import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Upload, X, Loader2, FileText } from 'lucide-react';
import { Investment } from '../data/investments';
import { useLanguage } from '../i18n/LanguageContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (investments: Investment[]) => void;
}

export function AIUploadModal({ isOpen, onClose, onSuccess }: Props) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
                    sector: { type: Type.STRING }
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
            onSuccess(newInvestments);
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">{t("Import Investments")}</h2>
          <p className="text-sm text-slate-500 mt-1">{t("Upload a document, image, or spreadsheet. AI will automatically extract your investments.")}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}

        <div 
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${loading ? 'border-slate-200 bg-slate-50' : 'border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer'}`}
          onClick={() => !loading && fileInputRef.current?.click()}
        >
          {loading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
              <p className="text-sm font-medium text-slate-700">{t("Analyzing file with AI...")}</p>
              <p className="text-xs text-slate-500 mt-1">{t("This might take a few seconds")}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-8 h-8 text-indigo-500 mb-2" />
              <p className="text-sm font-medium text-slate-700">{t("Click to upload file")}</p>
              <p className="text-xs text-slate-500 mt-1">{t("PDF, Image, CSV, TXT")}</p>
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
