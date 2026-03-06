import React, { useState } from 'react';
import { X, Mail, Lock, AlertCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: Props) {
  const { t } = useLanguage();
  const { resetPassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  if (!isSupabaseConfigured) {
    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative border border-slate-200 text-center">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">{t("Supabase Not Configured")}</h2>
          <p className="text-sm text-slate-500 mb-6">
            {t("To enable user accounts and cloud sync, please set up Supabase and add the configuration to your environment variables.")}
          </p>
          <button onClick={onClose} className="w-full py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">
            {t("Continue in Local Mode")}
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(t("Logged in successfully"));
        onClose();
      } else if (mode === 'register') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success(t("Account created successfully"));
        onClose();
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setMode('login');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">
            {mode === 'login' ? t('Sign In') : mode === 'register' ? t('Create Account') : t('Reset Password')}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("Email")}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                required 
                type="email" 
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:border-slate-400 bg-slate-50 hover:bg-white transition-colors outline-none text-sm" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="you@example.com"
              />
            </div>
          </div>
          
          {mode !== 'forgot' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t("Password")}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  required 
                  type="password" 
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:border-slate-400 bg-slate-50 hover:bg-white transition-colors outline-none text-sm" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors text-sm disabled:opacity-70 mt-2"
          >
            {loading ? t("Please wait...") : mode === 'login' ? t("Sign In") : mode === 'register' ? t("Create Account") : t("Send Reset Link")}
          </button>

          <div className="pt-4 text-center text-sm">
            {mode === 'login' ? (
              <div className="space-y-2">
                <button type="button" onClick={() => setMode('forgot')} className="text-indigo-600 hover:text-indigo-700 font-medium block w-full">
                  {t("Forgot Password?")}
                </button>
                <p className="text-slate-500">
                  {t("Don't have an account?")} <button type="button" onClick={() => setMode('register')} className="text-slate-900 font-medium hover:underline">{t("Sign Up")}</button>
                </p>
              </div>
            ) : (
              <p className="text-slate-500">
                {t("Already have an account?")} <button type="button" onClick={() => setMode('login')} className="text-slate-900 font-medium hover:underline">{t("Sign In")}</button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
