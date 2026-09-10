'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CheckCircle,
  CreditCard,
  Banknote,
  Smartphone,
  Printer,
  Sparkles,
  User,
  X,
  AlertCircle,
  Clock,
  RotateCcw,
} from 'lucide-react';
import {
  getClientProducts,
  saveClientProducts,
  getClientCustomers,
  getClientSales,
  saveClientSales,
} from '@/lib/store';

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  sku: string;
  barcode: string;
  shade_or_variant: string;
  selling_price: number;
  stock_quantity: number;
  batch_number: string;
  expiry_date: string;
  image_color: string;
}

interface CartItem {
  productId: number;
  productName: string;
  brand: string;
  shadeOrVariant: string;
  unitPrice: number;
  quantity: number;
  stockAvailable: number;
}

export default function PosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const taxRate = 0.08; // 8%

  // Checkout Modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'MOBILE_MONEY'>('CASH');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Receipt Modal
  const [completedReceipt, setCompletedReceipt] = useState<any>(null);

  const categories = ['All', 'Skincare', 'Makeup', 'Fragrance', 'Haircare', 'Bath & Body'];

  // Load products & customers
  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, custRes] = await Promise.all([
        fetch('/api/products').catch(() => null),
        fetch('/api/customers').catch(() => null),
      ]);
      
      let prodsLoaded = false;
      let custsLoaded = false;

      if (prodRes && prodRes.ok) {
        const prodJson = await prodRes.json();
        if (prodJson.success && prodJson.products?.length > 0) {
          setProducts(prodJson.products);
          prodsLoaded = true;
        }
      }

      if (custRes && custRes.ok) {
        const custJson = await custRes.json();
        if (custJson.success && custJson.customers?.length > 0) {
          setCustomers(custJson.customers);
          custsLoaded = true;
        }
      }

      if (!prodsLoaded) {
        setProducts(getClientProducts());
      }
      if (!custsLoaded) {
        setCustomers(getClientCustomers());
      }
    } catch (err) {
      setProducts(getClientProducts());
      setCustomers(getClientCustomers());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const query = search.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      p.shade_or_variant?.toLowerCase().includes(query) ||
      p.barcode?.includes(query);
    return matchesCategory && matchesSearch;
  });

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.stock_quantity <= 0) return;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          alert(`Cannot add more. Only ${product.stock_quantity} units in stock.`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prevCart,
          {
            productId: product.id,
            productName: product.name,
            brand: product.brand,
            shadeOrVariant: product.shade_or_variant,
            unitPrice: product.selling_price,
            quantity: 1,
            stockAvailable: product.stock_quantity,
          },
        ];
      }
    });
  };

  const updateQuantity = (productId: number, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.productId === productId) {
          if (newQty > item.stockAvailable) {
            alert(`Maximum stock available: ${item.stockAvailable}`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setCashTendered('');
    setCheckoutError('');
  };

  // Computations
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discountAmount = Math.min(subtotal, Math.max(0, Number(discount) || 0));
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Number((taxableAmount * taxRate).toFixed(2));
  const totalAmount = Number((taxableAmount + taxAmount).toFixed(2));

  const changeDue =
    paymentMethod === 'CASH' && cashTendered
      ? Math.max(0, Number((Number(cashTendered) - totalAmount).toFixed(2)))
      : 0;

  // Execute Checkout
  const handleCheckout = async () => {
    setCheckoutError('');

    if (paymentMethod === 'CASH') {
      const tendered = Number(cashTendered);
      if (!tendered || tendered < totalAmount) {
        setCheckoutError(`Cash tendered ($${tendered || 0}) is less than total amount ($${totalAmount.toFixed(2)}).`);
        return;
      }
    }

    setIsProcessing(true);
    const selectedCustomer = customers.find((c) => c.id.toString() === selectedCustomerId);
    let receiptObj: any = null;

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart,
          customerId: selectedCustomer ? selectedCustomer.id : null,
          customerName: selectedCustomer ? selectedCustomer.name : 'Walk-in Guest',
          discount: discountAmount,
          taxRate,
          paymentMethod,
          cashTendered: paymentMethod === 'CASH' ? Number(cashTendered) : null,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.receipt) {
          receiptObj = json.receipt;
        }
      }
    } catch (err) {
      console.warn('Backend API unavailable, using client store checkout');
    }

    // Client Demo Checkout Fallback for Vercel
    if (!receiptObj) {
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      receiptObj = {
        saleId: Date.now(),
        receiptNumber: `RCP-${dateStr}-${randomSuffix}`,
        subtotal,
        discountAmount,
        taxAmount,
        totalAmount,
        paymentMethod,
        cashTendered: paymentMethod === 'CASH' ? Number(cashTendered) : null,
        changeDue,
        items: cart,
        date: now.toISOString(),
      };

      // Deduct stock in client store
      const currentProds = getClientProducts();
      const updatedProds = currentProds.map((p) => {
        const inCart = cart.find((c) => c.productId === p.id);
        if (inCart) {
          return { ...p, stock_quantity: Math.max(0, p.stock_quantity - inCart.quantity) };
        }
        return p;
      });
      saveClientProducts(updatedProds);
      setProducts(updatedProds as any);

      // Record sale in client store
      const currentSales = getClientSales();
      saveClientSales([
        {
          id: Date.now(),
          receipt_number: receiptObj.receiptNumber,
          customer_name: selectedCustomer ? selectedCustomer.name : 'Walk-in Guest',
          subtotal,
          discount_amount: discountAmount,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          payment_method: paymentMethod,
          cash_tendered: receiptObj.cashTendered,
          change_due: changeDue,
          created_at: now.toISOString(),
          items_summary: cart.map((c) => `${c.productName} (${c.quantity})`).join(', '),
        },
        ...currentSales,
      ]);
    }

    setCompletedReceipt(receiptObj);
    setIsCheckoutOpen(false);
    clearCart();
    setIsProcessing(false);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-screen overflow-hidden bg-[#0b0f19]">
      {/* LEFT: Product Catalog & Fast POS Search */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-rose-500/10 overflow-hidden">
        {/* Search & Category Bar */}
        <div className="p-4 border-b border-rose-500/10 bg-slate-950/40 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Scan barcode, search cosmetic name, brand, shade, or SKU..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/40 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Categories Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-rose-500 text-white font-semibold shadow-md shadow-rose-500/20'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-400 gap-2">
              <Sparkles className="w-5 h-5 animate-spin text-rose-400" />
              <span>Loading boutique catalog...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
              <p className="text-sm">No cosmetics found matching your query.</p>
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('All');
                }}
                className="text-xs text-rose-400 hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredProducts.map((p) => {
                const isOutOfStock = p.stock_quantity <= 0;
                const isLowStock = p.stock_quantity <= 5;
                const cartQty = cart.find((i) => i.productId === p.id)?.quantity || 0;

                return (
                  <button
                    key={p.id}
                    onClick={() => !isOutOfStock && addToCart(p)}
                    disabled={isOutOfStock}
                    className={`text-left p-3.5 rounded-2xl glass-panel border transition-all relative flex flex-col justify-between group ${
                      isOutOfStock
                        ? 'opacity-40 cursor-not-allowed border-slate-800'
                        : 'hover:border-rose-500/40 hover:scale-[1.01] border-slate-800/80'
                    }`}
                  >
                    {/* Shade / Color Accent bar */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
                        {p.brand}
                      </span>
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: p.image_color || '#ec4899' }}
                        title="Shade preview"
                      />
                    </div>

                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-100 line-clamp-2 leading-snug group-hover:text-rose-200 transition-colors">
                        {p.name}
                      </h4>
                      {p.shade_or_variant && (
                        <p className="text-[11px] text-slate-400 font-medium mt-1 truncate">
                          {p.shade_or_variant}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold font-mono text-white">
                          ${p.selling_price.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {isOutOfStock ? (
                            <span className="text-rose-500 font-semibold">Out of Stock</span>
                          ) : (
                            <span className={isLowStock ? 'text-amber-400 font-medium' : 'text-slate-400'}>
                              {p.stock_quantity} available
                            </span>
                          )}
                        </div>
                      </div>

                      {cartQty > 0 && (
                        <span className="w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center shadow-md shadow-rose-500/40">
                          {cartQty}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Register Cart & Instant Checkout Terminal */}
      <div className="w-full lg:w-96 flex-shrink-0 bg-slate-950/70 flex flex-col justify-between h-auto lg:h-screen border-l border-rose-500/10">
        {/* Cart Header */}
        <div className="p-4 border-b border-rose-500/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-rose-400" />
            <h3 className="font-bold text-sm text-slate-100">Order Cart</h3>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
              {cart.reduce((s, i) => s + i.quantity, 0)} items
            </span>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Customer Select (Loyalty link) */}
        <div className="p-3 bg-slate-900/40 border-b border-rose-500/10">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-rose-400" />
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg text-xs py-1.5 px-2.5 text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="">Guest / Walk-in Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.loyalty_points} pts • {c.skin_type || 'Normal'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 py-12">
              <ShoppingCart className="w-8 h-8 text-slate-600 stroke-[1.5]" />
              <p className="text-xs font-medium">Cart is currently empty</p>
              <p className="text-[11px] text-slate-600 text-center max-w-[200px]">
                Click or scan cosmetics from the catalog on the left to ring up sales.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.productId}
                className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/90 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h5 className="text-xs font-semibold text-slate-200 truncate">
                      {item.productName}
                    </h5>
                    <p className="text-[10px] text-slate-400 truncate">
                      {item.shadeOrVariant}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-100">
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                  <span className="text-[11px] text-slate-400 font-mono">
                    ${item.unitPrice.toFixed(2)} ea
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-xs font-bold text-white px-1">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Totals & Checkout Button */}
        <div className="p-4 border-t border-rose-500/10 bg-slate-950/60 space-y-3">
          {/* Subtotal, Discount, Tax */}
          <div className="space-y-1.5 text-xs text-slate-400 font-medium">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono text-slate-200">${subtotal.toFixed(2)}</span>
            </div>

            {/* Discount input */}
            <div className="flex items-center justify-between">
              <span>Discount ($)</span>
              <input
                type="number"
                min="0"
                max={subtotal}
                value={discount || ''}
                onChange={(e) => setDiscount(Number(e.target.value))}
                placeholder="0.00"
                className="w-20 text-right bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-xs font-mono text-rose-300 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-between">
              <span>Tax (8%)</span>
              <span className="font-mono text-slate-200">${taxAmount.toFixed(2)}</span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
              <span className="text-sm font-bold text-white">Total Due</span>
              <span className="text-xl font-bold font-mono text-rose-300">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Pay Button */}
          <button
            onClick={() => {
              if (cart.length === 0) return;
              setCashTendered(totalAmount.toString());
              setIsCheckoutOpen(true);
            }}
            disabled={cart.length === 0}
            className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              cart.length === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg shadow-rose-500/25 hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            <Banknote className="w-4 h-4" />
            <span>Process Payment (${totalAmount.toFixed(2)})</span>
          </button>
        </div>
      </div>

      {/* CHECKOUT MODAL */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/20 rounded-3xl p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Complete Sale</h3>
                <p className="text-xs text-slate-400">Select payment method and finalize register receipt</p>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'CASH', label: 'Cash', icon: Banknote },
                { id: 'CARD', label: 'Card', icon: CreditCard },
                { id: 'MOBILE_MONEY', label: 'Mobile', icon: Smartphone },
              ].map((m) => {
                const Icon = m.icon;
                const isSel = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`py-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      isSel
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-semibold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Total Summary */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <span className="text-xs text-slate-400 uppercase tracking-wider">Total Amount</span>
              <div className="text-3xl font-extrabold font-mono text-white">
                ${totalAmount.toFixed(2)}
              </div>
            </div>

            {/* If Cash, show cash tendered and change calculator */}
            {paymentMethod === 'CASH' && (
              <div className="space-y-3">
                <label className="text-xs font-medium text-slate-300">Cash Received ($)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-lg font-mono text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Quick denomination pills */}
                <div className="flex gap-2">
                  {[20, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCashTendered(amt.toString())}
                      className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-medium text-slate-200"
                    >
                      ${amt}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCashTendered(totalAmount.toString())}
                    className="flex-1 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-xs font-mono font-medium text-rose-300 border border-rose-500/30"
                  >
                    Exact
                  </button>
                </div>

                {/* Change Due readout */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Change Due:</span>
                  <span className={`font-mono text-base font-bold ${changeDue > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                    ${changeDue.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {checkoutError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{checkoutError}</span>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Finalizing Sale...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Complete Transaction</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* COMPLETED RECEIPT MODAL */}
      {completedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-slate-900 border border-rose-500/20 rounded-3xl p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Transaction Successful
              </span>
              <button
                onClick={() => setCompletedReceipt(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thermal style receipt card */}
            <div
              id="printable-receipt"
              className="p-5 rounded-xl bg-white text-slate-900 font-mono text-xs space-y-3 shadow-inner"
            >
              <div className="text-center border-b border-dashed border-slate-300 pb-3">
                <h2 className="font-bold text-base tracking-wider">AURA LUXE COSMETICS</h2>
                <p className="text-[10px] text-slate-600">Luxury Beauty Boutique & Skincare</p>
                <p className="text-[10px] text-slate-500 mt-1">Receipt #: {completedReceipt.receiptNumber}</p>
                <p className="text-[10px] text-slate-500">
                  {new Date(completedReceipt.date).toLocaleString()}
                </p>
              </div>

              {/* Items */}
              <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3">
                {completedReceipt.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="truncate pr-2">
                      {item.productName} ({item.quantity}x)
                    </span>
                    <span className="font-semibold">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${completedReceipt.subtotal.toFixed(2)}</span>
                </div>
                {completedReceipt.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount:</span>
                    <span>-${completedReceipt.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax (8%):</span>
                  <span>${completedReceipt.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-300">
                  <span>TOTAL:</span>
                  <span>${completedReceipt.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-600 pt-1">
                  <span>Payment Method:</span>
                  <span>{completedReceipt.paymentMethod}</span>
                </div>
                {completedReceipt.cashTendered && (
                  <>
                    <div className="flex justify-between text-[10px] text-slate-600">
                      <span>Cash Tendered:</span>
                      <span>${completedReceipt.cashTendered.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-800">
                      <span>Change:</span>
                      <span>${completedReceipt.changeDue.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="text-center text-[9px] text-slate-500 pt-2 border-t border-dashed border-slate-300">
                <p>Thank you for beauty shopping with us!</p>
                <p>Returns accepted within 14 days for unopened items.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setCompletedReceipt(null)}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Next Customer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
