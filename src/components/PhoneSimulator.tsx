import React, { useState, useEffect, useRef } from 'react';
import { 
  Wifi, 
  Battery, 
  Signal, 
  Home, 
  Coins, 
  ShoppingBag, 
  Settings, 
  Sparkles, 
  RefreshCw,
  Share2,
  Smartphone,
  Eye,
  Info,
  MessageCircle,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playNotificationSound } from '../utils/audio';

// Import Views
import Splash1 from './Splash1';
import Splash2 from './Splash2';
import HomeView from './HomeView';
import PricesView from './PricesView';
import ProductsView from './ProductsView';
import SettingsView from './SettingsView';
import WhatsAppChat from './WhatsAppChat';
import MarketAnalysis from './MarketAnalysis';

import { Currency, Product, WhatsAppConfig, SystemAlert } from '../types';

interface PhoneSimulatorProps {
  currencies?: Currency[];
  products?: Product[];
  currentFrancRate?: number;
  onUpdateFrancRate?: (rate: number) => void;
  onNewOrder?: (order: any) => void;
  whatsAppConfig?: WhatsAppConfig;
  compact?: boolean;
  systemAlerts?: SystemAlert[];
  onTriggerAdminLogin?: () => void;
}

export default function PhoneSimulator({
  currencies,
  products,
  currentFrancRate: currentFrancRateProp,
  onUpdateFrancRate: onUpdateFrancRateProp,
  onNewOrder,
  whatsAppConfig,
  compact = false,
  systemAlerts = [],
  onTriggerAdminLogin
}: PhoneSimulatorProps) {
  
  const DEFAULT_WHATSAPP_CONFIG: WhatsAppConfig = {
    salesPhone1: '+249 91 234 5678',
    salesPhone2: '+249 92 345 6789',
    supportPhone: '+249 93 456 7890',
    emergencyPhone: '+249 94 567 8901',
    waLink: 'https://wa.me/249912345678',
    groupLink: 'https://chat.whatsapp.com/BadalGroup',
    channelLink: 'https://whatsapp.com/channel/0029VaBadal',
    defaultMessage: 'مرحباً، أريد الاستفسار عن المنتجات والأسعار المتوفرة. شكراً لكم.'
  };

  const activeWaConfig = whatsAppConfig || DEFAULT_WHATSAPP_CONFIG;
  // State for the active screen inside our smartphone simulator
  // Options: 'splash1' | 'splash2' | 'home' | 'prices' | 'products' | 'settings'
  const [activeScreen, setActiveScreen] = useState<string>('splash1');

  const handleSplash1Next = () => {
    const hasVisited = localStorage.getItem('hasVisitedBefore') === 'true';
    if (hasVisited) {
      setActiveScreen('home');
    } else {
      setActiveScreen('splash2');
    }
  };

  const handleSplash2Start = () => {
    localStorage.setItem('hasVisitedBefore', 'true');
    setActiveScreen('home');
  };
  
  // Custom states that persist across view switches
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [baseCurrency, setBaseCurrency] = useState<string>('الفرنك التشادي - ج.س');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [refreshInterval, setRefreshInterval] = useState<string>('كل ٥ دقائق');
  
  // Use prop or fallback to state
  const [localFrancRate, setLocalFrancRate] = useState<number>(5900);
  const currentFrancRate = currentFrancRateProp !== undefined ? currentFrancRateProp : localFrancRate;

  const [isUpdatingRate, setIsUpdatingRate] = useState<boolean>(false);

  // WhatsApp order state
  const [activeOrderProduct, setActiveOrderProduct] = useState<{ name: string; price: string } | null>(null);
  
  // Market analysis modal
  const [showMarketModal, setShowMarketModal] = useState<boolean>(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Digital clock state in the status bar
  const [timeStr, setTimeStr] = useState('09:41');

  // User notifications read state
  const [readAlertIds, setReadAlertIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('readAlertIds') || '[]');
    } catch {
      return [];
    }
  });

  const handleMarkAlertAsRead = (id: string) => {
    if (!readAlertIds.includes(id)) {
      const updated = [...readAlertIds, id];
      setReadAlertIds(updated);
      localStorage.setItem('readAlertIds', JSON.stringify(updated));
    }
  };

  // Real-time Push Notification alert states
  const [activeNotification, setActiveNotification] = useState<SystemAlert | null>(null);
  
  // Persistent tracking of alerts that have already played their popup/sound
  const [playedAlertIds, setPlayedAlertIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('playedAlertIds') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (systemAlerts && systemAlerts.length > 0) {
      const now = Date.now();
      
      // Find recent, unplayed alerts (created in the last 40 seconds, and not in playedAlertIds)
      const recentUnplayedAlerts = systemAlerts.filter(alert => {
        const isRecent = (now - (alert.createdAt || 0)) < 40000;
        const isUnplayed = !playedAlertIds.includes(alert.id);
        return isRecent && isUnplayed;
      });

      if (recentUnplayedAlerts.length > 0) {
        // Sort ascending by createdAt to play the latest one
        recentUnplayedAlerts.sort((a, b) => a.createdAt - b.createdAt);
        const alertToPlay = recentUnplayedAlerts[recentUnplayedAlerts.length - 1];

        // Mark all of these recent unplayed alerts as "played" immediately to prevent double processing
        const updatedPlayedIds = [...playedAlertIds, ...recentUnplayedAlerts.map(a => a.id)];
        setPlayedAlertIds(updatedPlayedIds);
        localStorage.setItem('playedAlertIds', JSON.stringify(updatedPlayedIds));

        // Avoid triggering sounds/popups if the app just loaded within the last 1.5 seconds
        const isAppOldEnough = performance.now() > 1500;
        if (isAppOldEnough) {
          setActiveNotification(alertToPlay);
          playNotificationSound(undefined, 'urgent_alert');

          const timer = setTimeout(() => {
            setActiveNotification(null);
          }, 7000);
          return () => clearTimeout(timer);
        }
      } else {
        // If there are any alerts in the system list that are not marked as played, but they are not recent,
        // we silently mark them as "played" so they never trigger on subsequent updates
        const unplayedOldAlerts = systemAlerts.filter(alert => !playedAlertIds.includes(alert.id));
        if (unplayedOldAlerts.length > 0) {
          const updatedPlayedIds = [...playedAlertIds, ...unplayedOldAlerts.map(a => a.id)];
          setPlayedAlertIds(updatedPlayedIds);
          localStorage.setItem('playedAlertIds', JSON.stringify(updatedPlayedIds));
        }
      }
    }
  }, [systemAlerts, playedAlertIds]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'م' : 'ص';
      hours = hours % 12 || 12; // 12-hour format
      setTimeStr(`${hours}:${minutes} ${ampm}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Show customized toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Handle live rate refresh inside card (Pure Sync with Admin Certified Rates)
  const handleUpdateFrancRate = () => {
    setIsUpdatingRate(true);
    setTimeout(() => {
      // Play a crisp sync notification sound
      playNotificationSound(undefined, 'test');
      triggerToast(
        language === 'ar' 
          ? '🔄 تم تحديث وجلب الأسعار الفورية المعتمدة من الإدارة بنجاح' 
          : '🔄 Live prices successfully synced with approved admin rates'
      );
      setIsUpdatingRate(false);
    }, 1200);
  };

  const handleOpenWhatsApp = (pName: string, pPrice: string) => {
    // Instantly register new order in dashboard state!
    if (onNewOrder) {
      onNewOrder({
        id: `order-${Date.now()}`,
        productName: pName,
        price: pPrice,
        unit: pName.includes('شوال') ? 'شوال' : pName.includes('كيس') ? 'كيس' : pName.includes('علبة') ? 'علبة' : 'عبوة',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) + ' اليوم',
        status: 'pending',
        customerName: 'عميل تجريبي محاكي',
        customerPhone: activeWaConfig.salesPhone1,
        notes: 'طلب شراء فوري مستلم من واجهة الهاتف المحاكاة وتحويله للواتساب الرسمي'
      });
    }

    triggerToast(
      language === 'ar'
        ? `🟢 جاري تحويلك مباشرة للرقم المعتمد لإتمام شراء ${pName}...`
        : `🟢 Directing you to WhatsApp for purchasing ${pName}...`
    );

    // Direct redirection to the official WhatsApp agent number configured in the database!
    try {
      const cleanPhone = activeWaConfig.salesPhone1.replace(/[^0-9]/g, '');
      const textMsg = `مرحباً تطبيق بدل، أود الاستفسار وشراء منتج [${pName}] بسعر [${pPrice}]. هل المنتج متوفر حالياً؟`;
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textMsg)}`;
      window.open(waUrl, '_blank');
    } catch (error) {
      console.error('Redirection failed or popup blocked:', error);
    }
  };

  const handleToggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    triggerToast(
      !notificationsEnabled 
        ? (language === 'ar' ? '🔔 تم تفعيل إشعارات الأسعار الفورية' : '🔔 Live price notifications enabled')
        : (language === 'ar' ? '🔕 تم إيقاف إشعارات الأسعار' : '🔕 Price notifications disabled')
    );
  };

  if (compact) {
    return (
      <div className="relative w-full h-[100dvh] sm:w-[375px] sm:h-[780px] bg-[#FAF7F0] sm:bg-stone-950 sm:rounded-[55px] p-0 sm:p-3.5 shadow-none sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] sm:border-[4px] sm:border-stone-800 sm:ring-12 sm:ring-stone-900 sm:ring-offset-4 sm:ring-offset-stone-950 flex flex-col items-center justify-between select-none mx-auto shrink-0 z-10">
        
        {/* Top Ear Piece Speaker & Camera island notch */}
        <div className="hidden sm:flex absolute top-5 left-1/2 -translate-x-1/2 w-32 h-6 bg-stone-950 rounded-full z-50 items-center justify-center gap-2 border border-stone-800/40">
          {/* Speaker mesh */}
          <div className="w-10 h-1 bg-stone-800 rounded-full" />
          {/* Camera hole */}
          <div className="w-2.5 h-2.5 bg-stone-900 rounded-full border border-stone-800" />
        </div>

        {/* Inner display viewport */}
        <div className="w-full h-full bg-[#FAF7F0] sm:rounded-[42px] overflow-hidden flex flex-col relative sm:border border-stone-900/60 shadow-inner">
          
          {/* Status Bar at top of screen */}
          <div className={`px-6 pt-3 pb-1 flex justify-between items-center text-xs font-black z-30 select-none ${
            activeScreen === 'splash1' ? 'text-stone-800' : 'text-stone-700'
          }`}>
            {/* Time Display */}
            <span className="font-mono text-[11px]">{timeStr}</span>
            
            {/* Icons Status Right */}
            <div className="flex items-center gap-1.5 text-stone-800 scale-90">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <div className="flex items-center gap-0.5">
                <span className="text-[9px] font-bold font-mono">100%</span>
                <Battery className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              </div>
            </div>
          </div>

          {/* Dynamic Viewport Container */}
          <div className="flex-1 w-full overflow-hidden relative">
            
            {/* Real-time Push Notification alert */}
            <AnimatePresence>
              {activeNotification && (
                <motion.div
                  initial={{ opacity: 0, y: -100, scale: 0.95 }}
                  animate={{ opacity: 1, y: 10, scale: 1 }}
                  exit={{ opacity: 0, y: -100, scale: 0.95 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="absolute top-2 inset-x-3 bg-stone-900/95 backdrop-blur-md border border-amber-500/30 text-stone-100 p-3 rounded-2xl shadow-2xl z-50 flex items-start gap-2.5 font-tajawal cursor-pointer"
                  onClick={() => {
                    if (activeNotification) {
                      handleMarkAlertAsRead(activeNotification.id);
                    }
                    setActiveScreen('home');
                    setActiveNotification(null);
                  }}
                >
                  <div className="w-8 h-8 rounded-xl bg-[#850F1D] text-white flex items-center justify-center shrink-0 shadow-md">
                    <Bell className="w-4 h-4 text-amber-300 animate-bounce" />
                  </div>
                  <div className="flex-1 min-w-0 text-right" dir="rtl">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-amber-300 font-cairo">تنبيه عاجل • تطبيق بدل</span>
                      <span className="text-[8px] text-stone-400">الآن</span>
                    </div>
                    <h4 className="text-[11px] font-black text-stone-100 truncate mt-0.5">{activeNotification.title}</h4>
                    <p className="text-[10px] text-stone-300 leading-normal line-clamp-2 mt-0.5">{activeNotification.text}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              
              {/* 1. Splash Screen 1 */}
              {activeScreen === 'splash1' && (
                <motion.div 
                  key="splash1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 w-full h-full"
                >
                  <Splash1 onNext={handleSplash1Next} />
                </motion.div>
              )}

              {/* 2. Splash Screen 2 (Onboarding) */}
              {activeScreen === 'splash2' && (
                <motion.div 
                  key="splash2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 w-full h-full"
                >
                  <Splash2 onStart={handleSplash2Start} />
                </motion.div>
              )}

              {/* 3. Home View */}
              {activeScreen === 'home' && (
                <motion.div 
                  key="home"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 w-full h-full"
                >
                  <HomeView 
                    onNavigate={(tab) => setActiveScreen(tab)}
                    onOpenWhatsApp={handleOpenWhatsApp}
                    onOpenMarket={() => setShowMarketModal(true)}
                    currentFrancRate={currentFrancRate}
                    onUpdateFrancRate={handleUpdateFrancRate}
                    isUpdatingRate={isUpdatingRate}
                    products={products}
                    whatsAppConfig={activeWaConfig}
                    systemAlerts={systemAlerts}
                    readAlertIds={readAlertIds}
                    onMarkAlertAsRead={handleMarkAlertAsRead}
                  />
                </motion.div>
              )}

              {/* 4. Prices View */}
              {activeScreen === 'prices' && (
                <motion.div 
                  key="prices"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 w-full h-full"
                >
                  <PricesView 
                    currentFrancRate={currentFrancRate} 
                    currencies={currencies} 
                    onBack={() => setActiveScreen('home')}
                  />
                </motion.div>
              )}

              {/* 5. Products View */}
              {activeScreen === 'products' && (
                <motion.div 
                  key="products"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 w-full h-full"
                >
                  <ProductsView 
                    onOpenWhatsApp={handleOpenWhatsApp} 
                    products={products} 
                    onBack={() => setActiveScreen('home')}
                  />
                </motion.div>
              )}

              {/* 6. Settings View */}
              {activeScreen === 'settings' && (
                <motion.div 
                  key="settings"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 w-full h-full"
                >
                  <SettingsView 
                    language={language}
                    onToggleLanguage={(lang) => {
                      setLanguage(lang);
                      triggerToast(lang === 'ar' ? '🌐 تم تحويل لغة التطبيق إلى العربية' : '🌐 Application language set to English');
                    }}
                    baseCurrency={baseCurrency}
                    onSelectBaseCurrency={(curr) => {
                      setBaseCurrency(curr);
                      triggerToast(language === 'ar' ? `🪙 تم تغيير العملة الأساسية: ${curr}` : `🪙 Base currency changed to: ${curr}`);
                    }}
                    notificationsEnabled={notificationsEnabled}
                    onToggleNotifications={handleToggleNotifications}
                    refreshInterval={refreshInterval}
                    onSelectRefreshInterval={(interval) => {
                      setRefreshInterval(interval);
                      triggerToast(language === 'ar' ? `⏱️ تم ضبط الفاصل التلقائي: ${interval}` : `⏱️ Auto refresh interval set to: ${interval}`);
                    }}
                    onBack={() => setActiveScreen('home')}
                    onTriggerAdminLogin={onTriggerAdminLogin}
                    whatsAppConfig={activeWaConfig}
                  />
                </motion.div>
              )}

            </AnimatePresence>

          </div>

          {/* Bottom Tab Navigation Bar (Only visible in inner functional pages) */}
          {['home', 'prices', 'products', 'settings'].includes(activeScreen) && (
            <div 
              className="bg-white/95 backdrop-blur-md border-t border-stone-200/50 py-2 px-4 flex items-center justify-around absolute bottom-0 inset-x-0 z-20 shadow-lg select-none"
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
              {/* Tab 1: الرئيسية */}
              <button
                onClick={() => setActiveScreen('home')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer flex-1 transition-all ${
                  activeScreen === 'home' ? 'text-[#850F1D] font-black scale-105' : 'text-stone-400 hover:text-stone-500'
                }`}
              >
                <Home className="w-5 h-5 shrink-0" />
                <span className="text-[9px] font-black">{language === 'ar' ? 'الرئيسية' : 'Home'}</span>
              </button>

              {/* Tab 2: الأسعار */}
              <button
                onClick={() => setActiveScreen('prices')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer flex-1 transition-all ${
                  activeScreen === 'prices' ? 'text-[#850F1D] font-black scale-105' : 'text-stone-400 hover:text-stone-500'
                }`}
              >
                <Coins className="w-5 h-5 shrink-0" />
                <span className="text-[9px] font-black">{language === 'ar' ? 'الأسعار' : 'Prices'}</span>
              </button>

              {/* Tab 3: المنتجات */}
              <button
                onClick={() => setActiveScreen('products')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer flex-1 transition-all ${
                  activeScreen === 'products' ? 'text-[#850F1D] font-black scale-105' : 'text-stone-400 hover:text-stone-500'
                }`}
              >
                <ShoppingBag className="w-5 h-5 shrink-0" />
                <span className="text-[9px] font-black">{language === 'ar' ? 'المنتجات' : 'Products'}</span>
              </button>

              {/* Tab 4: الإعدادات */}
              <button
                onClick={() => setActiveScreen('settings')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer flex-1 transition-all ${
                  activeScreen === 'settings' ? 'text-[#850F1D] font-black scale-105' : 'text-stone-400 hover:text-stone-500'
                }`}
              >
                <Settings className="w-5 h-5 shrink-0" />
                <span className="text-[9px] font-black">{language === 'ar' ? 'الإعدادات' : 'Settings'}</span>
              </button>
            </div>
          )}

          {/* Bottom Gesture Bar Casing for iOS/Modern screens */}
          <div className="hidden sm:block absolute bottom-1 left-1/2 -translate-x-1/2 w-28 h-1 bg-stone-900 rounded-full z-30 opacity-70 pointer-events-none" />

          {/* Floating micro toast alerts */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="absolute top-14 inset-x-4 bg-stone-900/90 backdrop-blur-md border border-stone-800 text-stone-100 text-center py-2.5 px-4 rounded-xl text-[10px] font-bold shadow-xl z-50 flex items-center justify-center gap-2"
              >
                <span>{toastMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Overlays / Modals rendered inside the device scope */}
        {/* WhatsApp simulated chat */}
        <AnimatePresence>
          {activeOrderProduct && (
            <WhatsAppChat
              productName={activeOrderProduct.name}
              productPrice={activeOrderProduct.price}
              onClose={() => setActiveOrderProduct(null)}
            />
          )}
        </AnimatePresence>

        {/* Market Trend Analysis Modal */}
        <AnimatePresence>
          {showMarketModal && (
            <MarketAnalysis
              onClose={() => setShowMarketModal(false)}
              currentFrancRate={currentFrancRate}
            />
          )}
        </AnimatePresence>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-stone-900 via-stone-800 to-[#5C0A13] flex flex-col items-center justify-center p-4 md:p-8 font-sans antialiased text-stone-100 overflow-x-hidden">
      
      {/* Background ambient gold/red aura */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

      {/* Top Title Section */}
      <div className="w-full max-w-5xl text-center mb-6 space-y-2 z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-xs">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span className="text-xs font-bold text-amber-100 font-tajawal">عرض تفاعلي متكامل للأجهزة المحمولة</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-white to-amber-200 tracking-wide font-cairo">
          تطبيق بدل - BADAL APP
        </h1>
        <p className="text-stone-300 text-xs md:text-sm font-medium font-tajawal max-w-2xl mx-auto">
          المستشار المالي والتمويني الأول لرصد أسعار الصرف والمواد الاستهلاكية الأساسية لحظة بلحظة بدقة تامة.
        </p>
      </div>

      {/* Responsive Grid layout containing Smartphone simulator in center, custom controls on the left */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center justify-center z-10">
        
        {/* Left Side: Presentation Panel / Interactive controllers */}
        <div className="lg:col-span-4 space-y-4 lg:order-1 order-2">
          
          {/* 1. App Navigation Jumper (Interactive Playroom) */}
          <div className="bg-white/10 border border-white/10 rounded-2xl p-4 backdrop-blur-md space-y-3.5 shadow-xl">
            <h3 className="text-sm font-black text-amber-300 flex items-center gap-2 font-cairo" dir="rtl">
              <Eye className="w-4.5 h-4.5" />
              <span>مستعرض الصفحات السريع</span>
            </h3>
            <p className="text-[11px] text-stone-300 font-tajawal leading-relaxed" dir="rtl">
              تنقل بين الشاشات الستة للتطبيق بنقرة واحدة لتجربة جميع حالات الواجهات:
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-extrabold" dir="rtl">
              {/* Splash 1 */}
              <button 
                onClick={() => { setActiveScreen('splash1'); triggerToast('🌟 تم فتح شاشة الترحيب الأولى'); }}
                className={`py-2.5 px-3 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                  activeScreen === 'splash1' 
                    ? 'bg-[#850F1D] text-white border-[#850F1D] shadow-md' 
                    : 'bg-white/5 text-stone-200 border-white/10 hover:bg-white/10'
                }`}
              >
                <span>شاشة البداية ١</span>
                <span className="text-[9px] opacity-60">انترو</span>
              </button>

              {/* Splash 2 */}
              <button 
                onClick={() => { setActiveScreen('splash2'); triggerToast('✨ تم فتح شاشة الترحيب الثانية'); }}
                className={`py-2.5 px-3 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                  activeScreen === 'splash2' 
                    ? 'bg-[#850F1D] text-white border-[#850F1D] shadow-md' 
                    : 'bg-white/5 text-stone-200 border-white/10 hover:bg-white/10'
                }`}
              >
                <span>مرحباً بك ٢</span>
                <span className="text-[9px] opacity-60">ابدأ</span>
              </button>

              {/* Home */}
              <button 
                onClick={() => { setActiveScreen('home'); triggerToast('🏠 تم فتح الشاشة الرئيسية'); }}
                className={`py-2.5 px-3 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                  activeScreen === 'home' 
                    ? 'bg-[#850F1D] text-white border-[#850F1D] shadow-md' 
                    : 'bg-white/5 text-stone-200 border-white/10 hover:bg-white/10'
                }`}
              >
                <span>الرئيسية 🏠</span>
                <span className="text-[9px] opacity-60">الرئيسية</span>
              </button>

              {/* Prices */}
              <button 
                onClick={() => { setActiveScreen('prices'); triggerToast('💰 تم فتح جدول أسعار العملات'); }}
                className={`py-2.5 px-3 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                  activeScreen === 'prices' 
                    ? 'bg-[#850F1D] text-white border-[#850F1D] shadow-md' 
                    : 'bg-white/5 text-stone-200 border-white/10 hover:bg-white/10'
                }`}
              >
                <span>الأسعار 💰</span>
                <span className="text-[9px] opacity-60">صرف</span>
              </button>

              {/* Products */}
              <button 
                onClick={() => { setActiveScreen('products'); triggerToast('📦 تم فتح دليل أسعار السلع التموينية'); }}
                className={`py-2.5 px-3 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                  activeScreen === 'products' 
                    ? 'bg-[#850F1D] text-white border-[#850F1D] shadow-md' 
                    : 'bg-white/5 text-stone-200 border-white/10 hover:bg-white/10'
                }`}
              >
                <span>المنتجات 📦</span>
                <span className="text-[9px] opacity-60">متجر</span>
              </button>

              {/* Settings */}
              <button 
                onClick={() => { setActiveScreen('settings'); triggerToast('⚙️ تم فتح لوحة الإعدادات'); }}
                className={`py-2.5 px-3 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                  activeScreen === 'settings' 
                    ? 'bg-[#850F1D] text-white border-[#850F1D] shadow-md' 
                    : 'bg-white/5 text-stone-200 border-white/10 hover:bg-white/10'
                }`}
              >
                <span>الإعدادات ⚙️</span>
                <span className="text-[9px] opacity-60">إعدادات</span>
              </button>
            </div>
          </div>

          {/* 2. Interactive Simulation Controller (Trigger Events!) */}
          <div className="bg-white/10 border border-white/10 rounded-2xl p-4 backdrop-blur-md space-y-3 shadow-xl">
            <h3 className="text-sm font-black text-amber-300 flex items-center gap-2 font-cairo" dir="rtl">
              <RefreshCw className="w-4.5 h-4.5 animate-spin-slow" />
              <span>محاكي تقلبات السوق الفورية</span>
            </h3>
            <p className="text-[11px] text-stone-300 font-tajawal leading-relaxed" dir="rtl">
              اضغط على الأزرار لتشغيل محاكاة حية لتحديث البيانات من خوادم السوق في الموازي:
            </p>

            <div className="space-y-2 text-xs font-bold" dir="rtl">
              {/* Fluctuate rate */}
              <button 
                onClick={handleUpdateFrancRate}
                disabled={isUpdatingRate}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer font-black"
              >
                <RefreshCw className={`w-4 h-4 ${isUpdatingRate ? 'animate-spin' : ''}`} />
                <span>تحديث عشوائي لسعر الصرف</span>
              </button>

              {/* Trigger WhatsApp order sugar directly */}
              <button 
                onClick={() => handleOpenWhatsApp('سكر مستورد فاخر (كيس ١٠ كجم)', '24,000')}
                className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer font-black"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>محاكاة طلب سكر عبر واتساب</span>
              </button>
            </div>
          </div>



        </div>

        {/* Center: The Smartphone Device Mockup Simulator Container */}
        <div className="lg:col-span-8 flex justify-center lg:order-2 order-1">
          
          {/* Main phone body casing wrapping viewport */}
          <div className="relative w-[375px] h-[780px] bg-stone-950 rounded-[55px] p-3.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] border-[4px] border-stone-800 ring-12 ring-stone-900 ring-offset-4 ring-offset-stone-950 flex flex-col items-center justify-between select-none">
            
            {/* Top Ear Piece Speaker & Camera island notch */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-32 h-6 bg-stone-950 rounded-full z-50 flex items-center justify-center gap-2 border border-stone-800/40">
              {/* Speaker mesh */}
              <div className="w-10 h-1 bg-stone-800 rounded-full" />
              {/* Camera hole */}
              <div className="w-2.5 h-2.5 bg-stone-900 rounded-full border border-stone-800" />
            </div>

            {/* Inner display viewport */}
            <div className="w-full h-full bg-[#FAF7F0] rounded-[42px] overflow-hidden flex flex-col relative border border-stone-900/60 shadow-inner">
              
              {/* Status Bar at top of screen */}
              <div className={`px-6 pt-3 pb-1 flex justify-between items-center text-xs font-black z-30 select-none ${
                activeScreen === 'splash1' ? 'text-stone-800' : 'text-stone-700'
              }`}>
                {/* Time Display */}
                <span className="font-mono text-[11px]">{timeStr}</span>
                
                {/* Icons Status Right */}
                <div className="flex items-center gap-1.5 text-stone-800 scale-90">
                  <Signal className="w-3.5 h-3.5" />
                  <Wifi className="w-3.5 h-3.5" />
                  <div className="flex items-center gap-0.5">
                    <span className="text-[9px] font-bold font-mono">100%</span>
                    <Battery className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Dynamic Viewport Container */}
              <div className="flex-1 w-full overflow-hidden relative">
                
                {/* Real-time Push Notification alert */}
                <AnimatePresence>
                  {activeNotification && (
                    <motion.div
                      initial={{ opacity: 0, y: -100, scale: 0.95 }}
                      animate={{ opacity: 1, y: 10, scale: 1 }}
                      exit={{ opacity: 0, y: -100, scale: 0.95 }}
                      transition={{ type: 'spring', damping: 15 }}
                      className="absolute top-2 inset-x-3 bg-stone-900/95 backdrop-blur-md border border-amber-500/30 text-stone-100 p-3 rounded-2xl shadow-2xl z-50 flex items-start gap-2.5 font-tajawal cursor-pointer"
                      onClick={() => {
                        if (activeNotification) {
                          handleMarkAlertAsRead(activeNotification.id);
                        }
                        setActiveScreen('home');
                        setActiveNotification(null);
                      }}
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#850F1D] text-white flex items-center justify-center shrink-0 shadow-md">
                        <Bell className="w-4 h-4 text-amber-300 animate-bounce" />
                      </div>
                      <div className="flex-1 min-w-0 text-right" dir="rtl">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-amber-300 font-cairo">تنبيه عاجل • تطبيق بدل</span>
                          <span className="text-[8px] text-stone-400">الآن</span>
                        </div>
                        <h4 className="text-[11px] font-black text-stone-100 truncate mt-0.5">{activeNotification.title}</h4>
                        <p className="text-[10px] text-stone-300 leading-normal line-clamp-2 mt-0.5">{activeNotification.text}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  
                  {/* 1. Splash Screen 1 */}
                  {activeScreen === 'splash1' && (
                    <motion.div 
                      key="splash1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 w-full h-full"
                    >
                      <Splash1 onNext={handleSplash1Next} />
                    </motion.div>
                  )}

                  {/* 2. Splash Screen 2 (Onboarding) */}
                  {activeScreen === 'splash2' && (
                    <motion.div 
                      key="splash2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 w-full h-full"
                    >
                      <Splash2 onStart={handleSplash2Start} />
                    </motion.div>
                  )}

                  {/* 3. Home View */}
                  {activeScreen === 'home' && (
                    <motion.div 
                      key="home"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 w-full h-full"
                    >
                      <HomeView 
                        onNavigate={(tab) => setActiveScreen(tab)}
                        onOpenWhatsApp={handleOpenWhatsApp}
                        onOpenMarket={() => setShowMarketModal(true)}
                        currentFrancRate={currentFrancRate}
                        onUpdateFrancRate={handleUpdateFrancRate}
                        isUpdatingRate={isUpdatingRate}
                        products={products}
                        whatsAppConfig={activeWaConfig}
                        systemAlerts={systemAlerts}
                        readAlertIds={readAlertIds}
                        onMarkAlertAsRead={handleMarkAlertAsRead}
                      />
                    </motion.div>
                  )}

                  {/* 4. Prices View */}
                  {activeScreen === 'prices' && (
                    <motion.div 
                      key="prices"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 w-full h-full"
                    >
                      <PricesView 
                        currentFrancRate={currentFrancRate} 
                        currencies={currencies} 
                        onBack={() => setActiveScreen('home')}
                      />
                    </motion.div>
                  )}

                  {/* 5. Products View */}
                  {activeScreen === 'products' && (
                    <motion.div 
                      key="products"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 w-full h-full"
                    >
                      <ProductsView 
                        onOpenWhatsApp={handleOpenWhatsApp} 
                        products={products} 
                        onBack={() => setActiveScreen('home')}
                      />
                    </motion.div>
                  )}

                  {/* 6. Settings View */}
                  {activeScreen === 'settings' && (
                    <motion.div 
                      key="settings"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 w-full h-full"
                    >
                      <SettingsView 
                        onLogout={() => {
                          setActiveScreen('splash1');
                          triggerToast(language === 'ar' ? '🚪 تم تسجيل الخروج بنجاح' : '🚪 Logged out successfully');
                        }}
                        language={language}
                        onToggleLanguage={(lang) => {
                          setLanguage(lang);
                          triggerToast(lang === 'ar' ? '🌐 تم تحويل لغة التطبيق إلى العربية' : '🌐 Application language set to English');
                        }}
                        baseCurrency={baseCurrency}
                        onSelectBaseCurrency={(curr) => {
                          setBaseCurrency(curr);
                          triggerToast(language === 'ar' ? `🪙 تم تغيير العملة الأساسية: ${curr}` : `🪙 Base currency changed to: ${curr}`);
                        }}
                        notificationsEnabled={notificationsEnabled}
                        onToggleNotifications={handleToggleNotifications}
                        refreshInterval={refreshInterval}
                        onSelectRefreshInterval={(interval) => {
                          setRefreshInterval(interval);
                          triggerToast(language === 'ar' ? `⏱️ تم ضبط الفاصل التلقائي: ${interval}` : `⏱️ Auto refresh interval set to: ${interval}`);
                        }}
                        onBack={() => setActiveScreen('home')}
                        onTriggerAdminLogin={onTriggerAdminLogin}
                      />
                    </motion.div>
                  )}

                </AnimatePresence>

              </div>

              {/* Bottom Tab Navigation Bar (Only visible in inner functional pages) */}
              {['home', 'prices', 'products', 'settings'].includes(activeScreen) && (
                <div 
                  className="bg-white/95 backdrop-blur-md border-t border-stone-200/50 py-2 px-4 flex items-center justify-around absolute bottom-0 inset-x-0 z-20 shadow-lg select-none"
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                >
                  {/* Tab 1: الرئيسية */}
                  <button
                    onClick={() => setActiveScreen('home')}
                    className={`flex flex-col items-center gap-0.5 cursor-pointer flex-1 transition-all ${
                      activeScreen === 'home' ? 'text-[#850F1D] font-black scale-105' : 'text-stone-400 hover:text-stone-500'
                    }`}
                  >
                    <Home className="w-5 h-5 shrink-0" />
                    <span className="text-[9px] font-black">{language === 'ar' ? 'الرئيسية' : 'Home'}</span>
                  </button>

                  {/* Tab 2: الأسعار */}
                  <button
                    onClick={() => setActiveScreen('prices')}
                    className={`flex flex-col items-center gap-0.5 cursor-pointer flex-1 transition-all ${
                      activeScreen === 'prices' ? 'text-[#850F1D] font-black scale-105' : 'text-stone-400 hover:text-stone-500'
                    }`}
                  >
                    <Coins className="w-5 h-5 shrink-0" />
                    <span className="text-[9px] font-black">{language === 'ar' ? 'الأسعار' : 'Prices'}</span>
                  </button>

                  {/* Tab 3: المنتجات */}
                  <button
                    onClick={() => setActiveScreen('products')}
                    className={`flex flex-col items-center gap-0.5 cursor-pointer flex-1 transition-all ${
                      activeScreen === 'products' ? 'text-[#850F1D] font-black scale-105' : 'text-stone-400 hover:text-stone-500'
                    }`}
                  >
                    <ShoppingBag className="w-5 h-5 shrink-0" />
                    <span className="text-[9px] font-black">{language === 'ar' ? 'المنتجات' : 'Products'}</span>
                  </button>

                  {/* Tab 4: الإعدادات */}
                  <button
                    onClick={() => setActiveScreen('settings')}
                    className={`flex flex-col items-center gap-0.5 cursor-pointer flex-1 transition-all ${
                      activeScreen === 'settings' ? 'text-[#850F1D] font-black scale-105' : 'text-stone-400 hover:text-stone-500'
                    }`}
                  >
                    <Settings className="w-5 h-5 shrink-0" />
                    <span className="text-[9px] font-black">{language === 'ar' ? 'الإعدادات' : 'Settings'}</span>
                  </button>
                </div>
              )}

              {/* Bottom Gesture Bar Casing for iOS/Modern screens */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-28 h-1 bg-stone-900 rounded-full z-30 opacity-70 pointer-events-none" />

              {/* Floating micro toast alerts */}
              <AnimatePresence>
                {toastMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="absolute top-14 inset-x-4 bg-stone-900/90 backdrop-blur-md border border-stone-800 text-stone-100 text-center py-2.5 px-4 rounded-xl text-[10px] font-bold shadow-xl z-50 flex items-center justify-center gap-2"
                  >
                    <span>{toastMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Overlays / Modals rendered inside the device scope */}
            {/* WhatsApp simulated chat */}
            <AnimatePresence>
              {activeOrderProduct && (
                <WhatsAppChat
                  productName={activeOrderProduct.name}
                  productPrice={activeOrderProduct.price}
                  onClose={() => setActiveOrderProduct(null)}
                />
              )}
            </AnimatePresence>

            {/* Market Trend Analysis Modal */}
            <AnimatePresence>
              {showMarketModal && (
                <MarketAnalysis
                  onClose={() => setShowMarketModal(false)}
                  currentFrancRate={currentFrancRate}
                />
              )}
            </AnimatePresence>

          </div>

        </div>

      </div>

    </div>
  );
}
