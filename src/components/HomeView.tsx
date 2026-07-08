import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, RefreshCw, Copy, Check, MessageSquare, ShoppingBag, TrendingUp, HelpCircle, Phone, ArrowLeft, Clock, CheckSquare, ShieldAlert } from 'lucide-react';
import BadalLogo from './BadalLogo';
import { SugarIllustration, FlourIllustration } from './ProductIllustrations';
import { playNotificationSound } from '../utils/audio';

import { Product as SharedProduct, WhatsAppConfig, SystemAlert } from '../types';

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
  onMarkAlertAsRead
}: HomeViewProps) {
  const [copied, setCopied] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

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
    notifications.forEach(n => {
      if (!readAlertIds.includes(n.id) && onMarkAlertAsRead) {
        onMarkAlertAsRead(n.id);
      }
    });
  };

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

  const handleCopyPrice = () => {
    navigator.clipboard.writeText(`${currentFrancRate} ج.س`);
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
    <div className="w-full h-full bg-[#FAF7F0] overflow-y-auto pb-24 text-stone-800 font-sans relative select-none" dir="rtl">
      
      {/* Top Header */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-20 px-5 py-3 flex items-center justify-between border-b border-stone-200/40">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center border border-amber-200 shadow-xs">
            <BadalLogo size={28} withTag={false} />
          </div>
          <div>
            <h2 className="text-base font-black text-[#850F1D] tracking-wide leading-tight">BADAL</h2>
            <p className="text-[10px] text-stone-500 font-medium font-tajawal">{todayArabic}</p>
          </div>
        </div>

        {/* Notifications Button */}
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200/70 text-stone-600 flex items-center justify-center transition-all cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-mono text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md animate-bounce border border-white">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      <div className="p-4 space-y-5">
        
        {/* Main Golden Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FAF1D6] via-[#EBC173] to-[#D5A549] text-[#4A3716] p-5 shadow-md border border-[#E9C37A] group">
          
          {/* Subtle graphic background curve */}
          <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
              <path d="M 0 50 Q 50 10 100 50 T 100 100 L 0 100 Z" fill="#FFF" />
            </svg>
          </div>

          <div className="relative flex justify-between items-start z-10">
            {/* Currency Name & Flag */}
            <div className="flex items-center gap-2">
              {/* Chad Flag */}
              <span className="text-3xl shadow-sm filter drop-shadow-xs leading-none">🇹🇩</span>
              <div className="space-y-0.5">
                <span className="text-xs text-[#5D461D] font-bold font-tajawal">العملة النشطة</span>
                <h3 className="text-sm font-black text-[#3D2C0E]">الفرنك التشادي</h3>
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
                  <span className="text-xs font-bold text-[#5D461D] font-tajawal bg-amber-50/60 border border-amber-200/20 px-2.5 py-0.5 rounded-md mb-1.5 shadow-2xs">ألف فرنك</span>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-black text-[#850F1D] tracking-tight">{currentFrancRate}</span>
                    <span className="text-sm font-bold text-[#5D461D] font-tajawal">ج.س / ١</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Inside Card Actions */}
          <div className="relative flex gap-3 z-10">
            {/* Refresh Button */}
            <button
              onClick={onUpdateFrancRate}
              disabled={isUpdatingRate}
              className="flex-1 bg-white hover:bg-[#FFFDF9] active:bg-[#F2EDE0] text-[#3D2C0E] font-bold text-xs py-2.5 px-3 rounded-xl shadow-xs border border-[#DFB24F]/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUpdatingRate ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </button>

            {/* Copy Price Button */}
            <button
              onClick={handleCopyPrice}
              className="flex-1 bg-white hover:bg-[#FFFDF9] active:bg-[#F2EDE0] text-[#3D2C0E] font-bold text-xs py-2.5 px-3 rounded-xl shadow-xs border border-[#DFB24F]/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#3D2C0E]" />}
              <span>{copied ? 'تم النسخ!' : 'نسخ السعر'}</span>
            </button>
          </div>

        </div>

        {/* "خدمات سريعة" Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-stone-700 tracking-wide">خدمات سريعة</h3>
          
          <div className="grid grid-cols-4 gap-3">
            {/* Prices tab (الأسعار) */}
            <button 
              onClick={() => onNavigate('prices')}
              className="bg-white hover:bg-stone-50 active:bg-amber-50/50 p-2.5 rounded-xl border border-stone-200/50 shadow-xs flex flex-col items-center gap-2 transition-all group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-[#850F1D] flex items-center justify-center group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/>
                </svg>
              </div>
              <span className="text-[10px] font-extrabold text-stone-600">الأسعار</span>
            </button>

            {/* Products tab (المنتجات) */}
            <button 
              onClick={() => onNavigate('products')}
              className="bg-white hover:bg-stone-50 active:bg-amber-50/50 p-2.5 rounded-xl border border-stone-200/50 shadow-xs flex flex-col items-center gap-2 transition-all group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-[#850F1D] flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold text-stone-600">المنتجات</span>
            </button>

            {/* Market trend chart (السوق) */}
            <button 
              onClick={onOpenMarket}
              className="bg-white hover:bg-stone-50 active:bg-amber-50/50 p-2.5 rounded-xl border border-stone-200/50 shadow-xs flex flex-col items-center gap-2 transition-all group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-[#850F1D] flex items-center justify-center group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold text-stone-600">السوق</span>
            </button>

            {/* Contact us (تواصل معنا) */}
            <button 
              onClick={() => setShowContactModal(true)}
              className="bg-white hover:bg-stone-50 active:bg-amber-50/50 p-2.5 rounded-xl border border-stone-200/50 shadow-xs flex flex-col items-center gap-2 transition-all group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-[#850F1D] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Phone className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold text-stone-600 text-center">تواصل معنا</span>
            </button>
          </div>
        </div>

        {/* "المنتجات الأكثر طلباً" Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-stone-700 tracking-wide">المنتجات الأكثر طلباً</h3>
            <button 
              onClick={() => onNavigate('products')}
              className="text-xs font-extrabold text-[#850F1D] hover:underline cursor-pointer"
            >
              عرض الكل
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            
            {/* Sugar Card */}
            <div className="bg-white rounded-2xl p-3 border border-stone-200/40 shadow-xs flex flex-col items-center text-center group">
              <div className="w-24 h-24 mb-2 group-hover:scale-105 transition-transform duration-200">
                <SugarIllustration />
              </div>
              <h4 className="font-extrabold text-xs text-stone-800">{sugarName}</h4>
              <p className="text-[#850F1D] font-black text-xs mt-1">{sugarPrice} {sugarCurrency}</p>
              
              <button 
                onClick={() => onOpenWhatsApp(sugarName, `${sugarPrice} ${sugarCurrency}`)}
                className="w-full bg-[#850F1D] hover:bg-[#720a15] text-white font-bold text-[10px] py-2 rounded-xl mt-3 flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>شراء عبر واتساب</span>
              </button>
            </div>

            {/* Flour Card */}
            <div className="bg-white rounded-2xl p-3 border border-stone-200/40 shadow-xs flex flex-col items-center text-center group">
              <div className="w-24 h-24 mb-2 group-hover:scale-105 transition-transform duration-200">
                <FlourIllustration />
              </div>
              <h4 className="font-extrabold text-xs text-stone-800">{flourName}</h4>
              <p className="text-[#850F1D] font-black text-xs mt-1">{flourPrice} {flourCurrency}</p>
              
              <button 
                onClick={() => onOpenWhatsApp(flourName, `${flourPrice} ${flourCurrency}`)}
                className="w-full bg-[#850F1D] hover:bg-[#720a15] text-white font-bold text-[10px] py-2 rounded-xl mt-3 flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
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
              className="bg-white w-4/5 h-full shadow-2xl flex flex-col p-4 z-40 relative"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-3">
                <h3 className="font-black text-sm text-[#850F1D] flex items-center gap-1.5">
                  <Bell className="w-4.5 h-4.5" />
                  <span>التنبيهات العاجلة</span>
                  {unreadCount > 0 && (
                    <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCount} جديد
                    </span>
                  )}
                </h3>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="p-1 hover:bg-stone-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-4.5 h-4.5 text-stone-500" />
                </button>
              </div>

              {/* Advanced controls: Sync & Mark All Read */}
              <div className="flex items-center justify-between gap-1 mb-3">
                {/* Time filter tabs */}
                <div className="flex bg-stone-100 p-0.5 rounded-lg border border-stone-200/50">
                  <button
                    onClick={() => setTimeFilter('all')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold font-tajawal transition-all ${
                      timeFilter === 'all' 
                        ? 'bg-white text-stone-800 shadow-xs' 
                        : 'text-stone-500 hover:text-stone-700'
                    }`}
                  >
                    الكل
                  </button>
                  <button
                    onClick={() => setTimeFilter('hour')}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold font-tajawal transition-all flex items-center gap-1 ${
                      timeFilter === 'hour' 
                        ? 'bg-[#850F1D] text-white shadow-xs' 
                        : 'text-stone-500 hover:text-stone-700'
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
                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-600 hover:text-amber-800 border border-stone-200/40 hover:border-amber-200 flex items-center justify-center transition-all cursor-pointer"
                      title="تحديد الكل كمقروء"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Manual Sync Cloud alerts */}
                  <button
                    onClick={handleSyncAlerts}
                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-all cursor-pointer"
                    title="مزامنة الإشعارات"
                    disabled={isSyncingAlerts}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAlerts ? 'animate-spin text-[#850F1D]' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Syncing status visual cue */}
              {isSyncingAlerts && (
                <div className="mb-3 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span className="text-[10px] font-bold text-amber-700 font-tajawal">جاري المزامنة مع سحابة بدل...</span>
                </div>
              )}

              {/* Alerts List */}
              <div className="space-y-2.5 flex-1 overflow-y-auto no-scrollbar pb-4">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <ShieldAlert className="w-8 h-8 text-stone-300 mb-2" />
                    <h4 className="text-[11px] font-bold text-stone-700">لا توجد تنبيهات عاجلة</h4>
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
                            ? 'bg-amber-50/55 border-amber-200/60 shadow-xs' 
                            : 'bg-stone-50/80 border-stone-200/30 opacity-75'
                        }`}
                      >
                        {/* Interactive hover glow */}
                        {isUnread && (
                          <div className="absolute inset-y-0 right-0 w-1 bg-[#850F1D]" />
                        )}
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-extrabold text-[11px] text-stone-800">{notif.title}</h4>
                          <span className="text-[8px] text-stone-400 font-bold font-tajawal shrink-0">{notif.time || 'الآن'}</span>
                        </div>
                        <p className="text-[10px] text-stone-600 mt-1 leading-relaxed font-tajawal">{notif.text}</p>
                        {isUnread && (
                          <div className="flex items-center gap-1 mt-1.5">
                            <span className="w-1.5 h-1.5 bg-[#850F1D] rounded-full animate-pulse" />
                            <span className="text-[8px] font-bold text-[#850F1D] font-tajawal">جديد - اضغط لتحديد كمقروء</span>
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
                className="w-full bg-[#850F1D] hover:bg-[#720a15] active:scale-98 text-white text-xs font-bold py-2.5 rounded-xl mt-2 transition-all shadow-md cursor-pointer"
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
              className="bg-white w-full max-w-xs rounded-2xl overflow-hidden shadow-2xl p-4 text-center border border-amber-200/30"
            >
              <HelpCircle className="w-12 h-12 text-[#850F1D] mx-auto mb-3" />
              <h3 className="font-black text-sm text-stone-800 mb-1">تواصل مع الدعم الفني لـ بدل</h3>
              <p className="text-[11px] text-stone-500 font-medium leading-relaxed mb-4">
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
                  className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>اتصال هاتفي مباشر</span>
                </a>
              </div>

              <button 
                onClick={() => setShowContactModal(false)}
                className="text-[11px] font-bold text-stone-500 hover:text-stone-800 hover:underline transition-colors mt-4 block mx-auto"
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
