import axios from 'axios';

export async function getLighterData() {
  const [markets, stats] = await Promise.all([
    axios.get('https://mainnet.zklighter.elliot.ai/api/v1/orderBooks'),
    axios.get('https://mainnet.zklighter.elliot.ai/api/v1/marketStats')
  ]);

  const ltStats = stats.data.market_stats;
  const nextHour = new Date();
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);

  return (markets.data.order_books || []).reduce((acc: any, m: any) => {
    const stat = ltStats[m.market_id];
    if (stat && m.market_type === 'perp') {
      const sym = m.symbol.toUpperCase().replace('-USDC', '');
      acc[sym] = {
        rate: parseFloat(stat.current_funding_rate || 0),
        interval: 1,
        next: nextHour.getTime(),
        perpPrice: parseFloat(stat.last_trade_price || 0),
        spotPrice: null // Lighter는 해당 마켓의 현물 페어가 별도로 존재할 경우 추가 매핑 필요
      };
    }
    return acc;
  }, {});
}