'use client';

import React, { useState } from 'react';
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
  Menu,
  X,
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* MOBILE TOP BAR (visible only on small screens < lg) */}
      <div className="lg:hidden w-full bg-slate-950 border-b border-rose-500/15 p-3.5 flex items-center justify-between sticky top-0 z-40 backdrop-blur-lg">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-500 to-amber-400 p-0.5 shadow-md">
            <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide bg-gradient-to-r from-rose-200 via-pink-100 to-amber-200 bg-clip-text text-transparent">
              AURA LUXE
            </h1>
            <p className="text-[9px] font-medium text-rose-400/80 uppercase">
              Cosmetics POS
            </p>
          </div>
        </Link>

        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-rose-500/40 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="w-5 h-5 text-rose-400" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* BACKDROP OVERLAY (Mobile only when open) */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* SIDEBAR ASIDE */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-slate-950 border-r border-rose-500/15 flex flex-col justify-between backdrop-blur-xl z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Navigation */}
        <div>
          {/* Brand header with Mobile Close button */}
          <div className="p-5 border-b border-rose-500/10 flex items-center justify-between">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 group"
            >
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

            {/* Close [X] button for mobile */}
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
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
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-rose-600/25 to-pink-600/15 text-rose-200 border border-rose-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-rose-400' : 'text-slate-400'
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
    </>
  );
}
