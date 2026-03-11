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
  "Distribution by Currency / Asset": { en: "Distribution by Currency / Asset", es: "Distribución por Divisa / Activo" },
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
  "Technology": { en: "Technology", es: "Tecnología" },
  "Healthcare": { en: "Healthcare", es: "Salud" },
  "Consumer Goods": { en: "Consumer Goods", es: "Bienes de Consumo" },
  "Industrials": { en: "Industrials", es: "Industriales" },
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
  "Enter amounts in the Portfolio tab to see your wealth distribution, average interest rates, and detailed statistics.": { en: "Enter amounts in the Portfolio tab to see your wealth distribution, average interest rates, and detailed statistics.", es: "Ingresa montos en la pestaña Portafolio para ver la distribución de tu riqueza, tasas de interés promedio y estadísticas detalladas." },
  "Maturity": { en: "Maturity", es: "Vencimiento" },
  "Annual Rate": { en: "Annual Rate", es: "Tasa Anual" },
  "Filter Statistics": { en: "Filter Statistics", es: "Filtrar Estadísticas" },
  "All Currencies": { en: "All Currencies", es: "Todas las Divisas" },
  "USD Value": { en: "USD Value", es: "Valor USD" },
  "Sign In": { en: "Sign In", es: "Iniciar Sesión" },
  "Sign Out": { en: "Sign Out", es: "Cerrar Sesión" },
  "Create Account": { en: "Create Account", es: "Crear Cuenta" },
  "Email": { en: "Email", es: "Correo Electrónico" },
  "Password": { en: "Password", es: "Contraseña" },
  "Forgot Password?": { en: "Forgot Password?", es: "¿Olvidaste tu contraseña?" },
  "Reset Password": { en: "Reset Password", es: "Restablecer Contraseña" },
  "Send Reset Link": { en: "Send Reset Link", es: "Enviar enlace de recuperación" },
  "Don't have an account?": { en: "Don't have an account?", es: "¿No tienes una cuenta?" },
  "Sign Up": { en: "Sign Up", es: "Regístrate" },
  "Already have an account?": { en: "Already have an account?", es: "¿Ya tienes una cuenta?" },
  "Please wait...": { en: "Please wait...", es: "Por favor espera..." },
  "Logged in successfully": { en: "Logged in successfully", es: "Sesión iniciada con éxito" },
  "Account created successfully. Please check your email to confirm.": { en: "Account created successfully. Please check your email to confirm.", es: "Cuenta creada con éxito. Por favor, revisa tu correo para confirmar." },
  "Logged out successfully": { en: "Logged out successfully", es: "Sesión cerrada con éxito" },
  "Password reset email sent": { en: "Password reset email sent", es: "Correo de recuperación enviado" },
  "Data synced from cloud": { en: "Data synced from cloud", es: "Datos sincronizados de la nube" },
  "Local data saved to cloud": { en: "Local data saved to cloud", es: "Datos locales guardados en la nube" },
  "Cloud Sync Active": { en: "Cloud Sync Active", es: "Sincronización Activa" },
  "Supabase Not Configured": { en: "Supabase Not Configured", es: "Supabase no configurado" },
  "To enable user accounts and cloud sync, please set up Supabase and add the configuration to your environment variables.": { en: "To enable user accounts and cloud sync, please set up Supabase and add the configuration to your environment variables.", es: "Para habilitar cuentas de usuario y sincronización, configura Supabase y añade la configuración a tus variables de entorno." },
  "Continue in Local Mode": { en: "Continue in Local Mode", es: "Continuar en Modo Local" },
  "History": { en: "History", es: "Historial" },
  "Portfolio History": { en: "Portfolio History", es: "Historial del Portafolio" },
  "Save your current portfolio state to track your wealth growth over time.": { en: "Save your current portfolio state to track your wealth growth over time.", es: "Guarda el estado actual de tu portafolio para rastrear el crecimiento de tu patrimonio a lo largo del tiempo." },
  "Save Current State": { en: "Save Current State", es: "Guardar Estado Actual" },
  "Saving...": { en: "Saving...", es: "Guardando..." },
  "No historical data yet": { en: "No historical data yet", es: "Aún no hay datos históricos" },
  "Click the button above to save your first portfolio snapshot and start tracking your wealth growth.": { en: "Click the button above to save your first portfolio snapshot and start tracking your wealth growth.", es: "Haz clic en el botón de arriba para guardar tu primer estado y empezar a rastrear el crecimiento de tu patrimonio." },
  "Total Net Worth History": { en: "Total Net Worth History", es: "Historial del Patrimonio Neto" },
  "Growth Percentage": { en: "Growth Percentage", es: "Porcentaje de Crecimiento" },
  "Growth": { en: "Growth", es: "Crecimiento" },
  "Portfolio state saved successfully": { en: "Portfolio state saved successfully", es: "Estado del portafolio guardado con éxito" },
  "Error saving portfolio state": { en: "Error saving portfolio state", es: "Error al guardar el estado del portafolio" },
  "Updated today": { en: "Updated today", es: "Actualizado hoy" },
  "Updated yesterday": { en: "Updated yesterday", es: "Actualizado ayer" },
  "Updated {days} days ago": { en: "Updated {days} days ago", es: "Actualizado hace {days} días" },
  "Currency / Asset": { en: "Currency / Asset", es: "Divisa / Activo" },
  "Currencies": { en: "Currencies", es: "Divisas" },
  "Updating prices...": { en: "Updating prices...", es: "Actualizando precios..." },
  "Live Price": { en: "Live Price", es: "Precio en Vivo" },
  "Other Assets": { en: "Other Assets", es: "Otros Activos" },
  "Indices & Funds": { en: "Indices & Funds", es: "Índices y Fondos" },
  "Custom Asset...": { en: "Custom Asset...", es: "Activo Personalizado..." },
  "e.g. TSLA, Gold, etc.": { en: "e.g. TSLA, Gold, etc.", es: "ej. TSLA, Oro, etc." },
  "Select Asset": { en: "Select Asset", es: "Seleccionar Activo" },
  "Select Asset...": { en: "Select Asset...", es: "Seleccionar Activo..." },
  "Search by symbol or name...": { en: "Search by symbol or name...", es: "Buscar por símbolo o nombre..." },
  "No predefined assets found for": { en: "No predefined assets found for", es: "No se encontraron activos predefinidos para" },
  "Search market for": { en: "Search market for", es: "Buscar en el mercado" },
  "Asset not found or no market quote available.": { en: "Asset not found or no market quote available.", es: "Activo no encontrado o sin cotización disponible." },
  "Search Result": { en: "Search Result", es: "Resultado de búsqueda" },
  "Search Results": { en: "Search Results", es: "Resultados de búsqueda" },
  "Popular Assets": { en: "Popular Assets", es: "Activos Populares" },
  "Custom Asset": { en: "Custom Asset", es: "Activo Personalizado" },
  "Live Quote": { en: "Live Quote", es: "Cotización en Vivo" },
  "No quote": { en: "No quote", es: "Sin cotización" },
  "Market Results": { en: "Market Results", es: "Resultados del Mercado" },
  "Clear": { en: "Clear", es: "Limpiar" },
  "Search Market": { en: "Search Market", es: "Buscar en el Mercado" },
  "US Dollar": { en: "US Dollar", es: "Dólar Estadounidense" },
  "Euro": { en: "Euro", es: "Euro" },
  "British Pound": { en: "British Pound", es: "Libra Esterlina" },
  "Japanese Yen": { en: "Japanese Yen", es: "Yen Japonés" },
  "Bitcoin": { en: "Bitcoin", es: "Bitcoin" },
  "Ethereum": { en: "Ethereum", es: "Ethereum" },
  "Solana": { en: "Solana", es: "Solana" },
  "Apple Inc.": { en: "Apple Inc.", es: "Apple Inc." },
  "Microsoft": { en: "Microsoft", es: "Microsoft" },
  "Alphabet": { en: "Alphabet", es: "Alphabet" },
  "Amazon": { en: "Amazon", es: "Amazon" },
  "Tesla": { en: "Tesla", es: "Tesla" },
  "NVIDIA": { en: "NVIDIA", es: "NVIDIA" },
  "Gold": { en: "Gold", es: "Oro" },
  "Silver": { en: "Silver", es: "Plata" },
  "S&P 500 Index": { en: "S&P 500 Index", es: "Índice S&P 500" },
  "NASDAQ 100": { en: "NASDAQ 100", es: "NASDAQ 100" },
  "Stocks": { en: "Stocks", es: "Acciones" },
  "Fixed Income Funds": { en: "Fixed Income Funds", es: "Fondos de Renta Fija" },
  "Other": { en: "Other", es: "Otro" },
  "All Currencies / Assets": { en: "All Currencies / Assets", es: "Todas las Divisas / Activos" },
  "Updated Before": { en: "Updated Before", es: "Actualizado Antes De" },
  "Portfolio Hierarchy": { en: "Portfolio Hierarchy", es: "Jerarquía del Portafolio" },
  "Level 1": { en: "Level 1", es: "Nivel 1" },
  "Level 2": { en: "Level 2", es: "Nivel 2" },
  "Level 3": { en: "Level 3", es: "Nivel 3" },
  "Filter Level 1": { en: "Filter Level 1", es: "Filtrar Nivel 1" },
  "Best viewed in full screen or on a large display": { en: "Best viewed in full screen or on a large display", es: "Mejor visualización en pantalla completa o en un monitor grande" },
  "Type": { en: "Type", es: "Tipo" },
  "Maximize": { en: "Maximize", es: "Maximizar" },
  "Minimize": { en: "Minimize", es: "Minimizar" }
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
