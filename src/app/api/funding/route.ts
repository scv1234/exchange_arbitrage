import { NextResponse } from 'next/server';
import { getBinanceData } from '@/lib/services/binance';
import { getBybitData } from '@/lib/services/bybit';
import { getHyperliquidData } from '@/lib/services/hyperliquid';
import { getVariationalData } from '@/lib/services/variational';
import { getLighterData } from '@/lib/services/lighter';

export async function GET() {
  try {
    const results = await Promise.allSettled([
      getBinanceData(), getHyperliquidData(), getBybitData(), getVariationalData(), getLighterData()
    ]);

    const [bnMap, hlMap, bbMap, vrMap, ltMap] = results.map(r => r.status === 'fulfilled' ? r.value : {});
    const allSymbols = Array.from(new Set([...Object.keys(bnMap), ...Object.keys(hlMap), ...Object.keys(bbMap), ...Object.keys(vrMap), ...Object.keys(ltMap)]));

    const combined = allSymbols.map((symbol) => {
      const exchs = [
        { id: 'BN', d: bnMap[symbol] }, { id: 'HL', d: hlMap[symbol] },
        { id: 'BB', d: bbMap[symbol] }, { id: 'VR', d: vrMap[symbol] }, { id: 'LT', d: ltMap[symbol] }
      ];

      const mapped = exchs.map(ex => {
        if (!ex.d) return { id: ex.id, apr: null, rate: null, next: null, price: null, spot: null };
        return {
          id: ex.id,
          apr: ex.d.rate * (24 / (ex.d.interval || 1)) * 365 * 100,
          rate: ex.d.rate * 100,
          next: ex.d.next,
          price: ex.d.perpPrice,
          spot: ex.d.spotPrice
        };
      });

      // 1. 선-선 차익거래용 데이터
      const valid = mapped.filter(m => m.apr !== null).sort((a, b) => a.apr! - b.apr!);
      const aprGap = valid.length >= 2 ? valid[valid.length - 1].apr! - valid[0].apr! : 0;

      // 2. 현-선 차익거래용 데이터 (Best Funding 추출)
      const bestFunding = valid.length > 0 ? valid[valid.length - 1] : null;
      const refSpot = mapped[0].spot || mapped[2].spot || mapped[1].spot || 0; // BN > BB > HL 순서로 현물가 참조
      const basis = (refSpot > 0 && bestFunding?.price) ? ((bestFunding.price / refSpot) - 1) * 100 : 0;
      const dailyReturn = (basis / 30) + ((bestFunding?.apr || 0) / 365);

      return {
        symbol,
        bn: mapped[0], hl: mapped[1], bb: mapped[2], vr: mapped[3], lt: mapped[4],
        aprGap,
        bestFunding,
        basis,
        dailyReturn,
        bestPair: valid.length >= 2 ? { long: valid[0].id, short: valid[valid.length - 1].id } : null
      };
    });

    return NextResponse.json({ data: combined, timestamp: Date.now() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}