export const getYahooTicker = (asset: string): string => {
  const map: Record<string, string> = {
    'EUR': 'EURUSD=X',
    'GBP': 'GBPUSD=X',
    'JPY': 'JPYUSD=X',
    'BTC': 'BTC-USD',
    'ETH': 'ETH-USD',
    'SOL': 'SOL-USD',
    'ADA': 'ADA-USD',
    'XRP': 'XRP-USD',
    'S&P 500': '^GSPC',
    'MSCI World': 'URTH',
    'NASDAQ': '^NDX',
    'GOLD': 'GC=F',
    'ORO': 'GC=F',
    'SILVER': 'SI=F',
    'PLATA': 'SI=F',
  };
  return map[asset.toUpperCase()] || asset.toUpperCase();
};

export const fetchAssetPrice = async (asset: string): Promise<number | null> => {
  if (!asset || asset === 'USD') return 1;
  
  const ticker = getYahooTicker(asset);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`;

  // Try primary proxy (AllOrigins)
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    if (response.ok) {
      const data = await response.json();
      if (data.contents) {
        const parsedData = JSON.parse(data.contents);
        const price = parsedData.chart?.result?.[0]?.meta?.regularMarketPrice;
        if (price) return price;
      }
    }
  } catch (e) {
    // Silently fail and try fallback
  }

  // Try fallback proxy (CodeTabs)
  try {
    const fallbackUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`;
    const response = await fetch(fallbackUrl);
    if (response.ok) {
      const parsedData = await response.json();
      const price = parsedData.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (price) return price;
    }
  } catch (e) {
    // Silently fail if both proxies or the ticker itself fails
  }

  return null;
};
