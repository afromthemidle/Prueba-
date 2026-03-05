import React, { useState, useEffect } from 'react';
import { initialInvestments, Investment } from './data/investments';
import { InvestmentList } from './components/InvestmentList';
import { DashboardStats } from './components/DashboardStats';
import { AISuggestions } from './components/AISuggestions';
import { LayoutDashboard, Wallet, Sparkles, TrendingUp } from 'lucide-react';
import { useLanguage } from './i18n/LanguageContext';
import toast, { Toaster } from 'react-hot-toast';

export default function App() {
  const { t, language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'insights' | 'suggestions'>('portfolio');
  
  const [investments, setInvestments] = useState<Investment[]>(() => {
    const saved = localStorage.getItem('customInvestments_v2');
    return saved ? JSON.parse(saved) : initialInvestments;
  });

  // Load amounts from localStorage or initialize empty
  const [amounts, setAmounts] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('investmentAmounts_v2');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('customInvestments_v2', JSON.stringify(investments));
  }, [investments]);

  // Save to localStorage when amounts change
  useEffect(() => {
    localStorage.setItem('investmentAmounts_v2', JSON.stringify(amounts));
  }, [amounts]);

  // Notifications for upcoming maturities
  useEffect(() => {
    const notified = JSON.parse(localStorage.getItem('notified_investments') || '{}');
    let updated = false;

    investments.forEach(inv => {
      if (!inv.maturityDate) return;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const maturity = new Date(inv.maturityDate);
      maturity.setHours(0, 0, 0, 0);
      
      const daysLeft = Math.ceil((maturity.getTime() - today.getTime()) / (1000 * 3600 * 24));
      
      if (daysLeft === 0 && notified[inv.id] !== 'matured') {
        toast(`${inv.name} ${t("matures today!")}`, { icon: '🚨', duration: 5000 });
        notified[inv.id] = 'matured';
        updated = true;
      } else if (daysLeft > 0 && daysLeft <= 7 && notified[inv.id] !== 'week' && notified[inv.id] !== 'matured') {
        toast(`${inv.name} ${t("matures in")} ${daysLeft} ${t("days")}`, { icon: '⚠️', duration: 5000 });
        notified[inv.id] = 'week';
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem('notified_investments', JSON.stringify(notified));
    }
  }, [investments, t]);

  const handleAmountChange = (id: string, amount: number) => {
    setAmounts(prev => ({
      ...prev,
      [id]: amount
    }));
  };

  const handleAddInvestment = (inv: Investment) => {
    setInvestments(prev => [inv, ...prev]);
  };

  const handleUpdateInvestment = (id: string, updated: Partial<Investment>) => {
    setInvestments(prev => prev.map(inv => inv.id === id ? { ...inv, ...updated } : inv));
  };

  const handleDeleteInvestment = (id: string) => {
    setInvestments(prev => prev.filter(inv => inv.id !== id));
    setAmounts(prev => {
      const newAmounts = { ...prev };
      delete newAmounts[id];
      return newAmounts;
    });
  };

  const handleAddMultiple = (newInvs: Investment[]) => {
    setInvestments(prev => [...newInvs, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Toaster position="top-right" />
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm border border-indigo-200/50">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">{t("Wealth Tracker")}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLanguage('en')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${language === 'en' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <span>🇺🇸</span> EN
              </button>
              <button
                onClick={() => setLanguage('es')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${language === 'es' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <span>🇪🇸</span> ES
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl mb-8 max-w-md mx-auto sm:mx-0">
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'portfolio' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Wallet className="w-4 h-4" />
            {t("Portfolio")}
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'insights' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            {t("Insights")}
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'suggestions' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            {t("AI Ideas")}
          </button>
        </div>

        {/* Content Area */}
        <div className="h-[calc(100vh-12rem)] min-h-[600px]">
          {activeTab === 'portfolio' && (
            <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <InvestmentList 
                investments={investments} 
                amounts={amounts} 
                onAmountChange={handleAmountChange} 
                onAdd={handleAddInvestment}
                onUpdate={handleUpdateInvestment}
                onDelete={handleDeleteInvestment}
                onAddMultiple={handleAddMultiple}
              />
            </div>
          )}
          
          {activeTab === 'insights' && (
            <div className="h-full overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pr-2 pb-10">
              <DashboardStats 
                investments={investments} 
                amounts={amounts} 
              />
            </div>
          )}

          {activeTab === 'suggestions' && (
            <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <AISuggestions />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
