import React, { useState } from 'react';
import { InvestmentSector, InvestmentType } from '../data/investments';
import { COUNTRIES } from '../data/countries';
import { GoogleGenAI, Type } from '@google/genai';
import { Sparkles, Loader2, ExternalLink } from 'lucide-react';
import { formatPercent } from '../lib/utils';
import { useLanguage } from '../i18n/LanguageContext';

interface Suggestion {
  name: string;
  type: InvestmentType;
  sector: InvestmentSector;
  interestRate: number;
  website: string;
  description: string;
}

export function AISuggestions() {
  const { t } = useLanguage();
  const [sector, setSector] = useState<InvestmentSector | 'Any'>('Any');
  const [type, setType] = useState<InvestmentType | 'Any'>('Any');
  const [country, setCountry] = useState<string>('');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'Any'>('Any');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSuggest = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API Key is not configured.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `Suggest 3 real-world investment opportunities.
      ${sector !== 'Any' ? `Sector preference: ${sector}.` : ''}
      ${type !== 'Any' ? `Type preference: ${type} income.` : ''}
      ${country ? `Country preference: ${country}.` : ''}
      ${currency !== 'Any' ? `Currency preference: ${currency}.` : ''}
      Provide realistic, currently available options (e.g., specific platforms, bonds, P2P lending, ETFs, savings accounts).
      Ensure the interest rates are realistic annual percentages.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Name of the investment or platform" },
                type: { type: Type.STRING, description: "Must be exactly 'Fixed' or 'Variable'" },
                sector: { type: Type.STRING, description: "Must be one of: 'Financial', 'Cooperatives', 'Energy', 'Cryptocurrencies', 'Real Estate', 'Others'" },
                interestRate: { type: Type.NUMBER, description: "Expected annual interest rate as a decimal (e.g., 0.05 for 5%)" },
                website: { type: Type.STRING, description: "URL to the platform or more information" },
                description: { type: Type.STRING, description: "Brief 1-sentence description of why this is a good option" }
              },
              required: ["name", "type", "sector", "interestRate", "website", "description"]
            }
          }
        }
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text) as Suggestion[];
        setSuggestions(parsed);
      } else {
        throw new Error("Received empty response from AI.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate suggestions.");
    } finally {
      setLoading(false);
    }
  };

  const sectors: InvestmentSector[] = ['Financial', 'Cooperatives', 'Energy', 'Cryptocurrencies', 'Real Estate', 'Others'];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{t("AI Investment Suggestions")}</h2>
          <p className="text-sm text-slate-500">{t("Discover new opportunities tailored to your preferences.")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t("Investment Type")}</label>
          <select
            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
            value={type}
            onChange={(e) => setType(e.target.value as InvestmentType | 'Any')}
          >
            <option value="Any">{t("Any Type")}</option>
            <option value="Fixed">{t("Fixed Income")}</option>
            <option value="Variable">{t("Variable Income")}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t("Sector")}</label>
          <select
            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
            value={sector}
            onChange={(e) => setSector(e.target.value as InvestmentSector | 'Any')}
          >
            <option value="Any">{t("Any Sector")}</option>
            {sectors.map(s => <option key={s} value={s}>{t(s)}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t("Country")}</label>
          <input
            type="text"
            list="countries"
            placeholder={t("e.g. Spain, USA, Global")}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
          <datalist id="countries">
            {COUNTRIES.map(c => <option key={c} value={c} />)}
          </datalist>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t("Currency")}</label>
          <select
            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as 'USD' | 'EUR' | 'Any')}
          >
            <option value="Any">{t("Any Currency")}</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleSuggest}
        disabled={loading}
        className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {t("Generating Ideas...")}
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            {t("Get Suggestions")}
          </>
        )}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">{t("Recommended For You")}</h3>
          <div className="grid gap-4">
            {suggestions.map((s, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-slate-900 text-lg">{s.name}</h4>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-800">
                    {formatPercent(s.interestRate)}
                  </span>
                </div>
                <p className="text-slate-600 text-sm mb-4 leading-relaxed">{s.description}</p>
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700">
                      {t(s.type)}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                      {t(s.sector)}
                    </span>
                  </div>
                  <a 
                    href={s.website.startsWith('http') ? s.website : `https://${s.website}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    {t("Visit Site")} <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
