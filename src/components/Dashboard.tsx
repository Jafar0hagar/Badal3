import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Database, 
  Cpu, 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  FileText, 
  AlertCircle,
  Bell,
  RefreshCw,
  Search,
  CheckCircle2,
  X,
  Play,
  Volume2,
  Lock,
  Smartphone,
  Coins,
  ClipboardList,
  Phone,
  Link2,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import BadalLogo from './BadalLogo';

// Import Types
import { Currency, Product, WhatsAppConfig, Order, SystemAlert } from '../types';
import { playNotificationSound } from '../utils/audio';
import { addSystemAlertToDb, deleteSystemAlertInDb } from '../utils/firebase';

interface DashboardProps {
  currencies: Currency[];
  onUpdateCurrencies: (updated: Currency[]) => void;
  products: Product[];
  onUpdateProducts: (updated: Product[]) => void;
  orders: Order[];
  onUpdateOrders: (updated: Order[]) => void;
  onUpdateFrancRate: (newRate: number) => void;
  currentFrancRate: number;
  whatsAppConfig?: WhatsAppConfig;
  onUpdateWhatsAppConfig?: (config: WhatsAppConfig) => void;
  systemAlerts?: SystemAlert[];
}

export default function Dashboard({
  currencies,
  onUpdateCurrencies,
  products,
  onUpdateProducts,
  orders,
  onUpdateOrders,
  onUpdateFrancRate,
  currentFrancRate,
  whatsAppConfig,
  onUpdateWhatsAppConfig,
  systemAlerts = []
}: DashboardProps) {
  
  // Mobile Pages / Screens
  // 'overview' | 'currencies' | 'products' | 'orders' | 'alerts'
  const [activeTab, setActiveTab] = useState<'overview' | 'currencies' | 'products' | 'orders' | 'alerts'>('overview');

  // Search and Filter states
  const [currencySearch, setCurrencySearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'processing' | 'completed'>('all');

  // State for Add/Edit Modals
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [isAddingCurrency, setIsAddingCurrency] = useState(false);
  const [newCurrency, setNewCurrency] = useState<Partial<Currency>>({
    name: '',
    code: '',
    price: 100,
    trend: 'stable',
    country: '',
    flag: '🏳️'
  });

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 1000,
    category: 'foodstuffs',
    categoryAr: 'غذائيات',
    unit: 'كجم',
    isAvailable: true,
    whatsappMessage: '',
    description: '',
    imageUrl: ''
  });

  // System Alerts Broadcast local states
  const [alertTitle, setAlertTitle] = useState('');
  const [alertText, setAlertText] = useState('');
  const [isBroadcastingAlert, setIsBroadcastingAlert] = useState(false);

  // WhatsApp Local Form Config State
  const [waConfigForm, setWaConfigForm] = useState<WhatsAppConfig>({
    salesPhone1: '+249 91 234 5678',
    salesPhone2: '+249 92 345 6789',
    supportPhone: '+249 93 456 7890',
    emergencyPhone: '+249 94 567 8901',
    waLink: 'https://wa.me/249912345678',
    groupLink: 'https://chat.whatsapp.com/BadalGroup',
    channelLink: 'https://whatsapp.com/channel/0029VaBadal',
    defaultMessage: 'مرحباً، أريد الاستفسار عن المنتجات والأسعار المتوفرة. شكراً لكم.'
  });

  // Sync Local WhatsApp Config Form with incoming server values
  useEffect(() => {
    if (whatsAppConfig) {
      setWaConfigForm(whatsAppConfig);
    }
  }, [whatsAppConfig]);

  // Toast Feedback State
  const [dashToast, setDashToast] = useState<string | null>(null);
  const showToast = (message: string) => {
    setDashToast(message);
    setTimeout(() => setDashToast(null), 3000);
  };

  // Mobile clock state
  const [timeStr, setTimeStr] = useState('12:00 م');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Update WhatsApp config
  const handleUpdateWhatsApp = async (partName: string) => {
    if (onUpdateWhatsAppConfig) {
      try {
        await onUpdateWhatsAppConfig(waConfigForm);
        showToast(`✅ تم حفظ وتحديث إعدادات ${partName} بنجاح!`);
      } catch (err) {
        showToast('❌ عذراً، فشل تحديث إعدادات الواتساب.');
      }
    }
  };

  // Broadcast Alert manually
  const handleBroadcastAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTitle.trim() || !alertText.trim()) {
      showToast('⚠️ يرجى كتابة عنوان التنبيه ومحتوى الرسالة أولاً!');
      return;
    }
    setIsBroadcastingAlert(true);
    try {
      const newAlert: SystemAlert = {
        id: `alert-${Date.now()}`,
        title: alertTitle,
        text: alertText,
        time: 'الآن',
        unread: true,
        createdAt: Date.now()
      };
      await addSystemAlertToDb(newAlert);
      showToast('🔔 تم بث التنبيه لجميع المستخدمين وتشغيل جرس التنبيه!');
      setAlertTitle('');
      setAlertText('');
    } catch (error) {
      console.error('Error broadcasting alert:', error);
      showToast('❌ عذراً، فشل بث التنبيه، تحقق من اتصال الإنترنت.');
    } finally {
      setIsBroadcastingAlert(false);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      await deleteSystemAlertInDb(id);
      showToast('🗑️ تم حذف التنبيه بنجاح من قاعدة البيانات.');
    } catch (err) {
      console.error(err);
      showToast('❌ فشل حذف التنبيه.');
    }
  };

  // 1. Currency Handlers with automatic Increase/Decrease alerts
  const handleSaveCurrency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCurrency) {
      const oldItem = currencies.find(c => c.id === editingCurrency.id);
      const oldPrice = oldItem ? oldItem.price : 0;
      const newPrice = editingCurrency.price;

      // Update in currencies array
      const updatedList = currencies.map(c => 
        c.id === editingCurrency.id ? { ...editingCurrency, lastUpdated: 'تحديث فوري الآن' } : c
      );
      onUpdateCurrencies(updatedList);
      
      // Update Chad Franc if edited
      if (editingCurrency.id === 'xaf') {
        onUpdateFrancRate(editingCurrency.price);
      }

      // Check for price difference and automatically create system notification
      if (oldPrice !== newPrice) {
        const diff = newPrice - oldPrice;
        const arrow = diff > 0 ? '📈' : '📉';
        const changeLabel = diff > 0 ? 'ارتفع' : 'انخفض';
        const amountText = Math.abs(diff).toLocaleString();
        
        const alertTitle = `تحديث فوري: سعر صرف ${editingCurrency.name}`;
        const alertText = `${arrow} ${changeLabel} سعر صرف ${editingCurrency.name} (${editingCurrency.code}) من ${oldPrice.toLocaleString()} ج.س إلى ${newPrice.toLocaleString()} ج.س (تغير قدره ${diff > 0 ? '+' : '-'}${amountText} ج.س)`;

        try {
          const autoAlert: SystemAlert = {
            id: `alert-auto-${Date.now()}`,
            title: alertTitle,
            text: alertText,
            time: 'الآن',
            unread: true,
            createdAt: Date.now()
          };
          await addSystemAlertToDb(autoAlert);
        } catch (err) {
          console.error('Error broadcasting auto alert:', err);
        }
      }
      
      setEditingCurrency(null);
      showToast('🪙 تم تحديث معلومات العملة بنجاح وتعميم الإشعار فوري!');
    }
  };

  const handleCreateCurrency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCurrency.name || !newCurrency.code) {
      showToast('⚠️ الرجاء تعبئة الحقول الأساسية');
      return;
    }
    const created: Currency = {
      id: newCurrency.code.toLowerCase(),
      name: newCurrency.name,
      code: newCurrency.code.toUpperCase(),
      symbol: 'ج.س',
      price: Number(newCurrency.price) || 0,
      lastUpdated: 'تمت الإضافة الآن',
      flag: newCurrency.flag || '🏳️',
      trend: newCurrency.trend || 'stable',
      changeRate: '0.0%',
      country: newCurrency.country || 'دولة مضافة'
    };
    onUpdateCurrencies([...currencies, created]);
    setIsAddingCurrency(false);
    setNewCurrency({ name: '', code: '', price: 100, trend: 'stable', country: '', flag: '🏳️' });
    showToast('🪙 تم إضافة العملة الجديدة بنجاح!');
  };

  const handleDeleteCurrency = (id: string) => {
    if (id === 'xaf') {
      showToast('❌ لا يمكن حذف العملة الأساسية للتطبيق!');
      return;
    }
    const filtered = currencies.filter(c => c.id !== id);
    onUpdateCurrencies(filtered);
    showToast('🗑️ تم حذف العملة من النظام');
  };

  // 2. Product Handlers with automatic Increase/Decrease alerts
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      const oldItem = products.find(p => p.id === editingProduct.id);
      const oldPrice = oldItem ? oldItem.price : 0;
      const newPrice = editingProduct.price;

      // Update
      const updatedList = products.map(p => p.id === editingProduct.id ? editingProduct : p);
      onUpdateProducts(updatedList);

      // Check for price difference and automatically create system notification
      if (oldPrice !== newPrice) {
        const diff = newPrice - oldPrice;
        const arrow = diff > 0 ? '📈' : '📉';
        const changeLabel = diff > 0 ? 'ارتفع' : 'انخفض';
        const amountText = Math.abs(diff).toLocaleString();

        const alertTitle = `تعديل أسعار: ${editingProduct.name}`;
        const alertText = `${arrow} تم تحديث سعر ${editingProduct.name} من ${oldPrice.toLocaleString()} فرنك إلى ${newPrice.toLocaleString()} فرنك (بتغير ${diff > 0 ? 'زيادة بمقدار +' : 'تخفيض بمقدار -'}${amountText} فرنك تشادي)`;

        try {
          const autoAlert: SystemAlert = {
            id: `alert-prod-${Date.now()}`,
            title: alertTitle,
            text: alertText,
            time: 'الآن',
            unread: true,
            createdAt: Date.now()
          };
          await addSystemAlertToDb(autoAlert);
        } catch (err) {
          console.error('Error broadcasting auto product alert:', err);
        }
      }

      setEditingProduct(null);
      showToast('📦 تم تعديل بيانات السلعة وبث الإشعار التلقائي!');
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      showToast('⚠️ الرجاء ملء الحقول المطلوبة');
      return;
    }
    const created: Product = {
      id: `p-${Date.now()}`,
      name: newProduct.name,
      price: Number(newProduct.price) || 0,
      currencySymbol: 'فرنك',
      category: (newProduct.category as any) || 'foodstuffs',
      categoryAr: newProduct.category === 'sugar' ? 'سكر' : newProduct.category === 'rice' ? 'أرز' : newProduct.category === 'oil' ? 'زيوت' : 'غذائيات',
      imageUrl: newProduct.imageUrl || '',
      isAvailable: newProduct.isAvailable !== undefined ? newProduct.isAvailable : true,
      unit: newProduct.unit || 'شوال',
      whatsappMessage: newProduct.whatsappMessage || `السلام عليكم، أود شراء ${newProduct.name} عبر تطبيق بدل.`,
      description: newProduct.description || ''
    };
    onUpdateProducts([...products, created]);
    setIsAddingProduct(false);
    setNewProduct({ name: '', price: 1000, category: 'foodstuffs', categoryAr: 'غذائيات', unit: 'كجم', isAvailable: true, imageUrl: '', description: '' });
    showToast('📦 تم إضافة المنتج الجديد للتطبيق!');
  };

  const handleToggleProductAvailability = (id: string) => {
    const updated = products.map(p => p.id === id ? { ...p, isAvailable: !p.isAvailable } : p);
    onUpdateProducts(updated);
    const p = products.find(prod => prod.id === id);
    showToast(p?.isAvailable ? `📴 تم تعيين المنتج غير متوفر` : `🟢 تم تفعيل توفر المنتج للطلب`);
  };

  const handleDeleteProduct = (id: string) => {
    const filtered = products.filter(p => p.id !== id);
    onUpdateProducts(filtered);
    showToast('🗑️ تم إزالة السلعة من المتجر');
  };

  // 3. Order Handlers
  const handleUpdateOrderStatus = (id: string, nextStatus: 'pending' | 'processing' | 'contacted' | 'completed') => {
    const updated = orders.map(o => o.id === id ? { ...o, status: nextStatus } : o);
    onUpdateOrders(updated);
    showToast(`🔄 تم تحديث حالة الطلب إلى: ${nextStatus === 'completed' ? 'تم التسليم' : nextStatus === 'contacted' ? 'تم الاتصال' : 'قيد التجهيز'}`);
  };

  const handleDeleteOrder = (id: string) => {
    const filtered = orders.filter(o => o.id !== id);
    onUpdateOrders(filtered);
    showToast('🗑️ تم حذف سجل الطلب');
  };

  // Statistics Computations
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const activeCurrencies = currencies.length;
  const availableProducts = products.filter(p => p.isAvailable).length;

  return (
    <div className="w-full flex justify-center items-center py-2 sm:py-6" dir="rtl">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {dashToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900 border border-amber-500/30 text-amber-200 font-extrabold text-xs py-3 px-5 rounded-xl shadow-2xl flex items-center gap-2 max-w-[90vw]"
          >
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-tajawal">{dashToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
        Responsive Casing:
        - On desktop (sm and up), renders like a beautiful luxury smartphone simulator chassis.
        - On actual phone, renders full-screen (w-full h-[100dvh]) to make it beautiful to use together on a phone!
      */}
      <div className="w-full h-[100dvh] sm:w-[410px] sm:h-[840px] bg-stone-950 sm:rounded-[55px] p-0 sm:p-3.5 shadow-2xl sm:border-[6px] sm:border-stone-800 sm:ring-12 sm:ring-stone-900 sm:ring-offset-4 sm:ring-offset-stone-950 flex flex-col justify-between overflow-hidden relative">
        
        {/* Dynamic Notch / Camera Hole on desktop simulator */}
        <div className="hidden sm:flex absolute top-5 left-1/2 -translate-x-1/2 w-32 h-6 bg-stone-950 rounded-full z-50 items-center justify-center gap-2 border border-stone-800/40">
          <div className="w-10 h-1 bg-stone-800 rounded-full" />
          <div className="w-2.5 h-2.5 bg-stone-900 rounded-full border border-stone-800" />
        </div>

        {/* Inner Viewport Container */}
        <div className="w-full h-full bg-stone-950 sm:rounded-[42px] overflow-hidden flex flex-col relative pb-16">
          
          {/* Simulated Mobile Status Bar */}
          <div className="px-6 pt-3.5 pb-2 flex justify-between items-center text-xs font-black text-stone-400 z-30 select-none font-mono">
            {/* Battery & Signals */}
            <div className="flex items-center gap-1.5 order-2">
              <span className="text-[10px]">100%</span>
              <div className="w-5.5 h-2.5 border border-stone-500 rounded-sm p-0.5 flex items-center">
                <div className="w-full h-full bg-emerald-500 rounded-xs" />
              </div>
            </div>
            
            {/* Central Badge */}
            <span className="text-[9px] text-[#850F1D] font-tajawal font-bold bg-[#850F1D]/10 px-2.5 py-0.5 rounded-full absolute left-1/2 -translate-x-1/2">
              لوحة تحكم المنظومة
            </span>

            {/* Time display */}
            <span className="order-1 text-[11px] font-bold">{timeStr}</span>
          </div>

          {/* Top Admin Header Section */}
          <div className="px-5 py-3.5 bg-stone-950/80 border-b border-stone-900 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#850F1D] to-amber-500 p-0.5 flex items-center justify-center shadow-lg">
                <div className="w-full h-full bg-[#170e17] rounded-[9px] flex items-center justify-center">
                  <BadalLogo size={28} withTag={false} />
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-white to-amber-300 font-cairo">
                  بَدَلْ • الإدارة السحابية
                </h1>
                <p className="text-[9px] text-stone-500 font-tajawal">التحكم الفوري بالأسعار والسلع</p>
              </div>
            </div>
          </div>

          {/* Dynamic Scrollable Content Panel */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-right no-scrollbar" dir="rtl">
            
            {/* ======================================================== */}
            {/* TAB 1: OVERVIEW (الرئيسية) */}
            {activeTab === 'overview' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Intro Banner */}
                <div className="bg-gradient-to-br from-[#850F1D]/20 to-stone-900 border border-[#850F1D]/30 p-4 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-20 h-20 bg-amber-500/5 rounded-full blur-xl" />
                  <h4 className="text-xs font-black text-amber-300 flex items-center gap-1.5 font-cairo">
                    <Cpu className="w-4 h-4" />
                    <span>مرحبًا بك في لوحة التحكم المركزية</span>
                  </h4>
                  <p className="text-[10px] text-stone-300 font-tajawal mt-1 leading-relaxed">
                    جميع الأسعار، العملات، وحالات التوفر للسلع يتم مزامنتها تلقائيًا في الوقت الفعلي مع جميع الهواتف الذكية للعملاء.
                  </p>
                </div>

                {/* Dashboard Quick Numbers Grid (2x2) */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Stat 1 */}
                  <div className="bg-stone-900/60 border border-stone-850 p-3.5 rounded-xl text-right">
                    <span className="text-[10px] text-stone-500 font-tajawal block">سعر صرف الفرنك</span>
                    <span className="text-base font-black text-amber-300 tracking-tight block mt-1">
                      {currentFrancRate.toLocaleString()} <span className="text-[9px] text-stone-500">ج.س</span>
                    </span>
                    <span className="text-[8px] text-emerald-400 font-tajawal block mt-1">🇹🇩 العملة الأساسية</span>
                  </div>

                  {/* Stat 2 */}
                  <div className="bg-stone-900/60 border border-stone-850 p-3.5 rounded-xl text-right">
                    <span className="text-[10px] text-stone-500 font-tajawal block">العملات المفعلة</span>
                    <span className="text-base font-black text-white tracking-tight block mt-1">
                      {activeCurrencies} <span className="text-[9px] text-stone-500">عملات</span>
                    </span>
                    <span className="text-[8px] text-[#850F1D] font-tajawal block mt-1">تحت المراقبة الفورية</span>
                  </div>

                  {/* Stat 3 */}
                  <div className="bg-stone-900/60 border border-stone-850 p-3.5 rounded-xl text-right">
                    <span className="text-[10px] text-stone-500 font-tajawal block">السلع المتوفرة</span>
                    <span className="text-base font-black text-white tracking-tight block mt-1">
                      {availableProducts} <span className="text-[9px] text-stone-500">سلع</span>
                    </span>
                    <span className="text-[8px] text-amber-400 font-tajawal block mt-1">من أصل {products.length} مواد</span>
                  </div>

                  {/* Stat 4 */}
                  <div className="bg-stone-900/60 border border-stone-850 p-3.5 rounded-xl text-right">
                    <span className="text-[10px] text-stone-500 font-tajawal block">الطلبات الواردة</span>
                    <span className="text-base font-black text-rose-400 tracking-tight block mt-1">
                      {totalOrders} <span className="text-[9px] text-stone-500">طلبات</span>
                    </span>
                    <span className="text-[8px] text-rose-500 font-tajawal block mt-1 animate-pulse">{pendingOrders} طلبات جديدة</span>
                  </div>
                </div>

                {/* Simulated Chart visualizer */}
                <div className="bg-stone-900/60 border border-stone-850 p-4 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-stone-300 font-cairo">مخطط حركة أسعار الصرف (الأسبوعي)</span>
                    <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">مستقر</span>
                  </div>
                  
                  {/* SVG Chart */}
                  <div className="relative h-28 bg-stone-950 rounded-lg p-2 flex items-end overflow-hidden border border-stone-900">
                    <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGradAdmin" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#DFBA82" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#DFBA82" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <line x1="0" y1="25" x2="300" y2="25" stroke="#1f1813" strokeWidth="1" strokeDasharray="3,3" />
                      <line x1="0" y1="50" x2="300" y2="50" stroke="#1f1813" strokeWidth="1" strokeDasharray="3,3" />
                      <line x1="0" y1="75" x2="300" y2="75" stroke="#1f1813" strokeWidth="1" strokeDasharray="3,3" />
                      
                      <path
                        d={`M 0 100 L 0 70 Q 37.5 55 75 65 T 150 40 T 225 45 T 300 ${100 - ((currentFrancRate - 5500) / 15)} L 300 100 Z`}
                        fill="url(#chartGradAdmin)"
                      />
                      <path
                        d={`M 0 70 Q 37.5 55 75 65 T 150 40 T 225 45 T 300 ${100 - ((currentFrancRate - 5500) / 15)}`}
                        fill="none"
                        stroke="#DFBA82"
                        strokeWidth="2"
                      />
                      <circle cx="150" cy="40" r="3.5" fill="#850F1D" stroke="#DFBA82" strokeWidth="1" />
                      <circle cx="300" cy={100 - ((currentFrancRate - 5500) / 15)} r="4" fill="#FFF" stroke="#850F1D" strokeWidth="2" />
                    </svg>
                    <span className="absolute bottom-1 right-2 text-[8px] text-stone-600 font-mono">السبت</span>
                    <span className="absolute bottom-1 left-2 text-[8px] text-amber-300 font-bold font-mono">الآن ({currentFrancRate})</span>
                  </div>
                </div>

                {/* Direct quick connection monitor */}
                <div className="bg-stone-900/60 border border-stone-850 p-3.5 rounded-xl flex items-center justify-between gap-3 text-right">
                  <div className="flex gap-2.5 items-center">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <RefreshCw className="w-4 h-4 animate-spin-slow" />
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-300 font-bold block font-tajawal">مزامنة سحابية نشطة</span>
                      <span className="text-[8px] text-stone-500 block">Firebase Live Sync Server</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2 py-1 rounded-md">
                    مستمر
                  </span>
                </div>
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* TAB 2: CURRENCIES (العملات) */}
            {activeTab === 'currencies' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Header Actions */}
                <div className="flex items-center justify-between gap-2 shrink-0">
                  <h3 className="text-xs font-black text-white font-cairo">إدارة أسعار الصرف</h3>
                  
                  <button
                    onClick={() => setIsAddingCurrency(!isAddingCurrency)}
                    className="bg-[#850F1D] hover:bg-[#720a15] text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    {isAddingCurrency ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{isAddingCurrency ? 'إغلاق' : 'عملة جديدة'}</span>
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ابحث عن العملة..."
                    value={currencySearch}
                    onChange={(e) => setCurrencySearch(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-850 rounded-xl py-2 px-3 pr-9 text-xs text-stone-200 focus:outline-hidden focus:border-amber-500/40 text-right"
                  />
                  <Search className="w-4 h-4 text-stone-500 absolute right-3 top-2.5" />
                </div>

                {/* Add Currency Box (Embedded) */}
                <AnimatePresence>
                  {isAddingCurrency && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-stone-900 border border-amber-500/20 p-3.5 rounded-xl space-y-3"
                      onSubmit={handleCreateCurrency}
                    >
                      <span className="text-[10px] font-black text-amber-300 font-cairo block border-b border-stone-800 pb-1.5">تعبئة بيانات العملة الجديدة</span>
                      
                      <div className="space-y-2.5 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] text-stone-400 block font-bold">اسم العملة بالكامل</label>
                            <input
                              type="text"
                              placeholder="مثال: الدينار الكويتي"
                              value={newCurrency.name}
                              onChange={(e) => setNewCurrency({ ...newCurrency, name: e.target.value })}
                              className="w-full bg-stone-950 border border-stone-800 rounded-lg py-1.5 px-2 text-xs text-white"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-stone-400 block font-bold">الرمز الدولي (3 حروف)</label>
                            <input
                              type="text"
                              placeholder="مثال: KWD"
                              value={newCurrency.code}
                              onChange={(e) => setNewCurrency({ ...newCurrency, code: e.target.value })}
                              className="w-full bg-stone-950 border border-stone-800 rounded-lg py-1.5 px-2 text-xs text-white text-left font-mono"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] text-stone-400 block font-bold">السعر (مقابل ج.س)</label>
                            <input
                              type="number"
                              value={newCurrency.price}
                              onChange={(e) => setNewCurrency({ ...newCurrency, price: Number(e.target.value) })}
                              className="w-full bg-stone-950 border border-stone-800 rounded-lg py-1.5 px-2 text-xs text-white"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-stone-400 block font-bold">علم الدولة (Emoji)</label>
                            <input
                              type="text"
                              placeholder="مثال: 🇰🇼"
                              value={newCurrency.flag}
                              onChange={(e) => setNewCurrency({ ...newCurrency, flag: e.target.value })}
                              className="w-full bg-stone-950 border border-stone-800 rounded-lg py-1.5 px-2 text-xs text-center"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] text-stone-400 block font-bold">اتجاه السعر</label>
                            <select
                              value={newCurrency.trend}
                              onChange={(e) => setNewCurrency({ ...newCurrency, trend: e.target.value as any })}
                              className="w-full bg-stone-950 border border-stone-800 rounded-lg py-1.5 px-2 text-xs text-stone-300"
                            >
                              <option value="stable">مستقر</option>
                              <option value="up">صاعد 📈</option>
                              <option value="down">هابط 📉</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-stone-400 block font-bold">اسم الدولة</label>
                            <input
                              type="text"
                              placeholder="الكويت"
                              value={newCurrency.country}
                              onChange={(e) => setNewCurrency({ ...newCurrency, country: e.target.value })}
                              className="w-full bg-stone-950 border border-stone-800 rounded-lg py-1.5 px-2 text-xs text-white"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
                        <button
                          type="submit"
                          className="bg-amber-300 hover:bg-amber-400 text-stone-950 font-black px-4 py-1.5 rounded-lg text-[10px]"
                        >
                          إضافة وحفظ
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Edit Currency Sheet (Overlay) */}
                <AnimatePresence>
                  {editingCurrency && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-stone-950/95 z-40 p-4 flex flex-col justify-center"
                    >
                      <motion.form
                        initial={{ y: 50 }}
                        animate={{ y: 0 }}
                        className="bg-stone-900 border border-amber-500/20 p-5 rounded-2xl space-y-4 shadow-2xl text-right"
                        onSubmit={handleSaveCurrency}
                      >
                        <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                          <span className="text-xs font-black text-amber-300 font-cairo">تحديث السعر الفوري للعملة</span>
                          <button type="button" onClick={() => setEditingCurrency(null)} className="text-stone-400 hover:text-stone-200">
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-3 text-xs">
                          <div className="space-y-1">
                            <label className="text-[10px] text-stone-400 block font-bold">اسم العملة</label>
                            <input
                              type="text"
                              value={editingCurrency.name}
                              onChange={(e) => setEditingCurrency({ ...editingCurrency, name: e.target.value })}
                              className="w-full bg-stone-950 border border-stone-800 rounded-lg py-2 px-3 text-xs text-white"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] text-stone-400 block font-bold">سعر الصرف الجديد (ج.س)</label>
                              <input
                                type="number"
                                value={editingCurrency.price}
                                onChange={(e) => setEditingCurrency({ ...editingCurrency, price: Number(e.target.value) })}
                                className="w-full bg-stone-950 border border-[#850F1D]/50 rounded-lg py-2 px-3 text-xs text-amber-200 font-black"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-stone-400 block font-bold">المؤشر الحالي</label>
                              <select
                                value={editingCurrency.trend}
                                onChange={(e) => setEditingCurrency({ ...editingCurrency, trend: e.target.value as any })}
                                className="w-full bg-stone-950 border border-stone-800 rounded-lg py-2 px-3 text-xs text-stone-300"
                              >
                                <option value="stable">مستقر</option>
                                <option value="up">صاعد 📈</option>
                                <option value="down">هابط 📉</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-3 border-t border-stone-800 justify-end">
                          <button
                            type="button"
                            onClick={() => setEditingCurrency(null)}
                            className="bg-stone-800 hover:bg-stone-750 text-stone-300 px-4 py-2 rounded-xl text-xs"
                          >
                            إلغاء
                          </button>
                          <button
                            type="submit"
                            className="bg-amber-300 hover:bg-amber-400 text-stone-950 font-black px-5 py-2 rounded-xl text-xs"
                          >
                            تحديث وتعميم فوري
                          </button>
                        </div>
                      </motion.form>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Currencies Phone List view */}
                <div className="space-y-2">
                  {currencies
                    .filter(c => 
                      c.name.includes(currencySearch) || 
                      c.code.toLowerCase().includes(currencySearch.toLowerCase())
                    )
                    .map((currency) => (
                      <div 
                        key={currency.id} 
                        className="bg-stone-900 border border-stone-850 hover:border-[#850F1D]/30 p-3 rounded-xl flex items-center justify-between gap-3 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl select-none">{currency.flag}</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-xs text-white leading-none">{currency.name}</span>
                              <span className="text-[9px] font-mono text-stone-500 font-bold">{currency.code}</span>
                            </div>
                            <span className="text-[9px] text-stone-500 block mt-1 font-tajawal">{currency.country || 'عالمية'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-left">
                            <span className="text-xs font-black text-amber-300 block">
                              {currency.price.toLocaleString()} <span className="text-[8px] text-stone-500">ج.س</span>
                            </span>
                            {currency.trend === 'up' && (
                              <span className="text-[8px] text-emerald-400 font-bold block mt-0.5">📈 صاعد</span>
                            )}
                            {currency.trend === 'down' && (
                              <span className="text-[8px] text-rose-400 font-bold block mt-0.5">📉 هابط</span>
                            )}
                            {currency.trend === 'stable' && (
                              <span className="text-[8px] text-stone-500 font-bold block mt-0.5">➖ مستقر</span>
                            )}
                          </div>

                          <div className="flex flex-col gap-1 shrink-0">
                            <button
                              onClick={() => setEditingCurrency(currency)}
                              className="p-1.5 bg-amber-400/5 hover:bg-amber-400/10 text-amber-300 rounded-md transition-colors cursor-pointer"
                              title="تعديل"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCurrency(currency.id)}
                              className="p-1.5 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 rounded-md transition-colors cursor-pointer"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* TAB 3: PRODUCTS (السلع والتموين) */}
            {activeTab === 'products' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Header Title */}
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-black text-white font-cairo">جرد السلع والتموين</h3>
                  <button
                    onClick={() => setIsAddingProduct(!isAddingProduct)}
                    className="bg-[#850F1D] hover:bg-[#720a15] text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    {isAddingProduct ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{isAddingProduct ? 'إغلاق' : 'سلعة جديدة'}</span>
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ابحث عن السلعة..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-850 rounded-xl py-2 px-3 pr-9 text-xs text-stone-200 focus:outline-hidden focus:border-amber-500/40 text-right"
                  />
                  <Search className="w-4 h-4 text-stone-500 absolute right-3 top-2.5" />
                </div>

                {/* Add Product Embedded form */}
                <AnimatePresence>
                  {isAddingProduct && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-stone-900 border border-amber-500/20 p-4 rounded-xl space-y-3"
                      onSubmit={handleCreateProduct}
                    >
                      <span className="text-[10px] font-black text-amber-300 font-cairo block border-b border-stone-800 pb-1.5">إضافة سلعة تموينية جديدة</span>
                      
                      <div className="space-y-2.5 text-xs">
                        <div className="space-y-1">
                          <label className="text-[9px] text-stone-400 block font-bold">اسم السلعة</label>
                          <input
                            type="text"
                            placeholder="مثال: سكر النيلين (جوال 10 كجم)"
                            value={newProduct.name || ''}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            className="w-full bg-stone-950 border border-stone-800 rounded-lg py-1.5 px-2.5 text-xs text-white"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] text-stone-400 block font-bold">السعر بالفرنك</label>
                            <input
                              type="number"
                              placeholder="مثال: 4500"
                              value={newProduct.price || ''}
                              onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                              className="w-full bg-stone-950 border border-stone-800 rounded-lg py-1.5 px-2.5 text-xs text-white"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-stone-400 block font-bold">وحدة التعبئة</label>
                            <input
                              type="text"
                              placeholder="شوال / كجم / كيس"
                              value={newProduct.unit || ''}
                              onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                              className="w-full bg-stone-950 border border-stone-800 rounded-lg py-1.5 px-2.5 text-xs text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] text-stone-400 block font-bold">التصنيف</label>
                            <select
                              value={newProduct.category || 'groceries'}
                              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as any })}
                              className="w-full bg-stone-950 border border-stone-800 rounded-lg py-1.5 px-2 text-xs text-stone-300"
                            >
                              <option value="groceries">غذائيات عامة</option>
                              <option value="sugar">سكر</option>
                              <option value="rice">أرز</option>
                              <option value="oil">زيوت</option>
                            </select>
                          </div>

                          <div className="space-y-1 flex items-center pt-4">
                            <input
                              type="checkbox"
                              id="isAvailCheckNew"
                              checked={newProduct.isAvailable || false}
                              onChange={(e) => setNewProduct({ ...newProduct, isAvailable: e.target.checked })}
                              className="w-4 h-4 text-[#850F1D] bg-stone-950 border-stone-800 rounded-sm"
                            />
                            <label htmlFor="isAvailCheckNew" className="text-[10px] text-stone-300 font-bold mr-1.5">متوفر وجاهز للطلب</label>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] text-stone-400 block font-bold">وصف تفصيلي للمنتج</label>
                          <textarea
                            placeholder="وصف جودة المنتج وتفاصيله للعميل..."
                            value={newProduct.description || ''}
                            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                            className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-white h-12 resize-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
                        <button
                          type="submit"
                          className="bg-amber-300 hover:bg-amber-400 text-stone-950 font-black px-4 py-1.5 rounded-lg text-[10px]"
                        >
                          إضافة المنتج
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Edit Product Overlay Sheet */}
                <AnimatePresence>
                  {editingProduct && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-stone-950/95 z-40 p-4 flex flex-col justify-center"
                    >
                      <motion.form
                        initial={{ y: 50 }}
                        animate={{ y: 0 }}
                        className="bg-stone-900 border border-amber-500/20 p-5 rounded-2xl space-y-4 shadow-2xl text-right"
                        onSubmit={handleSaveProduct}
                      >
                        <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                          <span className="text-xs font-black text-amber-300 font-cairo">تحديث تفاصيل وسعر السلعة</span>
                          <button type="button" onClick={() => setEditingProduct(null)} className="text-stone-400 hover:text-stone-200">
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-3 text-xs">
                          <div className="space-y-1">
                            <label className="text-[10px] text-stone-400 block font-bold">اسم السلعة بالتفصيل</label>
                            <input
                              type="text"
                              value={editingProduct.name}
                              onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                              className="w-full bg-stone-950 border border-stone-800 rounded-lg py-2 px-3 text-xs text-white"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] text-stone-400 block font-bold">السعر بالفرنك</label>
                              <input
                                type="number"
                                value={editingProduct.price}
                                onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                                className="w-full bg-stone-950 border border-stone-800 rounded-lg py-2 px-3 text-xs text-amber-200 font-extrabold"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-stone-400 block font-bold">الوحدة بالتفصيل</label>
                              <input
                                type="text"
                                value={editingProduct.unit}
                                onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                                className="w-full bg-stone-950 border border-stone-800 rounded-lg py-2 px-3 text-xs text-white"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-stone-400 block font-bold">وصف السلعة للعميل</label>
                            <textarea
                              value={editingProduct.description || ''}
                              onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                              className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-white h-16 resize-none"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 pt-3 border-t border-stone-800 justify-end">
                          <button
                            type="button"
                            onClick={() => setEditingProduct(null)}
                            className="bg-stone-800 hover:bg-stone-750 text-stone-300 px-4 py-2 rounded-xl text-xs"
                          >
                            إلغاء
                          </button>
                          <button
                            type="submit"
                            className="bg-amber-300 hover:bg-amber-400 text-stone-950 font-black px-5 py-2 rounded-xl text-xs"
                          >
                            تحديث السعر فورًا
                          </button>
                        </div>
                      </motion.form>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Products Phone List View */}
                <div className="space-y-2">
                  {products
                    .filter(p => p.name.includes(productSearch))
                    .map((product) => (
                      <div 
                        key={product.id} 
                        className="bg-stone-900 border border-stone-850 p-3.5 rounded-xl flex flex-col justify-between hover:border-amber-500/10 transition-colors gap-3"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <span className="bg-amber-500/10 text-amber-300 text-[9px] font-black px-2 py-0.5 rounded-md">
                              {product.categoryAr || 'غذائيات'}
                            </span>
                            <h4 className="font-extrabold text-xs text-white mt-1 leading-snug">{product.name}</h4>
                            <p className="text-[9px] text-stone-500 font-tajawal mt-0.5">الوحدة: {product.unit}</p>
                          </div>

                          <div className="text-left shrink-0">
                            <span className="text-xs font-black text-amber-300 block">{product.price.toLocaleString()} <span className="text-[8px] text-stone-500">فرنك</span></span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-stone-850">
                          {/* Toggle availability instantly */}
                          <button 
                            onClick={() => handleToggleProductAvailability(product.id)}
                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-extrabold transition-all cursor-pointer ${
                              product.isAvailable 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${product.isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                            <span>{product.isAvailable ? 'متوفر بالمخازن' : 'غير متوفر'}</span>
                          </button>

                          {/* Quick Edit Actions */}
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="bg-stone-800 hover:bg-stone-750 p-1.5 text-stone-300 rounded-lg cursor-pointer"
                              title="تعديل السعر والوصف"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="bg-stone-800 hover:bg-[#850F1D]/20 p-1.5 text-stone-300 rounded-lg cursor-pointer"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* TAB 4: ORDERS (طلبات الشراء والـ WhatsApp) */}
            {activeTab === 'orders' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black text-white font-cairo">طلبات العملاء الواردة</h3>
                  <span className="bg-[#850F1D] text-white text-[9px] font-black px-2 py-0.5 rounded-md">
                    {orders.length} طلبات
                  </span>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-4 gap-1 bg-stone-900 p-1 rounded-xl">
                  {['all', 'pending', 'processing', 'completed'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setOrderFilter(f as any)}
                      className={`py-1 rounded-lg text-[9px] font-black cursor-pointer transition-all ${
                        orderFilter === f 
                          ? 'bg-[#850F1D] text-white shadow-xs' 
                          : 'text-stone-400 hover:text-stone-300'
                      }`}
                    >
                      {f === 'all' ? 'الكل' : f === 'pending' ? 'جديد' : f === 'processing' ? 'قيد التحضير' : 'تم'}
                    </button>
                  ))}
                </div>

                {/* Orders List */}
                <div className="space-y-2.5">
                  {orders
                    .filter(o => orderFilter === 'all' || o.status === orderFilter)
                    .map((order) => (
                      <div 
                        key={order.id} 
                        className="bg-stone-900 border border-stone-850 p-3.5 rounded-xl space-y-3"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="font-extrabold text-xs text-white leading-snug">{order.productName}</h4>
                            <p className="text-[10px] text-stone-400 font-mono mt-1 font-bold">
                              {order.customerName} • {order.customerPhone}
                            </p>
                          </div>
                          
                          <div className="text-left shrink-0">
                            <span className="text-xs font-black text-amber-300 block">{order.price}</span>
                            <span className="text-[8px] text-stone-500 block mt-0.5 font-mono">{order.timestamp}</span>
                          </div>
                        </div>

                        {order.notes && (
                          <div className="bg-stone-950/50 p-2 rounded-lg text-[9px] text-stone-400 font-tajawal leading-relaxed border-r-2 border-amber-500/20">
                            {order.notes}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-stone-850">
                          {/* Actions status trigger */}
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'processing')}
                              className={`px-2 py-1 rounded-md text-[8px] font-black transition-all cursor-pointer ${
                                order.status === 'processing' 
                                  ? 'bg-amber-400 text-stone-950 shadow-md' 
                                  : 'bg-stone-800 text-stone-400 hover:text-stone-300'
                              }`}
                            >
                              تجهيز
                            </button>
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                              className={`px-2 py-1 rounded-md text-[8px] font-black transition-all cursor-pointer ${
                                order.status === 'completed' 
                                  ? 'bg-emerald-500 text-stone-950 shadow-md' 
                                  : 'bg-stone-800 text-stone-400 hover:text-stone-300'
                              }`}
                            >
                              تسليم
                            </button>
                          </div>

                          {/* Delete Order logs */}
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-1.5 hover:bg-rose-500/20 text-stone-500 hover:text-rose-400 rounded-md transition-colors cursor-pointer"
                            title="حذف طلب الشراء"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                  {orders.filter(o => orderFilter === 'all' || o.status === orderFilter).length === 0 && (
                    <p className="text-stone-600 text-center py-8 text-[11px] font-tajawal">لا توجد طلبات شراء مسجلة هنا.</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* TAB 5: ALERTS & WHATSAPP SETTINGS (الإعدادات والتواصل) */}
            {activeTab === 'alerts' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* 1. BROADCAST SYSTEM ALERT */}
                <div className="bg-stone-900 border border-stone-850 p-4 rounded-xl space-y-3">
                  <span className="text-[10px] font-black text-amber-300 font-cairo flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-[#850F1D]" />
                    <span>بث إشعار يدوي جديد للجمهور</span>
                  </span>

                  <form onSubmit={handleBroadcastAlert} className="space-y-2 text-xs">
                    <div className="space-y-1">
                      <label className="text-[9px] text-stone-400 font-bold block">عنوان التنبيه</label>
                      <input
                        type="text"
                        placeholder="مثال: إشعار طارئ / تحديث مالي"
                        value={alertTitle}
                        onChange={(e) => setAlertTitle(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg py-1.5 px-2.5 text-xs text-white"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-stone-400 font-bold block">محتوى الإشعار</label>
                      <textarea
                        placeholder="اكتب تفاصيل التنبيه لتعميمه على هواتف المستخدمين فورًا..."
                        value={alertText}
                        onChange={(e) => setAlertText(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-white h-16 resize-none"
                        required
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isBroadcastingAlert}
                      className="w-full bg-amber-300 hover:bg-amber-400 text-stone-950 font-black py-2 rounded-lg text-[10px] flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
                    >
                      {isBroadcastingAlert ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      <span>بث وتعميم الإشعار فوري</span>
                    </button>
                  </form>
                </div>

                {/* 2. WHATSAPP CONFIGURATION */}
                <div className="bg-stone-900 border border-stone-850 p-4 rounded-xl space-y-3">
                  <span className="text-[10px] font-black text-emerald-400 font-cairo flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" />
                    <span>إعدادات الواتساب الرسمية</span>
                  </span>

                  <div className="space-y-2.5 text-xs text-right">
                    <div className="space-y-1">
                      <label className="text-[9px] text-stone-400 block font-bold">رقم مبيعات العميل المعتمد (الأساسي)</label>
                      <input
                        type="text"
                        value={waConfigForm.salesPhone1}
                        onChange={(e) => setWaConfigForm({ ...waConfigForm, salesPhone1: e.target.value })}
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg py-1.5 px-2.5 text-xs text-white font-mono text-left"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-stone-400 block font-bold">رقم الدعم والمساعدة الفنية</label>
                      <input
                        type="text"
                        value={waConfigForm.supportPhone}
                        onChange={(e) => setWaConfigForm({ ...waConfigForm, supportPhone: e.target.value })}
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg py-1.5 px-2.5 text-xs text-white font-mono text-left"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-stone-400 block font-bold">رابط قناة مجتمع أسعار الصرف</label>
                      <input
                        type="text"
                        value={waConfigForm.channelLink}
                        onChange={(e) => setWaConfigForm({ ...waConfigForm, channelLink: e.target.value })}
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg py-1.5 px-2.5 text-xs text-white font-mono text-left"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-stone-400 block font-bold">الرسالة التمهيدية التلقائية للعميل</label>
                      <textarea
                        value={waConfigForm.defaultMessage}
                        onChange={(e) => setWaConfigForm({ ...waConfigForm, defaultMessage: e.target.value })}
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-white h-16 resize-none"
                      />
                    </div>

                    <button
                      onClick={() => handleUpdateWhatsApp('روابط وأرقام الدعم')}
                      className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-extrabold border border-emerald-500/20 py-2 rounded-lg text-[10px] transition-all cursor-pointer"
                    >
                      حفظ وتحديث قنوات الواتساب
                    </button>
                  </div>
                </div>

                {/* Historic Alerts Broadcast logs list */}
                <div className="bg-stone-900 border border-stone-850 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] font-black text-stone-400 font-cairo block">أرشيف الإشعارات الصادرة ({systemAlerts.length})</span>
                  <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
                    {systemAlerts.map(alert => (
                      <div key={alert.id} className="bg-stone-950 p-2.5 rounded-lg flex items-start justify-between gap-2 border border-stone-900">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-amber-300 block">{alert.title}</span>
                          <p className="text-[9px] text-stone-400 font-tajawal leading-relaxed">{alert.text}</p>
                        </div>
                        <button 
                          onClick={() => handleDeleteAlert(alert.id)}
                          className="text-stone-500 hover:text-rose-400 transition-colors shrink-0 p-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </div>

          {/* Bottom App-Style Page Tab Navigation Bar */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-stone-950 border-t border-stone-900 px-2 flex items-center justify-around z-30 select-none">
            {/* Tab 1: الرئيسية (Overview) */}
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex flex-col items-center justify-center gap-1 cursor-pointer flex-1 h-full transition-all ${
                activeTab === 'overview' ? 'text-amber-300 font-black scale-105' : 'text-stone-500 hover:text-stone-400'
              }`}
            >
              <Cpu className="w-4.5 h-4.5 shrink-0" />
              <span className="text-[8.5px] font-black font-tajawal">لوحة الأداء</span>
            </button>

            {/* Tab 2: العملات (Currencies) */}
            <button
              onClick={() => setActiveTab('currencies')}
              className={`flex flex-col items-center justify-center gap-1 cursor-pointer flex-1 h-full transition-all ${
                activeTab === 'currencies' ? 'text-amber-300 font-black scale-105' : 'text-stone-500 hover:text-stone-400'
              }`}
            >
              <Coins className="w-4.5 h-4.5 shrink-0" />
              <span className="text-[8.5px] font-black font-tajawal">العملات والذهب</span>
            </button>

            {/* Tab 3: السلع والتموين (Products) */}
            <button
              onClick={() => setActiveTab('products')}
              className={`flex flex-col items-center justify-center gap-1 cursor-pointer flex-1 h-full transition-all ${
                activeTab === 'products' ? 'text-amber-300 font-black scale-105' : 'text-stone-500 hover:text-stone-400'
              }`}
            >
              <ShoppingBag className="w-4.5 h-4.5 shrink-0" />
              <span className="text-[8.5px] font-black font-tajawal">جرد السلع</span>
            </button>

            {/* Tab 4: الطلبات (Orders) */}
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex flex-col items-center justify-center gap-1 cursor-pointer flex-1 h-full transition-all ${
                activeTab === 'orders' ? 'text-amber-300 font-black scale-105' : 'text-stone-500 hover:text-stone-400'
              }`}
            >
              <ClipboardList className="w-4.5 h-4.5 shrink-0" />
              <span className="text-[8.5px] font-black font-tajawal">الطلبات الواردة</span>
            </button>

            {/* Tab 5: الإعدادات والرسائل (Alerts) */}
            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex flex-col items-center justify-center gap-1 cursor-pointer flex-1 h-full transition-all ${
                activeTab === 'alerts' ? 'text-amber-300 font-black scale-105' : 'text-stone-500 hover:text-stone-400'
              }`}
            >
              <Bell className="w-4.5 h-4.5 shrink-0" />
              <span className="text-[8.5px] font-black font-tajawal">بث وتواصل</span>
            </button>
          </div>

          {/* Bottom simulated home indicator bar on iOS devices */}
          <div className="hidden sm:block absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-stone-700 rounded-full z-40 opacity-50 pointer-events-none" />

        </div>
      </div>

    </div>
  );
}
