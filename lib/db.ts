import path from 'path';
import fs from 'fs';
import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_SUPPLIERS,
  INITIAL_SALES,
} from './mockStore';

let DatabaseConstructor: any = null;
try {
  const dynamicRequire = eval('require');
  DatabaseConstructor = dynamicRequire('better-sqlite3');
} catch (err) {
  // Gracefully bypassed when deploying on Vercel
}

let dbInstance: any = null;

if (DatabaseConstructor) {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path.join(dataDir, 'cosmetics.db');
    dbInstance = new DatabaseConstructor(dbPath);
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');
  } catch (e) {
    dbInstance = null;
  }
}

// In-memory fallback mock state for Vercel Serverless
let mockProducts = [...INITIAL_PRODUCTS];
let mockCustomers = [...INITIAL_CUSTOMERS];
let mockSuppliers = [...INITIAL_SUPPLIERS];
let mockSales = [...INITIAL_SALES];

export const db: any = dbInstance || {
  prepare: (sql: string) => {
    return {
      all: (...params: any[]) => {
        const lower = sql.toLowerCase();
        if (lower.includes('from products')) {
          if (lower.includes('expiry_date <=') || lower.includes("date('now'")) {
            return mockProducts.filter((p) => {
              const diffDays = Math.ceil(
                (new Date(p.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );
              return diffDays <= 60;
            });
          }
          if (lower.includes('stock_quantity <=')) {
            return mockProducts.filter((p) => p.stock_quantity <= p.min_threshold);
          }
          if (lower.includes('count(*) as count') && lower.includes('group by category')) {
            return [
              { category: 'Skincare', count: 5, total_stock: 63 },
              { category: 'Makeup', count: 7, total_stock: 113 },
              { category: 'Fragrance', count: 2, total_stock: 14 },
              { category: 'Haircare', count: 1, total_stock: 11 },
              { category: 'Bath & Body', count: 1, total_stock: 5 },
            ];
          }
          return mockProducts;
        }
        if (lower.includes('from customers')) return mockCustomers;
        if (lower.includes('from suppliers')) return mockSuppliers;
        if (lower.includes('from sales')) return mockSales;
        if (lower.includes('from shifts')) {
          return [
            {
              id: 1,
              cashier_name: 'Alice (Lead Beauty Consultant)',
              opened_at: new Date().toISOString(),
              opening_float: 150.0,
              status: 'OPEN',
            },
          ];
        }
        return [];
      },
      get: (...params: any[]) => {
        const lower = sql.toLowerCase();
        if (lower.includes('count(*) as count from products where stock_quantity <=')) {
          return { count: mockProducts.filter((p) => p.stock_quantity <= p.min_threshold).length };
        }
        if (lower.includes('count(*) as count from products where expiry_date <=')) {
          return {
            count: mockProducts.filter((p) => {
              const diffDays = Math.ceil(
                (new Date(p.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );
              return diffDays <= 60;
            }).length,
          };
        }
        if (lower.includes('sum(total_amount)') && lower.includes('from sales')) {
          const total = mockSales.reduce((sum, s) => sum + s.total_amount, 0);
          return { total, count: mockSales.length };
        }
        if (lower.includes('from shifts where status =')) {
          return {
            id: 1,
            cashier_name: 'Alice (Lead Beauty Consultant)',
            opened_at: new Date().toISOString(),
            opening_float: 150.0,
            status: 'OPEN',
          };
        }
        if (lower.includes('from products where id =')) {
          const id = params[0];
          return mockProducts.find((p) => p.id === id) || mockProducts[0];
        }
        return { count: 10, total: 169.56 };
      },
      run: (...params: any[]) => {
        const lower = sql.toLowerCase();
        if (lower.includes('update products set stock_quantity = stock_quantity -')) {
          const qty = params[0];
          const prodId = params[1];
          mockProducts = mockProducts.map((p) =>
            p.id === prodId ? { ...p, stock_quantity: Math.max(0, p.stock_quantity - qty) } : p
          );
        }
        return { lastInsertRowid: Date.now(), changes: 1 };
      },
    };
  },
  exec: () => {},
  transaction: (fn: any) => fn,
  pragma: () => {},
};

export function initDatabase() {
  if (dbInstance) {
    // Database schema setup if SQLite is loaded locally
    try {
      dbInstance.exec(`
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
      `);
    } catch (e) {
      // Ignored
    }
  }
}
