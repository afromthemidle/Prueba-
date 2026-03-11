import React, { useMemo, useState } from 'react';
import { Investment, InvestmentSector, InvestmentType, PortfolioSnapshot } from '../data/investments';
import { formatCurrency, formatPercent, formatDate, getDaysLeft } from '../lib/utils';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList,
  AreaChart, Area, LineChart, Line
} from 'recharts';
import { useLanguage } from '../i18n/LanguageContext';
import { Filter, Save, History, TrendingUp, Maximize2, Minimize2, Info } from 'lucide-react';
import { SunburstChart, SunburstNode } from './SunburstChart';

interface DashboardStatsProps {
  investments: Investment[];
  amounts: Record<string, number>;
  prices: Record<string, number>;
  snapshots: PortfolioSnapshot[];
  onSaveSnapshot: () => void;
  isSaving: boolean;
}

export type SunburstCriterion = 'country' | 'type' | 'currency' | 'sector';

export function DashboardStats({ investments, amounts, prices, snapshots, onSaveSnapshot, isSaving }: DashboardStatsProps) {
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];
  const { t } = useLanguage();
  const [filterSector, setFilterSector] = useState<InvestmentSector | 'All'>('All');
  const [filterType, setFilterType] = useState<InvestmentType | 'All'>('All');
  const [filterCurrency, setFilterCurrency] = useState<string>('All');
  const [expandedChart, setExpandedChart] = useState<string | null>(null);
  const [sunburstLevel1, setSunburstLevel1] = useState<SunburstCriterion>('country');
  const [sunburstLevel2, setSunburstLevel2] = useState<SunburstCriterion>('type');
  const [sunburstLevel3, setSunburstLevel3] = useState<SunburstCriterion>('currency');
  const [hiddenSunburstLevel1Values, setHiddenSunburstLevel1Values] = useState<Set<string>>(new Set());

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
      const matchesCurrency = filterCurrency === 'All' || (inv.currency || 'USD') === filterCurrency;
      return matchesSector && matchesType && matchesCurrency;
    });

    filteredInvestments.forEach(inv => {
      const amount = amounts[inv.id] || 0;
      if (amount <= 0) return;

      const currency = inv.currency || 'USD';
      const amountUSD = amount * (prices[currency] || 1);
      totalUSD += amountUSD;

      byCountry[inv.country] = (byCountry[inv.country] || 0) + amountUSD;
      byCurrency[currency] = (byCurrency[currency] || 0) + amountUSD; // Use USD equivalent for all charts
      byType[inv.type] = (byType[inv.type] || 0) + amountUSD;
      bySector[inv.sector] = (bySector[inv.sector] || 0) + amountUSD;

      totalWeightedInterest += amountUSD * inv.rate;
      
      activeInvestments.push({
        ...inv,
        currency,
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

    // Build hierarchical data for Sunburst chart
    const sunburstRoot: SunburstNode = { name: 'Portfolio', children: [] };
    const allSunburstLevel1Values = new Set<string>();
    
    const getCriterionValue = (inv: Investment, criterion: SunburstCriterion) => {
      switch (criterion) {
        case 'country': return inv.country || 'Unknown';
        case 'type': return inv.type || 'Unknown';
        case 'currency': return inv.currency || 'USD';
        case 'sector': return inv.sector || 'Unknown';
        default: return 'Unknown';
      }
    };

    activeInvestments.forEach(inv => {
      const val1 = getCriterionValue(inv, sunburstLevel1);
      allSunburstLevel1Values.add(val1);

      if (hiddenSunburstLevel1Values.has(val1)) {
        return;
      }

      const val2 = getCriterionValue(inv, sunburstLevel2);
      const val3 = getCriterionValue(inv, sunburstLevel3);

      let node1 = sunburstRoot.children!.find(c => c.name === val1);
      if (!node1) {
        node1 = { name: val1, children: [] };
        sunburstRoot.children!.push(node1);
      }
      
      let node2 = node1.children!.find(c => c.name === val2);
      if (!node2) {
        node2 = { name: val2, children: [] };
        node1.children!.push(node2);
      }
      
      let node3 = node2.children!.find(c => c.name === val3);
      if (!node3) {
        node3 = { name: val3, children: [] };
        node2.children!.push(node3);
      }
      
      node3.children!.push({
        name: inv.name || 'Unnamed',
        value: inv.amountUSD
      });
    });

    return {
      totalUSD,
      avgInterest,
      countryData: formatChartData(byCountry),
      currencyData: formatChartData(byCurrency),
      typeData: formatChartData(byType),
      sectorData: formatChartData(bySector),
      topPaying,
      topByAmount,
      upcomingMaturities,
      sunburstData: sunburstRoot,
      sunburstLevel1Values: Array.from(allSunburstLevel1Values).sort()
    };
  }, [investments, amounts, prices, filterSector, filterType, filterCurrency, sunburstLevel1, sunburstLevel2, sunburstLevel3, hiddenSunburstLevel1Values]);

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

  const sectors: InvestmentSector[] = ['Financial', 'Technology', 'Healthcare', 'Consumer Goods', 'Industrials', 'Energy', 'Cryptocurrencies', 'Real Estate', 'Others'];

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
      const value = payload[0].value;
      const percentage = stats.totalUSD > 0 ? ((value / stats.totalUSD) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-md rounded-lg">
          <p className="font-medium text-slate-900">{t(payload[0].name)}</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-indigo-600 font-mono font-semibold">{formatCurrency(value)}</p>
            <p className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-medium">{percentage}%</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const ChartCard = ({ id, title, children, heightClass = "h-[300px]" }: { id: string, title: string, children: React.ReactNode, heightClass?: string }) => {
    const isExpanded = expandedChart === id;
    
    const content = (
      <>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">{title}</h3>
          <button 
            onClick={() => setExpandedChart(isExpanded ? null : id)} 
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            title={isExpanded ? t("Minimize") : t("Maximize")}
          >
            {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
        <div className={isExpanded ? "h-[calc(100vh-150px)] min-h-[400px] w-full" : `${heightClass} w-full`}>
          {children}
        </div>
      </>
    );

    if (isExpanded) {
      return (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8">
          <div className="bg-white w-full max-w-6xl max-h-screen overflow-hidden rounded-3xl shadow-2xl border border-slate-200 p-6 flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {content}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 flex flex-col">
        {content}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Save State Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 gap-4">
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
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-70 text-sm whitespace-nowrap shadow-sm shadow-indigo-600/20"
        >
          <Save className="w-4 h-4" />
          {isSaving ? t("Saving...") : t("Save Current State")}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 mb-6">
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
              {Array.from(new Set(investments.map(inv => inv.currency || 'USD'))).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/60">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("Total Net Worth")}</p>
          <p className="text-4xl font-light text-slate-900 tracking-tight font-mono">{formatCurrency(stats.totalUSD)}</p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/60">
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
          <ChartCard id="history-total" title={t("Total Net Worth History")}>
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
          </ChartCard>

          {/* Growth Percentage Chart */}
          <ChartCard id="history-growth" title={t("Growth Percentage")}>
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
          </ChartCard>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Distribution */}
        <ChartCard id="sector" title={t("Distribution by Sector")}>
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
        </ChartCard>

        {/* Type Distribution */}
        <ChartCard id="type" title={t("Fixed vs Variable Income")}>
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
        </ChartCard>

        {/* Currency Distribution */}
        <ChartCard id="currency" title={t("Distribution by Currency / Asset")}>
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
        </ChartCard>

        {/* Country Distribution */}
        <ChartCard id="country" title={t("Distribution by Country")}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.countryData} layout="vertical" margin={{ top: 5, right: 100, left: 10, bottom: 5 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={120} interval={0} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24}>
                <LabelList 
                  dataKey="value" 
                  position="right" 
                  formatter={(value: number) => `${formatCurrency(value)} (${stats.totalUSD > 0 ? ((value / stats.totalUSD) * 100).toFixed(1) : 0}%)`} 
                  fill="#64748b" 
                  fontSize={12} 
                  fontWeight={500}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Sunburst Chart */}
      <ChartCard id="sunburst" title={t("Portfolio Hierarchy")} heightClass="h-[500px]">
        <div className="flex flex-col h-full">
          <div className="flex flex-wrap gap-4 mb-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">{t("Level 1")}</label>
              <select 
                className="px-2 py-1 rounded-md border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-indigo-400 transition-colors"
                value={sunburstLevel1}
                onChange={(e) => {
                  setSunburstLevel1(e.target.value as SunburstCriterion);
                  setHiddenSunburstLevel1Values(new Set());
                }}
              >
                <option value="country">{t("Country")}</option>
                <option value="type">{t("Type")}</option>
                <option value="currency">{t("Currency")}</option>
                <option value="sector">{t("Sector")}</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">{t("Level 2")}</label>
              <select 
                className="px-2 py-1 rounded-md border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-indigo-400 transition-colors"
                value={sunburstLevel2}
                onChange={(e) => setSunburstLevel2(e.target.value as SunburstCriterion)}
              >
                <option value="country">{t("Country")}</option>
                <option value="type">{t("Type")}</option>
                <option value="currency">{t("Currency")}</option>
                <option value="sector">{t("Sector")}</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">{t("Level 3")}</label>
              <select 
                className="px-2 py-1 rounded-md border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-indigo-400 transition-colors"
                value={sunburstLevel3}
                onChange={(e) => setSunburstLevel3(e.target.value as SunburstCriterion)}
              >
                <option value="country">{t("Country")}</option>
                <option value="type">{t("Type")}</option>
                <option value="currency">{t("Currency")}</option>
                <option value="sector">{t("Sector")}</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-md ml-auto">
              <Info className="w-4 h-4" />
              <span className="font-medium">{t("Best viewed in full screen or on a large display")}</span>
            </div>
          </div>
          <div className="flex-1 min-h-0 relative flex gap-4">
            {/* Sidebar for checkboxes */}
            <div className="w-36 overflow-y-auto border-r border-slate-100 pr-2 flex flex-col gap-2 shrink-0">
               <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t("Filter Level 1")}</h4>
               {stats.sunburstLevel1Values.map(val => (
                 <label key={val} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-indigo-600 transition-colors">
                   <input
                     type="checkbox"
                     className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                     checked={!hiddenSunburstLevel1Values.has(val)}
                     onChange={(e) => {
                       const newHidden = new Set(hiddenSunburstLevel1Values);
                       if (e.target.checked) {
                         newHidden.delete(val);
                       } else {
                         newHidden.add(val);
                       }
                       setHiddenSunburstLevel1Values(newHidden);
                     }}
                   />
                   <span className="truncate" title={t(val)}>{t(val)}</span>
                 </label>
               ))}
            </div>
            {/* Chart */}
            <div className="flex-1 min-w-0 relative">
              <SunburstChart data={stats.sunburstData} />
            </div>
          </div>
        </div>
      </ChartCard>

      {/* Top Investments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Largest Investments */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60">
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
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60">
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
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60">
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
