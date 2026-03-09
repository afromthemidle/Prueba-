import React, { useMemo, useState } from 'react';
import { Investment, InvestmentSector, InvestmentType, PortfolioSnapshot } from '../data/investments';
import { formatCurrency, formatPercent, formatDate, getDaysLeft } from '../lib/utils';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, LineChart, Line
} from 'recharts';
import { useLanguage } from '../i18n/LanguageContext';
import { Filter, Save, History, TrendingUp } from 'lucide-react';

interface DashboardStatsProps {
  investments: Investment[];
  amounts: Record<string, number>;
  prices: Record<string, number>;
  snapshots: PortfolioSnapshot[];
  onSaveSnapshot: () => void;
  isSaving: boolean;
}

export function DashboardStats({ investments, amounts, prices, snapshots, onSaveSnapshot, isSaving }: DashboardStatsProps) {
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];
  const { t } = useLanguage();
  const [filterSector, setFilterSector] = useState<InvestmentSector | 'All'>('All');
  const [filterType, setFilterType] = useState<InvestmentType | 'All'>('All');
  const [filterCurrency, setFilterCurrency] = useState<string>('All');

  const stats = useMemo(() => {
    let totalUSD = 0;
    const byCountry: Record<string, number> = {};
    const byCurrency: Record<string, number> = {};
    const byType: Record<string, number> = {};
    const bySector: Record<string, number> = {};
    
    // For weighted average interest rate
    let totalWeightedInterest = 0;
    
    // For top paying investments
    const activeInvestments = [];

    const filteredInvestments = investments.filter(inv => {
      const matchesSector = filterSector === 'All' || inv.sector === filterSector;
      const matchesType = filterType === 'All' || inv.type === filterType;
      const matchesCurrency = filterCurrency === 'All' || inv.currency === filterCurrency;
      return matchesSector && matchesType && matchesCurrency;
    });

    filteredInvestments.forEach(inv => {
      const amount = amounts[inv.id] || 0;
      if (amount <= 0) return;

      const amountUSD = amount * (prices[inv.currency] || 1);
      totalUSD += amountUSD;

      byCountry[inv.country] = (byCountry[inv.country] || 0) + amountUSD;
      byCurrency[inv.currency] = (byCurrency[inv.currency] || 0) + amountUSD; // Use USD equivalent for all charts
      byType[inv.type] = (byType[inv.type] || 0) + amountUSD;
      bySector[inv.sector] = (bySector[inv.sector] || 0) + amountUSD;

      totalWeightedInterest += amountUSD * inv.rate;
      
      activeInvestments.push({
        ...inv,
        amount,
        amountUSD
      });
    });

    const avgInterest = totalUSD > 0 ? totalWeightedInterest / totalUSD : 0;

    // Format data for charts
    const formatChartData = (data: Record<string, number>) => 
      Object.entries(data)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    const topPaying = [...activeInvestments]
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);

    const topByAmount = [...activeInvestments]
      .sort((a, b) => b.amountUSD - a.amountUSD)
      .slice(0, 5);

    const upcomingMaturities = [...activeInvestments]
      .filter(inv => inv.maturityDate)
      .sort((a, b) => new Date(`${a.maturityDate}T00:00:00`).getTime() - new Date(`${b.maturityDate}T00:00:00`).getTime())
      .filter(inv => getDaysLeft(inv.maturityDate!) >= 0)
      .slice(0, 5);

    return {
      totalUSD,
      avgInterest,
      countryData: formatChartData(byCountry),
      currencyData: formatChartData(byCurrency),
      typeData: formatChartData(byType),
      sectorData: formatChartData(bySector),
      topPaying,
      topByAmount,
      upcomingMaturities
    };
  }, [investments, amounts, prices, filterSector, filterType, filterCurrency]);

  const historyChartData = useMemo(() => {
    if (!snapshots || snapshots.length === 0) return [];
    
    // Sort by date ascending
    const sorted = [...snapshots].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const firstValue = sorted[0].totalNetWorth;

    return sorted.map(snap => {
      const dateObj = new Date(snap.date);
      const growthMoney = snap.totalNetWorth - firstValue;
      const growthPercentage = firstValue > 0 ? ((snap.totalNetWorth - firstValue) / firstValue) * 100 : 0;
      
      return {
        date: dateObj.toLocaleDateString(),
        fullDate: snap.date,
        total: snap.totalNetWorth,
        growthMoney,
        growthPercentage: parseFloat(growthPercentage.toFixed(2))
      };
    });
  }, [snapshots]);

  const sectors: InvestmentSector[] = ['Financial', 'Cooperatives', 'Energy', 'Cryptocurrencies', 'Real Estate', 'Others'];

  if (stats.totalUSD === 0 && investments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <span className="text-2xl">💰</span>
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">{t("No Investments Yet")}</h2>
        <p className="text-sm text-slate-500 max-w-md">
          {t("Enter amounts in the Portfolio tab to see your wealth distribution, average interest rates, and detailed statistics.")}
        </p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-md rounded-lg">
          <p className="font-medium text-slate-900">{t(payload[0].name)}</p>
          <p className="text-indigo-600 font-mono">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Save State Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-xl shadow-sm border border-slate-200 gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-600" />
            {t("Portfolio History")}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {t("Save your current portfolio state to track your wealth growth over time.")}
          </p>
        </div>
        <button
          onClick={onSaveSnapshot}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70 text-sm whitespace-nowrap"
        >
          <Save className="w-4 h-4" />
          {isSaving ? t("Saving...") : t("Save Current State")}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">{t("Filter Statistics")}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("Investment Type")}</label>
            <select
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white focus:outline-none focus:border-slate-400 transition-colors text-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as InvestmentType | 'All')}
            >
              <option value="All">{t("All Types")}</option>
              <option value="Fixed">{t("Fixed Income")}</option>
              <option value="Variable">{t("Variable Income")}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("Sector")}</label>
            <select
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white focus:outline-none focus:border-slate-400 transition-colors text-sm"
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value as InvestmentSector | 'All')}
            >
              <option value="All">{t("All Sectors")}</option>
              {sectors.map(s => <option key={s} value={s}>{t(s)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("Currency / Asset")}</label>
            <select
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white focus:outline-none focus:border-slate-400 transition-colors text-sm"
              value={filterCurrency}
              onChange={(e) => setFilterCurrency(e.target.value)}
            >
              <option value="All">{t("All Currencies / Assets")}</option>
              {Array.from(new Set(investments.map(inv => inv.currency))).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("Total Net Worth")}</p>
          <p className="text-4xl font-light text-slate-900 tracking-tight font-mono">{formatCurrency(stats.totalUSD)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("Average Weighted Interest")}</p>
          <p className={`text-4xl font-light tracking-tight font-mono ${stats.avgInterest >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatPercent(stats.avgInterest)}
          </p>
        </div>
      </div>

      {/* Historical Charts */}
      {historyChartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Net Worth Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 mb-6 uppercase tracking-wider">{t("Total Net Worth History")}</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    width={60}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), t("Total Net Worth")]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#4f46e5" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Growth Percentage Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 mb-6 uppercase tracking-wider">{t("Growth Percentage")}</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickFormatter={(value) => `${value}%`}
                    width={40}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, t("Growth")]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="growthPercentage" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 mb-6 uppercase tracking-wider">{t("Distribution by Sector")}</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.sectorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {stats.sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => <span className="text-slate-700">{t(value)}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Type Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 mb-6 uppercase tracking-wider">{t("Fixed vs Variable Income")}</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {stats.typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#10b981', '#6366f1'][index % 2]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => <span className="text-slate-700">{t(value)}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Currency Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 mb-6 uppercase tracking-wider">{t("Distribution by Currency / Asset")}</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.currencyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {stats.currencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#f59e0b', '#3b82f6', '#10b981'][index % 3]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => <span className="text-slate-700">{t(value)}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Country Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 mb-6 uppercase tracking-wider">{t("Distribution by Country")}</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.countryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Investments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Largest Investments */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">{t("Largest Investments (by Amount)")}</h3>
          <div className="space-y-3">
            {stats.topByAmount.map((inv, idx) => (
              <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-slate-900">{inv.name}</p>
                    <p className="text-[10px] uppercase text-slate-500">{t(inv.sector)} • {inv.country}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-slate-900 font-mono">{formatCurrency(inv.amountUSD)}</p>
                  <p className="text-[10px] text-emerald-600 font-medium">{formatPercent(inv.rate)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Paying Investments */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">{t("Highest Yielding Active Investments")}</h3>
          <div className="space-y-3">
            {stats.topPaying.map((inv, idx) => (
              <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-slate-900">{inv.name}</p>
                    <p className="text-[10px] uppercase text-slate-500">{t(inv.sector)} • {inv.country}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-emerald-600 font-mono">{formatPercent(inv.rate)}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{formatCurrency(inv.amount, inv.currency)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Maturities */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">{t("Upcoming Maturities")}</h3>
          <div className="space-y-3">
            {stats.upcomingMaturities.length > 0 ? stats.upcomingMaturities.map((inv, idx) => {
              const daysLeft = getDaysLeft(inv.maturityDate!);
              const isUrgent = daysLeft <= 7;
              return (
                <div key={inv.id} className={`flex items-center justify-between p-3 rounded-lg border ${isUrgent ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${isUrgent ? 'bg-orange-100 text-orange-700' : 'bg-slate-200 text-slate-700'}`}>
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-900">{inv.name}</p>
                      <p className="text-[10px] uppercase text-slate-500">{formatDate(inv.maturityDate!)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold text-sm ${isUrgent ? 'text-orange-600' : 'text-slate-900'}`}>
                      {daysLeft === 0 ? t("Today") : t("In {days} days").replace('{days}', daysLeft.toString())}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">{formatCurrency(inv.amount, inv.currency)}</p>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-8 text-slate-500 text-sm">
                {t("No upcoming maturities")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
