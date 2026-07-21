import React, { useState } from 'react';
import { Search, ArrowUpRight, ArrowDownRight, ChevronRight, MessageSquare, Users, Radio, Send, Share2, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

import { Currency as SharedCurrency, WhatsAppConfig } from '../types';

interface Currency {
  id: string;
  name: string;
  code: string;
  flag: string;
  rate: number;
  trend?: 'up' | 'down' | 'stable';
  lastUpdated: string;
  contactPhone?: string;
  officeName?: string;
}

interface PricesViewProps {
  currentFrancRate: number;
  currencies?: SharedCurrency[];
  onBack?: () => void;
  isDarkMode?: boolean;
  whatsAppConfig?: WhatsAppConfig;
}

export default function PricesView({ currentFrancRate, currencies: currenciesProp, onBack, isDarkMode = false, whatsAppConfig }: PricesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const emojiMap: Record<string, string> = {
    'TD': '🇹🇩', 'US': '🇺🇸', 'USDT': '🇺🇸', 'EG': '🇪🇬', 'NGN': '🇳🇬', 'EGP': '🇪🇬'
  };

  const formatActualTime = (id: string, customLastUpdated?: string) => {
    // If the admin edited the currency, display their updated custom string
    if (customLastUpdated && customLastUpdated !== 'الآن' && customLastUpdated !== 'تحديث فوري الآن' && customLastUpdated !== 'آخر تحديث الآن' && customLastUpdated !== 'تمت الإضافة الآن') {
      return customLastUpdated;
    }

    const now = new Date();
    let minutesAgo = 3;
    const cleanId = id.toLowerCase();
    if (cleanId === 'usd' || cleanId === 'usdt' || cleanId === '2') minutesAgo = 7;
    if (cleanId === 'egp' || cleanId === '6') minutesAgo = 42;
    if (cleanId === 'ngn' || cleanId === '9') minutesAgo = 11;

    const updateTime = new Date(now.getTime() - minutesAgo * 60 * 1000);
    const timeString = updateTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    return `آخر تحديث: اليوم، الساعة ${timeString}`;
  };

  // Target currency codes we want to support
  const targetCodes = ['XAF', 'USD', 'USDT', 'EGP', 'NGN'];

  // Currencies list matching exactly the requested currencies and details
  const currencies: Currency[] = currenciesProp 
    ? currenciesProp
        .filter(c => targetCodes.includes(c.code))
        .map(c => {
          let name = c.name;
          if (c.code === 'USD' || c.code === 'USDT') name = 'تتر (USDT)';
          else if (c.code === 'EGP') name = 'الجنيه المصري (مقابل السوداني)';
          else if (c.code === 'NGN') name = 'النايرا النيجيرية (مقابل الفرنك)';
          else if (c.code === 'XAF') name = 'الفرنك التشادي';

          return {
            id: c.id,
            name,
            code: c.code === 'USD' ? 'USDT' : c.code,
            flag: emojiMap[c.flag] || c.flag || '🏳️',
            rate: (c.id === 'xaf' || c.id === 'rate-xaf' || c.code === 'XAF') ? currentFrancRate : c.price,
            trend: c.trend,
            lastUpdated: formatActualTime(c.id, c.lastUpdated),
            contactPhone: c.contactPhone,
            officeName: c.officeName
          };
        }) 
    : [
        { id: '1', name: 'الفرنك التشادي', code: 'XAF', flag: '🇹🇩', rate: currentFrancRate, trend: 'stable', lastUpdated: formatActualTime('1'), contactPhone: '+249912345678', officeName: 'مكتب تحويلات العاصمة والفرنك' },
        { id: '2', name: 'تتر (USDT)', code: 'USDT', flag: '🇺🇸', rate: 3200, trend: 'up', lastUpdated: formatActualTime('2'), contactPhone: '+249923456789', officeName: 'مكتب الكريبتو والتتر السريع' },
        { id: '6', name: 'الجنيه المصري (مقابل السوداني)', code: 'EGP', flag: '🇪🇬', rate: 65, trend: 'stable', lastUpdated: formatActualTime('6'), contactPhone: '+249934567890', officeName: 'مكتب الصرف المصري والقاهرة' },
        { id: '9', name: 'النايرا النيجيرية (مقابل الفرنك)', code: 'NGN', flag: '🇳🇬', rate: 2500, trend: 'stable', lastUpdated: formatActualTime('9'), contactPhone: '+249945678901', officeName: 'مكتب تحويلات النايرا والربط الإفريقي' },
      ];

  // Filter currencies based on search input
  const filteredCurrencies = currencies.filter(c => 
    c.name.includes(searchQuery) || 
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [calcAmount, setCalcAmount] = useState<string>('1');
  const [calcSelectedCurrencyId, setCalcSelectedCurrencyId] = useState<string>(() => {
    return currencies[0]?.id || '1';
  });
  const [calcDirection, setCalcDirection] = useState<'toSDG' | 'fromSDG'>('toSDG');

  const selectedCurrency = currencies.find(c => c.id === calcSelectedCurrencyId) || currencies[0];
  const parsedAmount = parseFloat(calcAmount) || 0;
  
  let calcResult = 0;
  if (selectedCurrency) {
    if (selectedCurrency.code === 'NGN') {
      if (calcDirection === 'toSDG') {
        // NGN to Franc: (amount / rate) * 1000
        calcResult = selectedCurrency.rate > 0 ? (parsedAmount / selectedCurrency.rate) * 1000 : 0;
      } else {
        // Franc to NGN: (amount / 1000) * rate
        calcResult = (parsedAmount / 1000) * selectedCurrency.rate;
      }
    } else {
      calcResult = calcDirection === 'toSDG' 
        ? parsedAmount * selectedCurrency.rate 
        : (selectedCurrency.rate > 0 ? parsedAmount / selectedCurrency.rate : 0);
    }
  }

  return (
    <div className={`w-full h-full overflow-y-auto pb-24 font-sans relative transition-colors duration-200 ${
      isDarkMode ? 'bg-[#12100C] text-[#FAF7F0]' : 'bg-[#FAF7F0] text-stone-800'
    }`} dir="rtl">
      
      {/* Sticky Header with Golden Currency Card Theme */}
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
                ? 'bg-stone-900/60 hover:bg-stone-800/60 border-[#D5A549]/20 text-amber-300' 
                : 'bg-white/45 hover:bg-white/60 border-white/20 text-[#4A3716] shadow-[0_2px_8px_rgba(213,165,73,0.15)]'
            }`}
            aria-label="Back"
          >
            <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-amber-300' : 'text-[#4A3716]'}`} />
          </button>
        ) : (
          <div className="w-8 h-8" />
        )}
        <h2 className={`text-base font-black tracking-wide font-cairo ${isDarkMode ? 'text-amber-100' : 'text-[#4A3716]'}`}>الأسعار</h2>
        <div className="w-8 h-8" />
      </div>

      <div className="p-4 space-y-4">
        
        {/* Search Bar matching screenshot */}
        <div className="relative">
          <input
            type="text"
            placeholder="ابحث عن عملة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full border rounded-xl py-3 pr-10 pl-4 text-xs font-medium focus:outline-hidden focus:ring-1 transition-all duration-200 ${
              isDarkMode 
                ? 'bg-stone-900/60 border-[#D5A549]/20 text-amber-100 placeholder-stone-500 focus:ring-[#D5A549] focus:border-[#D5A549] shadow-[0_4px_16px_rgba(0,0,0,0.3)]' 
                : 'bg-white border-[#EBC173]/50 text-stone-800 focus:ring-[#D5A549] focus:border-[#D5A549] shadow-[0_4px_16px_rgba(213,165,73,0.12)]'
            }`}
          />
          <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5" />
        </div>

        {/* Interactive Currency Calculator */}
        <div className={`rounded-2xl p-4 border transition-all duration-200 ${
          isDarkMode 
            ? 'bg-[#1C1811] border-[#FAF1D6]/10 text-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.4)]' 
            : 'bg-white border-[#EBC173]/40 text-stone-800 shadow-[0_4px_20px_rgba(213,165,73,0.12)]'
        }`}>
          <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-stone-200/20">
            <h3 className={`text-xs font-black font-cairo flex items-center gap-1.5 ${isDarkMode ? 'text-amber-400' : 'text-[#850F1D]'}`}>
              <span>🧮</span>
              <span>حاسبة تحويل العملات المباشرة</span>
            </h3>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setCalcDirection('toSDG')}
                className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all cursor-pointer ${
                  calcDirection === 'toSDG'
                    ? (isDarkMode ? 'bg-[#D5A549] text-stone-950 font-bold' : 'bg-[#850F1D] text-white font-bold')
                    : (isDarkMode ? 'bg-stone-900 text-stone-400 hover:text-stone-300' : 'bg-stone-100 text-stone-500 hover:bg-stone-200')
                }`}
              >
                {selectedCurrency?.code === 'NGN' ? 'إلى الفرنك' : 'إلى ج.س'}
              </button>
              <button
                type="button"
                onClick={() => setCalcDirection('fromSDG')}
                className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all cursor-pointer ${
                  calcDirection === 'fromSDG'
                    ? (isDarkMode ? 'bg-[#D5A549] text-stone-950 font-bold' : 'bg-[#850F1D] text-white font-bold')
                    : (isDarkMode ? 'bg-stone-900 text-stone-400 hover:text-stone-300' : 'bg-stone-100 text-stone-500 hover:bg-stone-200')
                }`}
              >
                {selectedCurrency?.code === 'NGN' ? 'من الفرنك' : 'من ج.س'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-3 items-end">
            {/* Amount input */}
            <div className="col-span-5 space-y-1">
              <label className="text-[10px] font-bold text-stone-400 block font-tajawal">المبلغ</label>
              <input
                type="number"
                min="0"
                value={calcAmount}
                onChange={(e) => setCalcAmount(e.target.value)}
                className={`w-full border rounded-xl py-2 px-3 text-xs font-black text-center focus:outline-hidden transition-all ${
                  isDarkMode 
                    ? 'bg-stone-900 border-[#D5A549]/20 text-amber-100 focus:ring-1 focus:ring-[#D5A549]' 
                    : 'bg-stone-50 border-stone-200 text-stone-800 focus:ring-1 focus:ring-[#850F1D]'
                }`}
              />
            </div>

            {/* Currency selector */}
            <div className="col-span-7 space-y-1">
              <label className="text-[10px] font-bold text-stone-400 block font-tajawal">العملة المقابلة</label>
              <select
                value={calcSelectedCurrencyId}
                onChange={(e) => setCalcSelectedCurrencyId(e.target.value)}
                className={`w-full border rounded-xl py-2 px-3 text-xs font-black focus:outline-hidden transition-all ${
                  isDarkMode 
                    ? 'bg-stone-900 border-[#D5A549]/20 text-amber-100 focus:ring-1 focus:ring-[#D5A549]' 
                    : 'bg-stone-50 border-stone-200 text-stone-800 focus:ring-1 focus:ring-[#850F1D]'
                }`}
              >
                {currencies.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.flag} {c.code === 'XAF' ? 'ألف فرنك تشادي' : c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Result Card */}
          <div className={`mt-4 p-3 rounded-xl border flex items-center justify-between transition-colors ${
            isDarkMode 
              ? 'bg-[#2A2318]/40 border-[#FAF1D6]/10 text-amber-200' 
              : 'bg-gradient-to-r from-amber-50 to-amber-100/40 border-[#EBC173]/30 text-stone-800'
          }`}>
            <div className="space-y-0.5">
              <span className="text-[9px] font-extrabold text-stone-400 font-tajawal">النتيجة التقريبية للصرف</span>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-xl font-black ${isDarkMode ? 'text-amber-400' : 'text-[#850F1D]'}`}>
                  {calcResult.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
                <span className="text-[9px] font-bold text-stone-400 font-tajawal">
                  {selectedCurrency?.code === 'NGN'
                    ? (calcDirection === 'toSDG' ? 'فرنك تشادي' : 'نايرا نيجيرية')
                    : (calcDirection === 'toSDG' ? 'جنيه سوداني' : selectedCurrency?.code || '')}
                </span>
              </div>
            </div>
            
            <div className="text-[10px] font-bold text-stone-400 text-left font-tajawal flex flex-col items-end">
              <span>سعر الصرف المعتمد</span>
              <span className={`font-black font-mono text-xs ${isDarkMode ? 'text-amber-300' : 'text-[#850F1D]'}`}>
                {selectedCurrency?.code === 'NGN'
                  ? `١,٠٠٠ فرنك = ${selectedCurrency.rate.toLocaleString()} ₦`
                  : `${selectedCurrency ? selectedCurrency.rate.toLocaleString() : '0'} ج.س`}
              </span>
            </div>
          </div>
        </div>

        {/* Currencies List */}
        <div className="space-y-3">
          {filteredCurrencies.map((currency) => {
            const phone = currency.contactPhone || whatsAppConfig?.salesPhone1 || '+249912345678';
            const cleanPhone = phone.replace(/[^0-9]/g, '');
            const waMsg = `مرحباً، أريد الاستفسار أو التحويل بالنسبة لعملة ${currency.name} (${currency.code}) بسعر الصرف المعتمد اليوم (${currency.rate.toLocaleString()}). أرجو تزويدي بتفاصيل الحساب أو المكتب.`;
            const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMsg)}`;

            return (
              <div
                key={currency.id}
                className={`rounded-2xl p-4 border transition-all duration-200 space-y-3 ${
                  isDarkMode 
                    ? 'bg-[#1C1811] border-[#FAF1D6]/10 text-stone-100 shadow-[0_4px_16px_rgba(0,0,0,0.4)] hover:border-[#EBC173]/30' 
                    : 'bg-white border-[#EBC173]/40 text-stone-800 shadow-[0_4px_16px_rgba(213,165,73,0.15)] hover:border-[#EBC173]/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Custom circular flag background */}
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center border text-2xl shadow-inner select-none leading-none shrink-0 ${
                      isDarkMode 
                        ? 'bg-gradient-to-br from-[#332A18]/50 to-[#1B160E]/30 border-[#D5A549]/20' 
                        : 'bg-gradient-to-br from-[#FAF1D6]/30 to-[#EBC173]/10 border-[#EBC173]/30'
                    }`}>
                      {currency.flag}
                    </div>
                    
                    <div className="space-y-0.5">
                      <h4 className={`font-black text-xs ${isDarkMode ? 'text-amber-100' : 'text-stone-800'}`}>
                        {currency.code === 'XAF' ? 'ألف فرنك تشادي' : currency.name}
                      </h4>
                      {currency.officeName && (
                        <p className="text-[10px] font-bold text-amber-500/90 font-tajawal flex items-center gap-1">
                          <span>🏢</span>
                          <span>{currency.officeName}</span>
                        </p>
                      )}
                      <p className="text-[9px] text-stone-400 font-bold font-tajawal">{currency.lastUpdated}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-left">
                    <div className="space-y-0.5">
                      <div className="flex items-baseline justify-end gap-1">
                        <span className={`font-black text-base leading-none ${isDarkMode ? 'text-amber-300' : 'text-[#850F1D]'}`}>
                          {currency.rate.toLocaleString()}
                        </span>
                        <span className={`text-[9px] font-bold font-tajawal ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                          {currency.code === 'NGN' ? 'نايرا' : 'ج.س'}
                        </span>
                      </div>
                      <span className={`text-[9px] font-black ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                        {currency.code === 'NGN' ? 'لكل ١,٠٠٠ فرنك' : `${currency.code} / ١`}
                      </span>
                    </div>

                    {/* Trend Arrows matching screenshot */}
                    {currency.trend === 'up' && (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        <ArrowUpRight className="w-3.5 h-3.5 stroke-[3px]" />
                      </div>
                    )}
                    {currency.trend === 'down' && (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        isDarkMode ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600'
                      }`}>
                        <ArrowDownRight className="w-3.5 h-3.5 stroke-[3px]" />
                      </div>
                    )}
                    {currency.trend === 'stable' && (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        isDarkMode ? 'bg-stone-800 text-stone-500' : 'bg-stone-50 text-stone-400'
                      }`}>
                        <div className={`w-2 h-0.5 rounded-full ${isDarkMode ? 'bg-stone-500' : 'bg-stone-400'}`} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Direct WhatsApp Contact Button - Replacing Copy Price */}
                <div className="pt-2 border-t border-stone-200/15 flex items-center justify-between gap-2">
                  <div className="text-[10px] text-stone-400 font-bold font-tajawal flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>مكتب التحويلات مباشر</span>
                  </div>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs active:scale-95 transition-all"
                  >
                    <MessageSquare className="w-3 h-3 fill-current" />
                    <span>عبر الواتساب</span>
                  </a>
                </div>
              </div>
            );
          })}

          {filteredCurrencies.length === 0 && (
            <div className="text-center py-12 text-stone-400 text-xs font-bold font-tajawal">
              لا توجد نتائج مطابقة لـ "{searchQuery}"
            </div>
          )}
        </div>

        {/* Section: Badal Communities & Channels */}
        <div className={`mt-8 p-4 rounded-2xl border transition-all ${
          isDarkMode 
            ? 'bg-gradient-to-br from-[#1B160E] via-[#2A2215] to-[#1B160E] border-[#D5A549]/30 text-stone-100 shadow-xl' 
            : 'bg-gradient-to-br from-amber-500/10 via-amber-100/40 to-stone-100 border-[#EBC173]/50 text-stone-800 shadow-md'
        }`}>
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-amber-500/20">
            <Users className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className={`text-xs font-black font-cairo ${isDarkMode ? 'text-amber-200' : 'text-[#850F1D]'}`}>
                {whatsAppConfig?.communityTitle || 'مجتمعات بَدَلْ وقنوات الصرف المباشر'}
              </h3>
              <p className="text-[10px] text-stone-400 font-tajawal font-bold">
                {whatsAppConfig?.communityDescription || 'انضم إلى مجتمعاتنا الرسمية للحصول على آخر التحديثات فوراً والتواصل المباشر مع مكاتب التحويل'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 mt-3">
            {(whatsAppConfig?.communityLinks && whatsAppConfig.communityLinks.length > 0) ? (
              whatsAppConfig.communityLinks.map(link => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all active:scale-98 ${
                    isDarkMode 
                      ? 'bg-[#120E0A] hover:bg-[#1A150F] border-[#D5A549]/20 text-stone-200' 
                      : 'bg-white hover:bg-amber-50/50 border-[#EBC173]/40 text-stone-800 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                      {link.platform === 'whatsapp_group' && <Users className="w-4 h-4" />}
                      {link.platform === 'whatsapp_channel' && <Radio className="w-4 h-4" />}
                      {link.platform === 'telegram' && <Send className="w-4 h-4" />}
                      {link.platform === 'facebook' && <Share2 className="w-4 h-4" />}
                      {link.platform === 'phone' && <MessageSquare className="w-4 h-4" />}
                      {(!link.platform || link.platform === 'other') && <ExternalLink className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold">{link.title}</span>
                        {link.badgeText && (
                          <span className="bg-amber-500/20 text-amber-500 text-[8px] font-black px-1.5 py-0.5 rounded-md">
                            {link.badgeText}
                          </span>
                        )}
                      </div>
                      {link.description && (
                        <p className="text-[9px] text-stone-400 font-tajawal font-bold mt-0.5">{link.description}</p>
                      )}
                    </div>
                  </div>

                  <span className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-2xs shrink-0">
                    <span>انضمام</span>
                    <ChevronRight className="w-3 h-3 rotate-180" />
                  </span>
                </a>
              ))
            ) : (
              <>
                <a
                  href={whatsAppConfig?.groupLink || 'https://chat.whatsapp.com/BadalGroup'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    isDarkMode ? 'bg-[#120E0A] border-[#D5A549]/20 text-stone-200' : 'bg-white border-[#EBC173]/40 text-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold">مجتمع الواتساب الفوري</span>
                      <p className="text-[9px] text-stone-400 font-tajawal">قروب التجار والمكاتب المعتمدة</p>
                    </div>
                  </div>
                  <span className="bg-emerald-600 text-white font-black text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <span>انضم الآن</span>
                    <ChevronRight className="w-3 h-3 rotate-180" />
                  </span>
                </a>

                <a
                  href={whatsAppConfig?.channelLink || 'https://whatsapp.com/channel/0029VaBadal'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    isDarkMode ? 'bg-[#120E0A] border-[#D5A549]/20 text-stone-200' : 'bg-white border-[#EBC173]/40 text-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                      <Radio className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold">قناة بَدَلْ الرسمية للأسعار</span>
                      <p className="text-[9px] text-stone-400 font-tajawal">تنبيهات فورية بأسعار الصرف</p>
                    </div>
                  </div>
                  <span className="bg-emerald-600 text-white font-black text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <span>متابعة القناة</span>
                    <ChevronRight className="w-3 h-3 rotate-180" />
                  </span>
                </a>
              </>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
