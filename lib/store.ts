'use client';

import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_SUPPLIERS,
  INITIAL_SALES,
  MockProduct,
  MockCustomer,
  MockSupplier,
  MockSale,
} from './mockStore';

const PRODUCTS_KEY = 'aura_luxe_products';
const CUSTOMERS_KEY = 'aura_luxe_customers';
const SUPPLIERS_KEY = 'aura_luxe_suppliers';
const SALES_KEY = 'aura_luxe_sales';

export function getClientProducts(): MockProduct[] {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  const data = localStorage.getItem(PRODUCTS_KEY);
  if (!data) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export function saveClientProducts(products: MockProduct[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function getClientCustomers(): MockCustomer[] {
  if (typeof window === 'undefined') return INITIAL_CUSTOMERS;
  const data = localStorage.getItem(CUSTOMERS_KEY);
  if (!data) {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(INITIAL_CUSTOMERS));
    return INITIAL_CUSTOMERS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_CUSTOMERS;
  }
}

export function saveClientCustomers(customers: MockCustomer[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}

export function getClientSuppliers(): MockSupplier[] {
  if (typeof window === 'undefined') return INITIAL_SUPPLIERS;
  const data = localStorage.getItem(SUPPLIERS_KEY);
  if (!data) {
    localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(INITIAL_SUPPLIERS));
    return INITIAL_SUPPLIERS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_SUPPLIERS;
  }
}

export function saveClientSuppliers(suppliers: MockSupplier[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(suppliers));
}

export function getClientSales(): MockSale[] {
  if (typeof window === 'undefined') return INITIAL_SALES;
  const data = localStorage.getItem(SALES_KEY);
  if (!data) {
    localStorage.setItem(SALES_KEY, JSON.stringify(INITIAL_SALES));
    return INITIAL_SALES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_SALES;
  }
}

export function saveClientSales(sales: MockSale[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SALES_KEY, JSON.stringify(sales));
}
