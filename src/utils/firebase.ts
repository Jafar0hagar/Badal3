import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  query,
  orderBy,
  updateDoc,
  writeBatch
} from 'firebase/firestore';
import { Currency, Product, WhatsAppConfig, Order, SystemAlert } from '../types';

// Hardcoded Firebase configuration from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyBONzsAn9GbycG_xJRk4OkHor2W8yhMTSE",
  authDomain: "gen-lang-client-0584631997.firebaseapp.com",
  projectId: "gen-lang-client-0584631997",
  storageBucket: "gen-lang-client-0584631997.firebasestorage.app",
  messagingSenderId: "1098123820848",
  appId: "1:1098123820848:web:0ec371ffeca8c3db2cd2f5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-2c8954e1-0131-4d50-aa68-8d6bf61d2bc8");

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
  { id: 'pasta', name: 'مكرونة الوادي سريعة التحضير', price: 1000, currencySymbol: 'فرنك', category: 'foodstuffs', categoryAr: 'غذائيات', imageUrl: '', isAvailable: true, unit: '٥٠0 غرام', whatsappMessage: 'طلب شراء مكرونة الوادي سريعة التحضير', description: 'مكرونة مصنوعة من سميد القمح القاسي عالي الجودة وسهلة الإعداد.' },
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
 * Seed Firestore with default records if they do not exist
 */
export async function seedDatabaseIfEmpty() {
  try {
    const currencySnap = await getDocs(collection(db, 'currencies'));
    if (currencySnap.empty) {
      console.log('Seeding currencies...');
      const batch = writeBatch(db);
      INITIAL_CURRENCIES.forEach(c => {
        const docRef = doc(db, 'currencies', c.id);
        batch.set(docRef, c);
      });
      await batch.commit();
    }

    const productSnap = await getDocs(collection(db, 'products'));
    if (productSnap.empty) {
      console.log('Seeding products...');
      const batch = writeBatch(db);
      INITIAL_PRODUCTS.forEach(p => {
        const docRef = doc(db, 'products', p.id);
        batch.set(docRef, p);
      });
      await batch.commit();
    }

    const orderSnap = await getDocs(collection(db, 'orders'));
    if (orderSnap.empty) {
      console.log('Seeding orders...');
      const batch = writeBatch(db);
      INITIAL_ORDERS.forEach(o => {
        const docRef = doc(db, 'orders', o.id);
        batch.set(docRef, { ...o, createdAt: Date.now() });
      });
      await batch.commit();
    }

    const alertSnap = await getDocs(collection(db, 'alerts'));
    if (alertSnap.empty) {
      console.log('Seeding system alerts...');
      const batch = writeBatch(db);
      INITIAL_ALERTS.forEach(a => {
        const docRef = doc(db, 'alerts', a.id);
        batch.set(docRef, a);
      });
      await batch.commit();
    }

    const configSnap = await getDocs(collection(db, 'config'));
    if (configSnap.empty) {
      console.log('Seeding system config...');
      await setDoc(doc(db, 'config', 'whatsapp'), INITIAL_WHATSAPP_CONFIG);
      await setDoc(doc(db, 'config', 'general'), { currentFrancRate: 5900 });
    }
  } catch (error) {
    console.error('Error seeding Firestore database:', error);
  }
}

// Subscriptions (Real-time sync)
export function subscribeCurrencies(onUpdate: (currencies: Currency[]) => void) {
  return onSnapshot(collection(db, 'currencies'), (snapshot) => {
    const list: Currency[] = [];
    snapshot.forEach(doc => {
      list.push(doc.data() as Currency);
    });
    // Optional sorting or keeping seeded order
    onUpdate(list);
  }, (err) => {
    console.error('Currencies subscription error:', err);
  });
}

export function subscribeProducts(onUpdate: (products: Product[]) => void) {
  return onSnapshot(collection(db, 'products'), (snapshot) => {
    const list: Product[] = [];
    snapshot.forEach(doc => {
      list.push(doc.data() as Product);
    });
    onUpdate(list);
  }, (err) => {
    console.error('Products subscription error:', err);
  });
}

export function subscribeOrders(onUpdate: (orders: Order[]) => void) {
  // Ordered by createdAt descending if exists, otherwise local fallback
  return onSnapshot(collection(db, 'orders'), (snapshot) => {
    const list: Order[] = [];
    snapshot.forEach(doc => {
      list.push(doc.data() as Order);
    });
    // Sort manually by dynamic timestamps or createdAt
    list.sort((a, b) => {
      const aTime = (a as any).createdAt || 0;
      const bTime = (b as any).createdAt || 0;
      return bTime - aTime;
    });
    onUpdate(list);
  }, (err) => {
    console.error('Orders subscription error:', err);
  });
}

export function subscribeWhatsAppConfig(onUpdate: (config: WhatsAppConfig) => void) {
  return onSnapshot(doc(db, 'config', 'whatsapp'), (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data() as WhatsAppConfig);
    }
  }, (err) => {
    console.error('WhatsApp config subscription error:', err);
  });
}

export function subscribeGeneralConfig(onUpdate: (francRate: number) => void) {
  return onSnapshot(doc(db, 'config', 'general'), (docSnap) => {
    if (docSnap.exists()) {
      onUpdate((docSnap.data() as any).currentFrancRate || 5900);
    }
  }, (err) => {
    console.error('General config subscription error:', err);
  });
}

// Database Mutations
export async function updateCurrencyInDb(currency: Currency) {
  await setDoc(doc(db, 'currencies', currency.id), currency, { merge: true });
}

export async function deleteCurrencyInDb(id: string) {
  await deleteDoc(doc(db, 'currencies', id));
}

export async function updateProductInDb(product: Product) {
  await setDoc(doc(db, 'products', product.id), product, { merge: true });
}

export async function deleteProductInDb(id: string) {
  await deleteDoc(doc(db, 'products', id));
}

export async function addOrderToDb(order: Order) {
  await setDoc(doc(db, 'orders', order.id), {
    ...order,
    createdAt: Date.now()
  });
}

export async function updateOrderInDb(order: Order) {
  await setDoc(doc(db, 'orders', order.id), order, { merge: true });
}

export async function deleteOrderInDb(id: string) {
  await deleteDoc(doc(db, 'orders', id));
}

export async function updateWhatsAppConfigInDb(config: WhatsAppConfig) {
  await setDoc(doc(db, 'config', 'whatsapp'), config, { merge: true });
}

export async function updateGeneralConfigInDb(rate: number) {
  await setDoc(doc(db, 'config', 'general'), { currentFrancRate: rate }, { merge: true });
}

export function subscribeSystemAlerts(onUpdate: (alerts: SystemAlert[]) => void) {
  return onSnapshot(collection(db, 'alerts'), (snapshot) => {
    const list: SystemAlert[] = [];
    snapshot.forEach(doc => {
      list.push(doc.data() as SystemAlert);
    });
    // Sort by createdAt descending
    list.sort((a, b) => b.createdAt - a.createdAt);
    onUpdate(list);
  }, (err) => {
    console.error('System alerts subscription error:', err);
  });
}

export async function addSystemAlertToDb(alert: SystemAlert) {
  await setDoc(doc(db, 'alerts', alert.id), alert);
}

export async function deleteSystemAlertInDb(id: string) {
  await deleteDoc(doc(db, 'alerts', id));
}
