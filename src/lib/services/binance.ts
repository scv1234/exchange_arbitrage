import axios from 'axios';

export async function getBinanceData() {
  const [perpRes, infoRes, spotRes] = await Promise.all([
    axios.get('https://fapi.binance.com/fapi/v1/premiumIndex'),
    axios.get('https://fapi.binance.com/fapi/v1/fundingInfo'),
    axios.get('https://api.binance.com/api/v3/ticker/price')
  ]);

  const intervals = infoRes.data.reduce((acc: any, i: any) => ({ ...acc, [i.symbol]: i.fundingIntervalHours }), {});
  const spotMap = spotRes.data.reduce((acc: any, i: any) => ({ ...acc, [i.symbol.replace('USDT', '')]: parseFloat(i.price) }), {});

  return perpRes.data.reduce((acc: any, i: any) => {
    const s = i.symbol.replace('USDT', '');
    acc[s] = {
      rate: parseFloat(i.lastFundingRate),
      interval: intervals[i.symbol] || 8,
      next: parseInt(i.nextFundingTime),
      perpPrice: parseFloat(i.markPrice),
      spotPrice: spotMap[s] || null
    };
    return acc;
  }, {});
}