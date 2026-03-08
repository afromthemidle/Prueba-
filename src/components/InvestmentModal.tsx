import React, { useState, useEffect } from 'react';
import { Investment, InvestmentSector, InvestmentType } from '../data/investments';
import { X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (inv: Investment) => void;
  initialData?: Investment | null;
}

export function InvestmentModal({ isOpen, onClose, onSave, initialData }: Props) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<Partial<Investment>>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          name: '',
          rate: 0,
          currency: 'USD',
          country: '',
          type: 'Fixed',
          sector: 'Others'
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      name: formData.name || 'Unnamed Investment',
      rate: Number(formData.rate) || 0,
      currency: (formData.currency as string) || 'USD',
      country: formData.country || 'Global',
      type: (formData.type as InvestmentType) || 'Fixed',
      sector: (formData.sector as InvestmentSector) || 'Others',
      maturityDate: formData.maturityDate || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">
            {initialData ? t('Edit Investment') : t('Add Investment')}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("Name")}</label>
            <input required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-slate-400 bg-slate-50 hover:bg-white transition-colors outline-none text-sm" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("Rate (%)")}</label>
              <input required type="number" step="0.01" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-slate-400 bg-slate-50 hover:bg-white transition-colors outline-none text-sm" value={(formData.rate || 0) * 100} onChange={e => setFormData({...formData, rate: parseFloat(e.target.value) / 100})} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("Currency / Asset")}</label>
              <input 
                type="text" 
                list="assets-list"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-slate-400 bg-slate-50 hover:bg-white transition-colors outline-none text-sm" 
                value={formData.currency || 'USD'} 
                onChange={e => setFormData({...formData, currency: e.target.value.toUpperCase()})}
                placeholder="e.g. USD, EUR, BTC, AAPL"
              />
              <datalist id="assets-list">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="SOL">Solana (SOL)</option>
                <option value="ADA">Cardano (ADA)</option>
                <option value="XRP">Ripple (XRP)</option>
                <option value="S&P 500">S&P 500</option>
                <option value="MSCI World">MSCI World</option>
                <option value="NASDAQ">NASDAQ 100</option>
                <option value="AAPL">Apple (AAPL)</option>
                <option value="MSFT">Microsoft (MSFT)</option>
                <option value="GOOGL">Alphabet (GOOGL)</option>
                <option value="AMZN">Amazon (AMZN)</option>
                <option value="TSLA">Tesla (TSLA)</option>
                <option value="NVDA">NVIDIA (NVDA)</option>
              </datalist>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("Country")}</label>
              <input required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-slate-400 bg-slate-50 hover:bg-white transition-colors outline-none text-sm" value={formData.country || ''} onChange={e => setFormData({...formData, country: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("Type")}</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-slate-400 bg-slate-50 hover:bg-white transition-colors outline-none text-sm" value={formData.type || 'Fixed'} onChange={e => setFormData({...formData, type: e.target.value as InvestmentType})}>
                <option value="Fixed">{t("Fixed Income")}</option>
                <option value="Variable">{t("Variable Income")}</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("Sector")}</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-slate-400 bg-slate-50 hover:bg-white transition-colors outline-none text-sm" value={formData.sector || 'Others'} onChange={e => setFormData({...formData, sector: e.target.value as InvestmentSector})}>
                {['Financial', 'Cooperatives', 'Energy', 'Cryptocurrencies', 'Real Estate', 'Others'].map(s => (
                  <option key={s} value={s}>{t(s)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("Maturity Date")}</label>
              <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-slate-400 bg-slate-50 hover:bg-white transition-colors outline-none text-sm" value={formData.maturityDate || ''} onChange={e => setFormData({...formData, maturityDate: e.target.value})} />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg font-medium transition-colors text-sm">{t("Cancel")}</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors text-sm">{t("Save")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
