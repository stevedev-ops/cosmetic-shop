'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Receipt,
  Users,
  Truck,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pos', label: 'POS Terminal', icon: ShoppingCart, hotkey: 'POS' },
  { href: '/inventory', label: 'Inventory & Batches', icon: Package },
  { href: '/sales', label: 'Sales & Receipts', icon: Receipt },
  { href: '/customers', label: 'Beauty Profiles', icon: Users },
  { href: '/suppliers', label: 'Suppliers & Restock', icon: Truck },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-950/90 border-r border-rose-500/10 flex flex-col justify-between h-screen sticky top-0 backdrop-blur-xl z-30">
      {/* Brand & Boutique Title */}
      <div>
        <div className="p-5 border-b border-rose-500/10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 p-0.5 shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-rose-400 animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-base tracking-wide bg-gradient-to-r from-rose-200 via-pink-100 to-amber-200 bg-clip-text text-transparent">
                AURA LUXE
              </h1>
              <p className="text-[11px] font-medium text-rose-400/80 tracking-wider uppercase">
                Cosmetics & POS
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 mt-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-600/25 to-pink-600/15 text-rose-200 border border-rose-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-rose-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.hotkey && (
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                    {item.hotkey}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Cashier & Active Register Status */}
      <div className="p-4 m-3 rounded-2xl bg-slate-900/80 border border-rose-500/15 text-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-200">Register Active</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
            Shift #1
          </span>
        </div>
        
        <div className="text-slate-400">
          <p className="font-medium text-slate-200">Alice Vance</p>
          <p className="text-[11px] text-slate-500">Lead Beauty Consultant</p>
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Drawer Float</span>
          <span className="font-mono font-semibold text-rose-300">$150.00</span>
        </div>
      </div>
    </aside>
  );
}
