import React, { useState } from 'react';
import { 
  Globe, 
  Coins, 
  Bell, 
  RefreshCw, 
  Headset, 
  Share2, 
  ShieldCheck, 
  FileText, 
  Info, 
  LogOut, 
  ChevronLeft,
  ChevronRight,
  X,
  QrCode,
  Copy,
  Check,
  Smartphone,
  Facebook,
  Twitter,
  MessageCircle,
  Lock,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import BadalLogo from './BadalLogo';
import { WhatsAppConfig } from '../types';

interface SettingsViewProps {
  onLogout?: () => void;
  language: 'ar' | 'en';
  onToggleLanguage: (lang: 'ar' | 'en') => void;
  baseCurrency: string;
  onSelectBaseCurrency: (curr: string) => void;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  refreshInterval: string;
  onSelectRefreshInterval: (interval: string) => void;
  onBack?: () => void;
  onTriggerAdminLogin?: () => void;
  whatsAppConfig?: WhatsAppConfig;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export default function SettingsView({
  onLogout,
  language,
  onToggleLanguage,
  baseCurrency,
  onSelectBaseCurrency,
  notificationsEnabled,
  onToggleNotifications,
  refreshInterval,
  onSelectRefreshInterval,
  onBack,
  onTriggerAdminLogin,
  whatsAppConfig,
  isDarkMode = false,
  onToggleDarkMode
}: SettingsViewProps) {
  // Local modal triggers
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Labels based on selected language (Arabic / English support!)
  const t = {
    ar: {
      settings: 'الإعدادات',
      memberSince: 'عضو منذ يونيو 2025',
      language: 'اللغة',
      activeLanguage: 'العربية',
      baseCurrency: 'العملة الأساسية',
      notifications: 'الإشعارات',
      darkMode: 'الوضع المظلم',
      autoRefresh: 'تحديث البيانات التلقائي',
      contactUs: 'تواصل معنا',
      shareApp: 'مشاركة التطبيق',
      privacyPolicy: 'سياسة الخصوصية',
      terms: 'الشروط والأحكام',
      aboutApp: 'عن التطبيق',
      logout: 'تسجيل الخروج',
      copylink: 'نسخ الرابط',
      copied: 'تم النسخ!',
      shareWithFriends: 'شارك تطبيق بدل مع أصدقائك',
      qrTitle: 'امسح الرمز لتحميل التطبيق مباشرة'
    },
    en: {
      settings: 'Settings',
      memberSince: 'Member since June 2025',
      language: 'Language',
      activeLanguage: 'English',
      baseCurrency: 'Base Currency',
      notifications: 'Notifications',
      darkMode: 'Dark Mode',
      autoRefresh: 'Auto Refresh Data',
      contactUs: 'Contact Us',
      shareApp: 'Share Application',
      privacyPolicy: 'Privacy Policy',
      terms: 'Terms & Conditions',
      aboutApp: 'About Application',
      logout: 'Logout',
      copylink: 'Copy Link',
      copied: 'Copied!',
      shareWithFriends: 'Share Badal App with friends',
      qrTitle: 'Scan QR code to download app directly'
    }
  }[language];

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText('https://badal-app.sd');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className={`w-full h-full overflow-y-auto pb-8 font-sans relative transition-colors duration-200 ${isDarkMode ? 'bg-[#12100C] text-[#FAF7F0]' : 'bg-[#FAF7F0] text-stone-800'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Header with Golden Currency Card Theme */}
      <div className={`sticky top-0 z-10 px-5 py-4 flex items-center justify-between border-b transition-all duration-200 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-[#1B160E] via-[#332A18] to-[#1B160E] border-[#D5A549]/25 shadow-[0_4px_16px_rgba(0,0,0,0.5)]' 
          : 'bg-gradient-to-r from-[#FAF1D6] via-[#EBC173] to-[#D5A549] border-[#D5A549]/50 shadow-[0_4px_16px_rgba(213,165,73,0.25)]'
      }`}>
        {onBack ? (
          <button 
            onClick={onBack}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer border active:scale-95 shrink-0 ${
              isDarkMode
                ? 'bg-white/10 hover:bg-white/20 text-[#FAF1D6] border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.3)]'
                : 'bg-white/45 hover:bg-white/60 text-[#4A3716] border-white/20 shadow-[0_2px_8px_rgba(213,165,73,0.15)]'
            }`}
            aria-label="Back"
          >
            {language === 'ar' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        ) : (
          <div className="w-8 h-8" />
        )}
        <h2 className={`text-base font-black tracking-wide font-cairo ${isDarkMode ? 'text-[#FAF1D6]' : 'text-[#4A3716]'}`}>{t.settings}</h2>
        <div className="w-8 h-8" />
      </div>

      <div className="p-4 space-y-4">
        
        {/* User Profile Card */}
        <div className={`rounded-2xl p-4 border flex items-center justify-between gap-4 transition-all duration-200 ${
          isDarkMode
            ? 'bg-[#1C1811] border-[#D5A549]/25 shadow-[0_4px_16px_rgba(0,0,0,0.2)] text-[#FAF1D6]'
            : 'bg-white border-[#EBC173]/40 shadow-[0_4px_16px_rgba(213,165,73,0.15)] text-[#4A3716]'
        }`}>
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner shrink-0 ${
              isDarkMode ? 'bg-[#FAF1D6]/5 border-[#D5A549]/20' : 'bg-[#FAF1D6]/50 border-[#EBC173]/40'
            }`}>
              <BadalLogo size={36} withTag={false} />
            </div>
            <div className="space-y-0.5 min-w-0">
              <h3 className={`font-black text-sm leading-tight ${isDarkMode ? 'text-[#FAF1D6]' : 'text-stone-800'}`}>BADAL USER</h3>
              <p className={`text-[10px] font-bold font-mono ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>+249 91 234 5678</p>
              <p className={`text-[9px] font-extrabold font-tajawal ${isDarkMode ? 'text-amber-400' : 'text-[#850F1D]'}`}>{t.memberSince}</p>
            </div>
          </div>
          
          {onTriggerAdminLogin && (
            <button
              onClick={onTriggerAdminLogin}
              className={`w-10 h-10 rounded-xl active:scale-95 border transition-all cursor-pointer flex items-center justify-center shrink-0 group ${
                isDarkMode 
                  ? 'bg-white/5 border-white/10 text-stone-400 hover:text-[#FAF1D6]' 
                  : 'bg-[#FAF1D6]/20 hover:bg-[#FAF1D6]/40 border-[#EBC173]/40 text-stone-400 hover:text-[#4A3716] shadow-[0_2px_8px_rgba(213,165,73,0.1)]'
              }`}
              title="دخول الإدارة"
            >
              <Lock className="w-4.5 h-4.5 text-stone-400 group-hover:text-amber-400 group-hover:rotate-6 transition-all" />
            </button>
          )}
        </div>

        {/* Menu Items List matching layout */}
        <div className={`rounded-2xl border overflow-hidden divide-y transition-all duration-200 ${
          isDarkMode 
            ? 'bg-[#1C1811] border-[#D5A549]/25 shadow-[0_4px_16px_rgba(0,0,0,0.15)] divide-[#D5A549]/15' 
            : 'bg-white border-[#EBC173]/30 shadow-[0_4px_16px_rgba(213,165,73,0.15)] divide-[#EBC173]/20'
        }`}>
          
          {/* 1. Language (اللغة) */}
          <button 
            onClick={() => setActiveModal('language')}
            className={`w-full px-4 py-3.5 flex items-center justify-between transition-all cursor-pointer text-right ${
              isDarkMode ? 'text-stone-300 hover:bg-white/5 active:bg-[#D5A549]/10' : 'text-stone-700 hover:bg-stone-50/50 active:bg-amber-50/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                isDarkMode ? 'bg-indigo-950/40 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
              }`}>
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold">{t.language}</span>
            </div>
            <div className="flex items-center gap-1 text-stone-400">
              <span className={`text-[10px] font-bold ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>{t.activeLanguage}</span>
              <ChevronLeft className={`w-4 h-4 transition-transform ${language === 'en' ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* 2. Base Currency (العملة الأساسية) */}
          <button 
            onClick={() => setActiveModal('baseCurrency')}
            className={`w-full px-4 py-3.5 flex items-center justify-between transition-all cursor-pointer text-right ${
              isDarkMode ? 'text-stone-300 hover:bg-white/5 active:bg-[#D5A549]/10' : 'text-stone-700 hover:bg-stone-50/50 active:bg-amber-50/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                isDarkMode ? 'bg-amber-950/40 text-amber-400' : 'bg-amber-50 text-[#850F1D]'
              }`}>
                <Coins className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold">{t.baseCurrency}</span>
            </div>
            <div className="flex items-center gap-1 text-stone-400">
              <span className={`text-[10px] font-bold ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>{baseCurrency}</span>
              <ChevronLeft className={`w-4 h-4 transition-transform ${language === 'en' ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* 3. Notifications (الإشعارات) - Switch toggle */}
          <div className={`px-4 py-3.5 flex items-center justify-between transition-all duration-200 ${
            isDarkMode ? 'text-stone-300' : 'text-stone-700'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                isDarkMode ? 'bg-rose-950/40 text-rose-400' : 'bg-rose-50 text-rose-600'
              }`}>
                <Bell className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold">{t.notifications}</span>
            </div>
            {/* Custom toggle switch */}
            <button 
              onClick={onToggleNotifications}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-250 shrink-0 cursor-pointer ${
                notificationsEnabled ? (isDarkMode ? 'bg-amber-500' : 'bg-[#850F1D]') : (isDarkMode ? 'bg-stone-800' : 'bg-stone-200')
              }`}
              aria-label="Toggle notifications"
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-250 ${
                notificationsEnabled ? (language === 'ar' ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Dark Mode (الوضع المظلم) - Switch toggle */}
          <div className={`px-4 py-3.5 flex items-center justify-between transition-all duration-200 ${
            isDarkMode ? 'text-stone-300' : 'text-stone-700'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                isDarkMode ? 'bg-amber-950/60 text-amber-400' : 'bg-amber-50 text-[#850F1D]'
              }`}>
                {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <span className="text-xs font-extrabold">{t.darkMode}</span>
            </div>
            {/* Custom toggle switch */}
            <button 
              onClick={onToggleDarkMode}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-250 shrink-0 cursor-pointer ${
                isDarkMode ? (isDarkMode ? 'bg-amber-500' : 'bg-[#850F1D]') : 'bg-stone-200'
              }`}
              aria-label="Toggle dark mode"
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-250 ${
                isDarkMode ? (language === 'ar' ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* 4. Auto Refresh (تحديث البيانات التلقائي) */}
          <button 
            onClick={() => setActiveModal('refresh')}
            className={`w-full px-4 py-3.5 flex items-center justify-between transition-all cursor-pointer text-right ${
              isDarkMode ? 'text-stone-300 hover:bg-white/5 active:bg-[#D5A549]/10' : 'text-stone-700 hover:bg-stone-50/50 active:bg-amber-50/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                isDarkMode ? 'bg-emerald-950/40 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
              }`}>
                <RefreshCw className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold">{t.autoRefresh}</span>
            </div>
            <div className="flex items-center gap-1 text-stone-400">
              <span className={`text-[10px] font-bold ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>{refreshInterval}</span>
              <ChevronLeft className={`w-4 h-4 transition-transform ${language === 'en' ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* 5. Contact Us (تواصل معنا) */}
          <button 
            onClick={() => setActiveModal('contact')}
            className={`w-full px-4 py-3.5 flex items-center justify-between transition-all cursor-pointer text-right ${
              isDarkMode ? 'text-stone-300 hover:bg-white/5 active:bg-[#D5A549]/10' : 'text-stone-700 hover:bg-stone-50/50 active:bg-amber-50/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                isDarkMode ? 'bg-sky-950/40 text-sky-400' : 'bg-sky-50 text-sky-600'
              }`}>
                <Headset className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold">{t.contactUs}</span>
            </div>
            <ChevronLeft className={`w-4 h-4 text-stone-400 transition-transform ${language === 'en' ? 'rotate-180' : ''}`} />
          </button>

          {/* 6. Share App (مشاركة التطبيق) */}
          <button 
            onClick={() => setActiveModal('share')}
            className={`w-full px-4 py-3.5 flex items-center justify-between transition-all cursor-pointer text-right ${
              isDarkMode ? 'text-stone-300 hover:bg-white/5 active:bg-[#D5A549]/10' : 'text-stone-700 hover:bg-stone-50/50 active:bg-amber-50/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                isDarkMode ? 'bg-teal-950/40 text-teal-400' : 'bg-teal-50 text-teal-600'
              }`}>
                <Share2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold">{t.shareApp}</span>
            </div>
            <ChevronLeft className={`w-4 h-4 text-stone-400 transition-transform ${language === 'en' ? 'rotate-180' : ''}`} />
          </button>

          {/* 7. Privacy Policy (سياسة الخصوصية) */}
          <button 
            onClick={() => setActiveModal('privacy')}
            className={`w-full px-4 py-3.5 flex items-center justify-between transition-all cursor-pointer text-right ${
              isDarkMode ? 'text-stone-300 hover:bg-white/5 active:bg-[#D5A549]/10' : 'text-stone-700 hover:bg-stone-50/50 active:bg-amber-50/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                isDarkMode ? 'bg-purple-950/40 text-purple-400' : 'bg-purple-50 text-purple-600'
              }`}>
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold">{t.privacyPolicy}</span>
            </div>
            <ChevronLeft className={`w-4 h-4 text-stone-400 transition-transform ${language === 'en' ? 'rotate-180' : ''}`} />
          </button>

          {/* 8. Terms and Conditions (الشروط والأحكام) */}
          <button 
            onClick={() => setActiveModal('terms')}
            className={`w-full px-4 py-3.5 flex items-center justify-between transition-all cursor-pointer text-right ${
              isDarkMode ? 'text-stone-300 hover:bg-white/5 active:bg-[#D5A549]/10' : 'text-stone-700 hover:bg-stone-50/50 active:bg-amber-50/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                isDarkMode ? 'bg-orange-950/40 text-orange-400' : 'bg-orange-50 text-orange-600'
              }`}>
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold">{t.terms}</span>
            </div>
            <ChevronLeft className={`w-4 h-4 text-stone-400 transition-transform ${language === 'en' ? 'rotate-180' : ''}`} />
          </button>

          {/* 9. About App (عن التطبيق) */}
          <button 
            onClick={() => setActiveModal('about')}
            className={`w-full px-4 py-3.5 flex items-center justify-between transition-all cursor-pointer text-right ${
              isDarkMode ? 'text-stone-300 hover:bg-white/5 active:bg-[#D5A549]/10' : 'text-stone-700 hover:bg-stone-50/50 active:bg-amber-50/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                isDarkMode ? 'bg-stone-900 text-stone-400' : 'bg-stone-100 text-stone-600'
              }`}>
                <Info className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold">{t.aboutApp}</span>
            </div>
            <ChevronLeft className={`w-4 h-4 text-stone-400 transition-transform ${language === 'en' ? 'rotate-180' : ''}`} />
          </button>

        </div>

      </div>

      {/* Dynamic Popups/Modals/Drawers */}
      <AnimatePresence>
        {activeModal && (
          <div className="absolute inset-0 bg-black/60 z-30 flex items-end">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className={`w-full rounded-t-3xl shadow-2xl p-5 border-t space-y-4 max-h-[80%] overflow-y-auto no-scrollbar z-40 transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-[#1C1811] border-[#D5A549]/30 text-[#FAF7F0]' 
                  : 'bg-white border-amber-200/30 text-stone-800'
              }`}
            >
              {/* Drawer Handle */}
              <div className={`w-12 h-1 rounded-full mx-auto ${isDarkMode ? 'bg-stone-700' : 'bg-stone-300'}`} />

              <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? 'border-white/10' : 'border-stone-100'}`}>
                <h3 className={`font-black text-sm ${isDarkMode ? 'text-[#FAF1D6]' : 'text-stone-800'}`}>
                  {activeModal === 'language' && t.language}
                  {activeModal === 'baseCurrency' && t.baseCurrency}
                  {activeModal === 'refresh' && t.autoRefresh}
                  {activeModal === 'contact' && t.contactUs}
                  {activeModal === 'share' && t.shareApp}
                  {activeModal === 'privacy' && t.privacyPolicy}
                  {activeModal === 'terms' && t.terms}
                  {activeModal === 'about' && t.aboutApp}
                </h3>
                <button 
                  onClick={() => setActiveModal(null)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isDarkMode ? 'bg-white/10 hover:bg-white/20 text-stone-300' : 'bg-stone-100 hover:bg-stone-200 text-stone-500'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Contents */}
              <div className={`py-2 text-xs leading-relaxed font-tajawal ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                
                {/* 1. Language Modal */}
                {activeModal === 'language' && (
                  <div className="space-y-2">
                    <button 
                      onClick={() => { onToggleLanguage('ar'); setActiveModal(null); }}
                      className={`w-full p-3.5 rounded-xl border font-black flex items-center justify-between cursor-pointer transition-colors duration-200 ${
                        language === 'ar' 
                          ? (isDarkMode ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-[#850F1D] bg-amber-50/30 text-[#850F1D]') 
                          : (isDarkMode ? 'border-[#FAF1D6]/10 hover:bg-white/5 text-stone-300' : 'border-stone-200 hover:bg-stone-50 text-stone-700')
                      }`}
                    >
                      <span>العربية (Arabic)</span>
                      {language === 'ar' && <Check className="w-4.5 h-4.5" />}
                    </button>
                    <button 
                      onClick={() => { onToggleLanguage('en'); setActiveModal(null); }}
                      className={`w-full p-3.5 rounded-xl border font-black flex items-center justify-between cursor-pointer transition-colors duration-200 ${
                        language === 'en' 
                          ? (isDarkMode ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-[#850F1D] bg-amber-50/30 text-[#850F1D]') 
                          : (isDarkMode ? 'border-[#FAF1D6]/10 hover:bg-white/5 text-stone-300' : 'border-stone-200 hover:bg-stone-50 text-stone-700')
                      }`}
                    >
                      <span>English (الإنجليزية)</span>
                      {language === 'en' && <Check className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                )}

                {/* 2. Base Currency Modal */}
                {activeModal === 'baseCurrency' && (
                  <div className="space-y-2">
                    {[
                      'الفرنك التشادي - ج.س',
                      'الدولار الأمريكي - ج.س',
                      'اليورو - ج.س',
                      'الريال السعودي - ج.س'
                    ].map((curr) => (
                      <button 
                        key={curr}
                        onClick={() => { onSelectBaseCurrency(curr); setActiveModal(null); }}
                        className={`w-full p-3.5 rounded-xl border font-black flex items-center justify-between cursor-pointer transition-colors duration-200 ${
                          baseCurrency === curr 
                            ? (isDarkMode ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-[#850F1D] bg-amber-50/30 text-[#850F1D]') 
                            : (isDarkMode ? 'border-[#FAF1D6]/10 hover:bg-white/5 text-stone-300' : 'border-stone-200 hover:bg-stone-50 text-stone-700')
                        }`}
                      >
                        <span>{curr}</span>
                        {baseCurrency === curr && <Check className="w-4.5 h-4.5" />}
                      </button>
                    ))}
                  </div>
                )}

                {/* 3. Refresh Frequency Modal */}
                {activeModal === 'refresh' && (
                  <div className="space-y-2">
                    {['كل ٥ دقائق', 'كل ١٠ دقائق', 'كل ٣٠ دقيقة', 'يدوي فقط'].map((freq) => (
                      <button 
                        key={freq}
                        onClick={() => { onSelectRefreshInterval(freq); setActiveModal(null); }}
                        className={`w-full p-3.5 rounded-xl border font-black flex items-center justify-between cursor-pointer transition-colors duration-200 ${
                          refreshInterval === freq 
                            ? (isDarkMode ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-[#850F1D] bg-amber-50/30 text-[#850F1D]') 
                            : (isDarkMode ? 'border-[#FAF1D6]/10 hover:bg-white/5 text-stone-300' : 'border-stone-200 hover:bg-stone-50 text-stone-700')
                        }`}
                      >
                        <span>{freq}</span>
                        {refreshInterval === freq && <Check className="w-4.5 h-4.5" />}
                      </button>
                    ))}
                  </div>
                )}

                {/* 4. Contact Us Modal */}
                {activeModal === 'contact' && (
                  <div className="space-y-3.5 text-center">
                    <Headset className={`w-12 h-12 mx-auto mb-2 ${isDarkMode ? 'text-amber-400' : 'text-[#850F1D]'}`} />
                    <p className={`font-extrabold ${isDarkMode ? 'text-stone-200' : 'text-stone-700'}`}>دعم عملاء تطبيق بدل جاهز لخدمتكم!</p>
                    <p className="px-4 text-xs">ساعات العمل: من السبت إلى الخميس، من الساعة ٨ صباحاً وحتى ٨ مساءً.</p>
                    <div className="pt-2 space-y-2">
                      <a 
                        href={whatsAppConfig?.waLink || "https://wa.me/249912345678"}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 rounded-xl bg-[#25D366] text-white font-bold flex items-center justify-center gap-2 transition-all hover:bg-[#20ba5a]"
                      >
                        <MessageCircle className="w-4 h-4 fill-current" />
                        <span>مراسلة الدعم الفني</span>
                      </a>
                      
                      <a 
                        href={`tel:${whatsAppConfig?.supportPhone || "+249912345678"}`} 
                        className={`w-full py-2.5 rounded-xl font-bold block text-xs transition-colors duration-200 ${
                          isDarkMode ? 'bg-white/5 hover:bg-white/10 text-stone-300 border border-white/5' : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                        }`}
                      >
                        هاتف الدعم: {whatsAppConfig?.supportPhone || "+249 91 234 5678"}
                      </a>

                      {whatsAppConfig?.channelLink && (
                        <a 
                          href={whatsAppConfig.channelLink} 
                          target="_blank" 
                          rel="noreferrer" 
                          className={`w-full py-2.5 rounded-xl font-bold block text-xs border transition-colors duration-200 ${
                            isDarkMode 
                              ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30' 
                              : 'bg-amber-50 hover:bg-amber-100 text-[#850F1D] border-amber-200/50'
                          }`}
                        >
                          قناة أسعار الصرف الرسمية
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. Share App Modal with QrCode & link */}
                {activeModal === 'share' && (
                  <div className="text-center space-y-4 py-2">
                    <p className={`font-extrabold text-xs ${isDarkMode ? 'text-stone-200' : 'text-stone-700'}`}>{t.shareWithFriends}</p>
                    
                    {/* Mock QrCode box */}
                    <div className={`w-32 h-32 rounded-2xl mx-auto flex items-center justify-center border p-2 shadow-inner transition-colors duration-200 ${
                      isDarkMode ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50/50 border-amber-200/50'
                    }`}>
                      <QrCode className={`w-24 h-24 ${isDarkMode ? 'text-amber-400' : 'text-stone-800'}`} />
                    </div>
                    <p className="text-[10px] text-stone-400 font-bold">{t.qrTitle}</p>

                    {/* Copy Link Button */}
                    <div className="flex gap-2 max-w-xs mx-auto">
                      <button 
                        onClick={handleCopyShareLink}
                        className={`flex-1 font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          isDarkMode ? 'bg-white/5 hover:bg-white/10 text-stone-200 border border-white/5' : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                        }`}
                      >
                        {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedLink ? t.copied : t.copylink}</span>
                      </button>
                    </div>

                    {/* Social Media icons */}
                    <div className="flex justify-center gap-4 pt-2">
                      <button className={`w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform ${
                        isDarkMode ? 'bg-[#1877F2]/20 text-[#1877F2]' : 'bg-[#1877F2]/10 text-[#1877F2]'
                      }`}>
                        <Facebook className="w-4.5 h-4.5 fill-current" />
                      </button>
                      <button className={`w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform ${
                        isDarkMode ? 'bg-[#1DA1F2]/20 text-[#1DA1F2]' : 'bg-[#1DA1F2]/10 text-[#1DA1F2]'
                      }`}>
                        <Twitter className="w-4.5 h-4.5 fill-current" />
                      </button>
                      <button className={`w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform ${
                        isDarkMode ? 'bg-[#25D366]/20 text-[#25D366]' : 'bg-[#25D366]/10 text-[#25D366]'
                      }`}>
                        <MessageCircle className="w-4.5 h-4.5 fill-current" />
                      </button>
                    </div>
                  </div>
                )}

                {/* 6. Privacy Policy Modal */}
                {activeModal === 'privacy' && (
                  <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                    <p className={`font-extrabold ${isDarkMode ? 'text-[#FAF1D6]' : 'text-stone-800'}`}>🔒 سياسة الخصوصية وحماية البيانات</p>
                    <p>يهتم تطبيق بدل بحماية خصوصيتك وأمن بياناتك المالية والاستهلاكية إلى أقصى درجة. نود أن نوضح لعملائنا النقاط التالية:</p>
                    <ul className="list-disc pr-4 space-y-1">
                      <li>نحن لا نقوم بحفظ أي بيانات شخصية أو بنكية حساسة تخص المستخدمين.</li>
                      <li>جميع تفاصيل الطلبات عبر واتساب تتم بخصوصية تامة بين العميل وإدارة المبيعات مباشرة.</li>
                      <li>تُستعمل معلومات الصرف بغرض التسهيل الاسترشادي لمعرفة الأسعار اللحظية فقط.</li>
                    </ul>
                    <p>باستعمالك للتطبيق، أنت توافق على شروط الأمان وحماية النظم لدينا.</p>
                  </div>
                )}

                {/* 7. Terms & Conditions Modal */}
                {activeModal === 'terms' && (
                  <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                    <p className={`font-extrabold ${isDarkMode ? 'text-[#FAF1D6]' : 'text-stone-800'}`}>📄 الشروط والأحكام الخاصة بالخدمة</p>
                    <p>أهلاً بك في منصة بدل. يرجى قراءة الشروط والأحكام التالية بعناية قبل البدء في استخدام الخدمات:</p>
                    <ul className="list-disc pr-4 space-y-1">
                      <li>الأسعار المعروضة في التطبيق استرشادية، تم جمعها من الأسواق والمحلات الموثوقة لحظة بلحظة.</li>
                      <li>قد تختلف أسعار الصرف الحقيقية والسلع بشكل طفيف باختلاف الموقع أو كمية الطلب.</li>
                      <li>تطبيق بدل غير مسؤول عن أي اتفاقيات تجارية خارجية تتم خارج نطاق قنواتنا المعتمدة.</li>
                    </ul>
                  </div>
                )}

                {/* 8. About Application Modal */}
                {activeModal === 'about' && (
                  <div className="text-center space-y-4 py-2">
                    <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center border shadow-inner transition-colors duration-200 ${
                      isDarkMode ? 'bg-[#FAF1D6]/5 border-amber-500/20' : 'bg-amber-50 border-amber-200/50'
                    }`}>
                      <BadalLogo size={48} withTag={false} />
                    </div>
                    <div>
                      <h4 className={`font-black text-sm leading-tight ${isDarkMode ? 'text-amber-400' : 'text-[#850F1D]'}`}>تطبيق بدل (BADAL)</h4>
                      <p className="text-[10px] text-stone-400 font-bold mt-1">نسخة بريميوم مستقرة v2.4.0</p>
                    </div>
                    <p className={`px-4 leading-relaxed max-w-xs mx-auto ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                      منصة متطورة لمتابعة أسعار صرف العملات الأجنبية مقابل الجنيه السوداني، ورصد أسعار السلع الغذائية والاستهلاكية الأساسية في الأسواق المحلية بشكل فوري.
                    </p>
                    <p className="text-[10px] text-[#C09F65] font-extrabold">جميع الحقوق محفوظة © بدل ٢٠٢٥ - ٢٠٢٦</p>
                  </div>
                )}

              </div>

              <button
                onClick={() => setActiveModal(null)}
                className={`w-full text-xs font-black py-3 rounded-xl transition-all cursor-pointer ${
                  isDarkMode 
                    ? 'bg-amber-500 hover:bg-amber-600 text-[#12100C]' 
                    : 'bg-[#850F1D] hover:bg-[#720a15] text-white'
                }`}
              >
                حفظ وإغلاق
              </button>
            </motion.div>
            <div className="absolute inset-0 z-30" onClick={() => setActiveModal(null)} />
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
