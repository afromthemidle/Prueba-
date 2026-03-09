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

export interface MarketSearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
}

export const searchMarketAssets = async (query: string): Promise<MarketSearchResult[]> => {
  if (!query) return [];
  
  try {
    const response = await fetch(`/api/market/search?q=${encodeURIComponent(query)}`);
    if (response.ok) {
      const parsedData = await response.json();
      if (parsedData.quotes && Array.isArray(parsedData.quotes)) {
        return parsedData.quotes
          .filter((q: any) => q.quoteType && q.symbol)
          .map((q: any) => ({
            symbol: q.symbol,
            name: q.shortname || q.longname || q.symbol,
            type: q.quoteType,
            exchange: q.exchDisp || q.exchange || ''
          }));
      }
    }
  } catch (e) {
    console.error("Error searching market assets via API", e);
  }
  
  // Client-side fallback directly to Yahoo Finance (sometimes CORS is allowed)
  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`;
    const response = await fetch(url);
    if (response.ok) {
      const parsedData = await response.json();
      if (parsedData.quotes && Array.isArray(parsedData.quotes)) {
        return parsedData.quotes
          .filter((q: any) => q.quoteType && q.symbol)
          .map((q: any) => ({
            symbol: q.symbol,
            name: q.shortname || q.longname || q.symbol,
            type: q.quoteType,
            exchange: q.exchDisp || q.exchange || ''
          }));
      }
    }
  } catch (e) {
    console.error("Error searching market assets directly", e);
  }
  
  return [];
};

export const fetchAssetPrice = async (asset: string): Promise<number | null> => {
  if (!asset || asset === 'USD') return 1;
  
  const ticker = getYahooTicker(asset);
  
  try {
    const response = await fetch(`/api/market/price?symbol=${encodeURIComponent(ticker)}`);
    if (response.ok) {
      const parsedData = await response.json();
      const price = parsedData.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (price) return price;
    }
  } catch (e) {
    console.error("Error fetching price for", asset, "via API", e);
  }

  // Client-side fallback directly to Yahoo Finance
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`;
    const response = await fetch(url);
    if (response.ok) {
      const parsedData = await response.json();
      const price = parsedData.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (price) return price;
    }
  } catch (e) {
    console.error("Error fetching price for", asset, "directly", e);
  }

  return null;
};
