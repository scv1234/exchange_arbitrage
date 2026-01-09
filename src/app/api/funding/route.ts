import { NextResponse } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [bnRes, hlRes] = await Promise.all([
      axios.get('https://fapi.binance.com/fapi/v1/premiumIndex'),
      axios.post('https://api.hyperliquid.xyz/info', { type: 'metaAndAssetCtxs' })
    ]);

    // 1. 바이낸스 데이터 맵핑 (기본 8시간 주기)
    const bnMap = bnRes.data.reduce((acc: any, item: any) => {
      const symbol = item.symbol.replace('USDT', '');
      acc[symbol] = { rate: parseFloat(item.lastFundingRate) };
      return acc;
    }, {});

    // 2. 하이퍼리퀴드 데이터 맵핑 (기본 1시간 주기)
    const meta = hlRes.data[0].universe;
    const ctxs = hlRes.data[1];
    const hlMap = meta.reduce((acc: any, asset: any, i: number) => {
      acc[asset.name] = { rate: parseFloat(ctxs[i].funding) };
      return acc;
    }, {});

    const allSymbols = Array.from(new Set([...Object.keys(bnMap), ...Object.keys(hlMap)]));

    const combined = allSymbols.map((symbol) => {
      const bn = bnMap[symbol];
      const hl = hlMap[symbol];
      
      const bnApr = bn ? bn.rate * 3 * 365 * 100 : null;
      const hlApr = hl ? hl.rate * 24 * 365 * 100 : null;
      
      // 실제 수익률은 두 APR의 차이의 절대값입니다.
      const aprGap = (bnApr !== null && hlApr !== null) ? Math.abs(bnApr - hlApr) : 0;

      return {
        symbol,
        bnRate: bn ? bn.rate * 100 : null,
        hlRate: hl ? hl.rate * 100 : null,
        bnApr,
        hlApr,
        aprGap,
      };
    }).sort((a, b) => b.aprGap - a.aprGap);

    return NextResponse.json({ data: combined, timestamp: Date.now() });
  } catch (error) {
    console.error("Funding API Error:", error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}