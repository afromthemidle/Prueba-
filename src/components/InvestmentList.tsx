import React, { useState } from 'react';
import { Investment, InvestmentSector, InvestmentType } from '../data/investments';
import { formatPercent } from '../lib/utils';
import { Search, Plus, Upload, Edit2, Trash2, Filter } from 'lucide-react';
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
  onAddMultiple: (invs: (Investment & { amount?: number })[], type: 'partial' | 'total') => void;
}

export function InvestmentList({ investments, amounts, onAmountChange, onAdd, onUpdate, onDelete, onAddMultiple }: InvestmentListProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSector, setFilterSector] = useState<InvestmentSector | 'All'>('All');
  const [filterType, setFilterType] = useState<InvestmentType | 'All'>('All');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  
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
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-900">{t("Your Investments")}</h2>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <button 
              onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors text-sm"
            >
              <Plus className="w-4 h-4" /> {t("Add")}
            </button>
            {isAddMenuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setIsAddMenuOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 z-30 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <button 
                    onClick={() => { setIsAddMenuOpen(false); setEditingInv(null); setIsModalOpen(true); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 text-slate-700 transition-colors border-b border-slate-100"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">{t("Add Manually")}</span>
                  </button>
                  <button 
                    onClick={() => { setIsAddMenuOpen(false); setIsUploadOpen(true); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <Upload className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">{t("Import")}</span>
                  </button>
                </div>
              </>
            )}
          </div>
          <button 
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border rounded-lg font-medium transition-colors text-sm ${isFiltersOpen ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'}`}
          >
            <Filter className="w-4 h-4" /> {t("Filters")}
          </button>
        </div>
      </div>

      {isFiltersOpen && (
        <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-200 space-y-4 mb-6 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("Search")}</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t("Search investments...")}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-48">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("Investment Type")}</label>
                <select
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as InvestmentType | 'All')}
                >
                  <option value="All">{t("All Types")}</option>
                  <option value="Fixed">{t("Fixed Income")}</option>
                  <option value="Variable">{t("Variable Income")}</option>
                </select>
              </div>
              
              <div className="w-full sm:w-48">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("Sector")}</label>
                <select
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={filterSector}
                  onChange={(e) => setFilterSector(e.target.value as InvestmentSector | 'All')}
                >
                  <option value="All">{t("All Sectors")}</option>
                  {sectors.map(s => <option key={s} value={s}>{t(s)}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pb-8 px-1">
        {filteredInvestments.map((inv) => (
          <div key={inv.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all duration-200 gap-4 group">
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-700 font-semibold text-lg border border-slate-100">
                  {inv.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{inv.name}</h3>
                    <div className="flex items-center gap-1 ml-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(inv)} className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors" title={t("Edit Investment")}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => onDelete(inv.id)} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title={t("Delete Investment")}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-xs font-medium text-slate-500">
                      {inv.country}
                    </span>
                    <span className="text-xs text-slate-300">•</span>
                    <span className="text-xs font-medium text-slate-500">
                      {t(inv.sector)}
                    </span>
                    <span className="text-xs text-slate-300">•</span>
                    <span className="text-xs font-medium text-slate-500">
                      {t(inv.type)}
                    </span>
                    <span className="text-xs text-slate-300">•</span>
                    <span className={`text-xs font-semibold ${inv.rate >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatPercent(inv.rate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 lg:w-auto mt-2 lg:mt-0">
              {/* Maturity Date */}
              <div className="flex flex-col gap-1 w-full sm:w-32">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t("Maturity Date")}</label>
                <input 
                  type="date"
                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:border-slate-400 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-white transition-colors"
                  value={inv.maturityDate || ''}
                  onChange={(e) => onUpdate(inv.id, { maturityDate: e.target.value })}
                />
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-1 w-full sm:w-36">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t("Amount")} ({inv.currency})</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">
                    {inv.currency === 'USD' ? '$' : '€'}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    placeholder="0"
                    className="w-full pl-6 pr-2.5 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:border-slate-400 text-right font-mono text-sm font-medium bg-slate-50 hover:bg-white transition-colors"
                    value={amounts[inv.id] || ''}
                    onChange={(e) => onAmountChange(inv.id, parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Value in USD */}
              <div className="flex flex-col gap-1 w-full sm:w-28 text-right justify-center">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t("Value (USD)")}</label>
                <div className="py-1.5 font-mono text-sm font-semibold text-slate-900">
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
