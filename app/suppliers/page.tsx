'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  Phone,
  Mail,
  Clock,
  Sparkles,
  PackageCheck,
  X,
  Search,
} from 'lucide-react';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    brands_supplied: '',
    lead_time_days: '3',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/suppliers');
      const json = await res.json();
      if (json.success) setSuppliers(json.suppliers);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        setFormData({
          name: '',
          contact_person: '',
          phone: '',
          email: '',
          brands_supplied: '',
          lead_time_days: '3',
        });
        fetchSuppliers();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-500/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
              Procurement & Supply Chain
            </span>
            <span className="text-xs text-slate-400 font-mono">{suppliers.length} Vendors</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Cosmetic Suppliers & Brand Distributors
          </h2>
          <p className="text-sm text-slate-400">
            Manage authorized beauty distributor contacts, lead times, and brand portfolios.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold text-sm shadow-lg shadow-rose-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <Sparkles className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-400" />
            <span>Loading cosmetic distributors...</span>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            No suppliers found. Click "Add Vendor" to create one.
          </div>
        ) : (
          suppliers.map((s) => (
            <div
              key={s.id}
              className="p-5 rounded-2xl glass-panel glass-panel-hover border border-rose-500/15 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-base text-white">{s.name}</h4>
                    <p className="text-xs text-rose-300 font-medium mt-0.5">
                      Rep: {s.contact_person || 'General Sales'}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    {s.lead_time_days}d Lead Time
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800">
                  {s.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{s.phone}</span>
                    </div>
                  )}
                  {s.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{s.email}</span>
                    </div>
                  )}
                </div>

                {s.brands_supplied && (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-300">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">
                      Supplied Brands:
                    </span>
                    <p className="font-medium text-slate-200">{s.brands_supplied}</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex justify-between items-center text-[11px]">
                <span className="text-emerald-400 flex items-center gap-1">
                  <PackageCheck className="w-3.5 h-3.5" />
                  Verified Beauty Vendor
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* NEW SUPPLIER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/20 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Register Beauty Vendor</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Company / Distributor Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Haute Parfumerie Imports"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Brand Representative / Contact</label>
                <input
                  type="text"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  placeholder="e.g. Marcus Vance"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Order Placement Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="orders@vendor.com"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Cosmetic Brands Distributed</label>
                <input
                  type="text"
                  value={formData.brands_supplied}
                  onChange={(e) => setFormData({ ...formData, brands_supplied: e.target.value })}
                  placeholder="e.g. Élégance Paris, Velvet Kiss"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Estimated Lead Time (Days)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.lead_time_days}
                  onChange={(e) => setFormData({ ...formData, lead_time_days: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold"
                >
                  {submitting ? 'Saving...' : 'Register Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
