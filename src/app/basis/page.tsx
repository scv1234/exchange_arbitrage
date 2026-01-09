'use client';

import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Zap } from 'lucide-react';

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const formatTime = (ts: number | null) => {
  if (!ts) return "-";
  const diff = ts - Date.now();
  if (diff <= 0) return "정산중";
  return `${Math.floor(diff / 3600000)}h ${Math.floor((diff % 3600000) / 60000)}m`;
};

const ExchangeDetailCard = ({ label, data, color }: { label: string, data: any, color: string }) => {
  const hasData = data && data.apr !== null && data.apr !== undefined;
  return (
    <div className="space-y-4 text-center">
      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{label}</p>
      <div className={`text-4xl font-black font-mono ${color}`}>
        {hasData ? `${data.apr.toFixed(2)}%` : '-'}
      </div>
      <div className="flex flex-col gap-1 items-center">
        <p className="text-[10px] text-slate-400 font-mono">
          Rate: {hasData && data.rate !== undefined ? `${data.rate.toFixed(4)}%` : '-'}
        </p>
        <p className="text-[10px] text-slate-500 flex items-center gap-1">
          <Clock className="w-3 h-3" /> {hasData ? formatTime(data.next) : '-'}
        </p>
      </div>
    </div>
  );
};

export default function CoinDetail() {
  const params = useParams();
  const router = useRouter();
  const symbol = params?.symbol;
  const { data, isLoading } = useSWR('/api/funding', fetcher, { refreshInterval: 5000 });

  if (isLoading || !data) return <div className="p-20 text-center font-mono">LOADING...</div>;

  const coin = data.data?.find((c: any) => c.symbol === symbol);
  if (!coin) return <div className="p-20 text-center">NOT FOUND</div>;

  return (
    <div className="p-10 max-w-6xl mx-auto space-y-8 ml-64">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2"><ArrowLeft className="w-4 h-4" /> 뒤로</Button>
        <h2 className="text-5xl font-black italic text-slate-900 tracking-tighter">{symbol}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-600 text-white border-none shadow-xl p-6">
          <p className="text-xs opacity-70 mb-2 font-bold uppercase">Max APR Gap</p>
          <div className="text-4xl font-black">{coin.aprGap?.toFixed(2)}%</div>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm p-6">
          <p className="text-xs text-slate-500 mb-2 font-bold uppercase">Current Basis</p>
          <div className={`text-4xl font-black ${coin.basis > 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {coin.basis > 0 ? '+' : ''}{coin.basis?.toFixed(3)}%
          </div>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm p-6">
          <p className="text-xs text-slate-500 mb-2 font-bold uppercase">Recommendation</p>
          <Badge className="bg-indigo-600 text-white text-sm font-bold px-3 py-1">
            {coin.bestPair?.short || '-'} SHORT / {coin.bestPair?.long || '-'} LONG
          </Badge>
        </Card>
      </div>

      <Card className="bg-slate-950 text-white p-12 rounded-[2rem] shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <ExchangeDetailCard label="Binance" data={coin.bn} color="text-green-400" />
          <ExchangeDetailCard label="Hyperliquid" data={coin.hl} color="text-red-400" />
          <ExchangeDetailCard label="Bybit" data={coin.bb} color="text-yellow-400" />
          <ExchangeDetailCard label="Variational" data={coin.vr} color="text-indigo-400" />
          <ExchangeDetailCard label="Lighter" data={coin.lt} color="text-emerald-400" />
        </div>
      </Card>
    </div>
  );
}