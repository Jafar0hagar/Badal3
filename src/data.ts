/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Currency, Product } from './types';

export const INITIAL_CURRENCIES: Currency[] = [
  {
    id: 'xaf',
    name: 'الفرنك التشادي',
    code: 'XAF',
    symbol: 'ج.س',
    price: 5900,
    lastUpdated: 'آخر تحديث الآن',
    flag: 'TD',
    trend: 'stable',
    changeRate: '0.0%',
    country: 'جمهورية تشاد'
  },
  {
    id: 'usd',
    name: 'الدولار الأمريكي',
    code: 'USD',
    symbol: 'ج.س',
    price: 3200,
    lastUpdated: 'آخر تحديث الآن',
    flag: 'US',
    trend: 'up',
    changeRate: '+1.5%',
    country: 'الولايات المتحدة الأمريكية'
  },
  {
    id: 'eur',
    name: 'اليورو',
    code: 'EUR',
    symbol: 'ج.س',
    price: 3650,
    lastUpdated: 'آخر تحديث الآن',
    flag: 'EU',
    trend: 'down',
    changeRate: '-0.3%',
    country: 'الاتحاد الأوروبي'
  },
  {
    id: 'sar',
    name: 'الريال السعودي',
    code: 'SAR',
    symbol: 'ج.س',
    price: 850,
    lastUpdated: 'آخر تحديث الآن',
    flag: 'SA',
    trend: 'up',
    changeRate: '+0.8%',
    country: 'المملكة العربية السعودية'
  },
  {
    id: 'gbp',
    name: 'الجنيه الإسترليني',
    code: 'GBP',
    symbol: 'ج.س',
    price: 4200,
    lastUpdated: 'آخر تحديث الآن',
    flag: 'GB',
    trend: 'stable',
    changeRate: '0.0%',
    country: 'المملكة المتحدة'
  },
  {
    id: 'egp',
    name: 'الجنيه المصري',
    code: 'EGP',
    symbol: 'ج.س',
    price: 65,
    lastUpdated: 'آخر تحديث الآن',
    flag: 'EG',
    trend: 'stable',
    changeRate: '0.0%',
    country: 'جمهورية مصر العربية'
  },
  {
    id: 'aed',
    name: 'الدرهم الإماراتي',
    code: 'AED',
    symbol: 'ج.س',
    price: 870,
    lastUpdated: 'آخر تحديث الآن',
    flag: 'AE',
    trend: 'up',
    changeRate: '+1.1%',
    country: 'الإمارات العربية المتحدة'
  },
  {
    id: 'kwd',
    name: 'الدينار الكويتي',
    code: 'KWD',
    symbol: 'ج.س',
    price: 10450,
    lastUpdated: 'آخر تحديث الآن',
    flag: 'KW',
    trend: 'up',
    changeRate: '+0.4%',
    country: 'دولة الكويت'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'sugar',
    name: 'سكر',
    price: 24000,
    currencySymbol: 'ج.س',
    category: 'sugar',
    categoryAr: 'سكر',
    imageUrl: 'sugar',
    isAvailable: true,
    unit: 'شوال 50 كيلو',
    whatsappMessage: 'السلام عليكم، أود شراء شوال سكر (50 كيلو) بسعر 24,000 ج.س عبر تطبيق بدل.'
  },
  {
    id: 'flour',
    name: 'دقيق',
    price: 21000,
    currencySymbol: 'ج.س',
    category: 'foodstuffs',
    categoryAr: 'غذائيات',
    imageUrl: 'flour',
    isAvailable: true,
    unit: 'كرتونة 10 كيلو',
    whatsappMessage: 'السلام عليكم، أود شراء كرتونة دقيق بسعر 21,000 ج.س عبر تطبيق بدل.'
  },
  {
    id: 'rice',
    name: 'أرز',
    price: 33000,
    currencySymbol: 'ج.س',
    category: 'rice',
    categoryAr: 'أرز',
    imageUrl: 'rice',
    isAvailable: true,
    unit: 'شوال 25 كيلو',
    whatsappMessage: 'السلام عليكم، أود شراء شوال أرز بسعر 33,000 ج.س عبر تطبيق بدل.'
  },
  {
    id: 'oil',
    name: 'زيت',
    price: 18000,
    currencySymbol: 'ج.س',
    category: 'oils',
    categoryAr: 'زيوت',
    imageUrl: 'oil',
    isAvailable: true,
    unit: 'جالون 4.5 لتر',
    whatsappMessage: 'السلام عليكم، أود شراء جالون زيت بسعر 18,000 ج.س عبر تطبيق بدل.'
  },
  {
    id: 'milk',
    name: 'حليب مجفف',
    price: 45000,
    currencySymbol: 'ج.س',
    category: 'foodstuffs',
    categoryAr: 'غذائيات',
    imageUrl: 'milk',
    isAvailable: true,
    unit: 'كيس 2.25 كيلو',
    whatsappMessage: 'السلام عليكم، أود شراء كيس حليب مجفف بسعر 45,000 ج.س عبر تطبيق بدل.'
  },
  {
    id: 'tea',
    name: 'شاي لبتون',
    price: 9500,
    currencySymbol: 'ج.س',
    category: 'foodstuffs',
    categoryAr: 'غذائيات',
    imageUrl: 'tea',
    isAvailable: true,
    unit: 'عبوة 100 فتلة',
    whatsappMessage: 'السلام عليكم، أود شراء عبوة شاي لبتون بسعر 9,500 ج.س عبر تطبيق بدل.'
  }
];
