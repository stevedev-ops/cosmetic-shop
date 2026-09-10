import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const filter = searchParams.get('filter') || ''; // 'low_stock' | 'expiring' | 'all'

    let query = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];

    if (search) {
      query += ' AND (name LIKE ? OR brand LIKE ? OR sku LIKE ? OR barcode LIKE ? OR shade_or_variant LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (filter === 'low_stock') {
      query += ' AND stock_quantity <= min_threshold';
    } else if (filter === 'expiring') {
      query += " AND expiry_date <= date('now', '+60 days')";
    }

    query += ' ORDER BY name ASC';

    const products = db.prepare(query).all(...params);
    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawText = await request.text();
    const body = rawText ? JSON.parse(rawText) : {};
    const {
      name,
      brand,
      category,
      sku,
      barcode,
      shade_or_variant,
      cost_price,
      selling_price,
      stock_quantity,
      min_threshold,
      batch_number,
      expiry_date,
      image_color,
    } = body;

    if (!name || !brand || !category || !sku || !cost_price || !selling_price || !batch_number || !expiry_date) {
      return NextResponse.json(
        { success: false, error: 'Missing required product fields' },
        { status: 400 }
      );
    }

    const stmt = db.prepare(`
      INSERT INTO products (
        name, brand, category, sku, barcode, shade_or_variant,
        cost_price, selling_price, stock_quantity, min_threshold,
        batch_number, expiry_date, image_color
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name,
      brand,
      category,
      sku,
      barcode || '',
      shade_or_variant || '',
      Number(cost_price),
      Number(selling_price),
      Number(stock_quantity || 0),
      Number(min_threshold || 5),
      batch_number,
      expiry_date,
      image_color || '#ec4899'
    );

    const newProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json({ success: true, product: newProduct });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const rawText = await request.text();
    const body = rawText ? JSON.parse(rawText) : {};
    const {
      id,
      name,
      brand,
      category,
      sku,
      barcode,
      shade_or_variant,
      cost_price,
      selling_price,
      stock_quantity,
      min_threshold,
      batch_number,
      expiry_date,
      image_color,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const stmt = db.prepare(`
      UPDATE products SET
        name = ?, brand = ?, category = ?, sku = ?, barcode = ?, shade_or_variant = ?,
        cost_price = ?, selling_price = ?, stock_quantity = ?, min_threshold = ?,
        batch_number = ?, expiry_date = ?, image_color = ?
      WHERE id = ?
    `);

    stmt.run(
      name,
      brand,
      category,
      sku,
      barcode,
      shade_or_variant,
      Number(cost_price),
      Number(selling_price),
      Number(stock_quantity),
      Number(min_threshold),
      batch_number,
      expiry_date,
      image_color,
      id
    );

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(Number(id));
    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
