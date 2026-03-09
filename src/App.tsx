import React, { useState, useEffect, useRef } from 'react';
import { initialInvestments, Investment } from './data/investments';
import { InvestmentList } from './components/InvestmentList';
import { DashboardStats } from './components/DashboardStats';
import { AISuggestions } from './components/AISuggestions';
import { AuthModal } from './components/AuthModal';
import { LayoutDashboard, Wallet, Sparkles, TrendingUp, User as UserIcon, LogOut } from 'lucide-react';
import { useLanguage } from './i18n/LanguageContext';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from './contexts/AuthContext';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { PortfolioSnapshot } from './data/investments';
import { fetchAssetPrice } from './services/marketData';

export default function App() {
  const { t, language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'insights' | 'suggestions'>('portfolio');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [isSavingSnapshot, setIsSavingSnapshot] = useState(false);
  
  const [investments, setInvestments] = useState<Investment[]>(() => {
    const saved = localStorage.getItem('customInvestments_v2');
    return saved ? JSON.parse(saved) : initialInvestments;
  });

  // Load amounts from localStorage or initialize empty
  const [amounts, setAmounts] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('investmentAmounts_v2');
    return saved ? JSON.parse(saved) : {};
  });

  const [snapshots, setSnapshots] = useState<PortfolioSnapshot[]>(() => {
    const saved = localStorage.getItem('portfolioSnapshots_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [prices, setPrices] = useState<Record<string, number>>({});
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);

  // Fetch live prices for all unique assets in the portfolio
  useEffect(() => {
    const fetchPrices = async () => {
      setIsLoadingPrices(true);
      const uniqueAssets = Array.from(new Set(investments.map(inv => inv.currency)));
      const newPrices: Record<string, number> = { ...prices };
      
      let updated = false;
      await Promise.all(uniqueAssets.map(async (asset) => {
        if (!newPrices[asset]) {
          const price = await fetchAssetPrice(asset);
          if (price !== null) {
            newPrices[asset] = price;
            updated = true;
          }
        }
      }));
      
      if (updated) {
        setPrices(newPrices);
      }
      setIsLoadingPrices(false);
    };
    
    if (investments.length > 0) {
      fetchPrices();
    }
  }, [investments]);

  const previousUserRef = useRef(user);

  // Clear data on logout to prevent data leaks
  useEffect(() => {
    if (previousUserRef.current && !user) {
      setInvestments(initialInvestments);
      setAmounts({});
      setSnapshots([]);
      localStorage.removeItem('customInvestments_v2');
      localStorage.removeItem('investmentAmounts_v2');
      localStorage.removeItem('portfolioSnapshots_v2');
      localStorage.removeItem('notified_investments');
    }
    previousUserRef.current = user;
  }, [user]);

  // Sync with Cloud when user logs in
  useEffect(() => {
    async function loadCloudData() {
      if (user && supabase) {
        if (loadedUserId === user.id) return;
        
        try {
          const { data, error } = await supabase
            .from('user_data')
            .select('investments, amounts, settings, snapshots')
            .eq('user_id', user.id)
            .single();

          if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            throw error;
          }

          if (data) {
            if (data.investments) setInvestments(data.investments);
            if (data.amounts) setAmounts(data.amounts);
            if (data.snapshots) setSnapshots(data.snapshots);
            if (data.settings) {
              if (data.settings.language) setLanguage(data.settings.language);
              if (data.settings.notified_investments) {
                localStorage.setItem('notified_investments', JSON.stringify(data.settings.notified_investments));
              }
            }
            toast.success(t("Data synced from cloud"));
          } else {
            // First time login, save local data to cloud
            const currentSettings = {
              language: localStorage.getItem('app_language') || 'es',
              notified_investments: JSON.parse(localStorage.getItem('notified_investments') || '{}')
            };
            const { error: insertError } = await supabase
              .from('user_data')
              .insert([{ user_id: user.id, investments, amounts, snapshots, settings: currentSettings }]);
            if (insertError) throw insertError;
            toast.success(t("Local data saved to cloud"));
          }
        } catch (error) {
          console.error("Error loading cloud data:", error);
        } finally {
          setLoadedUserId(user.id);
        }
      } else if (!user) {
        setLoadedUserId(null);
      }
    }
    loadCloudData();
  }, [user, t, loadedUserId, setLanguage]);

  // Save to localStorage and Cloud when data changes
  useEffect(() => {
    localStorage.setItem('customInvestments_v2', JSON.stringify(investments));
    localStorage.setItem('investmentAmounts_v2', JSON.stringify(amounts));
    localStorage.setItem('portfolioSnapshots_v2', JSON.stringify(snapshots));

    if (user && supabase && loadedUserId === user.id) {
      const currentSettings = {
        language: localStorage.getItem('app_language') || 'es',
        notified_investments: JSON.parse(localStorage.getItem('notified_investments') || '{}')
      };

      supabase
        .from('user_data')
        .upsert({ user_id: user.id, investments, amounts, snapshots, settings: currentSettings }, { onConflict: 'user_id' })
        .then(({ error }) => {
          if (error) console.error("Error saving to cloud:", error);
        });
    }
  }, [investments, amounts, snapshots, language, user, loadedUserId]);

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
    setInvestments(prev => prev.map(inv => 
      inv.id === id ? { ...inv, updatedAt: new Date().toISOString() } : inv
    ));
  };

  const handleAddInvestment = (inv: Investment) => {
    const newInv = { ...inv, updatedAt: new Date().toISOString() };
    setInvestments(prev => [newInv, ...prev]);
  };

  const handleUpdateInvestment = (id: string, updated: Partial<Investment>) => {
    setInvestments(prev => prev.map(inv => 
      inv.id === id ? { ...inv, ...updated, updatedAt: new Date().toISOString() } : inv
    ));
  };

  const handleDeleteInvestment = (id: string) => {
    setInvestments(prev => prev.filter(inv => inv.id !== id));
    setAmounts(prev => {
      const newAmounts = { ...prev };
      delete newAmounts[id];
      return newAmounts;
    });
  };

  const handleAddMultiple = (newInvs: (Investment & { amount?: number })[], type: 'partial' | 'total') => {
    const cleanInvs = newInvs.map(({ amount, ...inv }) => ({
      ...inv,
      updatedAt: new Date().toISOString()
    }));
    
    if (type === 'total') {
      setInvestments(cleanInvs);
      const newAmounts: Record<string, number> = {};
      newInvs.forEach(inv => {
        if (inv.amount !== undefined && inv.amount > 0) {
          newAmounts[inv.id] = inv.amount;
        }
      });
      setAmounts(newAmounts);
    } else {
      setInvestments(prev => [...cleanInvs, ...prev]);
      setAmounts(prev => {
        const newAmounts = { ...prev };
        newInvs.forEach(inv => {
          if (inv.amount !== undefined && inv.amount > 0) {
            newAmounts[inv.id] = inv.amount;
          }
        });
        return newAmounts;
      });
    }
  };

  const handleSaveSnapshot = () => {
    setIsSavingSnapshot(true);
    try {
      const totalNetWorth = investments.reduce((sum, inv) => {
        const amount = amounts[inv.id] || 0;
        const price = prices[inv.currency] || 1;
        return sum + (amount * price);
      }, 0);

      const newSnapshot: PortfolioSnapshot = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        totalNetWorth,
        investments: [...investments],
        amounts: { ...amounts }
      };

      setSnapshots(prev => [...prev, newSnapshot]);
      toast.success(t("Portfolio state saved successfully"));
    } catch (error) {
      console.error("Error saving snapshot:", error);
      toast.error(t("Error saving portfolio state"));
    } finally {
      setIsSavingSnapshot(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Toaster position="top-right" />
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-sm">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-semibold tracking-tight text-slate-900">{t("Wealth Tracker")}</h1>
            </div>
            <div className="flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-3 mr-4">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-medium text-slate-900">{user.email}</span>
                    <span className="text-[10px] text-emerald-600 font-medium">{t("Cloud Sync Active")}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                    title={t("Sign Out")}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 mr-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-medium transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  {t("Sign In")}
                </button>
              )}
              <div className="h-4 w-px bg-slate-200 mx-1"></div>
              <button
                onClick={() => setLanguage('en')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${language === 'en' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <span>🇺🇸</span> EN
              </button>
              <button
                onClick={() => setLanguage('es')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${language === 'es' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <span>🇪🇸</span> ES
              </button>
            </div>
          </div>
          
          {/* Navigation Tabs (Moved into sticky header) */}
          <div className="flex space-x-6 pt-2">
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === 'portfolio' 
                  ? 'text-slate-900' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                {t("Portfolio")}
              </div>
              {activeTab === 'portfolio' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === 'insights' 
                  ? 'text-slate-900' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                {t("Insights")}
              </div>
              {activeTab === 'insights' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === 'suggestions' 
                  ? 'text-slate-900' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {t("Investment Ideas")}
              </div>
              {activeTab === 'suggestions' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-t-full" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Content Area */}
        <div className="h-[calc(100vh-12rem)] min-h-[600px]">
          {activeTab === 'portfolio' && (
            <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <InvestmentList 
                investments={investments} 
                amounts={amounts} 
                prices={prices}
                isLoadingPrices={isLoadingPrices}
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
                prices={prices}
                snapshots={snapshots}
                onSaveSnapshot={handleSaveSnapshot}
                isSaving={isSavingSnapshot}
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

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
}
