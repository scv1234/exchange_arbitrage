'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import Link from 'next/link';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCcw, 
  ChevronRight, 
  TrendingUp, 
  Clock, 
  Search, 
  ArrowRightLeft,
  LayoutDashboard
} from 'lucide-react';

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

// 시간 포맷 헬퍼 함수
const formatTime = (ts: number | null) => {
  if (!ts) return "-";
  const diff = ts - Date.now();
  if (diff <= 0) return "정산중";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
};

// 선-선 탭 전용 거래소 셀 컴포넌트
const ExchangeCell = ({ data, color }: { data: any, color: string }) => {
  if (!data || data.apr === null) return <TableCell className="text-right text-slate-300">-</TableCell>;
  return (
    <TableCell className="text-right">
      <div className="flex flex-col">
        <span className={`text-sm font-bold ${data.rate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {data.rate >= 0 ? '+' : ''}{data.rate.toFixed(4)}%
        </span>
        <span className="text-[10px] text-slate-400 font-mono">APR: {data.apr.toFixed(2)}%</span>
        <span className={`text-[9px] font-bold flex items-center justify-end gap-1 mt-0.5 ${color}`}>
          <Clock className="w-2.5 h-2.5" /> {formatTime(data.next)}
        </span>
      </div>
    </TableCell>
  );
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'funding' | 'basis'>('funding');
  const [search, setSearch] = useState('');
  
  // 5초 간격 실시간 데이터 갱신
  const { data, isLoading } = useSWR('/api/funding', fetcher, { 
    refreshInterval: 5000,
    revalidateOnFocus: true 
  });

  // 탭 및 검색어에 따른 필터링/정렬 로직
  const filtered = useMemo(() => {
    if (!data?.data) return [];
    
    let list = [...data.data].filter((c: any) => 
      c.symbol.toUpperCase().includes(search.toUpperCase())
    );

    if (activeTab === 'funding') {
      // 1. 선-선 정렬: APR Gap 높은 순
      list.sort((a, b) => b.aprGap - a.aprGap);
    } else {
      // 2. 현-선 필터: 펀딩 APR이 +가 아닌 코인 제외
      // 3. 현-선 정렬: Daily Return 높은 순
      list = list.filter((c: any) => (c.bestFunding?.apr || 0) > 0)
                 .sort((a, b) => b.dailyReturn - a.dailyReturn);
    }
    return list;
  }, [data, search, activeTab]);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen font-mono animate-pulse text-slate-400">
      INITIALIZING ARBITRAGE TERMINAL...
    </div>
  );

  return (
    <div className="p-10 space-y-8">
      {/* 상단 헤더 섹션 */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic flex items-center gap-3">
            <LayoutDashboard className="w-10 h-10 text-blue-600" /> TERMINAL.v2
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-widest">
            Real-time Multi-DEX Arbitrage Engine
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search ticker..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm transition-all"
            />
          </div>
          <Badge variant="outline" className="h-10 px-4 bg-white border-slate-200 font-mono text-blue-600 font-bold shadow-sm">
            <RefreshCcw className="w-3 h-3 mr-2 animate-spin" />
            {new Date(data.timestamp).toLocaleTimeString()}
          </Badge>
        </div>
      </div>

      {/* 전략 전환 탭 */}
      <div className="flex gap-2 p-1.5 bg-slate-200/50 w-fit rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveTab('funding')}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black transition-all ${
            activeTab === 'funding' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> 선-선 (Funding)
        </button>
        <button
          onClick={() => setActiveTab('basis')}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black transition-all ${
            activeTab === 'basis' ? 'bg-white text-orange-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" /> 현-선 (Basis)
        </button>
      </div>

      {/* 데이터 테이블 카드 */}
      <Card className="border-none shadow-2xl overflow-hidden rounded-[2.5rem] bg-white">
        <Table>
          <TableHeader className="bg-slate-950">
            {activeTab === 'funding' ? (
              <TableRow className="border-none hover:bg-slate-950">
                <TableHead className="text-white py-6 pl-12 font-bold">ASSET</TableHead>
                <TableHead className="text-center text-slate-400 font-bold">BEST STRATEGY</TableHead>
                <TableHead className="text-right text-blue-400 font-black">MAX APR GAP</TableHead>
                <TableHead className="text-right text-slate-400">BINANCE</TableHead>
                <TableHead className="text-right text-slate-400">HYPERLIQUID</TableHead>
                <TableHead className="text-right text-slate-400">BYBIT</TableHead>
                <TableHead className="text-right text-slate-400">VARIATIONAL</TableHead>
                <TableHead className="text-right text-slate-400">LIGHTER</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            ) : (
              <TableRow className="border-none hover:bg-slate-950">
                <TableHead className="text-white py-6 pl-12 font-bold">ASSET</TableHead>
                <TableHead className="text-right text-slate-400">BN SPOT</TableHead>
                <TableHead className="text-right text-slate-400">BB SPOT</TableHead>
                <TableHead className="text-right text-slate-400">HL SPOT</TableHead>
                <TableHead className="text-right text-green-400 font-bold">BEST FUTURES (MKT/PRICE/APR)</TableHead>
                <TableHead className="text-right text-blue-400 font-black">DAILY RETURN</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            )}
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? filtered.map((row: any) => (
              activeTab === 'funding' ? (
                /* 1. 선-선 차익거래 행 렌더링 */
                <TableRow key={row.symbol} className="h-28 hover:bg-slate-50/80 group transition-all">
                  <TableCell className="pl-12 font-black text-2xl uppercase tracking-tighter group-hover:text-blue-600 transition-colors">
                    <Link href={`/coin/${row.symbol}`}>{row.symbol}</Link>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-blue-50 text-blue-700 border-blue-100 font-black px-4 py-2 text-[10px] rounded-lg">
                      {row.bestPair?.short} SHORT / {row.bestPair?.long} LONG
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-black text-3xl text-blue-600">
                    +{row.aprGap?.toFixed(2)}%
                  </TableCell>
                  <ExchangeCell data={row.bn} color="text-blue-500" />
                  <ExchangeCell data={row.hl} color="text-red-500" />
                  <ExchangeCell data={row.bb} color="text-yellow-600" />
                  <ExchangeCell data={row.vr} color="text-indigo-500" />
                  <ExchangeCell data={row.lt} color="text-emerald-600" />
                  <TableCell className="pr-8">
                    <Link href={`/coin/${row.symbol}`}>
                      <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-blue-500 transition-all group-hover:translate-x-1" />
                    </Link>
                  </TableCell>
                </TableRow>
              ) : (
                /* 2. 현-선 차익거래 행 렌더링 */
                <TableRow key={row.symbol} className="h-28 hover:bg-slate-50/80 group transition-all">
                  <TableCell className="pl-12 font-black text-2xl uppercase tracking-tighter">
                    <Link href={`/coin/${row.symbol}`}>{row.symbol}</Link>
                  </TableCell>
                  
                  {/* 주요 3개 거래소 현물 가격 */}
                  <TableCell className="text-right font-mono text-slate-600 font-medium">
                    {row.spotPrices?.bn ? `$${row.spotPrices.bn.toLocaleString()}` : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-slate-600 font-medium">
                    {row.spotPrices?.bb ? `$${row.spotPrices.bb.toLocaleString()}` : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-slate-600 font-medium">
                    {row.spotPrices?.hl ? `$${row.spotPrices.hl.toLocaleString()}` : "-"}
                  </TableCell>
                  
                  {/* 최고 펀딩비 시장 추출 데이터 */}
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-black border-slate-300">{row.bestFunding?.id}</Badge>
                        <span className="font-mono text-base font-bold text-slate-800">
                          ${row.bestFunding?.price?.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-xs text-green-600 font-black">
                        FUNDING APR: +{row.bestFunding?.apr?.toFixed(2)}%
                      </span>
                    </div>
                  </TableCell>
                  
                  {/* 일일 기대 수익률 */}
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <Badge className="bg-blue-600 text-white font-black px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 text-sm">
                        +{row.dailyReturn?.toFixed(3)}% / DAY
                      </Badge>
                      <span className="text-[9px] text-slate-400 mt-1 font-mono uppercase">Basis Conv. + Funding</span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="pr-8">
                    <Link href={`/coin/${row.symbol}`}>
                      <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-blue-500 transition-all" />
                    </Link>
                  </TableCell>
                </TableRow>
              )
            )) : (
              <TableRow>
                <TableCell colSpan={activeTab === 'funding' ? 9 : 7} className="text-center py-32 text-slate-400 font-mono tracking-widest">
                  NO PROFITABLE ASSETS DETECTED IN THIS CATEGORY
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}