import './globals.css';
import Link from 'next/link';
import { LayoutDashboard, Zap, TrendingUp, BarChart3 } from 'lucide-react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="flex bg-slate-50 min-h-screen text-slate-900">
        {/* 사이드바 */}
        <aside className="w-64 bg-slate-950 text-slate-400 flex flex-col fixed h-full border-r border-slate-800 z-50">
          <div className="p-8">
            <h2 className="text-white text-2xl font-black italic flex items-center gap-2 tracking-tighter">
              <Zap className="text-blue-500 fill-blue-500 w-6 h-6" /> ARB.DEX
            </h2>
          </div>
          
          <nav className="flex-1 px-4 space-y-1">
            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Main Menu</p>
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-900 hover:text-white transition-all group bg-slate-900 text-white">
              <LayoutDashboard className="w-5 h-5 text-blue-500" />
              <span className="font-bold text-sm">터미널 대시보드</span>
            </Link>
          </nav>

          <div className="p-6 border-t border-slate-900">
            <div className="bg-slate-900 rounded-xl p-4">
              <div className="flex items-center gap-2 text-[11px] text-emerald-500 font-bold">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                5 DEX LIVE CONNECTED
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 ml-64 min-h-screen bg-slate-50">
          {children}
        </main>
      </body>
    </html>
  );
}