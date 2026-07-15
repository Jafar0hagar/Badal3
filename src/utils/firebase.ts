import { initializeApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  onValue, 
  set, 
  remove, 
  get, 
  child 
} from 'firebase/database';
import { Currency, Product, WhatsAppConfig, Order, SystemAlert } from '../types';

// Load environment variables dynamically with strict fallback
const metaEnv = (import.meta as any).env || {};
const apiKeyRaw = metaEnv.VITE_FIREBASE_API_KEY || "AIzaSyBONzsAn9GbycG_xJRk4OkHor2W8yhMTSE";
const apiKey = apiKeyRaw.trim(); // Prevent trailing whitespace bugs from secret loaders
const projectId = (metaEnv.VITE_FIREBASE_PROJECT_ID || "badal-854a0").trim();
const databaseURL = (metaEnv.VITE_FIREBASE_DATABASE_URL || "https://badal-854a0-default-rtdb.firebaseio.com").trim();

const firebaseConfig = {
  apiKey,
  authDomain: `${projectId}.firebaseapp.com`,
  databaseURL,
  projectId,
  storageBucket: `${projectId}.firebasestorage.app`,
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize and Export Realtime Database Instance
export const db = getDatabase(app);

// Initial data for seeding if database is empty
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
  { id: 'sugar', name: 'سكر مستورد فاخر', price: 4000, currencySymbol: 'فرنك', category: 'sugar', categoryAr: 'سكر', imageUrl: '', isAvailable: true, unit: 'كيس ١٠ كجم', whatsappMessage: 'طلب شراء سكر مستورد فاخر', description: 'سكر نقي ناصع البياض سريع الذوبان مستورد من أجود المزارع العالمية.' },
  { id: 'flour', name: 'دقيق الخيرات فاخر', price: 3500, currencySymbol: 'فرنك', category: 'foodstuffs', categoryAr: 'غذائيات', imageUrl: '', isAvailable: true, unit: 'علبة ١ كجم', whatsappMessage: 'طلب شراء دقيق الخيرات فاخر', description: 'دقيق قمح ممتاز متعدد الاستعمالات للمخبوزات والحلويات الراقية.' },
  { id: 'rice', name: 'أرز بسمتي درجة أولى', price: 5500, currencySymbol: 'فرنك', category: 'rice', categoryAr: 'أرز', imageUrl: '', isAvailable: true, unit: 'جوال ٥ كجم', whatsappMessage: 'طلب شراء أرز بسمتي درجة أولى', description: 'أرز بسمتي هندي طويل الحبة ذو نكهة ورائحة عطرية زكية.' },
  { id: 'oil', name: 'زيت صباح نقي مكرر', price: 3000, currencySymbol: 'فرنك', category: 'oils', categoryAr: 'زيوت', imageUrl: '', isAvailable: true, unit: 'زجاجة ١.٥ لتر', whatsappMessage: 'طلب شراء زيت صباح نقي مكرر', description: 'زيت نباتي نقي مكرر وخفيف ومناسب لجميع أنواع الطبخ والقلي.' },
  { id: 'tea', name: 'شاي الجزيرة الأخضر الفاخر', price: 1500, currencySymbol: 'فرنك', category: 'foodstuffs', categoryAr: 'غذائيات', imageUrl: '', isAvailable: true, unit: '٢٥٠ غرام', whatsappMessage: 'طلب شراء شاي الجزيرة الأخضر الفاخر', description: 'أوراق الشاي الأخضر الطبيعي الفاخرة غنية بمضادات الأكسدة وبطعم مميز.' },
  { id: 'pasta', name: 'مكرونة الوادي سريعة التحضير', price: 1000, currencySymbol: 'فرنك', category: 'foodstuffs', categoryAr: 'غذائيات', imageUrl: '', isAvailable: true, unit: '٥٠٠ غرام', whatsappMessage: 'طلب شراء مكرونة الوادي سريعة التحضير', description: 'مكرونة مصنوعة من سميد القمح القاسي عالي الجودة وسهلة الإعداد.' },
];

const INITIAL_ORDERS: Order[] = [
  { id: 'order-1', productName: 'سكر مستورد فاخر', price: '24,000', unit: 'كيس ١٠ كجم', timestamp: '١٠:١٥ ص اليوم', status: 'completed', customerName: 'أحمد التاجر', customerPhone: '+249 91 234 5678', notes: 'يرجى التوصيل للمخزن الرئيسي بسوق ليبيا' },
  { id: 'order-2', productName: 'زيت صباح نقي مكرر', price: '18,000', unit: 'زجاجة ١.٥ لتر', timestamp: '٠٩:٣٠ ص اليوم', status: 'processing', customerName: 'فاطمة صالح', customerPhone: '+249 12 345 6789', notes: 'يرجى تأكيد التوافر للكميات الإضافية' },
  { id: 'order-3', productName: 'أرز بسمتي درجة أولى', price: '33,000', unit: 'جوال ٥ كجم', timestamp: 'منذ ١٥ دقيقة', status: 'pending', customerName: 'محمد عثمان', customerPhone: '+249 90 876 5432', notes: 'مستلم عبر واتساب المحاكي تلقائياً' }
];

const INITIAL_ALERTS: SystemAlert[] = [
  { id: 'alert-1', title: 'تحديث سعر الصرف', text: 'تم تحديث سعر الفرنك التشادي الآن في السوق الموازي ليكون 5900 ج.س.', time: 'منذ دقيقة', unread: true, createdAt: Date.now() - 60000 },
  { id: 'alert-2', title: 'توفر كمية جديدة', text: 'تم توفير كميات إدارية إضافية من منتج السكر المستورد بجودة ممتازة.', time: 'منذ ساعة', unread: true, createdAt: Date.now() - 3600000 },
  { id: 'alert-3', title: 'تحديث الأسعار المالي', text: 'تراجع طفيف لليورو واستقرار الدولار الأمريكي اليوم في الافتتاح الصباحي.', time: 'منذ ٥ ساعات', unread: false, createdAt: Date.now() - 18000000 },
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

/**
 * Seed Realtime Database with default records if they do not exist
 */
export async function seedDatabaseIfEmpty() {
  try {
    const dbRef = ref(db);
    
    // Check and seed currencies
    const currencySnap = await get(child(dbRef, 'currencies'));
    if (!currencySnap.exists()) {
      console.log('RTDB Seeding currencies...');
      for (const c of INITIAL_CURRENCIES) {
        await set(ref(db, `currencies/${c.id}`), c);
      }
    }

    // Check and seed products
    const productSnap = await get(child(dbRef, 'products'));
    if (!productSnap.exists()) {
      console.log('RTDB Seeding products...');
      for (const p of INITIAL_PRODUCTS) {
        await set(ref(db, `products/${p.id}`), p);
      }
    }

    // Check and seed orders
    const orderSnap = await get(child(dbRef, 'orders'));
    if (!orderSnap.exists()) {
      console.log('RTDB Seeding orders...');
      for (const o of INITIAL_ORDERS) {
        await set(ref(db, `orders/${o.id}`), { ...o, createdAt: Date.now() });
      }
    }

    // Check and seed system alerts
    const alertSnap = await get(child(dbRef, 'alerts'));
    if (!alertSnap.exists()) {
      console.log('RTDB Seeding system alerts...');
      for (const a of INITIAL_ALERTS) {
        await set(ref(db, `alerts/${a.id}`), a);
      }
    }

    // Check and seed config
    const whatsappSnap = await get(child(dbRef, 'config/whatsapp'));
    if (!whatsappSnap.exists()) {
      console.log('RTDB Seeding whatsapp config...');
      await set(ref(db, 'config/whatsapp'), INITIAL_WHATSAPP_CONFIG);
    }

    const generalSnap = await get(child(dbRef, 'config/general'));
    if (!generalSnap.exists()) {
      console.log('RTDB Seeding general config...');
      await set(ref(db, 'config/general'), { currentFrancRate: 5900 });
    }
    
    console.log('🎉 Realtime Database initial seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding Realtime Database:', error);
  }
}

// Subscriptions (Real-time synchronization using RTDB onValue)

export function subscribeCurrencies(onUpdate: (currencies: Currency[]) => void) {
  const currenciesRef = ref(db, 'currencies');
  return onValue(currenciesRef, (snapshot) => {
    const list: Currency[] = [];
    if (snapshot.exists()) {
      snapshot.forEach(childSnap => {
        list.push(childSnap.val() as Currency);
      });
    }
    onUpdate(list);
  }, (err) => {
    console.error('Currencies RTDB subscription error:', err);
  });
}

export function subscribeProducts(onUpdate: (products: Product[]) => void) {
  const productsRef = ref(db, 'products');
  return onValue(productsRef, (snapshot) => {
    const list: Product[] = [];
    if (snapshot.exists()) {
      snapshot.forEach(childSnap => {
        list.push(childSnap.val() as Product);
      });
    }
    onUpdate(list);
  }, (err) => {
    console.error('Products RTDB subscription error:', err);
  });
}

export function subscribeOrders(onUpdate: (orders: Order[]) => void) {
  const ordersRef = ref(db, 'orders');
  return onValue(ordersRef, (snapshot) => {
    const list: Order[] = [];
    if (snapshot.exists()) {
      snapshot.forEach(childSnap => {
        list.push(childSnap.val() as Order);
      });
    }
    // Sort descending by creation timestamp
    list.sort((a, b) => {
      const aTime = (a as any).createdAt || 0;
      const bTime = (b as any).createdAt || 0;
      return bTime - aTime;
    });
    onUpdate(list);
  }, (err) => {
    console.error('Orders RTDB subscription error:', err);
  });
}

export function subscribeWhatsAppConfig(onUpdate: (config: WhatsAppConfig) => void) {
  const whatsappRef = ref(db, 'config/whatsapp');
  return onValue(whatsappRef, (snapshot) => {
    if (snapshot.exists()) {
      onUpdate(snapshot.val() as WhatsAppConfig);
    }
  }, (err) => {
    console.error('WhatsApp config RTDB subscription error:', err);
  });
}

export function subscribeGeneralConfig(onUpdate: (francRate: number) => void) {
  const generalRef = ref(db, 'config/general');
  return onValue(generalRef, (snapshot) => {
    if (snapshot.exists()) {
      onUpdate((snapshot.val() as any).currentFrancRate || 5900);
    }
  }, (err) => {
    console.error('General config RTDB subscription error:', err);
  });
}

export function subscribeSystemAlerts(onUpdate: (alerts: SystemAlert[]) => void) {
  const alertsRef = ref(db, 'alerts');
  return onValue(alertsRef, (snapshot) => {
    const list: SystemAlert[] = [];
    if (snapshot.exists()) {
      snapshot.forEach(childSnap => {
        list.push(childSnap.val() as SystemAlert);
      });
    }
    // Sort descending by creation timestamp
    list.sort((a, b) => b.createdAt - a.createdAt);
    onUpdate(list);
  }, (err) => {
    console.error('System alerts RTDB subscription error:', err);
  });
}

// Database mutations

export async function updateCurrencyInDb(currency: Currency) {
  await set(ref(db, `currencies/${currency.id}`), currency);
}

export async function deleteCurrencyInDb(id: string) {
  await remove(ref(db, `currencies/${id}`));
}

export async function updateProductInDb(product: Product) {
  await set(ref(db, `products/${product.id}`), product);
}

export async function deleteProductInDb(id: string) {
  await remove(ref(db, `products/${id}`));
}

export async function addOrderToDb(order: Order) {
  await set(ref(db, `orders/${order.id}`), {
    ...order,
    createdAt: Date.now()
  });
}

export async function updateOrderInDb(order: Order) {
  await set(ref(db, `orders/${order.id}`), order);
}

export async function deleteOrderInDb(id: string) {
  await remove(ref(db, `orders/${id}`));
}

export async function updateWhatsAppConfigInDb(config: WhatsAppConfig) {
  await set(ref(db, 'config/whatsapp'), config);
}

export async function updateGeneralConfigInDb(rate: number) {
  await set(ref(db, 'config/general'), { currentFrancRate: rate });
}

export async function addSystemAlertToDb(alert: SystemAlert) {
  await set(ref(db, `alerts/${alert.id}`), alert);
}

export async function deleteSystemAlertInDb(id: string) {
  await remove(ref(db, `alerts/${id}`));
}
