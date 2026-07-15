import React, { useState } from 'react';
import { Search, ShoppingBag, MessageSquare, ShoppingCart, Filter, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { 
  SugarIllustration, 
  FlourIllustration, 
  RiceIllustration, 
  OilIllustration,
  TeaIllustration,
  PastaIllustration
} from './ProductIllustrations';

import { Product as SharedProduct } from '../types';

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
}

export default function ProductsView({ onOpenWhatsApp, products: productsProp, onBack, isDarkMode = false }: ProductsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
  const products: Product[] = productsProp ? productsProp.map(p => ({
    id: p.id,
    name: `${p.name} (${p.unit})`,
    category: p.category === 'foodstuffs' ? 'groceries' : (p.category as any),
    categoryLabel: p.categoryAr || 'غذائيات',
    price: p.price.toLocaleString(),
    rawPrice: p.price,
    available: p.isAvailable,
    illustration: getIllustration(p.category, p.name),
    imageUrl: p.imageUrl,
    description: p.description,
    currencySymbol: p.currencySymbol || 'فرنك'
  })) : [
    { 
      id: 'p1', 
      name: 'سكر مستورد فاخر (كيس ١٠ كجم)', 
      category: 'sugar',
      categoryLabel: 'سكر',
      price: '4,000', 
      rawPrice: 4000,
      available: true, 
      illustration: <SugarIllustration className="w-24 h-24" /> ,
      currencySymbol: 'فرنك'
    },
    { 
      id: 'p2', 
      name: 'دقيق الخيرات فاخر (علبة ١ كجم)', 
      category: 'groceries', 
      categoryLabel: 'غذائيات',
      price: '3,500', 
      rawPrice: 3500,
      available: true, 
      illustration: <FlourIllustration className="w-24 h-24" /> ,
      currencySymbol: 'فرنك'
    },
    { 
      id: 'p3', 
      name: 'أرز بسمتي درجة أولى (جوال ٥ كجم)', 
      category: 'rice', 
      categoryLabel: 'أرز',
      price: '5,500', 
      rawPrice: 5500,
      available: true, 
      illustration: <RiceIllustration className="w-24 h-24" /> ,
      currencySymbol: 'فرنك'
    },
    { 
      id: 'p4', 
      name: 'زيت صباح نقي مكرر (زجاجة ١.٥ لتر)', 
      category: 'oil', 
      categoryLabel: 'زيوت',
      price: '3,000', 
      rawPrice: 3000,
      available: true, 
      illustration: <OilIllustration className="w-24 h-24" /> ,
      currencySymbol: 'فرنك'
    },
    { 
      id: 'p5', 
      name: 'شاي الجزيرة الأخضر الفاخر (٢٥٠ غرام)', 
      category: 'tea', 
      categoryLabel: 'غذائيات',
      price: '1,500', 
      rawPrice: 1500,
      available: true, 
      illustration: <TeaIllustration className="w-24 h-24" /> ,
      currencySymbol: 'فرنك'
    },
    { 
      id: 'p6', 
      name: 'مكرونة الوادي سريعة التحضير (٥٠٠ غرام)', 
      category: 'groceries', 
      categoryLabel: 'غذائيات',
      price: '1,000', 
      rawPrice: 1000,
      available: true, 
      illustration: <PastaIllustration className="w-24 h-24" /> ,
      currencySymbol: 'فرنك'
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
    <div className={`w-full h-full overflow-y-auto pb-8 font-sans transition-colors duration-200 ${
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
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    referrerPolicy="no-referrer" 
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
