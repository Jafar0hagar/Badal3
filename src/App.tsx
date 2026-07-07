import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import PhoneSimulator from './components/PhoneSimulator';
import Dashboard from './components/Dashboard';
import AdminLogin from './components/AdminLogin';
import { Currency, Product, WhatsAppConfig, Order, SystemAlert } from './types';
import { Layers, Smartphone, Database, AlertCircle, CheckCircle2, LogOut, Home, Download, QrCode, ShieldCheck, Lock, Server, ArrowLeft, ExternalLink, Settings, Bell } from 'lucide-react';
import { playNotificationSound } from './utils/audio';
import { 
  seedDatabaseIfEmpty,
  subscribeCurrencies,
  subscribeProducts,
  subscribeOrders,
  subscribeWhatsAppConfig,
  subscribeGeneralConfig,
  subscribeSystemAlerts,
  addSystemAlertToDb,
  deleteSystemAlertInDb,
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

const INITIAL_CURRENCIES: Currency[] = [
  { id: 'xaf', name: 'الفرنك التشادي', code: 'XAF', symbol: 'FCFA', price: 5900, lastUpdated: 'الآن', flag: 'TD', trend: 'stable', country: 'تشاد' },
  { id: 'usd', name: 'الدولار الأمريكي', code: 'USD', symbol: '$', price: 3200, lastUpdated: 'الآن', flag: 'US', trend: 'up', country: 'الولايات المتحدة الأمريكية' },
  { id: 'eur', name: 'اليورو', code: 'EUR', symbol: '€', price: 3650, lastUpdated: 'الآن', flag: 'EU', trend: 'down', country: 'الاتحاد الأوروبي' },
  { id: 'sar', name: 'الريال السعودي', code: 'SAR', symbol: 'ر.س', price: 850, lastUpdated: 'الآن', flag: 'SA', trend: 'up', country: 'المملكة العربية السعودية' },
  { id: 'gbp', name: 'الجنيه الإسترليني', code: 'GBP', symbol: '£', price: 4200, lastUpdated: 'الآن', flag: 'GB', trend: 'stable', country: 'المملكة المتحدة' },
  { id: 'egp', name: 'الجنيه المصري', code: 'EGP', symbol: 'ج.م', price: 65, lastUpdated: 'الآن', flag: 'EG', trend: 'stable', country: 'مصر' },
  { id: 'aed', name: 'الدرهم الإماراتي', code: 'AED', symbol: 'د.إ', price: 870, lastUpdated: 'الآن', flag: 'AE', trend: 'up', country: 'دولة الإمارات العربية المتحدة' },
  { id: 'kwd', name: 'الدينار الكويتي', code: 'KWD', symbol: 'د.ك', price: 10400, lastUpdated: 'الآن', flag: 'KW', trend: 'down', country: 'الكويت' },
];

const INITIAL_PRODUCTS: Product[] = [
  { id: 'sugar', name: 'سكر مستورد فاخر', price: 4000, currencySymbol: 'فرنك', category: 'sugar', categoryAr: 'سكر', imageUrl: '', isAvailable: true, unit: 'كيس ١٠ كجم', whatsappMessage: 'طلب شراء سكر مستورد فاخر' },
  { id: 'flour', name: 'دقيق الخيرات فاخر', price: 3500, currencySymbol: 'فرنك', category: 'foodstuffs', categoryAr: 'غذائيات', imageUrl: '', isAvailable: true, unit: 'علبة ١ كجم', whatsappMessage: 'طلب شراء دقيق الخيرات فاخر' },
  { id: 'rice', name: 'أرز بسمتي درجة أولى', price: 5500, currencySymbol: 'فرنك', category: 'rice', categoryAr: 'أرز', imageUrl: '', isAvailable: true, unit: 'جوال ٥ كجم', whatsappMessage: 'طلب شراء أرز بسمتي درجة أولى' },
  { id: 'oil', name: 'زيت صباح نقي مكرر', price: 3000, currencySymbol: 'فرنك', category: 'oils', categoryAr: 'زيوت', imageUrl: '', isAvailable: true, unit: 'زجاجة ١.٥ لتر', whatsappMessage: 'طلب شراء زيت صباح نقي مكرر' },
  { id: 'tea', name: 'شاي الجزيرة الأخضر الفاخر', price: 1500, currencySymbol: 'فرنك', category: 'foodstuffs', categoryAr: 'غذائيات', imageUrl: '', isAvailable: true, unit: '٢٥٠ غرام', whatsappMessage: 'طلب شراء شاي الجزيرة الأخضر الفاخر' },
  { id: 'pasta', name: 'مكرونة الوادي سريعة التحضير', price: 1000, currencySymbol: 'فرنك', category: 'foodstuffs', categoryAr: 'غذائيات', imageUrl: '', isAvailable: true, unit: '٥٠٠ غرام', whatsappMessage: 'طلب شراء مكرونة الوادي سريعة التحضير' },
];

const INITIAL_ORDERS: Order[] = [
  { id: 'order-1', productName: 'سكر مستورد فاخر', price: '4,000 فرنك', unit: 'كيس ١٠ كجم', timestamp: '١٠:١٥ ص اليوم', status: 'completed', customerName: 'أحمد التاجر', customerPhone: '+249 91 234 5678', notes: 'يرجى التوصيل للمخزن الرئيسي بسوق ليبيا' },
  { id: 'order-2', productName: 'زيت صباح نقي مكرر', price: '3,000 فرنك', unit: 'زجاجة ١.٥ لتر', timestamp: '٠٩:٣٠ ص اليوم', status: 'processing', customerName: 'فاطمة صالح', customerPhone: '+249 12 345 6789', notes: 'يرجى تأكيد التوافر للكميات الإضافية' },
  { id: 'order-3', productName: 'أرز بسمتي درجة أولى', price: '5,500 فرنك', unit: 'جوال ٥ كجم', timestamp: 'منذ ١٥ دقيقة', status: 'pending', customerName: 'محمد عثمان', customerPhone: '+249 90 876 5432', notes: 'مستلم عبر واتساب المحاكي تلقائياً' }
];

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

  // Admin Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    const remembered = localStorage.getItem('isAdminAuthenticated') === 'true' && localStorage.getItem('rememberDevice') === 'true';
    const tempSession = sessionStorage.getItem('isAdminAuthenticated') === 'true';
    return remembered || tempSession;
  });

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('isAdminAuthenticated');
    localStorage.removeItem('rememberDevice');
    sessionStorage.removeItem('isAdminAuthenticated');
  };

  // Determine if we are on the admin path or search query '?admin=true' or hash '#admin'
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    return window.location.pathname.startsWith('/admin') || 
           window.location.search.includes('admin') || 
           window.location.hash === '#admin';
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Database initialization & real-time snapshot subscription
  useEffect(() => {
    let unsubCurrencies: () => void;
    let unsubProducts: () => void;
    let unsubOrders: () => void;
    let unsubWhatsApp: () => void;
    let unsubGeneral: () => void;
    let unsubAlerts: () => void;

    async function initDb() {
      await seedDatabaseIfEmpty();
      
      unsubCurrencies = subscribeCurrencies(setCurrencies);
      unsubProducts = subscribeProducts(setProducts);
      unsubOrders = subscribeOrders((fetchedOrders) => {
        setOrders(prev => {
          // Play a notification chime if a new order lands in Firestore dynamically
          if (fetchedOrders.length > prev.length && prev.length > 0) {
            playNotificationSound(fetchedOrders.length, 'order_received');
          }
          return fetchedOrders;
        });
      });
      unsubWhatsApp = subscribeWhatsAppConfig(setWhatsAppConfig);
      unsubGeneral = subscribeGeneralConfig(setCurrentFrancRate);
      unsubAlerts = subscribeSystemAlerts((fetchedAlerts) => {
        // Auto-delete alerts older than 3 hours (3 * 60 * 60 * 1000 ms)
        const threeHoursMs = 3 * 60 * 60 * 1000;
        const now = Date.now();
        fetchedAlerts.forEach((alert) => {
          const alertTime = alert.createdAt || 0;
          if (alertTime > 0 && (now - alertTime) > threeHoursMs) {
            deleteSystemAlertInDb(alert.id).catch(err => {
              console.error("Failed to auto-delete old alert:", err);
            });
          }
        });

        setSystemAlerts(fetchedAlerts);
      });
    }

    initDb();

    return () => {
      if (unsubCurrencies) unsubCurrencies();
      if (unsubProducts) unsubProducts();
      if (unsubOrders) unsubOrders();
      if (unsubWhatsApp) unsubWhatsApp();
      if (unsubGeneral) unsubGeneral();
      if (unsubAlerts) unsubAlerts();
    };
  }, []);

  // Auto-sync visual cue when props update
  useEffect(() => {
    setIsSyncing(true);
    const timer = setTimeout(() => setIsSyncing(false), 800);
    return () => clearTimeout(timer);
  }, [currencies, products, orders, currentFrancRate, whatsAppConfig]);

  // Synchronize dynamic exchange rate triggers
  const handleUpdateFrancRate = async (newRate: number) => {
    await updateGeneralConfigInDb(newRate);
    const xafCurrency = currencies.find(c => c.id === 'xaf');
    if (xafCurrency) {
      await updateCurrencyInDb({
        ...xafCurrency,
        price: newRate,
        lastUpdated: 'الآن'
      });
    }
    playNotificationSound(undefined, 'price_updated');
  };

  // Intercept phone orders and stream them live to dashboard logs
  const handleNewOrder = async (newOrder: Order) => {
    await addOrderToDb(newOrder);
    playNotificationSound(orders.length + 1, 'order_received');
  };

  const handleUpdateCurrencies = async (updatedList: Currency[]) => {
    if (updatedList.length < currencies.length) {
      const deleted = currencies.find(c => !updatedList.some(item => item.id === c.id));
      if (deleted) {
        await deleteCurrencyInDb(deleted.id);
      }
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
      if (deleted) {
        await deleteProductInDb(deleted.id);
      }
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
      if (deleted) {
        await deleteOrderInDb(deleted.id);
      }
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
    <div className="w-full min-h-screen bg-[#070507] text-stone-100 flex flex-col font-sans select-none overflow-x-hidden antialiased">
      {isAdminMode ? (
        /* ==================== 1. ENCRYPTED ADMIN DASHBOARD VIEW ==================== */
        <div className="w-full min-h-screen flex flex-col bg-[#0b080b] animate-fade-in relative overflow-hidden">
          
          {/* Background ambient gold/red aura for luxury look */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#850F1D]/5 blur-[140px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[140px] pointer-events-none" />

          {/* Standalone admin screen layout */}
          <div className="flex-1 w-full max-w-7xl mx-auto p-0 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center min-h-0">
            
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center justify-center">
              
              {/* Left Column: Premium Admin Presentation Panel (Hidden on mobile) */}
              <div className="lg:col-span-7 hidden lg:flex flex-col space-y-6 text-right p-4 z-10" dir="rtl">
                
                {/* Status Badges */}
                <div className="flex items-center gap-3 self-start">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-xs">
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                    <span className="text-xs font-black text-amber-300 font-tajawal">لوحة المشرف المعتمدة</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-200 leading-tight font-cairo">
                    بَدَلْ • الإدارة والتحكم السحابي
                  </h1>
                  <p className="text-stone-300 text-sm font-tajawal leading-relaxed max-w-xl">
                    البوابة المركزية لإدارة منظومة بَدَلْ للخدمات والعملات. قم بتحديث أسعار الصرف، جرد السلع الأساسية، وإدارة وتوصيل الطلبات الواردة مباشرة لحظة بلحظة، مع ميزة بث الإشعارات والتنبيهات لجميع الهواتف الذكية للعملاء فورًا.
                  </p>
                </div>

                {/* Dashboard Metrics / Features Grid */}
                <div className="grid grid-cols-2 gap-4 max-w-lg">
                  <div className="bg-[#140f14]/80 border border-stone-800/80 rounded-2xl p-4 space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-black text-white font-cairo">تتبع فوري للطلبات</h3>
                    <p className="text-[10px] text-stone-400 font-tajawal leading-relaxed">تلقي طلبات الشراء للسلع الأساسية وصرف العملات من العملاء وتجهيزها مباشرة.</p>
                  </div>

                  <div className="bg-[#140f14]/80 border border-stone-800/80 rounded-2xl p-4 space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <Bell className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-black text-white font-cairo">بث فوري لأسعار الصرف</h3>
                    <p className="text-[10px] text-stone-400 font-tajawal leading-relaxed">عند تغيير أسعار السلع أو صرف الفرنك يتم بث التنبيه الفوري لجرس الهواتف.</p>
                  </div>
                </div>

                {/* Admin Quick Info Section */}
                <div className="bg-[#161017]/90 border border-stone-800/80 rounded-2xl p-6 shadow-xl space-y-4">
                  <h3 className="text-sm font-black text-amber-300 flex items-center gap-2 font-cairo">
                    <Smartphone className="w-4.5 h-4.5 text-amber-400" />
                    <span>مؤشرات أداء المنظومة النشطة</span>
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-stone-900/50 border border-stone-800/50 rounded-xl p-3">
                      <span className="text-xs text-stone-400 font-tajawal block">الطلبات الواردة</span>
                      <span className="text-lg font-black text-white font-mono mt-1 block">{orders.length}</span>
                    </div>
                    <div className="bg-stone-900/50 border border-stone-800/50 rounded-xl p-3">
                      <span className="text-xs text-stone-400 font-tajawal block">السلع المعروضة</span>
                      <span className="text-lg font-black text-amber-300 font-mono mt-1 block">{products.length}</span>
                    </div>
                    <div className="bg-stone-900/50 border border-stone-800/50 rounded-xl p-3">
                      <span className="text-xs text-stone-400 font-tajawal block">أسعار الصرف</span>
                      <span className="text-lg font-black text-[#850F1D] font-mono mt-1 block">{currencies.length}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-800 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-black text-stone-200 font-cairo">إدارة جماعية مشتركة</h4>
                      <p className="text-[10px] text-stone-500">مزامنة تامة لعدة مسؤولين ومشاركة فورية للمبيعات في السودان وتشاد.</p>
                    </div>
                  </div>
                </div>

                {/* Return button */}
                <div className="flex gap-3">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      window.history.pushState({}, '', window.location.origin + window.location.pathname);
                      setIsAdminMode(false);
                    }}
                    className="self-start text-xs font-bold text-stone-300 hover:text-white bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-rose-500" />
                    <span className="font-tajawal">معاينة تطبيق العملاء</span>
                  </button>

                  {isAdminAuthenticated && (
                    <button
                      onClick={handleLogout}
                      className="self-start text-xs font-bold text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 border border-red-900/60 hover:border-red-900 px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span className="font-tajawal">تسجيل الخروج من النظام</span>
                    </button>
                  )}
                </div>

              </div>

              {/* Right Column: Mobile view Simulator of either AdminLogin or Dashboard */}
              <div className="lg:col-span-5 w-full flex flex-col items-center justify-center">
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
                  />
                ) : (
                  <AdminLogin 
                    onLoginSuccess={(rememberDevice) => {
                      setIsAdminAuthenticated(true);
                      if (rememberDevice) {
                        localStorage.setItem('isAdminAuthenticated', 'true');
                        localStorage.setItem('rememberDevice', 'true');
                      } else {
                        sessionStorage.setItem('isAdminAuthenticated', 'true');
                        localStorage.removeItem('isAdminAuthenticated');
                        localStorage.removeItem('rememberDevice');
                      }
                    }} 
                    onGoBack={() => {
                      window.history.pushState({}, '', window.location.origin + window.location.pathname);
                      setIsAdminMode(false);
                    }}
                  />
                )}
              </div>

            </div>

          </div>

          {/* Standalone clean admin footer on desktop only */}
          <footer className="hidden lg:block w-full bg-[#110e11] border-t border-stone-900 py-3 text-center text-[10px] text-stone-500 font-tajawal z-40">
            منظومة التحكم السحابية الموحدة لشركاء بَدَلْ © ٢٠٢٦ • محمي ومشفر بالكامل
          </footer>

        </div>
      ) : (
        /* ==================== 2. STANDALONE CUSTOMER APP VIEW ==================== */
        <div className="w-full min-h-screen flex flex-col bg-[#070507] animate-fade-in relative overflow-hidden">
          
          {/* Background ambient gold/red aura for luxury look */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#850F1D]/5 blur-[140px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[140px] pointer-events-none" />

          {/* Standalone client screen layout */}
          <div className="flex-1 w-full max-w-7xl mx-auto p-0 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center min-h-0">
            
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center justify-center">
              
              {/* Left Column: Premium App Download & Installation Guide (Hidden on mobile) */}
              <div className="lg:col-span-7 hidden lg:flex flex-col space-y-6 text-right p-4" dir="rtl">
                
                {/* Badal Premium Badge */}
                <div className="inline-flex items-center gap-2 self-start px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-xs">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs font-black text-amber-300 font-tajawal">التطبيق الرسمي للعملاء</span>
                </div>

                <div className="space-y-3">
                  <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-200 leading-tight font-cairo">
                    تطبيق بَدَلْ • للخدمات والعملات
                  </h1>
                  <p className="text-stone-300 text-sm font-tajawal leading-relaxed max-w-xl">
                    المستشار المالي والتمويني الأول لرصد أسعار الصرف للفرنك التشادي والعملات الأجنبية مقابل الجنيه السوداني لحظة بلحظة، بالإضافة لكتالوج المنتجات والسلع الأساسية والمزامنة الفورية مع قواعد البيانات السحابية.
                  </p>
                </div>

                {/* Features Highlights */}
                <div className="grid grid-cols-2 gap-4 max-w-lg">
                  <div className="bg-[#140f14]/80 border border-stone-800/80 rounded-2xl p-4 space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-black text-white font-cairo">أمان فوري سحابي</h3>
                    <p className="text-[10px] text-stone-400 font-tajawal leading-relaxed">تكامل مشفر ومباشر مع خوادم السحاب يمنع أي تلاعب بالأسعار.</p>
                  </div>

                  <div className="bg-[#140f14]/80 border border-stone-800/80 rounded-2xl p-4 space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-[#850F1D]/10 border border-[#850F1D]/20 flex items-center justify-center text-rose-400">
                      <Download className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-black text-white font-cairo">تحميل وتثبيت فوري</h3>
                    <p className="text-[10px] text-stone-400 font-tajawal leading-relaxed">تثبيت التطبيق مباشرة على هاتفك دون استهلاك للذاكرة.</p>
                  </div>
                </div>

                {/* Progressive Web App (PWA) Interactive Guide */}
                <div className="bg-[#161017]/90 border border-stone-800/80 rounded-2xl p-6 shadow-xl space-y-4">
                  <h3 className="text-sm font-black text-amber-300 flex items-center gap-2 font-cairo">
                    <Download className="w-4.5 h-4.5 text-amber-400" />
                    <span>دليل تثبيت وتنزيل التطبيق على هاتفك</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-tajawal text-stone-300">
                    {/* Android Instructions */}
                    <div className="bg-stone-900/50 border border-stone-800/50 rounded-xl p-4 space-y-3">
                      <h4 className="font-extrabold text-[#850F1D] flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#850F1D]" />
                        <span>هواتف أندرويد (Chrome)</span>
                      </h4>
                      <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-stone-400">
                        <li>افتح الرابط الحالي في متصفح Chrome.</li>
                        <li>اضغط على النقاط الثلاث (<span className="font-bold">⋮</span>) أعلى اليسار.</li>
                        <li>اختر <span className="text-stone-200 font-extrabold">"تثبيت التطبيق"</span> من القائمة.</li>
                        <li>سيظهر التطبيق فوراً على شاشتك الرئيسية.</li>
                      </ol>
                    </div>

                    {/* iOS Instructions */}
                    <div className="bg-stone-900/50 border border-stone-800/50 rounded-xl p-4 space-y-3">
                      <h4 className="font-extrabold text-amber-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span>هواتف آيفون (Safari)</span>
                      </h4>
                      <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-stone-400">
                        <li>افتح الرابط الحالي في متصفح Safari.</li>
                        <li>اضغط على زر <span className="text-stone-200 font-extrabold">المشاركة (Share)</span> السفلي.</li>
                        <li>مرر لأسفل واختر <span className="text-stone-200 font-extrabold">"إضافة للشاشة الرئيسية"</span>.</li>
                        <li>اضغط على <span className="font-bold">إضافة</span> لتثبيته في شاشتك.</li>
                      </ol>
                    </div>
                  </div>

                  {/* QR Scan Section to transfer to Phone */}
                  <div className="pt-4 border-t border-stone-800 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-stone-200 font-cairo">تصفح عبر هاتفك الآن</h4>
                      <p className="text-[10px] text-stone-400">امسح رمز الاستجابة السريعة المقابل بكاميرا هاتفك لفتح وتنزيل التطبيق مباشرة.</p>
                    </div>
                    <div className="p-2 bg-white rounded-xl shadow-md shrink-0 flex items-center justify-center">
                      <QrCode className="w-16 h-16 text-stone-950" />
                    </div>
                  </div>

                </div>

                {/* Secure System Settings Button */}
                <button
                  onClick={() => setIsAdminMode(true)}
                  className="self-start text-xs font-bold text-amber-500 hover:text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 hover:border-amber-500/20 px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
                >
                  <Settings className="w-3.5 h-3.5 animate-spin-slow text-amber-500" />
                  <span className="font-tajawal">إعدادات النظام وأسعار الصرف</span>
                </button>

              </div>

              {/* Right Column: Full viewport phone Simulator */}
              <div className="lg:col-span-5 w-full flex flex-col items-center justify-center">
                <PhoneSimulator 
                  currencies={currencies}
                  products={products}
                  currentFrancRate={currentFrancRate}
                  onUpdateFrancRate={handleUpdateFrancRate}
                  onNewOrder={handleNewOrder}
                  whatsAppConfig={whatsAppConfig}
                  compact={true}
                  systemAlerts={systemAlerts}
                  onTriggerAdminLogin={() => setIsAdminMode(true)}
                />
              </div>

            </div>

          </div>

          {/* Standalone clean customer footer */}
          <footer className="w-full bg-[#110e11] border-t border-stone-900 py-4 text-center text-[10px] text-stone-500 font-tajawal z-40">
            تطبيق بَدَلْ للعملاء © ٢٠٢٦ • إصدار رسمي مستقل ومزامن مع قواعد بيانات سحابية مشفرة
          </footer>

        </div>
      )}
    </div>
  );
}
