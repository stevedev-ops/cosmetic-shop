'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  AlertTriangle,
  Clock,
  Send,
  X,
  ChevronRight,
  Bot,
  Copy,
  Check,
  RefreshCw,
  BellRing,
  Truck,
  Package,
} from 'lucide-react';

interface AiAlert {
  id: string;
  type: 'LOW_STOCK' | 'EXPIRATION';
  severity: 'CRITICAL' | 'WARNING' | 'ATTENTION';
  title: string;
  message: string;
  recommendation: string;
  productId: number;
  currentStock: number;
  suggestedReorderQty?: number;
  supplier?: string;
}

export default function AiStockAdvisor() {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<AiAlert[]>([]);
  const [summary, setSummary] = useState('');
  const [activeTab, setActiveTab] = useState<'alerts' | 'chat'>('alerts');
  const [copied, setCopied] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: '👋 Hello! I am your **Aura Luxe AI Stock Copilot**. I continuously scan your cosmetics inventory for low stock levels and expiration dates to protect your store revenue.',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Initial fetch of AI alerts
  const fetchAiData = async () => {
    try {
      const res = await fetch('/api/ai-assistant');
      const data = await res.json();
      if (data.success) {
        setAlerts(data.alerts || []);
        setSummary(data.summary || '');
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAiData();
    // Poll every 30 seconds for real-time stock alert updates
    const interval = setInterval(fetchAiData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: query }]);
    if (!textToSend) setInputPrompt('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, { sender: 'ai', text: data.reply }]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Sorry, I encountered an issue analyzing inventory.' },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lowStockCount = alerts.filter((a) => a.type === 'LOW_STOCK').length;

  return (
    <>
      {/* FLOATING AI TRIGGER BUTTON */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        {lowStockCount > 0 && !isOpen && (
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-red-500/40 text-xs text-red-300 shadow-xl backdrop-blur-md animate-bounce">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="font-semibold">{lowStockCount} items need restock!</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-3.5 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 text-white shadow-xl shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center group"
          title="Open AI Stock Advisor"
        >
          <Sparkles className="w-6 h-6 animate-pulse" />
          {lowStockCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-slate-950">
              {lowStockCount}
            </span>
          )}
        </button>
      </div>

      {/* SLIDE-OVER AI COPILOT DRAWER */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md h-full bg-slate-950 border-l border-rose-500/20 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 border-b border-rose-500/10 bg-slate-900/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-400 p-0.5 shadow-md">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <Bot className="w-4 h-4 text-rose-400" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <span>AI Stock Copilot</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold">
                      Live
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Proactive Low-Stock & Expiry Notification Engine
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('alerts')}
                className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
                  activeTab === 'alerts'
                    ? 'border-rose-500 text-rose-300 bg-rose-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Live Alerts ({alerts.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
                  activeTab === 'chat'
                    ? 'border-rose-500 text-rose-300 bg-rose-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Chat with AI</span>
              </button>
            </div>

            {/* TAB 1: LIVE ALERTS LIST */}
            {activeTab === 'alerts' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                  <p className="text-[11px] leading-relaxed text-slate-400">{summary}</p>
                </div>

                {alerts.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 space-y-2">
                    <Check className="w-8 h-8 mx-auto text-emerald-400" />
                    <p className="text-xs font-medium text-slate-300">Stock Levels Healthy</p>
                    <p className="text-[11px]">No products are below minimum reorder thresholds.</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-red-950/20 border-red-500/40'
                          : alert.type === 'LOW_STOCK'
                          ? 'bg-rose-950/20 border-rose-500/30'
                          : 'bg-amber-950/20 border-amber-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {alert.type === 'LOW_STOCK' ? (
                            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                          ) : (
                            <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          )}
                          <h4 className="text-xs font-bold text-white">{alert.title}</h4>
                        </div>
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            alert.severity === 'CRITICAL'
                              ? 'bg-red-500/30 text-red-300 border border-red-500/40'
                              : 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {alert.severity}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 mt-1.5">{alert.message}</p>

                      <div className="mt-2.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-rose-200">
                        <span className="font-semibold block text-[10px] text-rose-400 mb-0.5">
                          🤖 AI Recommendation:
                        </span>
                        {alert.recommendation}
                      </div>

                      {alert.supplier && (
                        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Truck className="w-3 h-3 text-slate-500" />
                            {alert.supplier}
                          </span>
                          <button
                            onClick={() => {
                              setActiveTab('chat');
                              handleSendMessage(`Draft a supplier restock order for ${alert.title}`);
                            }}
                            className="text-rose-400 hover:text-rose-300 font-semibold"
                          >
                            Draft Restock PO &rarr;
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 2: INTERACTIVE AI CHAT */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-rose-600 text-white rounded-br-sm shadow-md'
                            : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-sm space-y-1'
                        }`}
                      >
                        <div className="whitespace-pre-line">{msg.text}</div>
                        {msg.sender === 'ai' && msg.text.includes('Purchase Order') && (
                          <button
                            onClick={() => copyToClipboard(msg.text)}
                            className="mt-2 flex items-center gap-1 text-[10px] text-rose-300 hover:text-white bg-slate-800 px-2 py-1 rounded-lg transition-colors"
                          >
                            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copied ? 'Copied to Clipboard!' : 'Copy Order Text'}</span>
                          </button>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-500 mt-1 px-1">
                        {msg.sender === 'user' ? 'You' : 'AI Copilot'}
                      </span>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex items-center gap-2 text-xs text-rose-400 p-2">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>AI analyzing store inventory...</span>
                    </div>
                  )}
                </div>

                {/* Quick Prompts */}
                <div className="p-2 border-t border-slate-800 bg-slate-950 flex gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
                  <button
                    onClick={() => handleSendMessage('Which cosmetics are low on stock?')}
                    className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-rose-500/40"
                  >
                    🚨 Low Stock Alerts
                  </button>
                  <button
                    onClick={() => handleSendMessage('Draft supplier purchase order')}
                    className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-rose-500/40"
                  >
                    📋 Draft Supplier PO
                  </button>
                  <button
                    onClick={() => handleSendMessage('Which cosmetics expire soon?')}
                    className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-rose-500/40"
                  >
                    ⏳ Expiry Watchlist
                  </button>
                </div>

                {/* Input form */}
                <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center gap-2">
                  <input
                    type="text"
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask AI: 'What should I restock today?'..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    className="p-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
