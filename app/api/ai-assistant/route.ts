import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Scan for low-stock items
    const lowStockItems = db
      .prepare(
        `SELECT p.*, 
                (SELECT s.name FROM suppliers s WHERE s.brands_supplied LIKE '%' || p.brand || '%' LIMIT 1) as suggested_supplier,
                (SELECT s.email FROM suppliers s WHERE s.brands_supplied LIKE '%' || p.brand || '%' LIMIT 1) as supplier_email,
                (SELECT s.phone FROM suppliers s WHERE s.brands_supplied LIKE '%' || p.brand || '%' LIMIT 1) as supplier_phone
         FROM products p
         WHERE p.stock_quantity <= p.min_threshold
         ORDER BY p.stock_quantity ASC`
      )
      .all() as any[];

    // 2. Scan for expiring soon (< 60 days)
    const expiringItems = db
      .prepare(
        `SELECT * FROM products 
         WHERE expiry_date <= date('now', '+60 days')
         ORDER BY expiry_date ASC`
      )
      .all() as any[];

    // 3. Top selling cosmetics
    const topSellers = db
      .prepare(
        `SELECT product_name, shade_or_variant, SUM(quantity) as units_sold, SUM(line_total) as revenue
         FROM sale_items
         GROUP BY product_name, shade_or_variant
         ORDER BY units_sold DESC
         LIMIT 5`
      )
      .all();

    // 4. Generate intelligent AI recommendations
    const aiAlerts: any[] = [];

    // Critical low-stock alerts
    for (const item of lowStockItems) {
      const suggestedQty = Math.max(12, item.min_threshold * 3 - item.stock_quantity);
      aiAlerts.push({
        id: `low-stock-${item.id}`,
        type: 'LOW_STOCK',
        severity: item.stock_quantity === 0 ? 'CRITICAL' : 'WARNING',
        title: `Low Stock: ${item.name} (${item.shade_or_variant || 'Standard'})`,
        message: `Only ${item.stock_quantity} left in boutique drawer (threshold is ${item.min_threshold}).`,
        recommendation: `Restock recommended: Order +${suggestedQty} units immediately from ${item.suggested_supplier || 'Distributor'}.`,
        productId: item.id,
        currentStock: item.stock_quantity,
        suggestedReorderQty: suggestedQty,
        supplier: item.suggested_supplier,
        supplierEmail: item.supplier_email,
      });
    }

    // Expiry warnings & discount strategies
    for (const item of expiringItems) {
      aiAlerts.push({
        id: `expiry-${item.id}`,
        type: 'EXPIRATION',
        severity: 'ATTENTION',
        title: `Shelf-Life Alert: ${item.name}`,
        message: `Batch ${item.batch_number} expires on ${item.expiry_date} (${item.stock_quantity} units remaining).`,
        recommendation: `Recommendation: Apply a 20%-30% clearance discount or feature in a bundle to prevent expiration loss.`,
        productId: item.id,
        currentStock: item.stock_quantity,
        batchNumber: item.batch_number,
        expiryDate: item.expiry_date,
      });
    }

    // AI Summary statement
    const summary = lowStockItems.length > 0
      ? `AI Stock Advisor: You have ${lowStockItems.length} product(s) critically low on stock and ${expiringItems.length} product(s) approaching shelf-life expiration.`
      : `AI Stock Advisor: Inventory health is optimal. All cosmetics are above safety reorder thresholds.`;

    return NextResponse.json({
      success: true,
      summary,
      totalAlerts: aiAlerts.length,
      alerts: aiAlerts,
      lowStockItems,
      expiringItems,
      topSellers,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawText = await request.text();
    const body = rawText ? JSON.parse(rawText) : {};
    const { prompt } = body;

    const lowStock = db
      .prepare('SELECT * FROM products WHERE stock_quantity <= min_threshold')
      .all() as any[];

    const expiring = db
      .prepare("SELECT * FROM products WHERE expiry_date <= date('now', '+60 days')")
      .all() as any[];

    const suppliers = db.prepare('SELECT * FROM suppliers').all() as any[];

    const lower = (prompt || '').toLowerCase();
    let reply = '';

    if (lower.includes('low') || lower.includes('stock') || lower.includes('reorder') || lower.includes('running out')) {
      if (lowStock.length === 0) {
        reply = '✅ Great news! All cosmetics in your boutique have sufficient stock. None are currently under the minimum threshold.';
      } else {
        reply = `⚠️ **Urgent Stock Notification:** You currently have **${lowStock.length} cosmetics** below minimum threshold:\n\n` +
          lowStock.map(p => `• **${p.name}** (${p.shade_or_variant || 'Standard'}): **${p.stock_quantity} remaining** (Threshold: ${p.min_threshold}) → Suggest reordering **${p.min_threshold * 3} units**`).join('\n') +
          `\n\nWould you like me to draft a purchase order to your suppliers?`;
      }
    } else if (lower.includes('expire') || lower.includes('expiry') || lower.includes('date') || lower.includes('batch')) {
      if (expiring.length === 0) {
        reply = '🌿 All cosmetic batches are well within safe shelf-life parameters. No expirations expected in the next 60 days.';
      } else {
        reply = `⏳ **Cosmetic Expiry Alert (< 60 Days):**\n\n` +
          expiring.map(p => `• **${p.name}** (${p.shade_or_variant}): Batch \`${p.batch_number}\` expires on **${p.expiry_date}** (${p.stock_quantity} units left).`).join('\n') +
          `\n\n💡 **AI Strategy:** Put these on a 15%–25% flash promotional clearance this week to recoup costs prior to expiration.`;
      }
    } else if (lower.includes('draft') || lower.includes('order') || lower.includes('email') || lower.includes('supplier')) {
      if (lowStock.length === 0) {
        reply = 'No products are currently low on stock, so no purchase order is needed right now.';
      } else {
        const vendor = suppliers[0]?.name || 'Luxe Cosmetics Distribution';
        const vendorEmail = suppliers[0]?.email || 'orders@luxecosmetics.com';
        const itemsList = lowStock.map(p => `- ${p.name} (${p.shade_or_variant || 'Standard'}) [SKU: ${p.sku}]: Order Qty ${p.min_threshold * 3}`).join('\n');
        
        reply = `📋 **AI Drafted Supplier Purchase Order**\n\n` +
          `**To:** ${vendor} (${vendorEmail})\n` +
          `**Subject:** URGENT Restock Order - Aura Luxe Cosmetics Boutique\n\n` +
          `Dear Supplier Team,\n\n` +
          `Please process the following replenishment order for delivery:\n\n` +
          `${itemsList}\n\n` +
          `Please confirm expected shipment date and tracking number.\n\n` +
          `Best regards,\nAlice Vance\nAura Luxe Cosmetics`;
      }
    } else {
      reply = `Hello! I am your **Aura Luxe AI Inventory Copilot**.\n\n` +
        `Current Status:\n` +
        `• 🚨 **${lowStock.length}** low stock product(s) needing attention\n` +
        `• ⏳ **${expiring.length}** product(s) nearing expiration\n\n` +
        `You can ask me:\n` +
        `1. *"Which products are low on stock?"*\n` +
        `2. *"What is expiring soon?"*\n` +
        `3. *"Draft supplier purchase order"*`;
    }

    return NextResponse.json({ success: true, reply });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
