import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, RefreshCw, Copy, Check, MessageSquare, ShoppingBag, TrendingUp, HelpCircle, Phone, ArrowLeft, Clock, CheckSquare, ShieldAlert } from 'lucide-react';
import BadalLogo from './BadalLogo';
import { SafeImage } from './SafeImage';
import { SugarIllustration, FlourIllustration } from './ProductIllustrations';
import { playNotificationSound } from '../utils/audio';

import { Product as SharedProduct, WhatsAppConfig, SystemAlert, Currency } from '../types';

interface HomeViewProps {
  onNavigate: (tab: string) => void;
  onOpenWhatsApp: (productName: string, productPrice: string) => void;
  onOpenMarket: () => void;
  currentFrancRate: number;
  onUpdateFrancRate: () => void;
  isUpdatingRate: boolean;
  products?: SharedProduct[];
  whatsAppConfig?: WhatsAppConfig;
  systemAlerts?: SystemAlert[];
  readAlertIds?: string[];
  onMarkAlertAsRead?: (id: string) => void;
  onMarkAlertsAsRead?: (ids: string[]) => void;
  isDarkMode?: boolean;
  baseCurrency?: string;
  currencies?: Currency[];
}

export default function HomeView({ 
  onNavigate, 
  onOpenWhatsApp, 
  onOpenMarket,
  currentFrancRate,
  onUpdateFrancRate,
  isUpdatingRate,
  products: productsProp,
  whatsAppConfig,
  systemAlerts = [],
  readAlertIds = [],
  onMarkAlertAsRead,
  onMarkAlertsAsRead,
  isDarkMode = false,
  baseCurrency = 'الفرنك التشادي - ج.س',
  currencies = []
}: HomeViewProps) {
  const [copied, setCopied] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  
  // Real-time ticking clock for the home screen
  const [currentTime, setCurrentTime] = useState<string>(() => {
    return new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));
    }, 15000); // Update every 15 seconds for flawless real-time feel
    return () => clearInterval(timer);
  }, []);

  // Lookup dynamic values or fallback to defaults
  const sugarProduct = productsProp?.find(p => p.id === 'sugar' || p.category === 'sugar');
  const sugarPrice = sugarProduct ? sugarProduct.price.toLocaleString() : '4,000';
  const sugarName = sugarProduct ? sugarProduct.name : 'سكر مستورد فاخر';
  const sugarCurrency = sugarProduct?.currencySymbol || 'فرنك';

  const flourProduct = productsProp?.find(p => p.id === 'flour' || p.category === 'foodstuffs');
  const flourPrice = flourProduct ? flourProduct.price.toLocaleString() : '3,500';
  const flourName = flourProduct ? flourProduct.name : 'دقيق الخيرات فاخر';
  const flourCurrency = flourProduct?.currencySymbol || 'فرنك';

  const [timeFilter, setTimeFilter] = useState<'all' | 'hour'>('all');
  const [isSyncingAlerts, setIsSyncingAlerts] = useState(false);

  const notifications = systemAlerts;
  const unreadCount = notifications.filter(n => !readAlertIds.includes(n.id)).length;

  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const filteredNotifications = notifications.filter(notif => {
    if (timeFilter === 'hour') {
      const alertTime = notif.createdAt || 0;
      return alertTime >= oneHourAgo;
    }
    return true;
  });

  const handleSyncAlerts = () => {
    setIsSyncingAlerts(true);
    setTimeout(() => {
      setIsSyncingAlerts(false);
      playNotificationSound(undefined, 'test');
    }, 1000);
  };

  const handleMarkAllAsRead = () => {
    const unreadIds = notifications
      .filter(n => !readAlertIds.includes(n.id))
      .map(n => n.id);
    
    if (unreadIds.length > 0) {
      if (onMarkAlertsAsRead) {
        onMarkAlertsAsRead(unreadIds);
      } else if (onMarkAlertAsRead) {
        unreadIds.forEach(id => onMarkAlertAsRead(id));
      }
    }
  };

  useEffect(() => {
    if (showNotifications) {
      handleMarkAllAsRead();
    }
  }, [showNotifications, notifications]);

  // Real-time currency update time based on actual system/browser clock
  const [lastUpdateTime, setLastUpdateTime] = useState<string>(() => {
    const d = new Date(Date.now() - 3 * 60 * 1000); // Initialize to 3 minutes ago
    return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  });

  useEffect(() => {
    if (!isUpdatingRate) {
      setLastUpdateTime(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));
    }
  }, [isUpdatingRate]);

  // Find active currency from currencies list based on Settings selection
  const activeCurrencyInfo = React.useMemo(() => {
    let code = 'XAF';
    if (baseCurrency && (baseCurrency.includes('الدولار') || baseCurrency.includes('USDT'))) code = 'USDT';
    else if (baseCurrency && baseCurrency.includes('النايرا')) code = 'NGN';
    else if (baseCurrency && baseCurrency.includes('المصري')) code = 'EGP';

    const fallbackMap: Record<string, { id: string; code: string; name: string; flag: string; price: number; unit: string }> = {
      XAF: { id: 'rate-xaf', code: 'XAF', name: 'الفرنك التشادي', flag: '🇹🇩', price: currentFrancRate || 5900, unit: 'ألف فرنك' },
      USDT: { id: 'rate-usd', code: 'USDT', name: 'تتر (USDT)', flag: '🇺🇸', price: 3200, unit: 'تتر واحد' },
      NGN: { id: 'rate-ngn', code: 'NGN', name: 'النايرا النيجيرية', flag: '🇳🇬', price: 2500, unit: 'نايرا (مقابل الفرنك)' },
      EGP: { id: 'rate-egp', code: 'EGP', name: 'الجنيه المصري', flag: '🇪🇬', price: 65, unit: 'جنيه مصري واحد' }
    };

    const found = currencies ? currencies.find(c => c.code === code || (code === 'USDT' && c.code === 'USD')) : null;
    
    let unit = 'ألف فرنك';
    if (code === 'USDT') unit = 'تتر واحد';
    else if (code === 'NGN') unit = 'ألف فرنك تشادي';
    else if (code === 'EGP') unit = 'جنيه مصري واحد';

    let flag = '🇹🇩';
    if (code === 'USDT') flag = '🇺🇸';
    else if (code === 'NGN') flag = '🇳🇬';
    else if (code === 'EGP') flag = '🇪🇬';

    const selectedFallback = fallbackMap[code] || fallbackMap['XAF'];

    return {
      id: found?.id || selectedFallback.id,
      code,
      name: found?.name || selectedFallback.name,
      flag,
      price: found ? found.price : selectedFallback.price,
      unit
    };
  }, [baseCurrency, currencies, currentFrancRate]);

  const handleCopyPrice = () => {
    navigator.clipboard.writeText(`${activeCurrencyInfo.price} ج.س`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format today's date dynamically in Arabic based on actual system time
  const todayArabic = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className={`w-full h-full overflow-y-auto pb-24 font-sans relative select-none transition-colors duration-200 ${
      isDarkMode ? 'bg-[#12100C] text-[#FAF7F0]' : 'bg-[#FAF7F0] text-stone-800'
    }`} dir="rtl">
      
      {/* Top Header */}
      <div className={`sticky top-0 z-20 px-5 py-3 flex items-center justify-between border-b transition-all duration-200 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-[#1B160E] via-[#332A18] to-[#1B160E] border-[#D5A549]/25 shadow-[0_4px_16px_rgba(0,0,0,0.5)]' 
          : 'bg-gradient-to-r from-[#FAF1D6] via-[#EBC173] to-[#D5A549] border-[#D5A549]/50 shadow-[0_4px_16px_rgba(213,165,73,0.25)]'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`relative w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 ${
            isDarkMode ? 'bg-stone-900/65 border-[#D5A549]/30 shadow-[0_2px_8px_rgba(0,0,0,0.5)]' : 'bg-white/45 border-white/35 shadow-[0_2px_8px_rgba(213,165,73,0.15)]'
          }`}>
            <BadalLogo size={28} withTag={false} />
          </div>
          <div>
            <h2 className={`text-base font-black tracking-wide leading-tight ${isDarkMode ? 'text-amber-100' : 'text-[#4A3716]'}`}>BADAL</h2>
            <p className={`text-[10px] font-black font-tajawal ${isDarkMode ? 'text-stone-400' : 'text-[#4A3716]/85'}`}>{todayArabic}</p>
          </div>
        </div>

        {/* Notifications Button */}
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer border active:scale-95 ${
            isDarkMode 
              ? 'bg-stone-900/60 hover:bg-stone-800/60 border-[#D5A549]/20 text-amber-300' 
              : 'bg-white/45 hover:bg-white/60 border-white/20 text-[#4A3716] shadow-[0_2px_8px_rgba(213,165,73,0.15)]'
          }`}
          aria-label="Notifications"
        >
          <Bell className={`w-4.5 h-4.5 ${isDarkMode ? 'text-amber-300' : 'text-[#4A3716]'}`} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-mono text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md animate-bounce border border-white">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      <div className="p-4 space-y-5">
        
        {/* Dynamic, beautifully spaced Date & Time display */}
        <div className={`flex items-center justify-between px-4 py-3 border rounded-2xl transition-all duration-200 ${
          isDarkMode 
            ? 'bg-[#1C1811]/40 border-[#FAF1D6]/10 text-amber-200 shadow-[0_4px_16px_rgba(0,0,0,0.3)]' 
            : 'bg-white border-[#EBC173]/40 text-stone-800 shadow-[0_4px_16px_rgba(213,165,73,0.15)]'
        }`}>
          <div className={`flex items-center gap-1.5 font-black ${isDarkMode ? 'text-amber-400' : 'text-[#850F1D]'}`}>
            <Clock className={`w-4 h-4 animate-pulse ${isDarkMode ? 'text-amber-400' : 'text-[#850F1D]'}`} />
            <span className="text-xs font-mono tracking-tight leading-none pt-0.5">{currentTime}</span>
          </div>
          <div className={`text-[10px] font-extrabold font-tajawal flex items-center gap-1 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
            <span className={`w-1 h-1 rounded-full ${isDarkMode ? 'bg-stone-700' : 'bg-stone-300'}`} />
            <span>{todayArabic}</span>
          </div>
        </div>
        
        {/* Main Golden Card */}
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FAF1D6] via-[#EBC173] to-[#D5A549] text-[#4A3716] p-5 shadow-md border group ${
          isDarkMode ? 'border-[#FAF1D6]/20 shadow-[0_6px_24px_rgba(213,165,73,0.12)]' : 'border-[#E9C37A] shadow-[0_6px_20px_rgba(213,165,73,0.22)]'
        }`}>
          
          {/* Subtle graphic background curve */}
          <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
              <path d="M 0 50 Q 50 10 100 50 T 100 100 L 0 100 Z" fill="#FFF" />
            </svg>
          </div>

          <div className="relative flex justify-between items-start z-10">
            {/* Currency Name & Flag */}
            <div className="flex items-center gap-2">
              {/* Dynamic Flag */}
              <span className="text-3xl shadow-sm filter drop-shadow-xs leading-none">{activeCurrencyInfo.flag}</span>
              <div className="space-y-0.5">
                <span className="text-xs text-[#5D461D] font-bold font-tajawal">العملة النشطة</span>
                <h3 className="text-sm font-black text-[#3D2C0E]">{activeCurrencyInfo.name}</h3>
              </div>
            </div>

            {/* Live Indicator */}
            <div className="flex items-center gap-1.5 bg-white/60 backdrop-blur-xs px-2.5 py-1 rounded-full text-[9px] font-bold text-[#850F1D] shadow-xs">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              <span>آخر تحديث: {lastUpdateTime}</span>
            </div>
          </div>

          {/* Large Price Display */}
          <div className="relative my-6 text-center z-10">
            <AnimatePresence mode="wait">
              {isUpdatingRate ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="h-16 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-7 h-7 text-[#850F1D] animate-spin" />
                  <span className="text-xs font-bold text-[#5D461D] font-tajawal">جاري التحديث...</span>
                </motion.div>
              ) : (
                <motion.div 
                  key="price"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="flex flex-col items-center justify-center"
                >
                  <span className="text-xs font-bold text-[#5D461D] font-tajawal bg-amber-50/60 border border-amber-200/20 px-2.5 py-0.5 rounded-md mb-1.5 shadow-2xs">{activeCurrencyInfo.unit}</span>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-black text-[#850F1D] tracking-tight">{activeCurrencyInfo.price?.toLocaleString()}</span>
                    <span className="text-sm font-bold text-[#5D461D] font-tajawal">
                      {activeCurrencyInfo.code === 'NGN' ? 'نايرا' : 'ج.س / ١'}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Inside Card Actions */}
          <div className="relative flex gap-2.5 z-10">
            {/* Refresh Button */}
            <button
              onClick={onUpdateFrancRate}
              disabled={isUpdatingRate}
              className={`flex-1 font-bold text-[11px] py-1.5 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isDarkMode 
                  ? 'bg-stone-950/80 hover:bg-stone-950 text-amber-200 border-[#D5A549]/20 shadow-xs' 
                  : 'bg-white hover:bg-[#FFFDF9] active:bg-[#F2EDE0] text-[#3D2C0E] border-[#DFB24F]/40 shadow-xs'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUpdatingRate ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </button>

            {/* Direct WhatsApp Contact Button for Currency */}
            {(() => {
              const matchedCurr = currencies?.find(c => c.code === activeCurrencyInfo.code);
              const targetPhone = matchedCurr?.contactPhone || whatsAppConfig?.salesPhone1 || '+249912345678';
              const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
              const messageText = `مرحباً، أريد الاستفسار أو التحويل بالنسبة لعملة ${activeCurrencyInfo.name} بسعر الصرف المعتمد اليوم (${activeCurrencyInfo.price?.toLocaleString()}). شكراً لكم.`;
              const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;

              return (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 font-extrabold text-[11px] py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white flex items-center justify-center gap-1 transition-all shadow-xs active:scale-95"
                >
                  <MessageSquare className="w-3.5 h-3.5 fill-current" />
                  <span>عبر الواتساب</span>
                </a>
              );
            })()}
          </div>

        </div>

        {/* "خدمات سريعة" Section */}
        <div className="space-y-3">
          <h3 className={`text-xs font-black tracking-wide ${isDarkMode ? 'text-stone-400' : 'text-stone-700'}`}>خدمات سريعة</h3>
          
          <div className="grid grid-cols-4 gap-3">
            {/* Prices tab (الأسعار) */}
            <button 
              onClick={() => onNavigate('prices')}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-2 transition-all group cursor-pointer active:scale-95 ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-[#1C1811] via-[#2D2415] to-[#1C1811] border-[#D5A549]/20 shadow-[0_4px_12px_rgba(0,0,0,0.4)] text-amber-100' 
                  : 'bg-gradient-to-br from-[#FAF1D6] via-[#EBC173] to-[#D5A549] border-[#E9C37A] shadow-xs text-[#4A3716]'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs ${
                isDarkMode ? 'bg-stone-900/85 text-amber-400 border border-[#D5A549]/15' : 'bg-white/45 text-[#4A3716]'
              }`}>
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/>
                </svg>
              </div>
              <span className={`text-[10px] font-black font-tajawal ${isDarkMode ? 'text-amber-200/90' : 'text-[#4A3716]'}`}>الأسعار</span>
            </button>

            {/* Products tab (المنتجات) */}
            <button 
              onClick={() => onNavigate('products')}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-2 transition-all group cursor-pointer active:scale-95 ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-[#1C1811] via-[#2D2415] to-[#1C1811] border-[#D5A549]/20 shadow-[0_4px_12px_rgba(0,0,0,0.4)] text-amber-100' 
                  : 'bg-gradient-to-br from-[#FAF1D6] via-[#EBC173] to-[#D5A549] border-[#E9C37A] shadow-xs text-[#4A3716]'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs ${
                isDarkMode ? 'bg-stone-900/85 text-amber-400 border border-[#D5A549]/15' : 'bg-white/45 text-[#4A3716]'
              }`}>
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-black font-tajawal ${isDarkMode ? 'text-amber-200/90' : 'text-[#4A3716]'}`}>المنتجات</span>
            </button>

            {/* Market trend chart (السوق) */}
            <button 
              onClick={onOpenMarket}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-2 transition-all group cursor-pointer active:scale-95 ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-[#1C1811] via-[#2D2415] to-[#1C1811] border-[#D5A549]/20 shadow-[0_4px_12px_rgba(0,0,0,0.4)] text-amber-100' 
                  : 'bg-gradient-to-br from-[#FAF1D6] via-[#EBC173] to-[#D5A549] border-[#E9C37A] shadow-xs text-[#4A3716]'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs ${
                isDarkMode ? 'bg-stone-900/85 text-amber-400 border border-[#D5A549]/15' : 'bg-white/45 text-[#4A3716]'
              }`}>
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-black font-tajawal ${isDarkMode ? 'text-amber-200/90' : 'text-[#4A3716]'}`}>السوق</span>
            </button>

            {/* Contact us (تواصل معنا) */}
            <button 
              onClick={() => setShowContactModal(true)}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-2 transition-all group cursor-pointer active:scale-95 ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-[#1C1811] via-[#2D2415] to-[#1C1811] border-[#D5A549]/20 shadow-[0_4px_12px_rgba(0,0,0,0.4)] text-amber-100' 
                  : 'bg-gradient-to-br from-[#FAF1D6] via-[#EBC173] to-[#D5A549] border-[#E9C37A] shadow-xs text-[#4A3716]'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs ${
                isDarkMode ? 'bg-stone-900/85 text-amber-400 border border-[#D5A549]/15' : 'bg-white/45 text-[#4A3716]'
              }`}>
                <Phone className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-black text-center font-tajawal ${isDarkMode ? 'text-amber-200/90' : 'text-[#4A3716]'}`}>تواصل معنا</span>
            </button>
          </div>
        </div>

        {/* "المنتجات الأكثر طلباً" Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className={`text-xs font-black tracking-wide ${isDarkMode ? 'text-stone-400' : 'text-stone-700'}`}>المنتجات الأكثر طلباً</h3>
            <button 
              onClick={() => onNavigate('products')}
              className={`text-xs font-extrabold hover:underline cursor-pointer ${isDarkMode ? 'text-amber-400' : 'text-[#850F1D]'}`}
            >
              عرض الكل
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            
            {/* Sugar Card */}
            <div className={`rounded-2xl p-3 border flex flex-col items-center text-center group transition-all duration-200 ${
              isDarkMode 
                ? 'bg-[#1C1811] border-[#FAF1D6]/10 text-stone-100 shadow-[0_4px_16px_rgba(0,0,0,0.4)] hover:shadow-[0_6px_20px_rgba(213,165,73,0.15)] hover:border-[#EBC173]/30' 
                : 'bg-white border-[#EBC173]/40 text-stone-800 shadow-[0_4px_16px_rgba(213,165,73,0.15)] hover:shadow-[0_6px_20px_rgba(213,165,73,0.22)] hover:border-[#EBC173]/60'
            }`}>
              <div className="w-24 h-24 mb-2 group-hover:scale-105 transition-transform duration-200 flex items-center justify-center overflow-hidden">
                {sugarProduct?.imageUrl && (sugarProduct.imageUrl.startsWith('http') || sugarProduct.imageUrl.startsWith('data:image')) ? (
                  <SafeImage 
                    src={sugarProduct.imageUrl} 
                    alt={sugarName} 
                    className="max-w-full max-h-full object-contain rounded-lg" 
                  />
                ) : (
                  <SugarIllustration />
                )}
              </div>
              <h4 className={`font-extrabold text-xs ${isDarkMode ? 'text-amber-100' : 'text-stone-800'}`}>{sugarName}</h4>
              <p className={`font-black text-xs mt-1 ${isDarkMode ? 'text-amber-400' : 'text-[#850F1D]'}`}>{sugarPrice} {sugarCurrency}</p>
              
              <button 
                onClick={() => onOpenWhatsApp(sugarName, `${sugarPrice} ${sugarCurrency}`)}
                className={`w-full font-bold text-[10px] py-2 rounded-xl mt-3 flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isDarkMode 
                    ? 'bg-amber-500 text-stone-950 hover:bg-amber-400 shadow-[0_4px_12px_rgba(245,158,11,0.2)] hover:shadow-[0_6px_16px_rgba(245,158,11,0.35)] border border-amber-500/10' 
                    : 'bg-[#850F1D] text-white hover:bg-[#720a15] shadow-[0_4px_12px_rgba(213,165,73,0.3)] hover:shadow-[0_6px_16px_rgba(213,165,73,0.45)]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>شراء عبر واتساب</span>
              </button>
            </div>

            {/* Flour Card */}
            <div className={`rounded-2xl p-3 border flex flex-col items-center text-center group transition-all duration-200 ${
              isDarkMode 
                ? 'bg-[#1C1811] border-[#FAF1D6]/10 text-stone-100 shadow-[0_4px_16px_rgba(0,0,0,0.4)] hover:shadow-[0_6px_20px_rgba(213,165,73,0.15)] hover:border-[#EBC173]/30' 
                : 'bg-white border-[#EBC173]/40 text-stone-800 shadow-[0_4px_16px_rgba(213,165,73,0.15)] hover:shadow-[0_6px_20px_rgba(213,165,73,0.22)] hover:border-[#EBC173]/60'
            }`}>
              <div className="w-24 h-24 mb-2 group-hover:scale-105 transition-transform duration-200 flex items-center justify-center overflow-hidden">
                {flourProduct?.imageUrl && (flourProduct.imageUrl.startsWith('http') || flourProduct.imageUrl.startsWith('data:image')) ? (
                  <SafeImage 
                    src={flourProduct.imageUrl} 
                    alt={flourName} 
                    className="max-w-full max-h-full object-contain rounded-lg" 
                  />
                ) : (
                  <FlourIllustration />
                )}
              </div>
              <h4 className={`font-extrabold text-xs ${isDarkMode ? 'text-amber-100' : 'text-stone-800'}`}>{flourName}</h4>
              <p className={`font-black text-xs mt-1 ${isDarkMode ? 'text-amber-400' : 'text-[#850F1D]'}`}>{flourPrice} {flourCurrency}</p>
              
              <button 
                onClick={() => onOpenWhatsApp(flourName, `${flourPrice} ${flourCurrency}`)}
                className={`w-full font-bold text-[10px] py-2 rounded-xl mt-3 flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isDarkMode 
                    ? 'bg-amber-500 text-stone-950 hover:bg-amber-400 shadow-[0_4px_12px_rgba(245,158,11,0.2)] hover:shadow-[0_6px_16px_rgba(245,158,11,0.35)] border border-amber-500/10' 
                    : 'bg-[#850F1D] text-white hover:bg-[#720a15] shadow-[0_4px_12px_rgba(213,165,73,0.3)] hover:shadow-[0_6px_16px_rgba(213,165,73,0.45)]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>شراء عبر واتساب</span>
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Slide-out Notifications Drawer Overlay */}
      <AnimatePresence>
        {showNotifications && (
          <div className="absolute inset-0 bg-black/40 z-30 flex justify-end">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className={`w-4/5 h-full shadow-2xl flex flex-col p-4 z-40 relative transition-colors duration-200 ${
                isDarkMode ? 'bg-[#12100C] text-[#FAF7F0]' : 'bg-white text-[#4A3716]'
              }`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between border-b pb-3 mb-3 ${isDarkMode ? 'border-stone-800' : 'border-stone-100'}`}>
                <h3 className={`font-black text-sm flex items-center gap-1.5 ${isDarkMode ? 'text-amber-300' : 'text-[#850F1D]'}`}>
                  <Bell className="w-4.5 h-4.5" />
                  <span>التنبيهات العاجلة</span>
                  {unreadCount > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isDarkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-100 text-rose-700'}`}>
                      {unreadCount} جديد
                    </span>
                  )}
                </h3>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className={`p-1 rounded-full transition-colors ${isDarkMode ? 'hover:bg-stone-900 text-stone-400' : 'hover:bg-stone-100 text-[#4A3716]'}`}
                >
                  <ArrowLeft className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Advanced controls: Sync & Mark All Read */}
              <div className="flex items-center justify-between gap-1 mb-3">
                {/* Time filter tabs */}
                <div className={`flex p-0.5 rounded-lg border ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-stone-100 border-stone-200/50'}`}>
                  <button
                    onClick={() => setTimeFilter('all')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold font-tajawal transition-all ${
                      timeFilter === 'all' 
                        ? (isDarkMode ? 'bg-stone-800 text-amber-300 shadow-xs' : 'bg-white text-stone-800 shadow-xs') 
                        : (isDarkMode ? 'text-stone-500 hover:text-stone-300' : 'text-stone-500 hover:text-stone-700')
                    }`}
                  >
                    الكل
                  </button>
                  <button
                    onClick={() => setTimeFilter('hour')}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold font-tajawal transition-all flex items-center gap-1 ${
                      timeFilter === 'hour' 
                        ? (isDarkMode ? 'bg-[#FAF1D6] text-stone-950 shadow-xs' : 'bg-[#850F1D] text-white shadow-xs') 
                        : (isDarkMode ? 'text-stone-500 hover:text-stone-300' : 'text-stone-500 hover:text-stone-700')
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    آخر ساعة
                  </button>
                </div>

                {/* Direct Action buttons */}
                <div className="flex items-center gap-1.5">
                  {/* Mark All Read */}
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className={`p-1.5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                        isDarkMode 
                          ? 'bg-stone-900 hover:bg-[#332A18] text-amber-300 border-stone-800 hover:border-[#D5A549]/35' 
                          : 'bg-stone-100 hover:bg-amber-100 text-stone-600 hover:text-amber-800 border border-stone-200/40 hover:border-amber-200'
                      }`}
                      title="تحديد الكل كمقروء"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Manual Sync Cloud alerts */}
                  <button
                    onClick={handleSyncAlerts}
                    className={`p-1.5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                      isDarkMode 
                        ? 'bg-stone-900 hover:bg-[#332A18] text-amber-300 border-stone-800' 
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-600 border border-stone-200/45'
                    }`}
                    title="مزامنة الإشعارات"
                    disabled={isSyncingAlerts}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAlerts ? 'animate-spin text-[#850F1D]' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Syncing status visual cue */}
              {isSyncingAlerts && (
                <div className={`mb-3 px-3 py-1.5 rounded-xl border flex items-center gap-2 animate-pulse ${
                  isDarkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-700'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span className="text-[10px] font-bold font-tajawal">جاري المزامنة مع سحابة بدل...</span>
                </div>
              )}

              {/* Alerts List */}
              <div className="space-y-2.5 flex-1 overflow-y-auto no-scrollbar pb-4">
                {filteredNotifications.length === 0 ? (
                  <div className={`flex flex-col items-center justify-center py-12 text-center px-4 rounded-2xl border ${
                    isDarkMode ? 'bg-stone-900/40 border-stone-800/60' : 'bg-stone-50 rounded-2xl border-stone-100'
                  }`}>
                    <ShieldAlert className="w-8 h-8 text-stone-300 mb-2" />
                    <h4 className={`text-[11px] font-bold ${isDarkMode ? 'text-[#FAF1D6]' : 'text-stone-700'}`}>لا توجد تنبيهات عاجلة</h4>
                    <p className="text-[9px] text-stone-400 mt-1 max-w-[150px] leading-relaxed font-tajawal">
                      {timeFilter === 'hour' 
                        ? 'لم يتم إرسال أي تنبيهات إدارية جديدة خلال الساعة الماضية.' 
                        : 'كل التنبيهات والأسعار المباشرة محدثة ومستقرة تماماً.'}
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((notif) => {
                    const isUnread = !readAlertIds.includes(notif.id);
                    return (
                      <div 
                        key={notif.id} 
                        onClick={() => onMarkAlertAsRead && onMarkAlertAsRead(notif.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                          isUnread 
                            ? (isDarkMode ? 'bg-[#332A18]/45 border-[#D5A549]/20 shadow-[0_2px_8px_rgba(0,0,0,0.3)]' : 'bg-amber-50/55 border-amber-200/60 shadow-xs') 
                            : (isDarkMode ? 'bg-stone-900/40 border-stone-800/40 opacity-70' : 'bg-stone-50/80 border-stone-200/30 opacity-75')
                        }`}
                      >
                        {/* Interactive hover glow */}
                        {isUnread && (
                          <div className={`absolute inset-y-0 right-0 w-1 ${isDarkMode ? 'bg-amber-400' : 'bg-[#850F1D]'}`} />
                        )}
                        <div className="flex justify-between items-start gap-2">
                          <h4 className={`font-extrabold text-[11px] ${isDarkMode ? 'text-amber-200' : 'text-stone-800'}`}>{notif.title}</h4>
                          <span className="text-[8px] text-stone-400 font-bold font-tajawal shrink-0">{notif.time || 'الآن'}</span>
                        </div>
                        <p className={`text-[10px] mt-1 leading-relaxed font-tajawal ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>{notif.text}</p>
                        {isUnread && (
                          <div className="flex items-center gap-1 mt-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDarkMode ? 'bg-amber-400' : 'bg-[#850F1D]'}`} />
                            <span className={`text-[8px] font-bold font-tajawal ${isDarkMode ? 'text-amber-400' : 'text-[#850F1D]'}`}>جديد - اضغط لتحديد كمقروء</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Close Button */}
              <button 
                onClick={() => setShowNotifications(false)}
                className={`w-full text-xs font-bold py-2.5 rounded-xl mt-2 transition-all shadow-md cursor-pointer ${
                  isDarkMode ? 'bg-amber-500 text-stone-950 hover:bg-amber-400' : 'bg-[#850F1D] text-white hover:bg-[#720a15]'
                }`}
              >
                إغلاق التنبيهات
              </button>
            </motion.div>
            <div className="absolute inset-0 z-30" onClick={() => setShowNotifications(false)} />
          </div>
        )}
      </AnimatePresence>

      {/* Contact Modal */}
      <AnimatePresence>
        {showContactModal && (
          <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-xs rounded-2xl overflow-hidden shadow-2xl p-4 text-center border transition-colors duration-200 ${
                isDarkMode ? 'bg-[#1C1811] border-[#FAF1D6]/10 text-stone-100' : 'bg-white border-amber-200/30'
              }`}
            >
              <HelpCircle className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-amber-400' : 'text-[#850F1D]'}`} />
              <h3 className={`font-black text-sm mb-1 ${isDarkMode ? 'text-amber-100' : 'text-stone-800'}`}>تواصل مع الدعم الفني لـ بدل</h3>
              <p className={`text-[11px] font-medium leading-relaxed mb-4 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                نحن هنا لمساعدتك في أي استفسارات بخصوص أسعار صرف العملات أو طلبات السلع التموينية.
              </p>

              <div className="space-y-2">
                <a 
                  href={whatsAppConfig?.waLink || "https://wa.me/249912345678"} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  <span>محادثة واتساب الفورية</span>
                </a>
                
                <a 
                  href={`tel:${whatsAppConfig?.salesPhone1 || "+249912345678"}`}
                  className={`w-full text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isDarkMode ? 'bg-stone-900 hover:bg-stone-800 text-amber-200 border border-stone-800' : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  <span>اتصال هاتفي مباشر</span>
                </a>
              </div>

              <button 
                onClick={() => setShowContactModal(false)}
                className={`text-[11px] font-bold transition-colors mt-4 block mx-auto ${isDarkMode ? 'text-stone-400 hover:text-amber-400' : 'text-[#4A3716] hover:text-[#850F1D]'}`}
              >
                إلغاء
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
