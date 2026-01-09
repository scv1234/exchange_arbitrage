import axios from 'axios';

export async function getHyperliquidData() {
  const res = await axios.post('https://api.hyperliquid.xyz/info', { type: 'metaAndAssetCtxs' });
  const universe = res.data[0].universe;
  const ctxs = res.data[1];
  
  const nextHour = new Date();
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);

  const dataMap: any = { perp: {}, spot: {} };
  universe.forEach((asset: any, i: number) => {
    const symbol = asset.name.toUpperCase();
    const ctx = ctxs[i];
    if (ctx.funding) {
      dataMap.perp[symbol] = { rate: parseFloat(ctx.funding), interval: 1, next: nextHour.getTime(), perpPrice: parseFloat(ctx.midPrice) };
    } else {
      dataMap.spot[symbol] = parseFloat(ctx.midPrice);
    }
  });

  // 선물 데이터에 현물 가격 매칭
  Object.keys(dataMap.perp).forEach(s => {
    dataMap.perp[s].spotPrice = dataMap.spot[s] || null;
  });

  return dataMap.perp;
}