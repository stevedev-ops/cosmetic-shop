import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const customers = db
      .prepare(
        `SELECT c.*, 
                (SELECT COUNT(*) FROM sales WHERE customer_id = c.id) as total_visits,
                (SELECT COALESCE(SUM(total_amount), 0) FROM sales WHERE customer_id = c.id) as total_spent
         FROM customers c 
         ORDER BY c.name ASC`
      )
      .all();

    return NextResponse.json({ success: true, customers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, skin_type, notes } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    const stmt = db.prepare(`
      INSERT INTO customers (name, phone, email, skin_type, notes, loyalty_points)
      VALUES (?, ?, ?, ?, ?, 0)
    `);

    const result = stmt.run(name, phone || '', email || '', skin_type || 'Normal', notes || '');
    const newCustomer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json({ success: true, customer: newCustomer });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
