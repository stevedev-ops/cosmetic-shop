'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Printer,
  X,
  CreditCard,
  Banknote,
  Smartphone,
  Calendar,
  Sparkles,
  ArrowDownRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { getClientSales } from '@/lib/store';

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [shiftData, setShiftData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeReceipt, setActiveReceipt] = useState<any>(null);

  // Close shift modal state
  const [isCloseShiftOpen, setIsCloseShiftOpen] = useState(false);
  const [countedCash, setCountedCash] = useState('');
  const [closingNotes, setClosingNotes] = useState('');
  const [closingShift, setClosingShift] = useState(false);

  const formatMoney = (val: any) => Number(val || 0).toFixed(2);

  const fetchSalesAndShifts = async () => {
    try {
      setLoading(true);
      const [salesRes, shiftRes] = await Promise.all([
        fetch('/api/sales?limit=50').catch(() => null),
        fetch('/api/shifts').catch(() => null),
      ]);
      let sLoaded = false;
      if (salesRes && salesRes.ok) {
        const salesJson = await salesRes.json();
        if (salesJson.success && salesJson.sales?.length > 0) {
          setSales(salesJson.sales);
          sLoaded = true;
        }
      }
      if (shiftRes && shiftRes.ok) {
        const shiftJson = await shiftRes.json();
        if (shiftJson.success) setShiftData(shiftJson);
      }
      if (!sLoaded) {
        setSales(getClientSales());
      }
    } catch (e) {
      setSales(getClientSales());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesAndShifts();
  }, []);

  const handleCloseShift = async () => {
    if (!shiftData?.activeShift) return;
    setClosingShift(true);
    try {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CLOSE',
          shiftId: shiftData.activeShift.id,
          closingCashActual: Number(countedCash || 0),
          notes: closingNotes,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsCloseShiftOpen(false);
        fetchSalesAndShifts();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setClosingShift(false);
    }
  };

  const filteredSales = sales.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.receipt_number.toLowerCase().includes(q) ||
      (s.customer_name && s.customer_name.toLowerCase().includes(q)) ||
      (s.items_summary && s.items_summary.toLowerCase().includes(q))
    );
  });

  const activeShift = shiftData?.activeShift;
  const shiftSummary = shiftData?.shiftSalesSummary || { cashSales: 0, cardSales: 0, mobileSales: 0, totalSales: 0 };
  const expectedDrawerCash = (activeShift?.opening_float || 0) + shiftSummary.cashSales;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-500/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
              Audit & Settlement
            </span>
            <span className="text-xs text-slate-400 font-mono">Daily Ledger</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Sales Records & Shift Register
          </h2>
          <p className="text-sm text-slate-400">
            View completed transactions, reprint receipts, and reconcile cash drawer balance.
          </p>
        </div>

        {activeShift && (
          <button
            onClick={() => {
              setCountedCash(formatMoney(expectedDrawerCash));
              setIsCloseShiftOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 font-semibold text-xs border border-rose-500/30 transition-colors shadow-sm"
          >
            <Lock className="w-4 h-4 text-rose-400" />
            <span>Close Shift Register</span>
          </button>
        )}
      </div>

      {/* Active Shift Drawer Card */}
      {activeShift && (
        <div className="p-5 rounded-2xl glass-panel border border-rose-500/15 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-medium tracking-wider">Active Cashier</span>
            <p className="text-base font-bold text-white mt-1">{activeShift.cashier_name}</p>
            <p className="text-[10px] text-emerald-400 font-mono">Shift Opened: {new Date(activeShift.opened_at).toLocaleTimeString()}</p>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 uppercase font-medium tracking-wider">Opening Cash Float</span>
            <p className="text-xl font-bold font-mono text-slate-200 mt-1">${formatMoney(activeShift?.opening_float)}</p>
            <p className="text-[10px] text-slate-500">Base drawer change</p>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 uppercase font-medium tracking-wider">Shift Sales Total</span>
            <p className="text-xl font-bold font-mono text-emerald-400 mt-1">${formatMoney(shiftSummary?.totalSales)}</p>
            <p className="text-[10px] text-slate-400">
              Cash: ${formatMoney(shiftSummary?.cashSales)} | Card: ${formatMoney(shiftSummary?.cardSales)}
            </p>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 uppercase font-medium tracking-wider">Expected Cash in Drawer</span>
            <p className="text-xl font-bold font-mono text-rose-300 mt-1">${formatMoney(expectedDrawerCash)}</p>
            <p className="text-[10px] text-slate-500">Float + Cash sales received</p>
          </div>
        </div>
      )}

      {/* Search Filter */}
      <div className="flex items-center gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-rose-500/15">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by receipt number, customer name, or purchased item..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-mono px-2">
          {filteredSales.length} Transactions
        </span>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl glass-panel border border-rose-500/15 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-rose-500/10 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Receipt #</th>
                <th className="py-3.5 px-3">Date & Time</th>
                <th className="py-3.5 px-3">Customer</th>
                <th className="py-3.5 px-3">Items Purchased</th>
                <th className="py-3.5 px-3">Payment</th>
                <th className="py-3.5 px-3 text-right">Subtotal</th>
                <th className="py-3.5 px-4 text-right">Total Paid</th>
                <th className="py-3.5 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Sparkles className="w-5 h-5 animate-spin mx-auto mb-2 text-rose-400" />
                    <span>Loading transactions...</span>
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredSales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-rose-300">
                      {s.receipt_number}
                    </td>
                    <td className="py-3.5 px-3 text-slate-300 whitespace-nowrap">
                      {new Date(s.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-200">
                      {s.customer_name || 'Walk-in Guest'}
                    </td>
                    <td className="py-3.5 px-3 text-slate-400 max-w-xs truncate" title={s.items_summary}>
                      {s.items_summary}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900 border border-slate-800 text-slate-300 uppercase">
                        {s.payment_method === 'CASH' && <Banknote className="w-3 h-3 text-emerald-400" />}
                        {s.payment_method === 'CARD' && <CreditCard className="w-3 h-3 text-sky-400" />}
                        {s.payment_method === 'MOBILE_MONEY' && <Smartphone className="w-3 h-3 text-amber-400" />}
                        {s.payment_method}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-400">
                      ${formatMoney(s?.subtotal)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 text-sm">
                      ${formatMoney(s?.total_amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setActiveReceipt(s)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECEIPT VIEW MODAL */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-rose-500/20 rounded-3xl p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold text-rose-300">Receipt Details</span>
              <button onClick={() => setActiveReceipt(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div id="printable-receipt" className="p-4 rounded-xl bg-white text-slate-900 font-mono text-xs space-y-3">
              <div className="text-center border-b border-dashed border-slate-300 pb-2">
                <h3 className="font-bold text-sm tracking-wider">AURA LUXE COSMETICS</h3>
                <p className="text-[10px] text-slate-600">Receipt #: {activeReceipt.receipt_number}</p>
                <p className="text-[10px] text-slate-500">{new Date(activeReceipt.created_at).toLocaleString()}</p>
                <p className="text-[10px] text-slate-500">Customer: {activeReceipt.customer_name || 'Guest'}</p>
              </div>

              <div className="py-2 border-b border-dashed border-slate-300 text-[11px] space-y-1">
                <p className="font-semibold text-slate-700">Items Purchased:</p>
                <p className="text-slate-800">{activeReceipt.items_summary}</p>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${formatMoney(activeReceipt?.subtotal)}</span>
                </div>
                {activeReceipt.discount_amount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount:</span>
                    <span>-${formatMoney(activeReceipt?.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${formatMoney(activeReceipt?.tax_amount)}</span>
                </div>
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-300">
                  <span>TOTAL:</span>
                  <span>${formatMoney(activeReceipt?.total_amount)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-600 pt-1">
                  <span>Method:</span>
                  <span>{activeReceipt.payment_method}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                onClick={() => setActiveReceipt(null)}
                className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLOSE SHIFT MODAL */}
      {isCloseShiftOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/20 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-white text-base">Reconcile & Close Shift Register</h4>
              <button onClick={() => setIsCloseShiftOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Opening Cash Float:</span>
                <span className="font-mono text-white">${formatMoney(activeShift?.opening_float)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Cash Sales:</span>
                <span className="font-mono text-emerald-400">+{formatMoney(shiftSummary?.cashSales)}</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-200 pt-1 border-t border-slate-800">
                <span>Expected Drawer Total:</span>
                <span className="font-mono text-rose-300">${formatMoney(expectedDrawerCash)}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Actual Counted Cash in Drawer ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={countedCash}
                  onChange={(e) => setCountedCash(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm"
                />
              </div>

              {countedCash && (
                <div className="flex justify-between text-xs p-2 rounded-lg bg-slate-900">
                  <span className="text-slate-400">Drawer Discrepancy:</span>
                  <span
                    className={`font-mono font-bold ${
                      Number(countedCash) - expectedDrawerCash === 0
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    ${formatMoney(Number(countedCash) - expectedDrawerCash)}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-medium mb-1">Shift Notes / Handover</label>
                <textarea
                  rows={2}
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  placeholder="e.g. Balanced drawer, handed keys to evening staff."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsCloseShiftOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseShift}
                disabled={closingShift}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-semibold"
              >
                {closingShift ? 'Closing Register...' : 'Confirm & Close Register'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
