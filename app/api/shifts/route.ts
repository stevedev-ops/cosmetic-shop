import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const activeShift = db
      .prepare('SELECT * FROM shifts WHERE status = \'OPEN\' ORDER BY id DESC LIMIT 1')
      .get() as any;

    let shiftSalesSummary = {
      cashSales: 0,
      cardSales: 0,
      mobileSales: 0,
      totalSales: 0,
      transactionCount: 0,
    };

    if (activeShift) {
      const summary = db
        .prepare(
          `SELECT 
            COALESCE(SUM(CASE WHEN payment_method = 'CASH' THEN total_amount ELSE 0 END), 0) as cashSales,
            COALESCE(SUM(CASE WHEN payment_method = 'CARD' THEN total_amount ELSE 0 END), 0) as cardSales,
            COALESCE(SUM(CASE WHEN payment_method = 'MOBILE_MONEY' THEN total_amount ELSE 0 END), 0) as mobileSales,
            COALESCE(SUM(total_amount), 0) as totalSales,
            COUNT(*) as transactionCount
           FROM sales
           WHERE shift_id = ?`
        )
        .get(activeShift.id) as any;

      if (summary) {
        shiftSalesSummary = summary;
      }
    }

    const pastShifts = db
      .prepare('SELECT * FROM shifts ORDER BY id DESC LIMIT 10')
      .all();

    return NextResponse.json({
      success: true,
      activeShift,
      shiftSalesSummary,
      pastShifts,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, cashierName, openingFloat, closingCashActual, shiftId, notes } = body;

    if (action === 'OPEN') {
      if (!cashierName) {
        return NextResponse.json(
          { success: false, error: 'Cashier name is required' },
          { status: 400 }
        );
      }

      // Check if there's already an open shift
      const existing = db.prepare('SELECT id FROM shifts WHERE status = \'OPEN\'').get();
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'A shift is already open. Please close it first.' },
          { status: 400 }
        );
      }

      const stmt = db.prepare(`
        INSERT INTO shifts (cashier_name, opening_float, status, notes)
        VALUES (?, ?, 'OPEN', ?)
      `);
      const res = stmt.run(cashierName, Number(openingFloat || 100), notes || '');
      const newShift = db.prepare('SELECT * FROM shifts WHERE id = ?').get(res.lastInsertRowid);

      return NextResponse.json({ success: true, shift: newShift });
    } else if (action === 'CLOSE') {
      if (!shiftId) {
        return NextResponse.json({ success: false, error: 'Shift ID is required' }, { status: 400 });
      }

      const stmt = db.prepare(`
        UPDATE shifts SET
          status = 'CLOSED',
          closed_at = CURRENT_TIMESTAMP,
          closing_cash_actual = ?,
          notes = coalesce(notes || ' | ', '') || ?
        WHERE id = ?
      `);

      stmt.run(Number(closingCashActual || 0), notes || 'Shift closed normally', shiftId);
      const closedShift = db.prepare('SELECT * FROM shifts WHERE id = ?').get(shiftId);

      return NextResponse.json({ success: true, shift: closedShift });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
