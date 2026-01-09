'use client';

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
import { RefreshCcw, ChevronRight, TrendingUp, AlertTriangle } from 'lucide-react';

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function Home() {
  // 5초마다 실시간 데이터 갱신 (API 로직에 바이빗이 포함되어 있어야 합니다)
  const { data, isLoading, error } = useSWR('/api/funding', fetcher, { 
    refreshInterval: 5000,
    revalidateOnFocus: true 
  });

  if (error) return (
    <div className="p-20 text-center text-red-500">
      <AlertTriangle className="w-10 h-10 mx-auto mb-4" />
      <p className="font-bold">데이터를 가져오는 중 오류가 발생했습니다.</p>
      <p className="text-sm opacity-70">서버나 네트워크 상태를 확인해주세요.</p>
    </div>
  );

  if (isLoading || !data) return (
    <div className="p-20 text-center font-mono animate-pulse text-slate-400">
      SCANNING ARBITRAGE OPPORTUNITIES...
    </div>
  );

  return (
    <div className="p-6 max-w-[1500px] mx-auto space-y-6 bg-slate-50 min-h-screen">
      {/* 상단 헤더 영역 */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black italic text-slate-900 tracking-tighter flex items-center gap-2">
            <TrendingUp className="text-blue-600" /> FUNDING TERMINAL
          </h1>
          <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest">
            Binance(8h) vs Hyperliquid(1h) vs Bybit(8h)
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant="outline" className="font-mono text-[10px] py-1.5 px-3 bg-white shadow-sm border-slate-200">
            <RefreshCcw className="w-3 h-3 mr-2 animate-spin text-blue-500" />
            LIVE UPDATE: {new Date(data.timestamp).toLocaleTimeString()}
          </Badge>
          <span className="text-[9px] text-slate-400 italic">* MAX APR Gap 기준 내림차순 정렬됨</span>
        </div>
      </div>

      {/* 실시간 리스트 테이블 */}
      <Card className="border-none shadow-2xl overflow-hidden bg-white rounded-2xl">
        <Table>
          <TableHeader className="bg-slate-950">
            <TableRow className="hover:bg-slate-950 border-none text-xs">
              <TableHead className="text-white font-bold py-5 pl-8 w-[120px]">ASSET</TableHead>
              <TableHead className="text-center text-slate-300 font-bold w-[180px]">추천 포지션</TableHead>
              <TableHead className="text-right text-orange-400 font-black">MAX GAP (APR)</TableHead>
              <TableHead className="text-right text-green-400 font-semibold">바이낸스 (8h)</TableHead>
              <TableHead className="text-right text-red-400 font-semibold">하이퍼리퀴드 (1h)</TableHead>
              <TableHead className="text-right text-yellow-500 font-semibold">바이빗 (8h)</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data?.map((row: any) => {
              // 추천 포지션 스타일 설정 (API에서 계산된 bestPair 사용)
              const recommendation = {
                text: row.bestPair ? `${row.bestPair.short} 숏 / ${row.bestPair.long} 롱` : "데이터 부족",
                style: "bg-indigo-50 text-indigo-700 border-indigo-200"
              };

              return (
                <TableRow key={row.symbol} className="hover:bg-slate-50/80 cursor-pointer group border-b border-slate-50 h-20 transition-all">
                  {/* 1. 자산 티커 */}
                  <TableCell className="pl-8">
                    <Link href={`/coin/${row.symbol}`}>
                      <span className="font-black text-slate-900 text-xl uppercase tracking-tighter group-hover:text-blue-600 transition-colors">
                        {row.symbol}
                      </span>
                    </Link>
                  </TableCell>
                  
                  {/* 2. 추천 포지션 */}
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`font-black px-3 py-1.5 rounded-lg border shadow-sm text-[10px] ${recommendation.style}`}>
                      {recommendation.text}
                    </Badge>
                  </TableCell>
                  
                  {/* 3. 최대 APR 차이 */}
                  <TableCell className="text-right">
                    <div className="font-mono font-black text-2xl text-blue-600">
                      +{row.aprGap.toFixed(2)}%
                    </div>
                  </TableCell>

                  {/* 4. 바이낸스 상세 데이터 */}
                  <TableCell className="text-right">
                    {row.bnApr !== null ? (
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold ${row.bnRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {row.bnRate >= 0 ? '+' : ''}{row.bnRate.toFixed(4)}%
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono font-medium">APR: {row.bnApr.toFixed(2)}%</span>
                      </div>
                    ) : <span className="text-slate-300">-</span>}
                  </TableCell>

                  {/* 5. 하이퍼리퀴드 상세 데이터 */}
                  <TableCell className="text-right">
                    {row.hlApr !== null ? (
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold ${row.hlRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {row.hlRate >= 0 ? '+' : ''}{row.hlRate.toFixed(4)}%
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono font-medium">APR: {row.hlApr.toFixed(2)}%</span>
                      </div>
                    ) : <span className="text-slate-300">-</span>}
                  </TableCell>

                  {/* 6. 바이빗 상세 데이터 */}
                  <TableCell className="text-right">
                    {row.bbApr !== null ? (
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold ${row.bbRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {row.bbRate >= 0 ? '+' : ''}{row.bbRate.toFixed(4)}%
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono font-medium">APR: {row.bbApr.toFixed(2)}%</span>
                      </div>
                    ) : <span className="text-slate-300">-</span>}
                  </TableCell>

                  {/* 상세 페이지 링크 아이콘 */}
                  <TableCell className="text-right pr-6">
                    <Link href={`/coin/${row.symbol}`}>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* 하단 도움말 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-[11px]">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="font-bold text-slate-700 mb-1">💡 추천 원리</p>
          <p className="text-slate-500 leading-relaxed">펀딩비 수치가 낮은 곳(더 -이거나 덜 +인 곳)에서 <b>Long</b>을 잡고, 수치가 높은 곳에서 <b>Short</b>을 쳐서 수익을 극대화합니다.</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="font-bold text-slate-700 mb-1">📊 다중 거래소 비교</p>
          <p className="text-slate-500 leading-relaxed">바이낸스, 하이퍼리퀴드, 바이빗 세 거래소의 APR을 동시에 비교하여 가장 큰 차이가 발생하는 최적의 거래쌍을 추천합니다.</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="font-bold text-slate-700 mb-1">⚠️ 주의사항</p>
          <p className="text-slate-500 leading-relaxed">진입 전 반드시 <b>Exchange Cross Gap(가격차)</b>을 확인하세요. 가격차가 벌어져 있을 때 진입하면 펀딩비 수익보다 가격 차이로 인한 손실이 커질 수 있습니다.</p>
        </div>
      </div>
    </div>
  );
}