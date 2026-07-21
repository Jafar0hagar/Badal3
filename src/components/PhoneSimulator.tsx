import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  Coins, 
  ShoppingBag, 
  Settings, 
  Bell,
  CheckCircle2
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
  const [activeScreen, setActiveScreen] = useState<string>('splash1');
  const initialAlertIdsRef = useRef<Set<string> | null>(null);

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
  
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [baseCurrency, setBaseCurrency] = useState<string>('الفرنك التشادي - ج.س');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [refreshInterval, setRefreshInterval] = useState<string>('كل ٥ دقائق');
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('isDarkMode') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('isDarkMode', String(next));
      return next;
    });
  };
  
  const [localFrancRate, setLocalFrancRate] = useState<number>(5900);
  const currentFrancRate = currentFrancRateProp !== undefined ? currentFrancRateProp : localFrancRate;

  const [isUpdatingRate, setIsUpdatingRate] = useState<boolean>(false);
  const [activeOrderProduct, setActiveOrderProduct] = useState<{ name: string; price: string } | null>(null);
  const [showMarketModal, setShowMarketModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [readAlertIds, setReadAlertIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('readAlertIds') || '[]');
    } catch {
      return [];
    }
  });

  const handleMarkAlertsAsRead = (ids: string[]) => {
    setReadAlertIds(prev => {
      let changed = false;
      const updated = [...prev];
      ids.forEach(id => {
        if (!updated.includes(id)) {
          updated.push(id);
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem('readAlertIds', JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  };

  const handleMarkAlertAsRead = (id: string) => {
    handleMarkAlertsAsRead([id]);
  };

  const [activeNotification, setActiveNotification] = useState<SystemAlert | null>(null);
  const [playedAlertIds, setPlayedAlertIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('playedAlertIds') || '[]');
    } catch {
      return [];
    }
  });

  const [vibrateTrigger, setVibrateTrigger] = useState<number>(0);

  useEffect(() => {
    if (systemAlerts && systemAlerts.length > 0) {
      if (initialAlertIdsRef.current === null) {
        // First load: initialize the set of existing alert IDs
        initialAlertIdsRef.current = new Set(systemAlerts.map(a => a.id));
        
        // Also populate playedAlertIds so we don't play sound for existing ones
        const existingIds = systemAlerts.map(a => a.id);
        const uniquePlayed = Array.from(new Set([...playedAlertIds, ...existingIds]));
        setPlayedAlertIds(uniquePlayed);
        localStorage.setItem('playedAlertIds', JSON.stringify(uniquePlayed));
        return;
      }

      // Subsequent updates: check for brand new alerts
      const newLiveAlerts = systemAlerts.filter(alert => {
        const isNotInitial = !initialAlertIdsRef.current?.has(alert.id);
        const isUnplayed = !playedAlertIds.includes(alert.id);
        return isNotInitial && isUnplayed;
      });

      if (newLiveAlerts.length > 0) {
        // Sort by creation time to get the latest
        newLiveAlerts.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        const alertToPlay = newLiveAlerts[newLiveAlerts.length - 1];

        // Mark as played
        const updatedPlayedIds = [...playedAlertIds, ...newLiveAlerts.map(a => a.id)];
        setPlayedAlertIds(updatedPlayedIds);
        localStorage.setItem('playedAlertIds', JSON.stringify(updatedPlayedIds));

        // Add to the initial list as well so we don't process again
        newLiveAlerts.forEach(a => initialAlertIdsRef.current?.add(a.id));

        // Play the sound and show high-priority push banner ONLY if notifications are enabled
        if (notificationsEnabled) {
          setActiveNotification(alertToPlay);
          playNotificationSound(undefined, 'urgent_alert');

          // Trigger physical device vibration
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([150, 80, 150, 80, 200]);
          }

          // Trigger simulated phone shake/vibration
          setVibrateTrigger(prev => prev + 1);

          const timer = setTimeout(() => {
            setActiveNotification(null);
          }, 7000);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [systemAlerts, playedAlertIds, notificationsEnabled]);

  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerToast = (msg: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 3000);
  };

  const handleUpdateFrancRate = () => {
    if (onUpdateFrancRateProp) {
      onUpdateFrancRateProp(currentFrancRate);
      return;
    }
    setIsUpdatingRate(true);
    setTimeout(() => {
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
    if (onNewOrder) {
      onNewOrder({
        id: `order-${Date.now()}`,
        productName: pName,
        price: pPrice,
        unit: pName.includes('شوال') ? 'شوال' : pName.includes('كيس') ? 'كيس' : pName.includes('علبة') ? 'علبة' : 'عبوة',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) + ' اليوم',
        status: 'pending',
        customerName: 'عميل من واجهة المتجر السريع',
        customerPhone: activeWaConfig.salesPhone1,
        notes: 'طلب شراء مستلم مباشرة من واجهة الهواتف الذكية'
      });
    }

    triggerToast(
      language === 'ar'
        ? `🟢 جاري تحويلك مباشرة للرقم المعتمد لإتمام شراء ${pName}...`
        : `🟢 Directing you to WhatsApp for purchasing ${pName}...`
    );

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

  return (
    <motion.div 
      animate={vibrateTrigger > 0 ? {
        x: [0, -10, 10, -8, 8, -5, 5, -3, 3, 0],
        rotate: [0, -0.5, 0.5, -0.5, 0.5, -0.3, 0.3, 0],
        transition: { duration: 0.6, ease: "easeInOut" }
      } : {}}
      key={`phone-vibe-${vibrateTrigger}`}
      className={`relative w-full md:max-w-md h-screen h-[100dvh] md:h-[820px] md:my-4 md:rounded-[30px] md:border flex flex-col justify-between select-none mx-auto shrink-0 z-10 overflow-hidden transition-all duration-200 ${
        isDarkMode 
          ? 'bg-[#12100C] border-[#FAF1D6]/10 shadow-[0_12px_40px_rgba(0,0,0,0.8)] text-[#FAF7F0]' 
          : 'bg-[#FAF7F0] border-stone-200/50 shadow-2xl text-stone-800'
      }`}
    >
      {/* Inner display viewport - Pure fullscreen layout without simulated battery/time/speaker notch */}
      <div className={`w-full h-full overflow-hidden flex flex-col relative transition-colors duration-200 ${
        isDarkMode ? 'bg-[#12100C]' : 'bg-[#FAF7F0]'
      }`}>
        
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

        {/* Dynamic Viewport Container */}
        <div className="flex-1 w-full overflow-hidden relative">
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
                  onMarkAlertsAsRead={handleMarkAlertsAsRead}
                  isDarkMode={isDarkMode}
                  baseCurrency={baseCurrency}
                  currencies={currencies}
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
                  isDarkMode={isDarkMode}
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
                  isDarkMode={isDarkMode}
                  baseCurrency={baseCurrency}
                  currentFrancRate={currentFrancRate}
                  currencies={currencies}
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
                  isDarkMode={isDarkMode}
                  onToggleDarkMode={handleToggleDarkMode}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Bottom Tab Navigation Bar */}
        {['home', 'prices', 'products', 'settings'].includes(activeScreen) && (
          <div 
            className={`fixed bottom-0 left-0 right-0 md:absolute z-[999] py-3 px-4 flex items-center justify-around select-none shrink-0 transition-all duration-200 border-t ${
              isDarkMode 
                ? 'bg-gradient-to-r from-[#1B160E] via-[#332A18] to-[#1B160E] border-[#D5A549]/25 shadow-[0_-4px_20px_rgba(0,0,0,0.6)]' 
                : 'bg-gradient-to-r from-[#FAF1D6] via-[#EBC173] to-[#D5A549] border-[#D5A549]/60 shadow-[0_-4px_20px_rgba(213,165,73,0.25)]'
            }`}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            {/* Tab 1: الرئيسية */}
            <button
              onClick={() => setActiveScreen('home')}
              className={`flex flex-col items-center gap-0.5 cursor-pointer flex-1 transition-all ${
                activeScreen === 'home' 
                  ? (isDarkMode ? 'text-amber-400 font-black scale-105' : 'text-[#850F1D] font-black scale-105') 
                  : (isDarkMode ? 'text-[#FAF1D6]/50 hover:text-[#FAF1D6]' : 'text-[#4A3716]/65 hover:text-[#4A3716]')
              }`}
            >
              <Home className="w-5 h-5 shrink-0" />
              <span className="text-[9px] font-black">{language === 'ar' ? 'الرئيسية' : 'Home'}</span>
            </button>

            {/* Tab 2: الأسعار */}
            <button
              onClick={() => setActiveScreen('prices')}
              className={`flex flex-col items-center gap-0.5 cursor-pointer flex-1 transition-all ${
                activeScreen === 'prices' 
                  ? (isDarkMode ? 'text-amber-400 font-black scale-105' : 'text-[#850F1D] font-black scale-105') 
                  : (isDarkMode ? 'text-[#FAF1D6]/50 hover:text-[#FAF1D6]' : 'text-[#4A3716]/65 hover:text-[#4A3716]')
              }`}
            >
              <Coins className="w-5 h-5 shrink-0" />
              <span className="text-[9px] font-black">{language === 'ar' ? 'الأسعار' : 'Prices'}</span>
            </button>

            {/* Tab 3: المنتجات */}
            <button
              onClick={() => setActiveScreen('products')}
              className={`flex flex-col items-center gap-0.5 cursor-pointer flex-1 transition-all ${
                activeScreen === 'products' 
                  ? (isDarkMode ? 'text-amber-400 font-black scale-105' : 'text-[#850F1D] font-black scale-105') 
                  : (isDarkMode ? 'text-[#FAF1D6]/50 hover:text-[#FAF1D6]' : 'text-[#4A3716]/65 hover:text-[#4A3716]')
              }`}
            >
              <ShoppingBag className="w-5 h-5 shrink-0" />
              <span className="text-[9px] font-black">{language === 'ar' ? 'المنتجات' : 'Products'}</span>
            </button>

            {/* Tab 4: الإعدادات */}
            <button
              onClick={() => setActiveScreen('settings')}
              className={`flex flex-col items-center gap-0.5 cursor-pointer flex-1 transition-all ${
                activeScreen === 'settings' 
                  ? (isDarkMode ? 'text-amber-400 font-black scale-105' : 'text-[#850F1D] font-black scale-105') 
                  : (isDarkMode ? 'text-[#FAF1D6]/50 hover:text-[#FAF1D6]' : 'text-[#4A3716]/65 hover:text-[#4A3716]')
              }`}
            >
              <Settings className="w-5 h-5 shrink-0" />
              <span className="text-[9px] font-black">{language === 'ar' ? 'الإعدادات' : 'Settings'}</span>
            </button>
          </div>
        )}

        {/* Floating micro toast alerts */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -25 }}
              className="absolute top-14 inset-x-4 bg-stone-900/95 backdrop-blur-md border border-stone-800 text-stone-100 text-center py-2.5 px-4 rounded-xl text-[10px] font-bold shadow-xl z-50 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-tajawal">{toastMessage}</span>
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

    </motion.div>
  );
}
