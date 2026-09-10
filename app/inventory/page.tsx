'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Plus,
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  X,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  ArrowUpDown,
  Layers,
} from 'lucide-react';

interface Product {
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

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'expiring' | 'low_stock'>('all');

  // Modal State (Add / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'Skincare',
    sku: '',
    barcode: '',
    shade_or_variant: '',
    cost_price: '',
    selling_price: '',
    stock_quantity: '',
    min_threshold: '5',
    batch_number: '',
    expiry_date: '',
    image_color: '#f43f5e',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = ['All', 'Skincare', 'Makeup', 'Fragrance', 'Haircare', 'Bath & Body'];

  // Quick Restock modal/prompt
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState('');
  const [restockBatch, setRestockBatch] = useState('');
  const [restockExpiry, setRestockExpiry] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      const json = await res.json();
      if (json.success) {
        setProducts(json.products);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check URL search params for default filter
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const f = params.get('filter');
      if (f === 'expiring' || f === 'low_stock') {
        setStatusFilter(f);
      }
    }
    fetchProducts();
  }, []);

  // Compute days until expiry
  const getExpiryStatus = (expiryDateStr: string) => {
    const today = new Date();
    const expiry = new Date(expiryDateStr);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'EXPIRED', label: 'Expired', color: 'bg-red-500/20 text-red-300 border-red-500/40', days: diffDays };
    } else if (diffDays <= 60) {
      return {
        status: 'EXPIRING_SOON',
        label: `${diffDays} days left`,
        color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        days: diffDays,
      };
    } else {
      return { status: 'GOOD', label: 'Healthy', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', days: diffDays };
    }
  };

  // Filtered list
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const query = search.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      p.shade_or_variant?.toLowerCase().includes(query) ||
      p.batch_number?.toLowerCase().includes(query);

    const expiryInfo = getExpiryStatus(p.expiry_date);
    let matchesStatus = true;
    if (statusFilter === 'expiring') {
      matchesStatus = expiryInfo.days <= 60;
    } else if (statusFilter === 'low_stock') {
      matchesStatus = p.stock_quantity <= p.min_threshold;
    }

    return matchesCategory && matchesSearch && matchesStatus;
  });

  // Handle open add / edit modal
  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        brand: product.brand,
        category: product.category,
        sku: product.sku,
        barcode: product.barcode || '',
        shade_or_variant: product.shade_or_variant || '',
        cost_price: product.cost_price.toString(),
        selling_price: product.selling_price.toString(),
        stock_quantity: product.stock_quantity.toString(),
        min_threshold: product.min_threshold.toString(),
        batch_number: product.batch_number,
        expiry_date: product.expiry_date,
        image_color: product.image_color || '#f43f5e',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        brand: '',
        category: 'Skincare',
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        barcode: '',
        shade_or_variant: '',
        cost_price: '',
        selling_price: '',
        stock_quantity: '10',
        min_threshold: '5',
        batch_number: `BT-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`,
        expiry_date: '',
        image_color: '#f43f5e',
      });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  // Submit Add / Edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const url = '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';
      const body = editingProduct ? { ...formData, id: editingProduct.id } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (!json.success) {
        setFormError(json.error || 'Failed to save product');
        setSubmitting(false);
        return;
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      setFormError(err.message || 'Error saving product');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Quick Restock
  const handleQuickRestock = async () => {
    if (!restockProduct || !restockQty || Number(restockQty) <= 0) return;
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RESTOCK',
          productId: restockProduct.id,
          addedQuantity: Number(restockQty),
          newBatchNumber: restockBatch || undefined,
          newExpiryDate: restockExpiry || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setRestockProduct(null);
        setRestockQty('');
        setRestockBatch('');
        setRestockExpiry('');
        fetchProducts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Product
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the inventory?`)) return;
    try {
      await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      fetchProducts();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-500/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
              Cosmetics Catalog
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {products.length} Products Total
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Inventory & Batch Expiry Tracker
          </h2>
          <p className="text-sm text-slate-400">
            Monitor cosmetic shades, formulation batch numbers, and upcoming expiration milestones.
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold text-sm shadow-lg shadow-rose-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Cosmetic</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/60 p-4 rounded-2xl border border-rose-500/15">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, brand, shade, SKU, or batch #..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'expiring', label: 'Expiring Soon (< 60d)' },
            { id: 'low_stock', label: 'Low Stock' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === f.id
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedCategory === c
                ? 'bg-slate-800 text-rose-300 border border-rose-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="rounded-2xl glass-panel border border-rose-500/15 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-rose-500/10 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Cosmetic Product & Shade</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Batch #</th>
                <th className="py-3.5 px-3">Shelf Life / Expiry</th>
                <th className="py-3.5 px-3 text-right">Cost</th>
                <th className="py-3.5 px-3 text-right">Retail</th>
                <th className="py-3.5 px-3 text-center">Stock Level</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Sparkles className="w-5 h-5 animate-spin mx-auto mb-2 text-rose-400" />
                    <span>Loading cosmetics inventory...</span>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No cosmetics matched your current filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const expiry = getExpiryStatus(p.expiry_date);
                  const isLow = p.stock_quantity <= p.min_threshold;
                  const margin = Math.round(((p.selling_price - p.cost_price) / p.selling_price) * 100);

                  return (
                    <tr key={p.id} className="hover:bg-slate-900/40 transition-colors group">
                      {/* Product & Shade */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0 shadow-sm"
                            style={{ backgroundColor: p.image_color || '#ec4899' }}
                            title="Color swatch"
                          />
                          <div>
                            <div className="font-semibold text-slate-100 flex items-center gap-2">
                              <span>{p.name}</span>
                              <span className="text-[10px] font-mono text-slate-500">{p.sku}</span>
                            </div>
                            <div className="text-[11px] text-rose-400/80 font-medium">
                              {p.brand} {p.shade_or_variant ? `• ${p.shade_or_variant}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 text-slate-300">
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px]">
                          {p.category}
                        </span>
                      </td>

                      {/* Batch */}
                      <td className="py-3.5 px-3 font-mono text-slate-300">
                        {p.batch_number}
                      </td>

                      {/* Expiry Badge */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${expiry.color}`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>{p.expiry_date}</span>
                            <span>({expiry.label})</span>
                          </span>
                        </div>
                      </td>

                      {/* Cost */}
                      <td className="py-3.5 px-3 text-right font-mono text-slate-400">
                        ${p.cost_price.toFixed(2)}
                      </td>

                      {/* Retail Price + Margin */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="font-mono font-semibold text-white">
                          ${p.selling_price.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-mono">
                          {margin}% margin
                        </div>
                      </td>

                      {/* Stock Level */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <span
                            className={`font-mono font-bold text-sm ${
                              p.stock_quantity === 0
                                ? 'text-red-400'
                                : isLow
                                ? 'text-amber-400'
                                : 'text-slate-200'
                            }`}
                          >
                            {p.stock_quantity}
                          </span>
                          {isLow && (
                            <span title="Low stock (under threshold)">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Restock */}
                          <button
                            onClick={() => {
                              setRestockProduct(p);
                              setRestockQty('12');
                              setRestockBatch(p.batch_number);
                              setRestockExpiry(p.expiry_date);
                            }}
                            className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-semibold transition-colors"
                          >
                            + Restock
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => openModal(p)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border border-rose-500/20 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingProduct ? 'Edit Cosmetic Details' : 'Add New Cosmetic Product'}
                </h3>
                <p className="text-xs text-slate-400">
                  Fill in beauty formulation, shade swatch, pricing, and batch expiration info.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Name */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Lumina Glow Vitamin C Serum"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Aura Botanics"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-rose-500"
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Shade / Variant */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Shade / Size Variant
                  </label>
                  <input
                    type="text"
                    value={formData.shade_or_variant}
                    onChange={(e) => setFormData({ ...formData, shade_or_variant: e.target.value })}
                    placeholder="e.g. Shade 04 Warm Honey or 50ml"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">SKU / Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="SKU-XXX-01"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Barcode */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Barcode</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="89012345601"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Cost Price */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Cost Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                    placeholder="12.00"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Selling Price */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Retail Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.selling_price}
                    onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                    placeholder="25.00"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    placeholder="10"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Low stock threshold */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Min Reorder Alert Threshold</label>
                  <input
                    type="number"
                    value={formData.min_threshold}
                    onChange={(e) => setFormData({ ...formData, min_threshold: e.target.value })}
                    placeholder="5"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Batch Number */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Batch Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.batch_number}
                    onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                    placeholder="BT-2026-VC1"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Expiration Date (YYYY-MM-DD) *</label>
                  <input
                    type="date"
                    required
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Shade / Preview color swatch */}
              <div className="pt-2">
                <label className="block text-slate-300 font-medium mb-1">
                  Swatch / Accent Color (for lipstick shades, packaging color)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.image_color}
                    onChange={(e) => setFormData({ ...formData, image_color: e.target.value })}
                    className="w-10 h-10 rounded-xl border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <span className="font-mono text-xs text-slate-400">{formData.image_color}</span>
                </div>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold transition-all shadow-md shadow-rose-500/20"
                >
                  {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK RESTOCK MODAL */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/20 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-white">Log Restock Shipment</h4>
                <p className="text-xs text-slate-400">{restockProduct.name}</p>
              </div>
              <button
                onClick={() => setRestockProduct(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Units Received</label>
                <input
                  type="number"
                  min="1"
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">New Batch Number</label>
                <input
                  type="text"
                  value={restockBatch}
                  onChange={(e) => setRestockBatch(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">New Expiry Date</label>
                <input
                  type="date"
                  value={restockExpiry}
                  onChange={(e) => setRestockExpiry(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setRestockProduct(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleQuickRestock}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold"
              >
                Confirm Restock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
