import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit') || '50');

    const sales = db
      .prepare(
        `SELECT s.*, 
                (SELECT COUNT(*) FROM sale_items WHERE sale_id = s.id) as total_items,
                (SELECT GROUP_CONCAT(product_name || ' x' || quantity, ', ') 
                 FROM sale_items WHERE sale_id = s.id) as items_summary
         FROM sales s 
         ORDER BY s.id DESC 
         LIMIT ?`
      )
      .all(limit);

    return NextResponse.json({ success: true, sales });
  } catch (error: any) {
    console.error('Error fetching sales:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawText = await request.text();
    const body = rawText ? JSON.parse(rawText) : {};
    const {
      cart,
      customerId,
      customerName,
      discount = 0,
      taxRate = 0.08, // 8% sales tax default
      paymentMethod = 'CASH', // 'CASH' | 'CARD' | 'MOBILE_MONEY'
      cashTendered,
      shiftId,
    } = body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ success: false, error: 'Cart cannot be empty' }, { status: 400 });
    }

    // Generate unique receipt number: RCP-YYYYMMDD-XXXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const receiptNumber = `RCP-${dateStr}-${randomSuffix}`;

    // Compute subtotal from cart
    const subtotal = cart.reduce((sum: number, item: any) => sum + item.unitPrice * item.quantity, 0);
    const discountAmount = Number(discount) || 0;
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = Number((taxableAmount * Number(taxRate)).toFixed(2));
    const totalAmount = Number((taxableAmount + taxAmount).toFixed(2));

    const changeDue =
      paymentMethod === 'CASH' && cashTendered
        ? Math.max(0, Number((Number(cashTendered) - totalAmount).toFixed(2)))
        : 0;

    // Execute within a strict database transaction
    const processCheckout = db.transaction(() => {
      // 1. Verify stock availability and deduct
      const checkStockStmt = db.prepare('SELECT id, name, stock_quantity FROM products WHERE id = ?');
      const deductStockStmt = db.prepare(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?'
      );

      for (const item of cart) {
        const prod = checkStockStmt.get(item.productId) as { id: number; name: string; stock_quantity: number } | undefined;
        if (!prod) {
          throw new Error(`Product "${item.productName}" not found in inventory.`);
        }
        if (prod.stock_quantity < item.quantity) {
          throw new Error(
            `Insufficient stock for "${prod.name}". Available: ${prod.stock_quantity}, requested: ${item.quantity}.`
          );
        }
        deductStockStmt.run(item.quantity, item.productId);
      }

      // 2. Insert into sales
      const insertSaleStmt = db.prepare(`
        INSERT INTO sales (
          receipt_number, shift_id, customer_id, customer_name,
          subtotal, discount_amount, tax_amount, total_amount,
          payment_method, cash_tendered, change_due
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const saleResult = insertSaleStmt.run(
        receiptNumber,
        shiftId || null,
        customerId || null,
        customerName || 'Walk-in Guest',
        subtotal,
        discountAmount,
        taxAmount,
        totalAmount,
        paymentMethod,
        cashTendered ? Number(cashTendered) : null,
        changeDue
      );

      const saleId = saleResult.lastInsertRowid;

      // 3. Insert sale items
      const insertItemStmt = db.prepare(`
        INSERT INTO sale_items (
          sale_id, product_id, product_name, shade_or_variant,
          unit_price, quantity, line_total
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      for (const item of cart) {
        insertItemStmt.run(
          saleId,
          item.productId,
          item.productName,
          item.shadeOrVariant || '',
          item.unitPrice,
          item.quantity,
          Number((item.unitPrice * item.quantity).toFixed(2))
        );
      }

      // 4. Update customer loyalty points (1 point per $1)
      if (customerId) {
        const pointsToAdd = Math.floor(totalAmount);
        db.prepare(
          'UPDATE customers SET loyalty_points = loyalty_points + ? WHERE id = ?'
        ).run(pointsToAdd, customerId);
      }

      return {
        saleId,
        receiptNumber,
        subtotal,
        discountAmount,
        taxAmount,
        totalAmount,
        paymentMethod,
        cashTendered: cashTendered ? Number(cashTendered) : null,
        changeDue,
        items: cart,
        date: new Date().toISOString(),
      };
    });

    const receipt = processCheckout();

    return NextResponse.json({
      success: true,
      message: 'Transaction completed successfully',
      receipt,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Transaction failed' },
      { status: 400 }
    );
  }
}
