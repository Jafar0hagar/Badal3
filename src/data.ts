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
    symbol: 'FCFA',
    price: 5900,
    lastUpdated: 'آخر تحديث الآن',
    flag: '🇹🇩',
    trend: 'stable',
    changeRate: '0.0%',
    country: 'جمهورية تشاد'
  },
  {
    id: 'usdt',
    name: 'تتر (USDT)',
    code: 'USDT',
    symbol: 'USDT',
    price: 3200,
    lastUpdated: 'آخر تحديث الآن',
    flag: '🇺🇸',
    trend: 'up',
    changeRate: '+1.5%',
    country: 'الولايات المتحدة الأمريكية'
  },
  {
    id: 'egp',
    name: 'الجنيه المصري',
    code: 'EGP',
    symbol: 'ج.م',
    price: 65,
    lastUpdated: 'آخر تحديث الآن',
    flag: '🇪🇬',
    trend: 'stable',
    changeRate: '0.0%',
    country: 'جمهورية مصر العربية'
  },
  {
    id: 'ngn',
    name: 'النايرا النيجيرية',
    code: 'NGN',
    symbol: '₦',
    price: 2500,
    lastUpdated: 'آخر تحديث الآن',
    flag: '🇳🇬',
    trend: 'stable',
    changeRate: '0.0%',
    country: 'جمهورية نيجيريا الاتحادية'
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
