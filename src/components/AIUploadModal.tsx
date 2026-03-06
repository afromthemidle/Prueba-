import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Upload, X, Loader2, FileText } from 'lucide-react';
import { Investment } from '../data/investments';
import { useLanguage } from '../i18n/LanguageContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (investments: (Investment & { amount?: number })[], type: 'partial' | 'total') => void;
}

export function AIUploadModal({ isOpen, onClose, onSuccess }: Props) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importType, setImportType] = useState<'partial' | 'total'>('partial');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          const apiKey = process.env.GEMINI_API_KEY;
          if (!apiKey) throw new Error("API Key missing");
          
          const ai = new GoogleGenAI({ apiKey });
          
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: file.type || 'application/octet-stream',
                    data: base64Data
                  }
                },
                {
                  text: `Analyze the provided file and extract a list of investments.
                  For each investment, provide:
                  - name: string
                  - rate: number (annual interest rate as a decimal, e.g. 0.05 for 5%. If not found, use 0)
                  - currency: 'USD' or 'EUR' (default to USD if unknown)
                  - country: string (default to 'Global' if unknown)
                  - type: 'Fixed' or 'Variable'
                  - sector: 'Financial', 'Cooperatives', 'Energy', 'Cryptocurrencies', 'Real Estate', or 'Others'
                  - amount: number (the balance, value, or amount invested. If not found, omit or use 0)
                  - maturityDate: string (YYYY-MM-DD format. If not found, omit)
                  `
                }
              ]
            },
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    rate: { type: Type.NUMBER },
                    currency: { type: Type.STRING },
                    country: { type: Type.STRING },
                    type: { type: Type.STRING },
                    sector: { type: Type.STRING },
                    amount: { type: Type.NUMBER },
                    maturityDate: { type: Type.STRING }
                  },
                  required: ["name", "rate", "currency", "country", "type", "sector"]
                }
              }
            }
          });
          
          const text = response.text;
          if (text) {
            const parsed = JSON.parse(text);
            const newInvestments = parsed.map((inv: any) => ({
              ...inv,
              id: Math.random().toString(36).substr(2, 9),
              currency: ['USD', 'EUR'].includes(inv.currency) ? inv.currency : 'USD',
              type: ['Fixed', 'Variable'].includes(inv.type) ? inv.type : 'Fixed',
              sector: ['Financial', 'Cooperatives', 'Energy', 'Cryptocurrencies', 'Real Estate', 'Others'].includes(inv.sector) ? inv.sector : 'Others',
            }));
            onSuccess(newInvestments, importType);
            onClose();
          } else {
            throw new Error("No data extracted");
          }
        } catch (err: any) {
          setError(err.message || "Failed to parse file");
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden p-6 relative border border-slate-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-lg flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">{t("Import Investments")}</h2>
          <p className="text-sm text-slate-500 mt-1">{t("Upload a document, image, or spreadsheet. AI will automatically extract your investments.")}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}

        <div className="mb-6 space-y-3">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">{t("Import Type")}</label>
          <div 
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${importType === 'partial' ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300'}`}
            onClick={() => setImportType('partial')}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${importType === 'partial' ? 'border-slate-900' : 'border-slate-300'}`}>
                {importType === 'partial' && <div className="w-2 h-2 rounded-full bg-slate-900" />}
              </div>
              <span className="font-semibold text-sm text-slate-900">{t("Partial Import")}</span>
            </div>
            <p className="text-xs text-slate-500 ml-6">{t("New records will be added to the current portfolio.")}</p>
          </div>
          
          <div 
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${importType === 'total' ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300'}`}
            onClick={() => setImportType('total')}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${importType === 'total' ? 'border-slate-900' : 'border-slate-300'}`}>
                {importType === 'total' && <div className="w-2 h-2 rounded-full bg-slate-900" />}
              </div>
              <span className="font-semibold text-sm text-slate-900">{t("Total Import")}</span>
            </div>
            <p className="text-xs text-slate-500 ml-6">{t("All current records will be deleted and replaced with the new ones.")}</p>
          </div>
        </div>

        <div 
          className={`border border-dashed rounded-lg p-8 text-center transition-colors ${loading ? 'border-slate-200 bg-slate-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50 cursor-pointer'}`}
          onClick={() => !loading && fileInputRef.current?.click()}
        >
          {loading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-slate-900 animate-spin mb-3" />
              <p className="text-sm font-semibold text-slate-900">{t("Analyzing file with AI...")}</p>
              <p className="text-xs text-slate-500 mt-1">{t("This might take a few seconds")}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-8 h-8 text-slate-400 mb-3" />
              <p className="text-sm font-semibold text-slate-900">{t("Click to upload file")}</p>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mt-2">{t("PDF, Image, CSV, TXT")}</p>
            </div>
          )}
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,image/*,.csv,.txt,.json"
          />
        </div>
      </div>
    </div>
  );
}
