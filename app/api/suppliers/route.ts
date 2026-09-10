import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const suppliers = db.prepare('SELECT * FROM suppliers ORDER BY name ASC').all();
    return NextResponse.json({ success: true, suppliers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'RESTOCK') {
      const { productId, addedQuantity, newBatchNumber, newExpiryDate, newCostPrice } = body;
      if (!productId || !addedQuantity || addedQuantity <= 0) {
        return NextResponse.json(
          { success: false, error: 'Product ID and positive quantity required' },
          { status: 400 }
        );
      }

      // Update product stock and optionally batch / expiry
      let updateQuery = 'UPDATE products SET stock_quantity = stock_quantity + ?';
      const params: any[] = [Number(addedQuantity)];

      if (newBatchNumber) {
        updateQuery += ', batch_number = ?';
        params.push(newBatchNumber);
      }

      if (newExpiryDate) {
        updateQuery += ', expiry_date = ?';
        params.push(newExpiryDate);
      }

      if (newCostPrice) {
        updateQuery += ', cost_price = ?';
        params.push(Number(newCostPrice));
      }

      updateQuery += ' WHERE id = ?';
      params.push(productId);

      db.prepare(updateQuery).run(...params);
      const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);

      return NextResponse.json({
        success: true,
        message: 'Stock replenished successfully',
        product: updatedProduct,
      });
    }

    // Default: create new supplier
    const { name, contact_person, phone, email, brands_supplied, lead_time_days } = body;
    if (!name) {
      return NextResponse.json({ success: false, error: 'Supplier name is required' }, { status: 400 });
    }

    const stmt = db.prepare(`
      INSERT INTO suppliers (name, contact_person, phone, email, brands_supplied, lead_time_days)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name,
      contact_person || '',
      phone || '',
      email || '',
      brands_supplied || '',
      Number(lead_time_days || 3)
    );

    const newSupplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json({ success: true, supplier: newSupplier });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
