import React, { useState } from 'react';
import { Search, ShoppingBag, MessageSquare, ShoppingCart, Filter, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { SafeImage } from './SafeImage';
import { 
  SugarIllustration, 
  FlourIllustration, 
  RiceIllustration, 
  OilIllustration,
  TeaIllustration,
  PastaIllustration
} from './ProductIllustrations';

import { Product as SharedProduct, Currency } from '../types';

interface Product {
  id: string;
  name: string;
  category: 'sugar' | 'flour' | 'rice' | 'oil' | 'groceries' | 'tea';
  categoryLabel: string;
  price: string;
  rawPrice: number;
  available: boolean;
  illustration: React.ReactNode;
  imageUrl?: string;
  description?: string;
  currencySymbol?: string;
}

interface ProductsViewProps {
  onOpenWhatsApp: (productName: string, productPrice: string) => void;
  products?: SharedProduct[];
  onBack?: () => void;
  isDarkMode?: boolean;
  baseCurrency?: string;
  currentFrancRate?: number;
  currencies?: Currency[];
}

export default function ProductsView({ 
  onOpenWhatsApp, 
  products: productsProp, 
  onBack, 
  isDarkMode = false,
  baseCurrency = 'الفرنك التشادي - ج.س',
  currentFrancRate = 5900,
  currencies = []
}: ProductsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Dynamic currency conversion logic
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

  const convertPrice = (rawFcfaPrice: number) => {
    const rate = currentFrancRate || 5900;
    if (activeCurrencyInfo.code === 'XAF') {
      return {
        formatted: rawFcfaPrice.toLocaleString(),
        symbol: 'فرنك'
      };
    } else if (activeCurrencyInfo.code === 'USDT') {
      const priceInSdg = (rawFcfaPrice / 1000) * rate;
      const converted = priceInSdg / activeCurrencyInfo.price;
      return {
        formatted: converted.toFixed(2),
        symbol: 'تتر'
      };
    } else if (activeCurrencyInfo.code === 'EGP') {
      const priceInSdg = (rawFcfaPrice / 1000) * rate;
      const converted = priceInSdg / activeCurrencyInfo.price;
      return {
        formatted: converted.toLocaleString(undefined, { maximumFractionDigits: 1 }),
        symbol: 'جنيه مصري'
      };
    } else if (activeCurrencyInfo.code === 'NGN') {
      const converted = (rawFcfaPrice / 1000) * activeCurrencyInfo.price;
      return {
        formatted: converted.toLocaleString(undefined, { maximumFractionDigits: 0 }),
        symbol: 'نايرا'
      };
    }
    return {
      formatted: rawFcfaPrice.toLocaleString(),
      symbol: 'فرنك'
    };
  };

  // Categories list matching screenshot and adding realistic segments
  const categories = [
    { id: 'all', label: 'الكل' },
    { id: 'groceries', label: 'غذائيات' },
    { id: 'oil', label: 'زيوت' },
    { id: 'sugar', label: 'سكر' },
    { id: 'rice', label: 'أرز' },
  ];

  const getIllustration = (category: string, name: string) => {
    const lowerName = name.toLowerCase();
    if (category === 'sugar' || lowerName.includes('سكر')) return <SugarIllustration className="w-24 h-24" />;
    if (category === 'rice' || lowerName.includes('أرز') || lowerName.includes('ارز')) return <RiceIllustration className="w-24 h-24" />;
    if (category === 'oil' || category === 'oils' || lowerName.includes('زيت')) return <OilIllustration className="w-24 h-24" />;
    if (lowerName.includes('شاي') || lowerName.includes('tea')) return <TeaIllustration className="w-24 h-24" />;
    if (lowerName.includes('مكرونة') || lowerName.includes('معكرونة') || lowerName.includes('pasta')) return <PastaIllustration className="w-24 h-24" />;
    return <FlourIllustration className="w-24 h-24" />; // default
  };

  // Realistic product items with gorgeous custom SVG illustrations
  const products: Product[] = productsProp ? productsProp.map(p => {
    const priceInfo = convertPrice(p.price);
    return {
      id: p.id,
      name: `${p.name} (${p.unit})`,
      category: p.category === 'foodstuffs' ? 'groceries' : (p.category as any),
      categoryLabel: p.categoryAr || 'غذائيات',
      price: priceInfo.formatted,
      rawPrice: p.price,
      available: p.isAvailable,
      illustration: getIllustration(p.category, p.name),
      imageUrl: p.imageUrl,
      description: p.description,
      currencySymbol: priceInfo.symbol
    };
  }) : [
    { 
      id: 'p1', 
      name: 'سكر مستورد فاخر (كيس ١٠ كجم)', 
      category: 'sugar',
      categoryLabel: 'سكر',
      price: convertPrice(4000).formatted, 
      rawPrice: 4000,
      available: true, 
      illustration: <SugarIllustration className="w-24 h-24" /> ,
      currencySymbol: convertPrice(4000).symbol
    },
    { 
      id: 'p2', 
      name: 'دقيق الخيرات فاخر (علبة ١ كجم)', 
      category: 'groceries', 
      categoryLabel: 'غذائيات',
      price: convertPrice(3500).formatted, 
      rawPrice: 3500,
      available: true, 
      illustration: <FlourIllustration className="w-24 h-24" /> ,
      currencySymbol: convertPrice(3500).symbol
    },
    { 
      id: 'p3', 
      name: 'أرز بسمتي درجة أولى (جوال ٥ كجم)', 
      category: 'rice', 
      categoryLabel: 'أرز',
      price: convertPrice(5500).formatted, 
      rawPrice: 5500,
      available: true, 
      illustration: <RiceIllustration className="w-24 h-24" /> ,
      currencySymbol: convertPrice(5500).symbol
    },
    { 
      id: 'p4', 
      name: 'زيت صباح نقي مكرر (زجاجة ١.٥ لتر)', 
      category: 'oil', 
      categoryLabel: 'زيوت',
      price: convertPrice(3000).formatted, 
      rawPrice: 3000,
      available: true, 
      illustration: <OilIllustration className="w-24 h-24" /> ,
      currencySymbol: convertPrice(3000).symbol
    },
    { 
      id: 'p5', 
      name: 'شاي الجزيرة الأخضر الفاخر (٢٥٠ غرام)', 
      category: 'tea', 
      categoryLabel: 'غذائيات',
      price: convertPrice(1500).formatted, 
      rawPrice: 1500,
      available: true, 
      illustration: <TeaIllustration className="w-24 h-24" /> ,
      currencySymbol: convertPrice(1500).symbol
    },
    { 
      id: 'p6', 
      name: 'مكرونة الوادي سريعة التحضير (٥٠٠ غرام)', 
      category: 'groceries', 
      categoryLabel: 'غذائيات',
      price: convertPrice(1000).formatted, 
      rawPrice: 1000,
      available: true, 
      illustration: <PastaIllustration className="w-24 h-24" /> ,
      currencySymbol: convertPrice(1000).symbol
    },
  ];

  // Filter products by search query and category pill selection
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.includes(searchQuery) || product.categoryLabel.includes(searchQuery);
    const matchesCategory = selectedCategory === 'all' || 
                            product.category === selectedCategory ||
                            (selectedCategory === 'groceries' && (product.category === 'groceries' || product.category === 'tea'));
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`w-full h-full overflow-y-auto pb-24 font-sans transition-colors duration-200 ${
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
        <h2 className={`text-base font-black tracking-wide font-cairo ${isDarkMode ? 'text-amber-100' : 'text-[#4A3716]'}`}>المنتجات</h2>
        <div className="w-8 h-8" />
      </div>

      <div className="p-4 space-y-4">
        
        {/* Search Bar matching screenshot */}
        <div className="relative">
          <input
            type="text"
            placeholder="ابحث عن منتج..."
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

        {/* Horizontal Category Toggles matching screenshot */}
        <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar -mx-4 px-4">
          {categories.map((category) => {
            const isActive = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-5 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive 
                    ? (isDarkMode ? 'bg-[#FAF1D6] text-stone-950 border border-[#FAF1D6] shadow-[0_4px_12px_rgba(0,0,0,0.5)]' : 'bg-[#850F1D] text-white shadow-md shadow-[0_4px_12px_rgba(213,165,73,0.35)]') 
                    : (isDarkMode ? 'bg-stone-900/40 text-[#FAF1D6]/70 border border-[#FAF1D6]/10 shadow-md hover:bg-stone-800' : 'bg-white text-stone-600 border border-[#EBC173]/40 shadow-[0_2px_8px_rgba(213,165,73,0.08)] hover:bg-stone-50')
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>

        {/* Products Grid matching screenshot style */}
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map((product) => (
            <motion.div
              layout
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className={`rounded-2xl p-3 border flex flex-col items-center text-center relative group transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-[#1C1811] border-[#FAF1D6]/10 text-stone-100 shadow-[0_4px_16px_rgba(0,0,0,0.4)] hover:shadow-[0_6px_20px_rgba(213,165,73,0.15)] hover:border-[#EBC173]/30' 
                  : 'bg-white border-[#EBC173]/40 text-stone-800 shadow-[0_4px_16px_rgba(213,165,73,0.15)] hover:shadow-[0_6px_20px_rgba(213,165,73,0.22)] hover:border-[#EBC173]/60'
              }`}
            >
              {/* "متوفر" Status badge */}
              {product.available && (
                <span className={`absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-full border ${
                  isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-800 border-emerald-200/30'
                }`}>
                  متوفر
                </span>
              )}

              {/* Illustration container */}
              <div className="w-24 h-24 mb-2 mt-4 group-hover:scale-105 transition-transform duration-200 flex items-center justify-center overflow-hidden">
                {product.imageUrl && (product.imageUrl.startsWith('http') || product.imageUrl.startsWith('data:image')) ? (
                  <SafeImage 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="max-w-full max-h-full object-contain rounded-lg" 
                  />
                ) : (
                  product.illustration
                )}
              </div>

              {/* Title and category label */}
              <div className="space-y-0.5 mb-1 flex-1 flex flex-col justify-center">
                <span className="text-[8px] font-black text-stone-400 uppercase tracking-wider">{product.categoryLabel}</span>
                <h4 className={`font-extrabold text-xs leading-snug px-1 line-clamp-2 ${isDarkMode ? 'text-amber-100' : 'text-stone-800'}`}>
                  {product.name}
                </h4>
                {product.description && (
                  <p className="text-[9px] text-stone-400 font-bold font-tajawal leading-relaxed line-clamp-2 mt-0.5 px-0.5">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Price */}
              <p className={`font-black text-xs mt-1.5 font-sans ${isDarkMode ? 'text-amber-400' : 'text-[#850F1D]'}`}>
                {product.price} <span className={`text-[10px] font-tajawal ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>{product.currencySymbol}</span>
              </p>

              {/* WhatsApp Order Button */}
              <button
                onClick={() => onOpenWhatsApp(product.name, `${product.price} ${product.currencySymbol}`)}
                className={`w-full font-bold text-[10px] py-2.5 rounded-xl mt-3.5 flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isDarkMode 
                    ? 'bg-amber-500 text-stone-950 hover:bg-amber-400 shadow-[0_4px_12px_rgba(245,158,11,0.2)] hover:shadow-[0_6px_16px_rgba(245,158,11,0.35)] border border-amber-500/10' 
                    : 'bg-[#850F1D] text-white hover:bg-[#720a15] shadow-[0_4px_12px_rgba(213,165,73,0.3)] hover:shadow-[0_6px_16px_rgba(213,165,73,0.45)]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>شراء عبر واتساب</span>
              </button>
            </motion.div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="col-span-2 text-center py-16 text-stone-400 text-xs font-bold font-tajawal">
              لا توجد منتجات مطابقة لعملية البحث
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
