import React, { useState, useEffect } from 'react';
import { Investment, InvestmentSector, InvestmentType } from '../data/investments';
import { X, Search } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { AssetSelectorModal } from './AssetSelectorModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (inv: Investment) => void;
  initialData?: Investment | null;
  investments?: Investment[];
  prices?: Record<string, number>;
}

export function InvestmentModal({ isOpen, onClose, onSave, initialData, investments = [], prices = {} }: Props) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<Partial<Investment>>({});
  const [isAssetSelectorOpen, setIsAssetSelectorOpen] = useState(false);

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
      setIsAssetSelectorOpen(false);
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
              <button
                type="button"
                onClick={() => setIsAssetSelectorOpen(true)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-slate-400 bg-slate-50 hover:bg-white transition-colors outline-none text-sm text-left flex justify-between items-center"
              >
                <span className={formData.currency ? "text-slate-900 font-medium" : "text-slate-400"}>
                  {formData.currency || t("Select Asset...")}
                </span>
                <Search className="w-4 h-4 text-slate-400" />
              </button>
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
      
      <AssetSelectorModal
        isOpen={isAssetSelectorOpen}
        onClose={() => setIsAssetSelectorOpen(false)}
        onSelect={(asset) => {
          setFormData({ ...formData, currency: asset });
          setIsAssetSelectorOpen(false);
        }}
        portfolioPrices={prices}
      />
    </div>
  );
}
