import axios from 'axios';

export async function getBybitData() {
  const [perpRes, spotRes] = await Promise.all([
    axios.get('https://api.bybit.com/v5/market/tickers?category=linear'),
    axios.get('https://api.bybit.com/v5/market/tickers?category=spot')
  ]);

  const spotMap = spotRes.data.result.list.reduce((acc: any, i: any) => ({ ...acc, [i.symbol.replace('USDT', '')]: parseFloat(i.lastPrice) }), {});

  return perpRes.data.result.list.reduce((acc: any, i: any) => {
    const s = i.symbol.replace('USDT', '');
    acc[s] = {
      rate: parseFloat(i.fundingRate),
      interval: parseInt(i.fundingIntervalHour) || 8,
      next: parseInt(i.nextFundingTime),
      perpPrice: parseFloat(i.lastPrice),
      spotPrice: spotMap[s] || null
    };
    return acc;
  }, {});
}