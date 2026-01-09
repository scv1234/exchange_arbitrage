import { NextResponse } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [bnRes, hlRes, bybitRes] = await Promise.all([
      axios.get('https://fapi.binance.com/fapi/v1/premiumIndex'),
      axios.post('https://api.hyperliquid.xyz/info', { type: 'metaAndAssetCtxs' }),
      axios.get('https://api.bybit.com/v5/market/tickers?category=linear') // 바이빗 추가
    ]);

    // 1. 바이낸스 맵핑 (8h)
    const bnMap = bnRes.data.reduce((acc: any, item: any) => {
      const symbol = item.symbol.replace('USDT', '');
      acc[symbol] = { rate: parseFloat(item.lastFundingRate) };
      return acc;
    }, {});

    // 2. 하이퍼리퀴드 맵핑 (1h)
    const meta = hlRes.data[0].universe;
    const ctxs = hlRes.data[1];
    const hlMap = meta.reduce((acc: any, asset: any, i: number) => {
      acc[asset.name] = { rate: parseFloat(ctxs[i].funding) };
      return acc;
    }, {});

    // 3. 바이빗 맵핑 (8h) - 추가된 부분
    const bybitMap = bybitRes.data.result.list.reduce((acc: any, item: any) => {
      const symbol = item.symbol.replace('USDT', '');
      acc[symbol] = { rate: parseFloat(item.fundingRate) };
      return acc;
    }, {});

    const allSymbols = Array.from(new Set([
      ...Object.keys(bnMap), 
      ...Object.keys(hlMap),
      ...Object.keys(bybitMap)
    ]));

    const combined = allSymbols.map((symbol) => {
      const bn = bnMap[symbol];
      const hl = hlMap[symbol];
      const bb = bybitMap[symbol];
      
      const bnApr = bn ? bn.rate * 3 * 365 * 100 : null;
      const hlApr = hl ? hl.rate * 24 * 365 * 100 : null;
      const bbApr = bb ? bb.rate * 3 * 365 * 100 : null; // 바이빗 APR (8h 기준)

      // 세 거래소 중 유효한 APR 값들만 필터링
      const aprs = [
        { name: 'BN', apr: bnApr },
        { name: 'HL', apr: hlApr },
        { name: 'BB', apr: bbApr }
      ].filter(v => v.apr !== null) as { name: string, apr: number }[];

      let aprGap = 0;
      let bestPair = { long: '', short: '' };

      if (aprs.length >= 2) {
        // 가장 높은 APR과 가장 낮은 APR의 차이 계산
        const sorted = [...aprs].sort((a, b) => a.apr - b.apr);
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        aprGap = max.apr - min.apr;
        bestPair = { long: min.name, short: max.name };
      }

      return {
        symbol,
        bnRate: bn ? bn.rate * 100 : null,
        hlRate: hl ? hl.rate * 100 : null,
        bbRate: bb ? bb.rate * 100 : null,
        bnApr,
        hlApr,
        bbApr,
        aprGap,
        bestPair
      };
    }).sort((a, b) => b.aprGap - a.aprGap);

    return NextResponse.json({ data: combined, timestamp: Date.now() });
  } catch (error) {
    console.error("Funding API Error:", error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}