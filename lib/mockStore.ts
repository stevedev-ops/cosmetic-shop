export interface MockProduct {
  id: number;
  name: string;
  brand: string;
  category: string;
  sku: string;
  barcode: string;
  shade_or_variant: string;
  cost_price: number;
  selling_price: number;
  stock_quantity: number;
  min_threshold: number;
  batch_number: string;
  expiry_date: string;
  image_color: string;
}

export interface MockCustomer {
  id: number;
  name: string;
  phone: string;
  email: string;
  skin_type: string;
  notes: string;
  loyalty_points: number;
  total_visits?: number;
  total_spent?: number;
}

export interface MockSupplier {
  id: number;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  brands_supplied: string;
  lead_time_days: number;
}

export interface MockSale {
  id: number;
  receipt_number: string;
  customer_name: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_method: string;
  cash_tendered?: number;
  change_due?: number;
  created_at: string;
  items_summary: string;
}

export const INITIAL_PRODUCTS: MockProduct[] = [
  {
    id: 1,
    name: 'Lumina Glow Vitamin C Serum',
    brand: 'Aura Botanics',
    category: 'Skincare',
    sku: 'SKU-AUR-01',
    barcode: '89012345601',
    shade_or_variant: '30ml Dropper',
    cost_price: 18.0,
    selling_price: 36.0,
    stock_quantity: 23,
    min_threshold: 6,
    batch_number: 'BT-2026-VC1',
    expiry_date: '2027-10-15',
    image_color: '#f59e0b',
  },
  {
    id: 2,
    name: 'Hydra-Plump Hyaluronic Acid Essence',
    brand: 'Glow Lab',
    category: 'Skincare',
    sku: 'SKU-GLW-02',
    barcode: '89012345602',
    shade_or_variant: '50ml Pump',
    cost_price: 14.5,
    selling_price: 29.0,
    stock_quantity: 18,
    min_threshold: 5,
    batch_number: 'BT-2026-HA4',
    expiry_date: '2027-12-01',
    image_color: '#0ea5e9',
  },
  {
    id: 3,
    name: 'Velvet Shield Daily Sunscreen SPF 50+',
    brand: 'Soleil Luxe',
    category: 'Skincare',
    sku: 'SKU-SOL-03',
    barcode: '89012345603',
    shade_or_variant: '60ml Tube',
    cost_price: 12.0,
    selling_price: 25.0,
    stock_quantity: 4, // LOW STOCK & EXPIRING SOON!
    min_threshold: 8,
    batch_number: 'BT-2025-SP8',
    expiry_date: '2026-10-12',
    image_color: '#eab308',
  },
  {
    id: 4,
    name: 'Midnight Recovery Ceramide Cream',
    brand: 'Nocturne Beauty',
    category: 'Skincare',
    sku: 'SKU-NOC-04',
    barcode: '89012345604',
    shade_or_variant: '50g Jar',
    cost_price: 22.0,
    selling_price: 44.0,
    stock_quantity: 15,
    min_threshold: 5,
    batch_number: 'BT-2026-CR2',
    expiry_date: '2028-02-14',
    image_color: '#6366f1',
  },
  {
    id: 5,
    name: 'Rose Petal Clarifying Mist',
    brand: 'Fleur & Herb',
    category: 'Skincare',
    sku: 'SKU-FLR-05',
    barcode: '89012345605',
    shade_or_variant: '120ml Spray',
    cost_price: 9.0,
    selling_price: 20.0,
    stock_quantity: 3, // LOW STOCK & EXPIRING SOON!
    min_threshold: 6,
    batch_number: 'BT-2025-RP1',
    expiry_date: '2026-10-05',
    image_color: '#f43f5e',
  },
  {
    id: 6,
    name: 'Silk Radiance Liquid Foundation',
    brand: 'Élégance Paris',
    category: 'Makeup',
    sku: 'SKU-ELG-F02',
    barcode: '89012345606',
    shade_or_variant: 'Shade 02 Porcelain',
    cost_price: 20.0,
    selling_price: 42.0,
    stock_quantity: 12,
    min_threshold: 4,
    batch_number: 'BT-2026-FN1',
    expiry_date: '2028-01-20',
    image_color: '#fed7aa',
  },
  {
    id: 7,
    name: 'Silk Radiance Liquid Foundation',
    brand: 'Élégance Paris',
    category: 'Makeup',
    sku: 'SKU-ELG-F04',
    barcode: '89012345607',
    shade_or_variant: 'Shade 04 Warm Honey',
    cost_price: 20.0,
    selling_price: 42.0,
    stock_quantity: 14,
    min_threshold: 4,
    batch_number: 'BT-2026-FN2',
    expiry_date: '2028-01-20',
    image_color: '#d97706',
  },
  {
    id: 8,
    name: 'Silk Radiance Liquid Foundation',
    brand: 'Élégance Paris',
    category: 'Makeup',
    sku: 'SKU-ELG-F08',
    barcode: '89012345608',
    shade_or_variant: 'Shade 08 Rich Espresso',
    cost_price: 20.0,
    selling_price: 42.0,
    stock_quantity: 2, // LOW STOCK
    min_threshold: 4,
    batch_number: 'BT-2026-FN3',
    expiry_date: '2028-01-20',
    image_color: '#78350f',
  },
  {
    id: 9,
    name: 'Petal Soft Matte Lipstick',
    brand: 'Velvet Kiss',
    category: 'Makeup',
    sku: 'SKU-VK-L01',
    barcode: '89012345609',
    shade_or_variant: 'Crimson Velvet #10',
    cost_price: 11.0,
    selling_price: 24.0,
    stock_quantity: 22,
    min_threshold: 5,
    batch_number: 'BT-2026-LP1',
    expiry_date: '2027-09-30',
    image_color: '#dc2626',
  },
  {
    id: 10,
    name: 'Petal Soft Matte Lipstick',
    brand: 'Velvet Kiss',
    category: 'Makeup',
    sku: 'SKU-VK-L05',
    barcode: '89012345610',
    shade_or_variant: 'Dusty Rose #05',
    cost_price: 11.0,
    selling_price: 24.0,
    stock_quantity: 19,
    min_threshold: 5,
    batch_number: 'BT-2026-LP2',
    expiry_date: '2027-09-30',
    image_color: '#fb7185',
  },
  {
    id: 11,
    name: 'Waterproof Panorama Mascara',
    brand: 'Lash Couture',
    category: 'Makeup',
    sku: 'SKU-LSH-M1',
    barcode: '89012345611',
    shade_or_variant: 'Ultra Black',
    cost_price: 9.5,
    selling_price: 21.0,
    stock_quantity: 28,
    min_threshold: 6,
    batch_number: 'BT-2026-MC9',
    expiry_date: '2027-08-15',
    image_color: '#1e293b',
  },
  {
    id: 12,
    name: 'Maison de Rose Eau de Parfum',
    brand: 'Atelier Grasse',
    category: 'Fragrance',
    sku: 'SKU-ATG-R50',
    barcode: '89012345613',
    shade_or_variant: '50ml Spray',
    cost_price: 45.0,
    selling_price: 95.0,
    stock_quantity: 8,
    min_threshold: 3,
    batch_number: 'BT-2026-EDP1',
    expiry_date: '2029-01-01',
    image_color: '#f472b6',
  },
  {
    id: 13,
    name: 'Amber Noir Oud Intense',
    brand: 'Sultana Fragrances',
    category: 'Fragrance',
    sku: 'SKU-SUL-O80',
    barcode: '89012345614',
    shade_or_variant: '80ml Spray',
    cost_price: 60.0,
    selling_price: 130.0,
    stock_quantity: 6,
    min_threshold: 2,
    batch_number: 'BT-2026-OUD5',
    expiry_date: '2029-06-01',
    image_color: '#854d0e',
  },
  {
    id: 14,
    name: 'Whipped Shea & Vanilla Body Butter',
    brand: 'Pure Botanicals',
    category: 'Bath & Body',
    sku: 'SKU-PUR-B01',
    barcode: '89012345616',
    shade_or_variant: '250ml Tub',
    cost_price: 10.0,
    selling_price: 22.0,
    stock_quantity: 5, // EXPIRING SOON!
    min_threshold: 5,
    batch_number: 'BT-2025-BB3',
    expiry_date: '2026-10-25',
    image_color: '#fde047',
  },
];

export const INITIAL_CUSTOMERS: MockCustomer[] = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    phone: '+1 (555) 234-5678',
    email: 'sarah.j@example.com',
    skin_type: 'Combination',
    notes: 'Prefers fragrance-free formulas. Favorite shade: #04 Warm Honey',
    loyalty_points: 178,
    total_visits: 5,
    total_spent: 198.5,
  },
  {
    id: 2,
    name: 'Elena Rostova',
    phone: '+1 (555) 345-6789',
    email: 'elena.r@example.com',
    skin_type: 'Dry',
    notes: 'Sensitive to essential oils. Buys Ceramide Night Cream',
    loyalty_points: 220,
    total_visits: 4,
    total_spent: 245.0,
  },
  {
    id: 3,
    name: 'Chloe Moreau',
    phone: '+1 (555) 456-7890',
    email: 'chloe.m@example.com',
    skin_type: 'Oily',
    notes: 'Loves matte finishes and waterproof mascara',
    loyalty_points: 85,
    total_visits: 2,
    total_spent: 98.0,
  },
  {
    id: 4,
    name: 'Amara Davis',
    phone: '+1 (555) 567-8901',
    email: 'amara.d@example.com',
    skin_type: 'Sensitive',
    notes: 'Requires patch test confirmation for AHAs/BHAs',
    loyalty_points: 310,
    total_visits: 7,
    total_spent: 340.0,
  },
];

export const INITIAL_SUPPLIERS: MockSupplier[] = [
  {
    id: 1,
    name: 'Luxe Cosmetics Distribution',
    contact_person: 'Marcus Vance',
    phone: '+1 (555) 800-1122',
    email: 'orders@luxecosmetics.com',
    brands_supplied: 'Élégance Paris, Velvet Kiss, Chic Cosmetics',
    lead_time_days: 3,
  },
  {
    id: 2,
    name: 'Pure Glow Botanics Ltd',
    contact_person: 'Hanna Lindqvist',
    phone: '+1 (555) 800-3344',
    email: 'hanna@pureglow.com',
    brands_supplied: 'Aura Botanics, Glow Lab, Botanica Hair',
    lead_time_days: 5,
  },
  {
    id: 3,
    name: 'Haute Parfumerie Imports',
    contact_person: 'Jean-Luc Dupont',
    phone: '+1 (555) 800-5566',
    email: 'jl@hauteparfums.com',
    brands_supplied: 'Atelier Grasse, Sultana Fragrances',
    lead_time_days: 7,
  },
];

export const INITIAL_SALES: MockSale[] = [
  {
    id: 1,
    receipt_number: 'RCP-20260910-6202',
    customer_name: 'Sarah Jenkins',
    subtotal: 36.0,
    discount_amount: 0,
    tax_amount: 2.88,
    total_amount: 38.88,
    payment_method: 'CASH',
    cash_tendered: 50.0,
    change_due: 11.12,
    created_at: new Date().toISOString(),
    items_summary: 'Lumina Glow Vitamin C Serum (1)',
  },
  {
    id: 2,
    receipt_number: 'RCP-2026-002',
    customer_name: 'Chloe Moreau',
    subtotal: 48.0,
    discount_amount: 0,
    tax_amount: 3.84,
    total_amount: 51.84,
    payment_method: 'CASH',
    cash_tendered: 60.0,
    change_due: 8.16,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    items_summary: 'Petal Soft Matte Lipstick (1), Waterproof Panorama Mascara (1)',
  },
  {
    id: 3,
    receipt_number: 'RCP-2026-001',
    customer_name: 'Sarah Jenkins',
    subtotal: 78.0,
    discount_amount: 5.0,
    tax_amount: 5.84,
    total_amount: 78.84,
    payment_method: 'CARD',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    items_summary: 'Lumina Glow Vitamin C Serum (1), Silk Radiance Liquid Foundation (1)',
  },
];
