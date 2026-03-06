import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'es';

interface Translations {
  [key: string]: {
    en: string;
    es: string;
  };
}

export const translations: Translations = {
  "Wealth Tracker": { en: "Wealth Tracker", es: "Mis Inversiones" },
  "Portfolio": { en: "Portfolio", es: "Portafolio" },
  "Insights": { en: "Insights", es: "Estadísticas" },
  "Investment Ideas": { en: "Investment Ideas", es: "Ideas de Inversión" },
  "Search investments...": { en: "Search investments...", es: "Buscar inversiones..." },
  "Add": { en: "Add", es: "Añadir" },
  "Import": { en: "Import", es: "Importar" },
  "Add Manually": { en: "Add Manually", es: "Añadir manualmente" },
  "Partial Import": { en: "Partial Import", es: "Importación parcial" },
  "Total Import": { en: "Total Import", es: "Importación total" },
  "New records will be added to the current portfolio.": { en: "New records will be added to the current portfolio.", es: "Los nuevos registros se añadirán al portafolio actual." },
  "All current records will be deleted and replaced with the new ones.": { en: "All current records will be deleted and replaced with the new ones.", es: "Se borrarán todos los registros actuales y se reemplazarán por los nuevos." },
  "Import Type": { en: "Import Type", es: "Tipo de importación" },
  "All Types": { en: "All Types", es: "Todos los tipos" },
  "Fixed Income": { en: "Fixed Income", es: "Renta Fija" },
  "Variable Income": { en: "Variable Income", es: "Renta Variable" },
  "All Sectors": { en: "All Sectors", es: "Todos los sectores" },
  "Maturity Date": { en: "Maturity Date", es: "Fecha de Vencimiento" },
  "Amount": { en: "Amount", es: "Monto" },
  "Value (USD)": { en: "Value (USD)", es: "Valor (USD)" },
  "No investments found matching your filters.": { en: "No investments found matching your filters.", es: "No se encontraron inversiones que coincidan con tus filtros." },
  "Total Net Worth": { en: "Total Net Worth", es: "Patrimonio Neto Total" },
  "Average Weighted Interest": { en: "Average Weighted Interest", es: "Interés Promedio Ponderado" },
  "Distribution by Sector": { en: "Distribution by Sector", es: "Distribución por Sector" },
  "Fixed vs Variable Income": { en: "Fixed vs Variable Income", es: "Renta Fija vs Variable" },
  "Distribution by Currency": { en: "Distribution by Currency", es: "Distribución por Divisa" },
  "Distribution by Country": { en: "Distribution by Country", es: "Distribución por País" },
  "Largest Investments (by Amount)": { en: "Largest Investments (by Amount)", es: "Inversiones más grandes (por monto)" },
  "Highest Yielding Active Investments": { en: "Highest Yielding Active Investments", es: "Inversiones activas de mayor rendimiento" },
  "AI Investment Suggestions": { en: "AI Investment Suggestions", es: "Sugerencias de Inversión con IA" },
  "Discover new opportunities tailored to your preferences.": { en: "Discover new opportunities tailored to your preferences.", es: "Descubre nuevas oportunidades adaptadas a tus preferencias." },
  "Investment Type": { en: "Investment Type", es: "Tipo de Inversión" },
  "Any Type": { en: "Any Type", es: "Cualquier Tipo" },
  "Sector": { en: "Sector", es: "Sector" },
  "Any Sector": { en: "Any Sector", es: "Cualquier Sector" },
  "Country": { en: "Country", es: "País" },
  "e.g. Spain, USA, Global": { en: "e.g. Spain, USA, Global", es: "ej. España, EE.UU., Global" },
  "Currency": { en: "Currency", es: "Divisa" },
  "Any Currency": { en: "Any Currency", es: "Cualquier Divisa" },
  "Generating Ideas...": { en: "Generating Ideas...", es: "Generando Ideas..." },
  "Get Suggestions": { en: "Get Suggestions", es: "Obtener Sugerencias" },
  "Recommended For You": { en: "Recommended For You", es: "Recomendado para ti" },
  "Visit Site": { en: "Visit Site", es: "Visitar Sitio" },
  "Edit Investment": { en: "Edit Investment", es: "Editar Inversión" },
  "Add Investment": { en: "Add Investment", es: "Añadir Inversión" },
  "Name": { en: "Name", es: "Nombre" },
  "Rate (%)": { en: "Rate (%)", es: "Tasa (%)" },
  "Cancel": { en: "Cancel", es: "Cancelar" },
  "Save": { en: "Save", es: "Guardar" },
  "Import Investments": { en: "Import Investments", es: "Importar Inversiones" },
  "Upload a document, image, or spreadsheet. AI will automatically extract your investments.": { en: "Upload a document, image, or spreadsheet. AI will automatically extract your investments.", es: "Sube un documento, imagen o hoja de cálculo. La IA extraerá automáticamente tus inversiones." },
  "Analyzing file with AI...": { en: "Analyzing file with AI...", es: "Analizando archivo con IA..." },
  "This might take a few seconds": { en: "This might take a few seconds", es: "Esto podría tomar unos segundos" },
  "Click to upload file": { en: "Click to upload file", es: "Haz clic para subir archivo" },
  "PDF, Image, CSV, TXT": { en: "PDF, Image, CSV, TXT", es: "PDF, Imagen, CSV, TXT" },
  "Financial": { en: "Financial", es: "Financiero" },
  "Cooperatives": { en: "Cooperatives", es: "Cooperativas" },
  "Energy": { en: "Energy", es: "Energía" },
  "Cryptocurrencies": { en: "Cryptocurrencies", es: "Criptomonedas" },
  "Real Estate": { en: "Real Estate", es: "Bienes Raíces" },
  "Others": { en: "Others", es: "Otros" },
  "Fixed": { en: "Fixed", es: "Fija" },
  "Variable": { en: "Variable", es: "Variable" },
  "Filters": { en: "Filters", es: "Filtros" },
  "Search": { en: "Search", es: "Buscar" },
  "Your Investments": { en: "Your Investments", es: "Tus Inversiones" },
  "Upcoming Maturities": { en: "Upcoming Maturities", es: "Próximos Vencimientos" },
  "Today": { en: "Today", es: "Hoy" },
  "In {days} days": { en: "In {days} days", es: "En {days} días" },
  "No upcoming maturities": { en: "No upcoming maturities", es: "No hay próximos vencimientos" },
  "matures today!": { en: "matures today!", es: "¡vence hoy!" },
  "matures in": { en: "matures in", es: "vence en" },
  "days": { en: "days", es: "días" },
  "No Investments Yet": { en: "No Investments Yet", es: "Aún no hay inversiones" },
  "Enter amounts in the Portfolio tab to see your wealth distribution, average interest rates, and detailed statistics.": { en: "Enter amounts in the Portfolio tab to see your wealth distribution, average interest rates, and detailed statistics.", es: "Ingresa montos en la pestaña Portafolio para ver la distribución de tu riqueza, tasas de interés promedio y estadísticas detalladas." }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');

  useEffect(() => {
    const savedLang = localStorage.getItem('app_language') as Language;
    if (savedLang) {
      setLanguage(savedLang);
    } else {
      // Try to detect Spanish speaking country by timezone or language
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const isSpanishTZ = tz.includes('Madrid') || tz.includes('Buenos_Aires') || tz.includes('Bogota') || tz.includes('Lima') || tz.includes('Santiago') || tz.includes('Mexico_City') || tz.includes('Guayaquil') || tz.includes('Caracas');
      const isSpanishLang = navigator.language.startsWith('es');
      
      if (isSpanishTZ || isSpanishLang) {
        setLanguage('es');
      } else {
        setLanguage('en');
      }
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
