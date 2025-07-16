export default async function handler(req, res) {
    const { coin, days } = req.query;
  
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=${days || 30}`
      );
      const data = await response.json();
  
      const chartData = data.prices.map(item => ({
        date: item[0],
        open: item[1],
        high: item[1] * 1.01,
        low: item[1] * 0.99,
        close: item[1],
      }));
  
      res.status(200).json(chartData);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch chart data' });
    }
  }