import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Today's sales KPI
    const todaySalesRow = db
      .prepare(
        `SELECT COALESCE(SUM(total_amount), 0) as total, COUNT(*) as count 
         FROM sales 
         WHERE date(created_at, 'localtime') = date('now', 'localtime')`
      )
      .get() as { total: number; count: number };

    // 2. All-time sales for context if today has few
    const totalSalesRow = db
      .prepare(`SELECT COALESCE(SUM(total_amount), 0) as total, COUNT(*) as count FROM sales`)
      .get() as { total: number; count: number };

    // 3. Low stock count
    const lowStockCountRow = db
      .prepare(`SELECT COUNT(*) as count FROM products WHERE stock_quantity <= min_threshold`)
      .get() as { count: number };

    // 4. Expiring soon (< 60 days) or already expired
    const expiringCountRow = db
      .prepare(`SELECT COUNT(*) as count FROM products WHERE expiry_date <= date('now', '+60 days')`)
      .get() as { count: number };

    // 5. Active shift
    const activeShift = db
      .prepare(`SELECT * FROM shifts WHERE status = 'OPEN' ORDER BY id DESC LIMIT 1`)
      .get();

    // 6. Recent sales (latest 5)
    const recentSales = db
      .prepare(
        `SELECT s.*, 
                (SELECT GROUP_CONCAT(product_name || ' (' || quantity || ')', ', ') 
                 FROM sale_items WHERE sale_id = s.id) as items_summary
         FROM sales s 
         ORDER BY s.id DESC 
         LIMIT 6`
      )
      .all();

    // 7. Expiring products list
    const expiringProducts = db
      .prepare(
        `SELECT * FROM products 
         WHERE expiry_date <= date('now', '+60 days')
         ORDER BY expiry_date ASC 
         LIMIT 8`
      )
      .all();

    // 8. Low stock products list
    const lowStockProducts = db
      .prepare(
        `SELECT * FROM products 
         WHERE stock_quantity <= min_threshold 
         ORDER BY stock_quantity ASC 
         LIMIT 8`
      )
      .all();

    // 9. Category breakdown
    const categoryStats = db
      .prepare(
        `SELECT category, COUNT(*) as count, SUM(stock_quantity) as total_stock 
         FROM products 
         GROUP BY category`
      )
      .all();

    return NextResponse.json({
      success: true,
      kpis: {
        todaySales: todaySalesRow.total,
        todayTransactions: todaySalesRow.count,
        totalSales: totalSalesRow.total,
        lowStockCount: lowStockCountRow.count,
        expiringSoonCount: expiringCountRow.count,
        activeShift,
      },
      recentSales,
      expiringProducts,
      lowStockProducts,
      categoryStats,
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
