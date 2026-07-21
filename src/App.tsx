import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Capacitor } from '@capacitor/core';
import PhoneSimulator from './components/PhoneSimulator';
import Dashboard from './components/Dashboard';
import AdminLogin from './components/AdminLogin';
import BadalLogo from './components/BadalLogo';
import { Currency, Product, WhatsAppConfig, Order, SystemAlert, AdminUser } from './types';
import { 
  Bell, 
  Lock, 
  CheckCircle2, 
  ShoppingBag,
  MessageSquare
} from 'lucide-react';
import { playNotificationSound } from './utils/audio';
import { 
  seedDatabaseIfEmpty,
  subscribeCurrencies,
  subscribeProducts,
  subscribeOrders,
  subscribeWhatsAppConfig,
  subscribeGeneralConfig,
  subscribeSystemAlerts,
  updateCurrencyInDb,
  deleteCurrencyInDb,
  updateProductInDb,
  deleteProductInDb,
  addOrderToDb,
  updateOrderInDb,
  deleteOrderInDb,
  updateWhatsAppConfigInDb,
  updateGeneralConfigInDb
} from './utils/firebase';

const INITIAL_WHATSAPP_CONFIG: WhatsAppConfig = {
  salesPhone1: '+249 91 234 5678',
  salesPhone2: '+249 92 345 6789',
  supportPhone: '+249 93 456 7890',
  emergencyPhone: '+249 94 567 8901',
  waLink: 'https://wa.me/249912345678',
  groupLink: 'https://chat.whatsapp.com/BadalGroup',
  channelLink: 'https://whatsapp.com/channel/0029VaBadal',
  defaultMessage: 'مرحباً، أريد الاستفسار عن المنتجات والأسعار المتوفرة. شكراً لكم.'
};

export default function App() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [whatsAppConfig, setWhatsAppConfig] = useState<WhatsAppConfig>(INITIAL_WHATSAPP_CONFIG);
  const [currentFrancRate, setCurrentFrancRate] = useState<number>(5900);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);

  // Default Language preference
  const [language, setLanguage] = useState<'ar' | 'en'>(() => {
    return (localStorage.getItem('badal_lang') as 'ar' | 'en') || 'ar';
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Admin Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    const remembered = localStorage.getItem('isAdminAuthenticated') === 'true' && localStorage.getItem('rememberDevice') === 'true';
    const tempSession = sessionStorage.getItem('isAdminAuthenticated') === 'true';
    return remembered || tempSession;
  });

  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => {
    const cached = localStorage.getItem('currentAdmin') || sessionStorage.getItem('currentAdmin');
    return cached ? JSON.parse(cached) : null;
  });

  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    return window.location.pathname.startsWith('/admin') || 
           window.location.search.includes('admin') || 
           window.location.hash === '#admin';
  });

  // Database initialization & real-time snapshot subscription
  useEffect(() => {
    // Seed database in the background if it is empty
    seedDatabaseIfEmpty().catch(err => {
      console.error('Error seeding database:', err);
    });
    
    // Subscribe synchronously to ensure the returned cleanup function is immediately active and effective
    const unsubCurrencies = subscribeCurrencies(setCurrencies);
    const unsubProducts = subscribeProducts(setProducts);
    const unsubOrders = subscribeOrders((fetchedOrders) => {
      setOrders(prev => {
        if (fetchedOrders.length > prev.length && prev.length > 0) {
          playNotificationSound(fetchedOrders.length, 'order_received');
        }
        return fetchedOrders;
      });
    });
    const unsubWhatsApp = subscribeWhatsAppConfig(setWhatsAppConfig);
    const unsubGeneral = subscribeGeneralConfig(setCurrentFrancRate);
    const unsubAlerts = subscribeSystemAlerts(setSystemAlerts);

    return () => {
      if (unsubCurrencies) unsubCurrencies();
      if (unsubProducts) unsubProducts();
      if (unsubOrders) unsubOrders();
      if (unsubWhatsApp) unsubWhatsApp();
      if (unsubGeneral) unsubGeneral();
      if (unsubAlerts) unsubAlerts();
    };
  }, []);

  // Toast Trigger Utility
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

  const isRtl = language === 'ar';

  // Manual rate updates simulation from simulator admin panel or direct dashboard edits
  const handleUpdateFrancRate = async (newRate: number) => {
    await updateGeneralConfigInDb(newRate);
    const xafCurrency = currencies.find(c => c.id === 'rate-xaf' || c.id === 'xaf' || c.code === 'XAF');
    if (xafCurrency) {
      await updateCurrencyInDb({
        ...xafCurrency,
        price: newRate,
        lastUpdated: 'الآن'
      });
    } else {
      await updateCurrencyInDb({
        id: 'rate-xaf',
        code: 'XAF',
        price: newRate,
        name: 'الفرنك التشادي',
        symbol: 'FCFA',
        lastUpdated: 'الآن',
        flag: 'TD',
        trend: 'stable',
        country: 'تشاد'
      });
    }
    playNotificationSound(undefined, 'price_updated');
    triggerToast(language === 'ar' ? '🔄 تم تحديث وجلب أسعار الصرف السحابية المعتمدة بنجاح' : '🔄 Live prices successfully synced with approved cloud rates');
  };

  // Callback for PhoneSimulator order logging
  const handleNewOrder = async (newOrder: Order) => {
    await addOrderToDb(newOrder);
    playNotificationSound(orders.length + 1, 'order_received');
  };

  // System Database Synchronizer actions for Dashboard
  const handleUpdateCurrencies = async (updatedList: Currency[]) => {
    if (updatedList.length < currencies.length) {
      const deleted = currencies.find(c => !updatedList.some(item => item.id === c.id));
      if (deleted) await deleteCurrencyInDb(deleted.id);
    } else {
      for (const item of updatedList) {
        const existing = currencies.find(c => c.id === item.id);
        if (!existing || JSON.stringify(existing) !== JSON.stringify(item)) {
          await updateCurrencyInDb(item);
        }
      }
    }
  };

  const handleUpdateProducts = async (updatedList: Product[]) => {
    if (updatedList.length < products.length) {
      const deleted = products.find(p => !updatedList.some(item => item.id === p.id));
      if (deleted) await deleteProductInDb(deleted.id);
    } else {
      for (const item of updatedList) {
        const existing = products.find(p => p.id === item.id);
        if (!existing || JSON.stringify(existing) !== JSON.stringify(item)) {
          await updateProductInDb(item);
        }
      }
    }
  };

  const handleUpdateOrders = async (updatedList: Order[]) => {
    if (updatedList.length < orders.length) {
      const deleted = orders.find(o => !updatedList.some(item => item.id === o.id));
      if (deleted) await deleteOrderInDb(deleted.id);
    } else {
      for (const item of updatedList) {
        const existing = orders.find(o => o.id === item.id);
        if (!existing || JSON.stringify(existing) !== JSON.stringify(item)) {
          await updateOrderInDb(item);
        }
      }
    }
  };

  const handleUpdateWhatsAppConfig = async (config: WhatsAppConfig) => {
    await updateWhatsAppConfigInDb(config);
  };

  return (
    <div 
      className="min-h-screen bg-[#FAF7F0] text-stone-900 select-none overflow-x-hidden antialiased flex flex-col relative"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Background elegant golden auras */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-amber-500/[0.04] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-rose-500/[0.03] blur-[150px] pointer-events-none" />

      {/* ==================== ADMINISTRATIVE WORKSPACE OVERLAY ==================== */}
      {isAdminMode ? (
        <div className="min-h-screen bg-[#FAF7F0] text-stone-900 select-none overflow-x-hidden antialiased flex flex-col relative" dir={isRtl ? 'rtl' : 'ltr'}>
          <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-stone-200/50 shadow-xs px-4 md:px-8 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#FAF1D6] to-[#EBC173] flex items-center justify-center border border-[#D5A549]/30 shadow-md shrink-0 p-1">
                <BadalLogo size={32} withTag={false} />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-black text-[#850F1D] tracking-wide leading-none font-cairo flex items-center gap-2">
                  <span>بَدَلْ لإدارة العملات</span>
                  <span className="text-[10px] bg-[#850F1D]/10 text-[#850F1D] px-2 py-0.5 rounded-full font-bold">لوحة التحكم السحابية</span>
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAdminAuthenticated && (
                <button
                  onClick={() => {
                    setIsAdminAuthenticated(false);
                    setCurrentAdmin(null);
                    localStorage.removeItem('isAdminAuthenticated');
                    localStorage.removeItem('rememberDevice');
                    localStorage.removeItem('currentAdmin');
                    sessionStorage.removeItem('isAdminAuthenticated');
                    sessionStorage.removeItem('currentAdmin');
                    setIsAdminMode(false);
                    triggerToast(language === 'ar' ? '🔒 تم تسجيل الخروج من لوحة التحكم بنجاح' : '🔒 Successfully logged out from admin console');
                  }}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black rounded-lg transition-all cursor-pointer border border-rose-200/30 font-tajawal flex items-center gap-1.5 active:scale-95 shadow-2xs"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'تسجيل الخروج' : 'Log Out'}</span>
                </button>
              )}
              <button
                onClick={() => setIsAdminMode(false)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-black rounded-lg transition-all cursor-pointer border border-stone-200/40 font-tajawal active:scale-95"
              >
                {language === 'ar' ? 'العودة للتطبيق' : 'Back to App'}
              </button>
            </div>
          </header>
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 z-10">
            {isAdminAuthenticated ? (
              <Dashboard 
                currencies={currencies}
                onUpdateCurrencies={handleUpdateCurrencies}
                products={products}
                onUpdateProducts={handleUpdateProducts}
                orders={orders}
                onUpdateOrders={handleUpdateOrders}
                currentFrancRate={currentFrancRate}
                onUpdateFrancRate={handleUpdateFrancRate}
                whatsAppConfig={whatsAppConfig}
                onUpdateWhatsAppConfig={handleUpdateWhatsAppConfig}
                systemAlerts={systemAlerts}
                currentAdmin={currentAdmin}
              />
            ) : (
              <div className="max-w-md mx-auto pt-10">
                <AdminLogin 
                  onLoginSuccess={(rememberDevice, user) => {
                    setIsAdminAuthenticated(true);
                    setCurrentAdmin(user);
                    if (rememberDevice) {
                      localStorage.setItem('isAdminAuthenticated', 'true');
                      localStorage.setItem('rememberDevice', 'true');
                      localStorage.setItem('currentAdmin', JSON.stringify(user));
                    } else {
                      sessionStorage.setItem('isAdminAuthenticated', 'true');
                      sessionStorage.setItem('currentAdmin', JSON.stringify(user));
                    }
                    triggerToast(language === 'ar' ? '🔐 تم التحقق من الموثوقية والدخول بنجاح' : '🔐 Access authorized successfully');
                  }}
                  onGoBack={() => setIsAdminMode(false)}
                />
              </div>
            )}
          </main>
          <footer className="w-full bg-white border-t border-stone-200/50 py-4.5 text-center text-[10px] text-stone-400 font-tajawal z-10">
            تطبيق بَدَلْ للخدمات والعملات © ٢٠٢٦ • محمي ومزامن سحابياً بالكامل
          </footer>
        </div>
      ) : (
        /* ==================== ONLY THE PHONE SIMULATOR (MOBILE PREVIEW) ==================== */
        <div className="flex-1 w-full flex flex-col items-center md:justify-center md:p-4 min-h-screen relative z-10">
          <PhoneSimulator 
            currencies={currencies}
            products={products}
            currentFrancRate={currentFrancRate}
            onUpdateFrancRate={handleUpdateFrancRate}
            onNewOrder={handleNewOrder}
            whatsAppConfig={whatsAppConfig}
            compact={false}
            systemAlerts={systemAlerts}
            onTriggerAdminLogin={() => {
              setIsAdminMode(true);
              triggerToast(language === 'ar' ? '🔐 تم نقلك لبوابة تسجيل دخول الإدارة الموحدة' : '🔐 Redirected to admin workspace login');
            }}
          />
        </div>
      )}

      {/* ==================== GLOBAL FLOATING TOAST FEEDBACK ==================== */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed top-6 inset-x-4 max-w-sm mx-auto bg-stone-900/95 backdrop-blur-md border border-stone-800 text-stone-100 text-center py-3 px-5 rounded-xl text-xs font-black shadow-2xl z-50 flex items-center justify-center gap-2 animate-bounce-short"
          >
            <CheckCircle2 className="w-4.5 h-4.5 text-amber-400 shrink-0" />
            <span className="font-tajawal">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
