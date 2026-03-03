import React, { useState } from 'react';
import { Investment, InvestmentSector, InvestmentType } from '../data/investments';
import { formatPercent } from '../lib/utils';
import { Search, Plus, Upload, Edit2, Trash2 } from 'lucide-react';
import { InvestmentModal } from './InvestmentModal';
import { AIUploadModal } from './AIUploadModal';
import { useLanguage } from '../i18n/LanguageContext';

interface InvestmentListProps {
  investments: Investment[];
  amounts: Record<string, number>;
  onAmountChange: (id: string, amount: number) => void;
  onAdd: (inv: Investment) => void;
  onUpdate: (id: string, inv: Partial<Investment>) => void;
  onDelete: (id: string) => void;
  onAddMultiple: (invs: Investment[]) => void;
}

export function InvestmentList({ investments, amounts, onAmountChange, onAdd, onUpdate, onDelete, onAddMultiple }: InvestmentListProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSector, setFilterSector] = useState<InvestmentSector | 'All'>('All');
  const [filterType, setFilterType] = useState<InvestmentType | 'All'>('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingInv, setEditingInv] = useState<Investment | null>(null);

  const filteredInvestments = investments.filter(inv => {
    const matchesSearch = inv.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = filterSector === 'All' || inv.sector === filterSector;
    const matchesType = filterType === 'All' || inv.type === filterType;
    return matchesSearch && matchesSector && matchesType;
  });

  const sectors: InvestmentSector[] = ['Financial', 'Cooperatives', 'Energy', 'Cryptocurrencies', 'Real Estate', 'Others'];

  const handleEdit = (inv: Investment) => {
    setEditingInv(inv);
    setIsModalOpen(true);
  };

  const handleSave = (inv: Investment) => {
    if (editingInv) {
      onUpdate(inv.id, inv);
    } else {
      onAdd(inv);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 space-y-4 bg-slate-50">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t("Search investments...")}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => { setEditingInv(null); setIsModalOpen(true); }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
            >
              <Plus className="w-4 h-4" /> {t("Add")}
            </button>
            <button 
              onClick={() => setIsUploadOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-medium transition-colors"
            >
              <Upload className="w-4 h-4" /> {t("Import")}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide pt-2 border-t border-slate-200/60">
          <span className="text-sm font-medium text-slate-500 whitespace-nowrap">{t("Filters")}:</span>
          <select
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as InvestmentType | 'All')}
          >
            <option value="All">{t("All Types")}</option>
            <option value="Fixed">{t("Fixed Income")}</option>
            <option value="Variable">{t("Variable Income")}</option>
          </select>
          <select
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={filterSector}
            onChange={(e) => setFilterSector(e.target.value as InvestmentSector | 'All')}
          >
            <option value="All">{t("All Sectors")}</option>
            {sectors.map(s => <option key={s} value={s}>{t(s)}</option>)}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredInvestments.map((inv) => (
          <div key={inv.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:border-indigo-100 hover:shadow-sm transition-all gap-4 group">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-slate-900">{inv.name}</h3>
                <div className="flex items-center gap-1 ml-2">
                  <button onClick={() => handleEdit(inv)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title={t("Edit Investment")}>
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(inv.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title={t("Delete Investment")}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                  {inv.country}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                  {t(inv.sector)}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
                  {t(inv.type)}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${inv.rate >= 0 ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                  {formatPercent(inv.rate)}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 lg:w-auto mt-2 lg:mt-0">
              {/* Maturity Date */}
              <div className="flex flex-col gap-1 w-full sm:w-36">
                <label className="text-xs text-slate-500 font-medium">{t("Maturity Date")}</label>
                <input 
                  type="date"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-700"
                  value={inv.maturityDate || ''}
                  onChange={(e) => onUpdate(inv.id, { maturityDate: e.target.value })}
                />
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-1 w-full sm:w-36">
                <label className="text-xs text-slate-500 font-medium">{t("Amount")} ({inv.currency})</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                    {inv.currency === 'USD' ? '$' : '€'}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    placeholder="0"
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right font-mono text-sm"
                    value={amounts[inv.id] || ''}
                    onChange={(e) => onAmountChange(inv.id, parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Value in USD */}
              <div className="flex flex-col gap-1 w-full sm:w-28 text-right">
                <label className="text-xs text-slate-500 font-medium">{t("Value (USD)")}</label>
                <div className="py-2 font-mono text-sm font-medium text-slate-900">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format((amounts[inv.id] || 0) * (inv.currency === 'EUR' ? 1.08 : 1))}
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredInvestments.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            {t("No investments found matching your filters.")}
          </div>
        )}
      </div>

      <InvestmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        initialData={editingInv} 
      />
      <AIUploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onSuccess={onAddMultiple} 
      />
    </div>
  );
}
