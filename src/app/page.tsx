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
  // 5초마다 실시간 데이터 갱신
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
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 bg-slate-50 min-h-screen">
      {/* 상단 헤더 영역 */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black italic text-slate-900 tracking-tighter flex items-center gap-2">
            <TrendingUp className="text-blue-600" /> FUNDING TERMINAL
          </h1>
          <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest">
            Binance Futures (8h) vs Hyperliquid Perps (1h)
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant="outline" className="font-mono text-[10px] py-1.5 px-3 bg-white shadow-sm border-slate-200">
            <RefreshCcw className="w-3 h-3 mr-2 animate-spin text-blue-500" />
            LIVE UPDATE: {new Date(data.timestamp).toLocaleTimeString()}
          </Badge>
          <span className="text-[9px] text-slate-400 italic">* APR Gap 기준 내림차순 정렬됨</span>
        </div>
      </div>

      {/* 실시간 리스트 테이블 */}
      <Card className="border-none shadow-2xl overflow-hidden bg-white rounded-2xl">
        <Table>
          <TableHeader className="bg-slate-950">
            <TableRow className="hover:bg-slate-950 border-none text-xs">
              <TableHead className="text-white font-bold py-5 pl-8 w-[150px]">ASSET</TableHead>
              <TableHead className="text-center text-slate-300 font-bold w-[200px]">추천 포지션</TableHead>
              <TableHead className="text-right text-orange-400 font-black">예상 수익 (APR)</TableHead>
              <TableHead className="text-right text-green-400 font-semibold">바이낸스 (8h / APR)</TableHead>
              <TableHead className="text-right text-red-400 font-semibold">하이퍼리퀴드 (1h / APR)</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data?.map((row: any) => {
              if (row.bnApr === null || row.hlApr === null) return null;

              /**
               * [핵심 추천 로직 수정 완료]
               * 펀딩비가 높은 곳(더 +이거나 덜 -인 곳)에서 '숏'
               * 펀딩비가 낮은 곳(더 -이거나 덜 +인 곳)에서 '롱'
               */
              const isBnHigher = row.bnApr > row.hlApr;
              
              const recommendation = isBnHigher 
                ? { text: "BN 숏 / HL 롱", style: "bg-orange-50 text-orange-700 border-orange-200" }
                : { text: "BN 롱 / HL 숏", style: "bg-blue-50 text-blue-700 border-blue-200" };

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
                  
                  {/* 2. 추천 포지션 (지적하신 로직 반영) */}
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`font-black px-4 py-1.5 rounded-lg border shadow-sm text-xs ${recommendation.style}`}>
                      {recommendation.text}
                    </Badge>
                  </TableCell>
                  
                  {/* 3. 예상 APR 차이 */}
                  <TableCell className="text-right">
                    <div className="font-mono font-black text-2xl text-blue-600">
                      +{row.aprGap.toFixed(2)}%
                    </div>
                  </TableCell>

                  {/* 4. 바이낸스 상세 데이터 */}
                  <TableCell className="text-right">
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold ${row.bnRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {row.bnRate >= 0 ? '+' : ''}{row.bnRate.toFixed(4)}% 
                        <span className="text-[10px] text-slate-400 font-normal ml-1">8h</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono font-medium">APR: {row.bnApr.toFixed(2)}%</span>
                    </div>
                  </TableCell>

                  {/* 5. 하이퍼리퀴드 상세 데이터 */}
                  <TableCell className="text-right">
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold ${row.hlRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {row.hlRate >= 0 ? '+' : ''}{row.hlRate.toFixed(4)}% 
                        <span className="text-[10px] text-slate-400 font-normal ml-1">1h</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono font-medium">APR: {row.hlApr.toFixed(2)}%</span>
                    </div>
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
          <p className="text-slate-500 leading-relaxed">펀딩비 수치가 낮은(음수 방향) 곳에서 <b>Long</b>을 잡아 이자를 받고, 수치가 높은(양수 방향) 곳에서 <b>Short</b>을 쳐서 가격 변동을 헷지합니다.</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="font-bold text-slate-700 mb-1">📊 수익 계산 (APR)</p>
          <p className="text-slate-500 leading-relaxed">양 거래소의 APR 차이가 님의 예상 수익률입니다. GMT처럼 한쪽의 음수 펀딩비가 압도적일 때 기회가 커집니다.</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="font-bold text-slate-700 mb-1">⚠️ 주의사항</p>
          <p className="text-slate-500 leading-relaxed">진입 전 반드시 상세 페이지에서 <b>Exchange Cross Gap(가격차)</b>을 확인하세요. 가격차가 벌어져 있을 때 진입하면 손실이 날 수 있습니다.</p>
        </div>
      </div>
    </div>
  );
}