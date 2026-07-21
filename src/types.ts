/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Currency {
  id: string;
  name: string;
  code: string;
  symbol: string;
  price: number;
  lastUpdated: string;
  flag: string; // SVG or Emoji code
  trend: 'up' | 'down' | 'stable';
  changeRate?: string;
  country: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  currencySymbol: string;
  category: 'all' | 'foodstuffs' | 'oils' | 'sugar' | 'rice' | 'other';
  categoryAr: string;
  imageUrl: string;
  isAvailable: boolean;
  unit: string;
  whatsappMessage: string;
  description?: string;
  supplierIds?: string[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin_full' | 'product_editor' | 'currency_manager';
  hashedPassword?: string;
  createdAt?: number;
  updatedAt?: number;
  assignedCurrency?: string; // e.g. currency code like 'USD', 'EGP' or 'all'
  assignedProduct?: string;  // e.g. category like 'sugar', 'oils' or product ID or 'all'
}

export interface Supplier {
  id: string;
  name: string;
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
  status: 'active' | 'inactive';
  createdBy?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface SchemaProduct {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  images: string[];
  supplierIds: string[];
  status: 'active' | 'inactive' | 'draft';
  createdBy?: string;
  createdAt?: number;
  updatedAt?: number;
  unit?: string;
  category?: 'all' | 'foodstuffs' | 'oils' | 'sugar' | 'rice' | 'other';
}

export interface CurrencyRate {
  id: string;
  currencyCode: string;
  rateToBase: number;
  lastUpdated?: number;
  updatedBy?: string;
}

export type ScreenId = 'splash' | 'onboarding' | 'home' | 'products' | 'prices' | 'settings';

export interface WhatsAppConfig {
  salesPhone1: string;
  salesPhone2: string;
  supportPhone: string;
  emergencyPhone: string;
  waLink: string;
  groupLink: string;
  channelLink: string;
  defaultMessage: string;
}

export interface AppSettings {
  language: 'ar' | 'en';
  baseCurrencyId: string;
  notificationsEnabled: boolean;
  autoUpdateIntervalMinutes: number;
}

export interface Order {
  id: string;
  productName: string;
  price: string;
  unit: string;
  timestamp: string;
  status: 'pending' | 'processing' | 'contacted' | 'completed' | 'cancelled';
  customerName: string;
  customerPhone: string;
  notes?: string;
  createdAt?: number;
}

export interface SystemAlert {
  id: string;
  title: string;
  text: string;
  time: string;
  unread: boolean;
  createdAt: number;
}

