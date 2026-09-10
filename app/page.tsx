'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  Package,
  ShoppingCart,
  ShieldAlert,
  Calendar,
  Layers,
  ChevronRight,
  CheckCircle,
  Receipt,
} from 'lucide-react';

import { getClientProducts, getClientSales } from '@/lib/store';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.kpis) {
          setData(json);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('API route unavailable, using client store');
    }

    // Client Demo Fallback for Vercel Showcase
    const prods = getClientProducts();
    const sales = getClientSales();
    const lowStock = prods.filter((p) => p.stock_quantity <= p.min_threshold);
    const expiring = prods.filter((p) => {
      const diffDays = Math.ceil((new Date(p.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 60;
    });
    const todayTotal = sales.reduce((sum, item) => sum + item.total_amount, 0);

    setData({
      kpis: {
        todaySales: todayTotal,
        todayTransactions: sales.length,
        totalSales: todayTotal + 350.0,
        lowStockCount: lowStock.length,
        expiringSoonCount: expiring.length,
      },
      recentSales: sales.slice(0, 6),
      expiringProducts: expiring.slice(0, 6),
      lowStockProducts: lowStock.slice(0, 6),
      categoryStats: [
        { category: 'Skincare', total_stock: 63, count: 5 },
        { category: 'Makeup', total_stock: 113, count: 7 },
        { category: 'Fragrance', total_stock: 14, count: 2 },
        { category: 'Haircare', total_stock: 11, count: 1 },
        { category: 'Bath & Body', total_stock: 5, count: 1 },
      ],
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="flex items-center gap-3 text-rose-400">
          <Sparkles className="w-6 h-6 animate-spin" />
          <span className="text-base font-medium">Loading cosmetic shop metrics...</span>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {
    todaySales: 0,
    todayTransactions: 0,
    totalSales: 0,
    lowStockCount: 0,
    expiringSoonCount: 0,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-500/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
              Operations Center
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Shop Performance & Daily Activities
          </h2>
          <p className="text-sm text-slate-400">
            Real-time cosmetics inventory status, expiration warnings, and POS sales volume.
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/pos"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold text-sm shadow-lg shadow-rose-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Launch POS Register</span>
          </Link>
          <Link
            href="/inventory"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-medium text-sm border border-rose-500/20 transition-colors"
          >
            <Package className="w-4 h-4 text-rose-400" />
            <span>Inventory Catalog</span>
          </Link>
        </div>
      </div>

      {/* Critical Expiry & Low Stock Banner (Cosmetics Specific) */}
      {(kpis.expiringSoonCount > 0 || kpis.lowStockCount > 0) && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-transparent border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-200">
                Cosmetic Quality & Batch Expiration Attention Needed
              </h4>
              <p className="text-xs text-slate-300">
                You have <span className="font-semibold text-amber-300">{kpis.expiringSoonCount} products expiring within 60 days</span> and{' '}
                <span className="font-semibold text-rose-300">{kpis.lowStockCount} items below minimum stock threshold</span>.
              </p>
            </div>
          </div>
          <Link
            href="/inventory?filter=expiring"
            className="self-start md:self-center flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 px-3.5 py-2 rounded-xl border border-amber-500/30 transition-colors"
          >
            <span>Review Expiry Watchlist</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Today's Sales */}
        <div className="p-5 rounded-2xl glass-panel glass-panel-hover border border-rose-500/15 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Today's Gross Sales
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center text-rose-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-white">
              ${kpis.todaySales.toFixed(2)}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="text-emerald-400 font-medium">
                {kpis.todayTransactions} order{kpis.todayTransactions === 1 ? '' : 's'}
              </span>
              <span>completed today</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Expiring Soon */}
        <div className="p-5 rounded-2xl glass-panel glass-panel-hover border border-amber-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">
              Expiring Soon (&lt; 60d)
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-amber-300">
              {kpis.expiringSoonCount} <span className="text-sm font-sans font-normal text-slate-400">SKUs</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Check shelf dates & clearance
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Low Stock Alert */}
        <div className="p-5 rounded-2xl glass-panel glass-panel-hover border border-red-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-400 uppercase tracking-wider">
              Low Stock Alerts
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-rose-300">
              {kpis.lowStockCount} <span className="text-sm font-sans font-normal text-slate-400">SKUs</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Items under reorder threshold
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-red-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Total Catalog Value / Total Sales */}
        <div className="p-5 rounded-2xl glass-panel glass-panel-hover border border-emerald-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Total Revenue Ledger
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-emerald-400">
              ${kpis.totalSales.toFixed(2)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Lifetime boutique register volume
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        </div>
      </div>

      {/* Grid: 2 Columns (Expiring/Low Stock Priority vs Recent Sales Feed) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring Soon Cosmetics Table */}
        <div className="p-6 rounded-2xl glass-panel border border-rose-500/15 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-base text-white">
                Upcoming Expirations Watchlist
              </h3>
            </div>
            <Link
              href="/inventory"
              className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
            >
              <span>Manage Catalog</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <p className="text-xs text-slate-400">
            Cosmetics have strict shelf-life limits after production. Review items approaching expiration:
          </p>

          <div className="space-y-2.5">
            {data?.expiringProducts?.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                All cosmetic batches are well within safe shelf-life dates.
              </div>
            ) : (
              data?.expiringProducts?.map((item: any) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-amber-500/30 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200 truncate">
                        {item.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {item.shade_or_variant}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span>Batch: <span className="font-mono text-slate-300">{item.batch_number}</span></span>
                      <span>•</span>
                      <span>Stock: <span className="font-bold text-slate-200">{item.stock_quantity} left</span></span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      <Clock className="w-3 h-3" />
                      {item.expiry_date}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent POS Sales Activity */}
        <div className="p-6 rounded-2xl glass-panel border border-rose-500/15 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center text-rose-400">
                <Receipt className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-base text-white">
                Live POS Cashier Activity
              </h3>
            </div>
            <Link
              href="/sales"
              className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
            >
              <span>View Full Ledger</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <p className="text-xs text-slate-400">
            Latest transactions completed at the cosmetic register:
          </p>

          <div className="space-y-2.5">
            {data?.recentSales?.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                No transactions recorded today yet.
              </div>
            ) : (
              data?.recentSales?.map((sale: any) => (
                <div
                  key={sale.id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-rose-300">
                        {sale.receipt_number}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {sale.payment_method}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 truncate mt-1">
                      {sale.customer_name || 'Walk-in Guest'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {sale.items_summary}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold font-mono text-emerald-400">
                      ${sale.total_amount.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Category Breakdown & Stock distribution */}
      <div className="p-6 rounded-2xl glass-panel border border-rose-500/15">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-pink-500/15 flex items-center justify-center text-pink-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white">
                Cosmetics Department Distribution
              </h3>
              <p className="text-xs text-slate-400">
                Inventory balance across skincare, makeup shades, fragrances, and beauty essentials.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {data?.categoryStats?.map((cat: any) => (
            <div
              key={cat.category}
              className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between"
            >
              <span className="text-xs font-semibold text-slate-300">{cat.category}</span>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-lg font-bold font-mono text-rose-300">{cat.total_stock}</span>
                <span className="text-[10px] text-slate-400">{cat.count} SKUs</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
