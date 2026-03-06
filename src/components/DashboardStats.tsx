import React, { useMemo, useState } from 'react';
import { Investment, InvestmentSector, InvestmentType } from '../data/investments';
import { formatCurrency, formatPercent, formatDate, getDaysLeft } from '../lib/utils';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { useLanguage } from '../i18n/LanguageContext';
import { Filter } from 'lucide-react';

interface DashboardStatsProps {
  investments: Investment[];
  amounts: Record<string, number>;
}

const EUR_TO_USD = 1.08; // Approximate conversion rate for total net worth

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

export function DashboardStats({ investments, amounts }: DashboardStatsProps) {
  const { t } = useLanguage();
  const [filterSector, setFilterSector] = useState<InvestmentSector | 'All'>('All');
  const [filterType, setFilterType] = useState<InvestmentType | 'All'>('All');
  const [filterCurrency, setFilterCurrency] = useState<'USD' | 'EUR' | 'All'>('All');

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

      const amountUSD = inv.currency === 'EUR' ? amount * EUR_TO_USD : amount;
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
  }, [investments, amounts, filterSector, filterType, filterCurrency]);

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
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("Currency")}</label>
            <select
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white focus:outline-none focus:border-slate-400 transition-colors text-sm"
              value={filterCurrency}
              onChange={(e) => setFilterCurrency(e.target.value as 'USD' | 'EUR' | 'All')}
            >
              <option value="All">{t("All Currencies")}</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
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
          <h3 className="text-sm font-semibold text-slate-900 mb-6 uppercase tracking-wider">{t("Distribution by Currency")}</h3>
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
