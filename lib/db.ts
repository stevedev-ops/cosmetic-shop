import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'cosmetics.db');

// Global singleton instance for Next.js hot reload
const globalForDb = global as unknown as { db: Database.Database };

export const db =
  globalForDb.db ||
  new Database(dbPath, {
    // verbose: console.log,
  });

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;

// Enable WAL mode for high performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      category TEXT NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      barcode TEXT,
      shade_or_variant TEXT,
      cost_price REAL NOT NULL,
      selling_price REAL NOT NULL,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      min_threshold INTEGER NOT NULL DEFAULT 5,
      batch_number TEXT NOT NULL,
      expiry_date TEXT NOT NULL,
      image_color TEXT DEFAULT '#f472b6',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      skin_type TEXT DEFAULT 'Normal',
      notes TEXT,
      loyalty_points INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact_person TEXT,
      phone TEXT,
      email TEXT,
      brands_supplied TEXT,
      lead_time_days INTEGER DEFAULT 3,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS shifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cashier_name TEXT NOT NULL,
      opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      closed_at DATETIME,
      opening_float REAL NOT NULL DEFAULT 150.00,
      closing_cash_actual REAL,
      status TEXT DEFAULT 'OPEN',
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receipt_number TEXT UNIQUE NOT NULL,
      shift_id INTEGER,
      customer_id INTEGER,
      customer_name TEXT,
      subtotal REAL NOT NULL,
      discount_amount REAL DEFAULT 0,
      tax_amount REAL DEFAULT 0,
      total_amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      cash_tendered REAL,
      change_due REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      shade_or_variant TEXT,
      unit_price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      line_total REAL NOT NULL,
      FOREIGN KEY(sale_id) REFERENCES sales(id) ON DELETE CASCADE,
      FOREIGN KEY(product_id) REFERENCES products(id)
    );
  `);

  // Seed sample products if table is empty
  const countRow = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
  if (countRow.count === 0) {
    seedDatabase();
  }
}

function seedDatabase() {
  const insertProduct = db.prepare(`
    INSERT INTO products (name, brand, category, sku, barcode, shade_or_variant, cost_price, selling_price, stock_quantity, min_threshold, batch_number, expiry_date, image_color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const sampleProducts: [string, string, string, string, string, string, number, number, number, number, string, string, string][] = [
    // Skincare
    ['Lumina Glow Vitamin C Serum', 'Aura Botanics', 'Skincare', 'SKU-AUR-01', '89012345601', '30ml Dropper', 18.00, 36.00, 24, 6, 'BT-2026-VC1', '2027-10-15', '#f59e0b'],
    ['Hydra-Plump Hyaluronic Acid Essence', 'Glow Lab', 'Skincare', 'SKU-GLW-02', '89012345602', '50ml Pump', 14.50, 29.00, 18, 5, 'BT-2026-HA4', '2027-12-01', '#0ea5e9'],
    ['Velvet Shield Daily Sunscreen SPF 50+', 'Soleil Luxe', 'Skincare', 'SKU-SOL-03', '89012345603', '60ml Tube', 12.00, 25.00, 4, 8, 'BT-2025-SP8', '2026-10-12', '#eab308'], // Low stock & expiring soon
    ['Midnight Recovery Ceramide Cream', 'Nocturne Beauty', 'Skincare', 'SKU-NOC-04', '89012345604', '50g Jar', 22.00, 44.00, 15, 5, 'BT-2026-CR2', '2028-02-14', '#6366f1'],
    ['Rose Petal Clarifying Mist', 'Fleur & Herb', 'Skincare', 'SKU-FLR-05', '89012345605', '120ml Spray', 9.00, 20.00, 3, 6, 'BT-2025-RP1', '2026-10-05', '#f43f5e'], // Low stock & expiring soon

    // Makeup - Lipsticks & Foundation
    ['Silk Radiance Liquid Foundation', 'Élégance Paris', 'Makeup', 'SKU-ELG-F02', '89012345606', 'Shade 02 Porcelain', 20.00, 42.00, 12, 4, 'BT-2026-FN1', '2028-01-20', '#fed7aa'],
    ['Silk Radiance Liquid Foundation', 'Élégance Paris', 'Makeup', 'SKU-ELG-F04', '89012345607', 'Shade 04 Warm Honey', 20.00, 42.00, 14, 4, 'BT-2026-FN2', '2028-01-20', '#d97706'],
    ['Silk Radiance Liquid Foundation', 'Élégance Paris', 'Makeup', 'SKU-ELG-F08', '89012345608', 'Shade 08 Rich Espresso', 20.00, 42.00, 2, 4, 'BT-2026-FN3', '2028-01-20', '#78350f'], // Low stock
    ['Petal Soft Matte Lipstick', 'Velvet Kiss', 'Makeup', 'SKU-VK-L01', '89012345609', 'Crimson Velvet #10', 11.00, 24.00, 22, 5, 'BT-2026-LP1', '2027-09-30', '#dc2626'],
    ['Petal Soft Matte Lipstick', 'Velvet Kiss', 'Makeup', 'SKU-VK-L05', '89012345610', 'Dusty Rose #05', 11.00, 24.00, 19, 5, 'BT-2026-LP2', '2027-09-30', '#fb7185'],
    ['Waterproof Panorama Mascara', 'Lash Couture', 'Makeup', 'SKU-LSH-M1', '89012345611', 'Ultra Black', 9.50, 21.00, 28, 6, 'BT-2026-MC9', '2027-08-15', '#1e293b'],
    ['Micro-Fine Translucent Powder', 'Chic Cosmetics', 'Makeup', 'SKU-CHC-P01', '89012345612', 'Translucent Universal', 13.00, 28.00, 16, 5, 'BT-2026-PW4', '2028-05-10', '#fef08a'],

    // Fragrance
    ['Maison de Rose Eau de Parfum', 'Atelier Grasse', 'Fragrance', 'SKU-ATG-R50', '89012345613', '50ml Spray', 45.00, 95.00, 8, 3, 'BT-2026-EDP1', '2029-01-01', '#f472b6'],
    ['Amber Noir Oud Intense', 'Sultana Fragrances', 'Fragrance', 'SKU-SUL-O80', '89012345614', '80ml Spray', 60.00, 130.00, 6, 2, 'BT-2026-OUD5', '2029-06-01', '#854d0e'],

    // Hair & Body
    ['Argan Infusion Repair Hair Serum', 'Botanica Hair', 'Haircare', 'SKU-BOT-H01', '89012345615', '100ml Bottle', 15.00, 32.00, 11, 4, 'BT-2026-AR1', '2027-11-20', '#ca8a04'],
    ['Whipped Shea & Vanilla Body Butter', 'Pure Botanicals', 'Bath & Body', 'SKU-PUR-B01', '89012345616', '250ml Tub', 10.00, 22.00, 5, 5, 'BT-2025-BB3', '2026-10-25', '#fde047'] // Expiring soon
  ];

  for (const p of sampleProducts) {
    insertProduct.run(...p);
  }

  // Seed sample customers
  const insertCustomer = db.prepare(`
    INSERT INTO customers (name, phone, email, skin_type, notes, loyalty_points)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertCustomer.run('Sarah Jenkins', '+1 (555) 234-5678', 'sarah.j@example.com', 'Combination', 'Prefers fragrance-free formulas. Favorite shade: #04 Warm Honey', 140);
  insertCustomer.run('Elena Rostova', '+1 (555) 345-6789', 'elena.r@example.com', 'Dry', 'Sensitive to essential oils. Buys Ceramide Night Cream', 220);
  insertCustomer.run('Chloe Moreau', '+1 (555) 456-7890', 'chloe.m@example.com', 'Oily', 'Loves matte finishes and waterproof mascara', 85);
  insertCustomer.run('Amara Davis', '+1 (555) 567-8901', 'amara.d@example.com', 'Sensitive', 'Requires patch test confirmation for AHAs/BHAs', 310);

  // Seed suppliers
  const insertSupplier = db.prepare(`
    INSERT INTO suppliers (name, contact_person, phone, email, brands_supplied, lead_time_days)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertSupplier.run('Luxe Cosmetics Distribution', 'Marcus Vance', '+1 (555) 800-1122', 'orders@luxecosmetics.com', 'Élégance Paris, Velvet Kiss, Chic Cosmetics', 3);
  insertSupplier.run('Pure Glow Botanics Ltd', 'Hanna Lindqvist', '+1 (555) 800-3344', 'hanna@pureglow.com', 'Aura Botanics, Glow Lab, Botanica Hair', 5);
  insertSupplier.run('Haute Parfumerie Imports', 'Jean-Luc Dupont', '+1 (555) 800-5566', 'jl@hauteparfums.com', 'Atelier Grasse, Sultana Fragrances', 7);

  // Seed default active cashier shift
  const insertShift = db.prepare(`
    INSERT INTO shifts (cashier_name, opened_at, opening_float, status, notes)
    VALUES (?, CURRENT_TIMESTAMP, ?, 'OPEN', 'Morning shift opened with standard cash float')
  `);
  const shiftResult = insertShift.run('Alice (Lead Beauty Consultant)', 150.00);
  const activeShiftId = shiftResult.lastInsertRowid;

  // Seed initial completed sales
  const insertSale = db.prepare(`
    INSERT INTO sales (receipt_number, shift_id, customer_id, customer_name, subtotal, discount_amount, tax_amount, total_amount, payment_method, cash_tendered, change_due, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-2 hours'))
  `);

  const insertSaleItem = db.prepare(`
    INSERT INTO sale_items (sale_id, product_id, product_name, shade_or_variant, unit_price, quantity, line_total)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const s1 = insertSale.run('RCP-2026-001', activeShiftId, 1, 'Sarah Jenkins', 78.00, 5.00, 5.84, 78.84, 'CARD', null, null);
  insertSaleItem.run(s1.lastInsertRowid, 1, 'Lumina Glow Vitamin C Serum', '30ml Dropper', 36.00, 1, 36.00);
  insertSaleItem.run(s1.lastInsertRowid, 7, 'Silk Radiance Liquid Foundation', 'Shade 04 Warm Honey', 42.00, 1, 42.00);

  const s2 = insertSale.run('RCP-2026-002', activeShiftId, 3, 'Chloe Moreau', 48.00, 0.00, 3.84, 51.84, 'CASH', 60.00, 8.16);
  insertSaleItem.run(s2.lastInsertRowid, 9, 'Petal Soft Matte Lipstick', 'Crimson Velvet #10', 24.00, 1, 24.00);
  insertSaleItem.run(s2.lastInsertRowid, 11, 'Waterproof Panorama Mascara', 'Ultra Black', 21.00, 1, 21.00);
}

// Ensure database is initialized
initDatabase();
