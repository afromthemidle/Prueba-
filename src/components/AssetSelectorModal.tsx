import React, { useState, useEffect } from 'react';
import { X, Search, Loader2, AlertCircle, TrendingUp } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { fetchAssetPrice } from '../services/marketData';

interface AssetSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: string) => void;
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

export function AssetSelectorModal({ isOpen, onClose, onSelect }: AssetSelectorModalProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [prices, setPrices] = useState<Record<string, number | null>>({});
  const [loadingPrices, setLoadingPrices] = useState<Record<string, boolean>>({});
  
  const [customAsset, setCustomAsset] = useState<{symbol: string, price: number | null} | null>(null);
  const [isSearchingCustom, setIsSearchingCustom] = useState(false);
  const [customSearchError, setCustomSearchError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setCustomAsset(null);
      setCustomSearchError(false);
      
      // Fetch prices for predefined assets that we don't have yet
      PREDEFINED_ASSETS.forEach(asset => {
        if (prices[asset.symbol] === undefined && !loadingPrices[asset.symbol]) {
          setLoadingPrices(prev => ({ ...prev, [asset.symbol]: true }));
          fetchAssetPrice(asset.symbol).then(price => {
            setPrices(prev => ({ ...prev, [asset.symbol]: price }));
            setLoadingPrices(prev => ({ ...prev, [asset.symbol]: false }));
          });
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredPredefined = PREDEFINED_ASSETS.filter(a => 
    a.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCustomSearch = async () => {
    if (!searchTerm) return;
    const upperSearch = searchTerm.toUpperCase();
    setIsSearchingCustom(true);
    setCustomSearchError(false);
    
    const price = await fetchAssetPrice(upperSearch);
    if (price !== null) {
      setCustomAsset({ symbol: upperSearch, price });
      setPrices(prev => ({ ...prev, [upperSearch]: price }));
    } else {
      setCustomSearchError(true);
      setCustomAsset(null);
    }
    setIsSearchingCustom(false);
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
                setCustomSearchError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCustomSearch();
                }
              }}
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {searchTerm && filteredPredefined.length === 0 && !customAsset && (
            <div className="p-4 text-center">
              <p className="text-sm text-slate-600 mb-4">
                {t("No predefined assets found for")} "{searchTerm}".
              </p>
              <button
                onClick={handleCustomSearch}
                disabled={isSearchingCustom}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-medium hover:bg-indigo-100 transition-colors disabled:opacity-50"
              >
                {isSearchingCustom ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {t("Search market for")} "{searchTerm.toUpperCase()}"
              </button>
              
              {customSearchError && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  {t("Asset not found or no market quote available.")}
                </div>
              )}
            </div>
          )}

          {customAsset && (
            <div className="mb-4">
              <h3 className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t("Search Result")}
              </h3>
              <button
                onClick={() => onSelect(customAsset.symbol)}
                className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors text-left group border border-indigo-100 bg-indigo-50/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                    {customAsset.symbol.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{customAsset.symbol}</div>
                    <div className="text-xs text-slate-500">{t("Custom Asset")}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-medium text-slate-900">
                    {formatPrice(customAsset.price)}
                  </div>
                  <div className="text-[10px] text-emerald-600 flex items-center justify-end gap-1 mt-0.5">
                    <TrendingUp className="w-3 h-3" /> {t("Live Quote")}
                  </div>
                </div>
              </button>
            </div>
          )}

          {filteredPredefined.length > 0 && (
            <div>
              <h3 className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {searchTerm ? t("Search Results") : t("Popular Assets")}
              </h3>
              <div className="space-y-1">
                {filteredPredefined.map(asset => {
                  const price = prices[asset.symbol];
                  const isLoading = loadingPrices[asset.symbol];
                  const hasQuote = price !== null && price !== undefined;
                  
                  return (
                    <button
                      key={asset.symbol}
                      onClick={() => {
                        if (hasQuote || asset.symbol === 'USD') onSelect(asset.symbol);
                      }}
                      disabled={!hasQuote && !isLoading && asset.symbol !== 'USD'}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left group
                        ${(!hasQuote && !isLoading && asset.symbol !== 'USD') ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'}
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
                            {!hasQuote && asset.symbol !== 'USD' && (
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
