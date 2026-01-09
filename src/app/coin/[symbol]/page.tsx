'use client';

import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, Database, Activity, BarChart3 } from 'lucide-react';

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function CoinDetail() {
  const params = useParams();
  const router = useRouter();
  const symbol = params?.symbol;

  const { data, isLoading } = useSWR('/api/funding', fetcher, { refreshInterval: 3000 });

  if (isLoading || !data) return <div className="p-20 text-center font-mono">데이터 로딩 중...</div>;

  const coin = data.data?.find((c: any) => c.symbol === symbol);

  if (!coin) return <div className="p-20 text-center">데이터를 찾을 수 없습니다.</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/')} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> 리스트로
        </Button>
        <div className="text-right">
          <h2 className="text-4xl font-black italic text-slate-900">{symbol}</h2>
          <Badge variant="outline">REAL-TIME DATA</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">PRICE</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold">BN: ${coin.bnPrice?.toFixed(4) || '-'}</div>
            <div className="text-sm font-semibold">HL: ${coin.hlPrice?.toFixed(4) || '-'}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">CROSS GAP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{coin.crossSpread?.toFixed(3) || '0.000'}%</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">BN SPREAD</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{coin.bnInternalSpread?.toFixed(4) || '0.0000'}%</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-slate-800 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">HL OI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">
              {coin.hlOi ? (coin.hlOi / 1000).toFixed(1) + 'K' : '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-950 text-white p-10 rounded-2xl shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-center">
          <div className="space-y-4">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Binance APR</p>
            <div className="text-6xl font-black text-green-400 font-mono">
              {coin.bnApr !== null ? `${coin.bnApr.toFixed(2)}%` : '-'}
            </div>
          </div>
          <div className="space-y-4 border-l border-slate-800">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Hyperliquid APR</p>
            <div className="text-6xl font-black text-red-400 font-mono">
              {coin.hlApr !== null ? `${coin.hlApr.toFixed(2)}%` : '-'}
            </div>
          </div>
        </div>
        <div className="mt-10 pt-10 border-t border-slate-800 text-center">
          <div className="text-slate-400 mb-2 text-xs uppercase">Annualized Gap</div>
          <div className="text-3xl font-bold text-blue-400">
            {Math.abs(coin.aprGap || 0).toFixed(2)}%
          </div>
        </div>
      </Card>
    </div>
  );
}