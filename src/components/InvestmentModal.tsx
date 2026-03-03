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
      currency: (formData.currency as 'USD' | 'EUR') || 'USD',
      country: formData.country || 'Global',
      type: (formData.type as InvestmentType) || 'Fixed',
      sector: (formData.sector as InvestmentSector) || 'Others'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">
            {initialData ? t('Edit Investment') : t('Add Investment')}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t("Name")}</label>
            <input required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("Rate (%)")}</label>
              <input required type="number" step="0.01" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={(formData.rate || 0) * 100} onChange={e => setFormData({...formData, rate: parseFloat(e.target.value) / 100})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("Currency")}</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.currency || 'USD'} onChange={e => setFormData({...formData, currency: e.target.value as 'USD'|'EUR'})}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("Country")}</label>
              <input required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.country || ''} onChange={e => setFormData({...formData, country: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("Type")}</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.type || 'Fixed'} onChange={e => setFormData({...formData, type: e.target.value as InvestmentType})}>
                <option value="Fixed">{t("Fixed Income")}</option>
                <option value="Variable">{t("Variable Income")}</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("Sector")}</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.sector || 'Others'} onChange={e => setFormData({...formData, sector: e.target.value as InvestmentSector})}>
                {['Financial', 'Cooperatives', 'Energy', 'Cryptocurrencies', 'Real Estate', 'Others'].map(s => (
                  <option key={s} value={s}>{t(s)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("Maturity Date")}</label>
              <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.maturityDate || ''} onChange={e => setFormData({...formData, maturityDate: e.target.value})} />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">{t("Cancel")}</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">{t("Save")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
