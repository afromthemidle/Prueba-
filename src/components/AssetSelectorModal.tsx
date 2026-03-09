import React, { useState, useEffect } from 'react';
import { X, Search, Loader2, AlertCircle, TrendingUp, Globe } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { fetchAssetPrice, searchMarketAssets, MarketSearchResult } from '../services/marketData';

interface AssetSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: string) => void;
  portfolioPrices?: Record<string, number>;
}

const PREDEFINED_ASSETS = [
  { symbol: 'USD', name: 'US Dollar', type: 'Currency' },
  { symbol: 'EUR', name: 'Euro', type: 'Currency' },
  { symbol: 'GBP', name: 'British Pound', type: 'Currency' },
  { symbol: 'JPY', name: 'Japanese Yen', type: 'Currency' },
  { symbol: 'BTC', name: 'Bitcoin', type: 'Crypto' },
  { symbol: 'ETH', name: 'Ethereum', type: 'Crypto' },
  { symbol: 'SOL', name: 'Solana', type: 'Crypto' },
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'Stock' },
  { symbol: 'MSFT', name: 'Microsoft', type: 'Stock' },
  { symbol: 'GOOGL', name: 'Alphabet', type: 'Stock' },
  { symbol: 'AMZN', name: 'Amazon', type: 'Stock' },
  { symbol: 'TSLA', name: 'Tesla', type: 'Stock' },
  { symbol: 'NVDA', name: 'NVIDIA', type: 'Stock' },
  { symbol: 'GOLD', name: 'Gold', type: 'Commodity' },
  { symbol: 'SILVER', name: 'Silver', type: 'Commodity' },
  { symbol: 'S&P 500', name: 'S&P 500 Index', type: 'Index' },
  { symbol: 'NASDAQ', name: 'NASDAQ 100', type: 'Index' },
];

export function AssetSelectorModal({ isOpen, onClose, onSelect, portfolioPrices = {} }: AssetSelectorModalProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [prices, setPrices] = useState<Record<string, number | null>>({});
  const [loadingPrices, setLoadingPrices] = useState<Record<string, boolean>>({});
  
  const [marketResults, setMarketResults] = useState<MarketSearchResult[]>([]);
  const [isSearchingMarket, setIsSearchingMarket] = useState(false);
  const [marketSearchError, setMarketSearchError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setMarketResults([]);
      setMarketSearchError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredPredefined = PREDEFINED_ASSETS.filter(a => 
    a.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMarketSearch = async () => {
    if (!searchTerm) return;
    setIsSearchingMarket(true);
    setMarketSearchError(false);
    setMarketResults([]);
    
    const results = await searchMarketAssets(searchTerm);
    
    if (results.length > 0) {
      setMarketResults(results);
      // Fetch prices for the results
      results.forEach(result => {
        if (prices[result.symbol] === undefined && !loadingPrices[result.symbol]) {
          setLoadingPrices(prev => ({ ...prev, [result.symbol]: true }));
          fetchAssetPrice(result.symbol).then(price => {
            setPrices(prev => ({ ...prev, [result.symbol]: price }));
            setLoadingPrices(prev => ({ ...prev, [result.symbol]: false }));
          });
        }
      });
    } else {
      setMarketSearchError(true);
    }
    setIsSearchingMarket(false);
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return '---';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: price < 1 ? 4 : 2 }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">{t("Select Asset")}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t("Search by symbol or name...")}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setMarketSearchError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleMarketSearch();
                }
              }}
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {searchTerm && filteredPredefined.length === 0 && marketResults.length === 0 && (
            <div className="p-4 text-center">
              <p className="text-sm text-slate-600 mb-4">
                {t("No predefined assets found for")} "{searchTerm}".
              </p>
              <button
                onClick={handleMarketSearch}
                disabled={isSearchingMarket}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-medium hover:bg-indigo-100 transition-colors disabled:opacity-50"
              >
                {isSearchingMarket ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                {t("Search market for")} "{searchTerm.toUpperCase()}"
              </button>
              
              {marketSearchError && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  {t("Asset not found or no market quote available.")}
                </div>
              )}
            </div>
          )}

          {marketResults.length > 0 && (
            <div className="mb-4">
              <h3 className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider flex justify-between items-center">
                <span>{t("Market Results")}</span>
                <button 
                  onClick={() => setMarketResults([])}
                  className="text-indigo-600 hover:text-indigo-700 text-[10px] font-medium"
                >
                  {t("Clear")}
                </button>
              </h3>
              <div className="space-y-1">
                {marketResults.map(asset => {
                  const price = prices[asset.symbol];
                  const isLoading = loadingPrices[asset.symbol];
                  const hasQuote = price !== null && price !== undefined;
                  
                  return (
                    <button
                      key={asset.symbol}
                      onClick={() => {
                        if (hasQuote) onSelect(asset.symbol);
                      }}
                      disabled={!hasQuote && !isLoading}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left group border border-indigo-50
                        ${(!hasQuote && !isLoading) ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'hover:bg-indigo-50 cursor-pointer bg-white'}
                      `}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                          {asset.symbol.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">{asset.symbol}</div>
                          <div className="text-xs text-slate-500 truncate">{asset.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{asset.exchange} • {asset.type}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-slate-400 inline-block" />
                        ) : (
                          <>
                            <div className="font-mono font-medium text-slate-900">
                              {formatPrice(price !== undefined ? price : null)}
                            </div>
                            {hasQuote ? (
                              <div className="text-[10px] text-emerald-600 flex items-center justify-end gap-1 mt-0.5">
                                <TrendingUp className="w-3 h-3" /> {t("Live Quote")}
                              </div>
                            ) : (
                              <div className="text-[10px] text-red-500 mt-0.5">
                                {t("No quote")}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredPredefined.length > 0 && marketResults.length === 0 && (
            <div>
              <div className="flex justify-between items-center px-3 py-2">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {searchTerm ? t("Search Results") : t("Popular Assets")}
                </h3>
                {searchTerm && (
                  <button
                    onClick={handleMarketSearch}
                    disabled={isSearchingMarket}
                    className="text-indigo-600 hover:text-indigo-700 text-[10px] font-medium flex items-center gap-1"
                  >
                    {isSearchingMarket ? <Loader2 className="w-3 h-3 animate-spin" /> : <Globe className="w-3 h-3" />}
                    {t("Search Market")}
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {filteredPredefined.map(asset => {
                  const localPrice = prices[asset.symbol];
                  const portfolioPrice = portfolioPrices[asset.symbol];
                  const price = localPrice !== undefined ? localPrice : portfolioPrice;
                  const isLoading = loadingPrices[asset.symbol];
                  const hasQuote = price !== null && price !== undefined;
                  const isFailed = price === null;
                  
                  return (
                    <button
                      key={asset.symbol}
                      onClick={() => {
                        if (!isFailed) onSelect(asset.symbol);
                      }}
                      disabled={isFailed}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left group
                        ${isFailed ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm border border-slate-200">
                          {asset.symbol.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{asset.symbol}</div>
                          <div className="text-xs text-slate-500">{t(asset.name)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-slate-400 inline-block" />
                        ) : (
                          <>
                            <div className="font-mono font-medium text-slate-900">
                              {formatPrice(price !== undefined ? price : null)}
                            </div>
                            {hasQuote && asset.symbol !== 'USD' && (
                              <div className="text-[10px] text-emerald-600 flex items-center justify-end gap-1 mt-0.5">
                                <TrendingUp className="w-3 h-3" /> {t("Live Quote")}
                              </div>
                            )}
                            {isFailed && asset.symbol !== 'USD' && (
                              <div className="text-[10px] text-red-500 mt-0.5">
                                {t("No quote")}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
