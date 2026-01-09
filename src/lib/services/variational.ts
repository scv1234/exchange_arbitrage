import axios from 'axios';

export async function getVariationalData() {
  const res = await axios.get('https://omni.variational.io/api/metadata/supported_assets');
  const data = res.data;
  const nextHour = new Date();
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);

  return Object.keys(data).reduce((acc: any, sym: string) => {
    const asset = data[sym][0];
    if (asset && asset.has_perp) {
      acc[sym.toUpperCase()] = {
        rate: parseFloat(asset.interest_rate || asset.funding_rate || 0),
        interval: 1, // 3600s 고정
        next: nextHour.getTime(),
        price: parseFloat(asset.price || 0)
      };
    }
    return acc;
  }, {});
}