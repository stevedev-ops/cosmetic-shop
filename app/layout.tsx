import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import AiStockAdvisor from '@/components/AiStockAdvisor';

export const metadata: Metadata = {
  title: 'Aura Luxe | Cosmetic Boutique Management & POS System',
  description: 'High-performance day-to-day cosmetic shop operations, expiry tracking, shades inventory, and cashier POS terminal.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-['Plus_Jakarta_Sans',sans-serif] bg-[#0b0f19] text-slate-100 min-h-screen flex antialiased selection:bg-rose-500 selection:text-white relative">
        <Sidebar />
        <main className="flex-1 min-w-0 flex flex-col min-h-screen overflow-y-auto">
          {children}
        </main>
        <AiStockAdvisor />
      </body>
    </html>
  );
}
