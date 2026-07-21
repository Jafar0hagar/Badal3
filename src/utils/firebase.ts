import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  getDoc, 
  getDocs,
  getDocFromServer
} from 'firebase/firestore';
import { 
  Currency, 
  Product, 
  WhatsAppConfig, 
  Order, 
  SystemAlert, 
  AdminUser, 
  Supplier, 
  SchemaProduct, 
  CurrencyRate 
} from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with Database ID from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// -------------------------------------------------------------------------
// Error Handler conforming to system instructions
// -------------------------------------------------------------------------
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

// Recursively sanitizes data to omit 'undefined' values before sending to Firestore
export function sanitizeDbData<T extends object>(obj: T): T {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = sanitizeDbData(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: 'anonymous_admin_session'
    },
    operationType,
    path
  };
  console.error('Firestore Error Details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on Startup
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'config', 'whatsapp'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn("Firestore client is offline or config is misaligned:", error);
    }
  }
}
testConnection();

// Helper to hash string to SHA-256 for passwords
export async function hashString(str: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// -------------------------------------------------------------------------
// Metadata for Mapping currency rates to old visual models
// -------------------------------------------------------------------------
const CURRENCY_METADATA: Record<string, { name: string; symbol: string; flag: string; country: string; trend: 'up' | 'down' | 'stable' }> = {
  XAF: { name: 'الفرنك التشادي', symbol: 'FCFA', flag: '🇹🇩', country: 'تشاد', trend: 'stable' },
  USDT: { name: 'تتر (USDT)', symbol: 'USDT', flag: '🇺🇸', country: 'الولايات المتحدة الأمريكية', trend: 'up' },
  USD: { name: 'تتر (USDT)', symbol: 'USDT', flag: '🇺🇸', country: 'الولايات المتحدة الأمريكية', trend: 'up' },
  EGP: { name: 'الجنيه المصري', symbol: 'ج.م', flag: '🇪🇬', country: 'جمهورية مصر العربية', trend: 'stable' },
  NGN: { name: 'النايرا النيجيرية', symbol: '₦', flag: '🇳🇬', country: 'جمهورية نيجيريا الاتحادية', trend: 'stable' },
};

function getCategory(name: string): { category: 'sugar' | 'rice' | 'oils' | 'foodstuffs' | 'other'; categoryAr: string } {
  const lowercase = name.toLowerCase();
  if (lowercase.includes('سكر') || lowercase.includes('sugar')) return { category: 'sugar', categoryAr: 'سكر' };
  if (lowercase.includes('أرز') || lowercase.includes('rice')) return { category: 'rice', categoryAr: 'أرز' };
  if (lowercase.includes('زيت') || lowercase.includes('oil')) return { category: 'oils', categoryAr: 'زيوت' };
  if (lowercase.includes('دقيق') || lowercase.includes('flour') || lowercase.includes('مكرونة') || lowercase.includes('pasta') || lowercase.includes('شاي') || lowercase.includes('tea')) return { category: 'foodstuffs', categoryAr: 'غذائيات' };
  return { category: 'other', categoryAr: 'أخرى' };
}

// -------------------------------------------------------------------------
// Seed Function
// -------------------------------------------------------------------------
export async function seedDatabaseIfEmpty() {
  try {
    // 1. Seed Config (whatsapp and general)
    const whatsappSnap = await getDoc(doc(db, 'config', 'whatsapp'));
    if (!whatsappSnap.exists()) {
      await setDoc(doc(db, 'config', 'whatsapp'), {
        salesPhone1: '+249 91 234 5678',
        salesPhone2: '+249 92 345 6789',
        supportPhone: '+249 93 456 7890',
        emergencyPhone: '+249 94 567 8901',
        waLink: 'https://wa.me/249912345678',
        groupLink: 'https://chat.whatsapp.com/BadalGroup',
        channelLink: 'https://whatsapp.com/channel/0029VaBadal',
        telegramLink: 'https://t.me/BadalExchange',
        facebookLink: 'https://facebook.com/groups/badalsudan',
        defaultMessage: 'مرحباً، أريد الاستفسار عن المنتجات والأسعار المتوفرة. شكراً لكم.',
        communityTitle: 'مجتمعات بَدَلْ وقنوات الصرف المباشر',
        communityDescription: 'انضم إلى مجتمعاتنا عبر الواتساب والتلغرام للحصول على آخر تحديثات الأسعار فوراً والواصل مع مكاتب الصرف',
        communityLinks: [
          { id: 'comm-1', title: 'مجتمع أسعار الصرف المباشر', description: 'قروب التبادلات والتسويات المباشرة', platform: 'whatsapp_group', url: 'https://chat.whatsapp.com/BadalGroup', badgeText: 'قروب الواتساب', isFeatured: true },
          { id: 'comm-2', title: 'قناة بَدَلْ الرسمية للأسعار', description: 'قناة موثقة للبث الفوري لأسعار الصرف والتموين', platform: 'whatsapp_channel', url: 'https://whatsapp.com/channel/0029VaBadal', badgeText: 'قناة وتساب', isFeatured: true },
          { id: 'comm-3', title: 'قناة التلغرام السريعة', description: 'تحديثات لحظية لسوق الصرف والعملات', platform: 'telegram', url: 'https://t.me/BadalExchange', badgeText: 'تلغرام', isFeatured: false },
          { id: 'comm-4', title: 'مجتمع الفيسبوك التفاعلي', description: 'مناقشات وعروض التموين والصرف', platform: 'facebook', url: 'https://facebook.com/groups/badalsudan', badgeText: 'فيسبوك', isFeatured: false }
        ]
      });
    }

    const generalSnap = await getDoc(doc(db, 'config', 'general'));
    if (!generalSnap.exists()) {
      await setDoc(doc(db, 'config', 'general'), { currentFrancRate: 5900 });
    }

    // 2. Seed Admin Users
    const adminSnap = await getDocs(collection(db, 'adminUsers'));
    if (adminSnap.empty) {
      const fullAdminPass = await hashString('badal2026');
      const editorPass = await hashString('editor2026');
      const managerPass = await hashString('rate2026');

      const initialAdmins: AdminUser[] = [
        { id: 'admin1', name: 'مدير النظام الكامل', email: 'admin@badal.com', role: 'admin_full', hashedPassword: fullAdminPass, whatsappPhone: '+249912345678', createdAt: Date.now(), updatedAt: Date.now() },
        { id: 'admin2', name: 'محرر السلع والمنتجات', email: 'editor@badal.com', role: 'product_editor', hashedPassword: editorPass, whatsappPhone: '+249923456789', createdAt: Date.now(), updatedAt: Date.now() },
        { id: 'admin3', name: 'مسؤول أسعار الصرف', email: 'rate@badal.com', role: 'currency_manager', hashedPassword: managerPass, whatsappPhone: '+249934567890', assignedCurrency: 'all', createdAt: Date.now(), updatedAt: Date.now() },
      ];

      for (const admin of initialAdmins) {
        await setDoc(doc(db, 'adminUsers', admin.id), admin);
      }
    }

    // 3. Seed Suppliers
    const suppliersSnap = await getDocs(collection(db, 'suppliers'));
    let defaultSupplierId1 = 'supp-taqwa';
    let defaultSupplierId2 = 'supp-sudani';
    if (suppliersSnap.empty) {
      const initialSuppliers: Supplier[] = [
        { id: defaultSupplierId1, name: 'مجمع التقوى التجاري للأغذية', contactInfo: { phone: '+249912000001', email: 'taqwa@example.com', address: 'الخرطوم - السوق المحلي' }, status: 'active', createdBy: 'admin1', createdAt: Date.now(), updatedAt: Date.now() },
        { id: defaultSupplierId2, name: 'شركة الموزع السوداني المحدودة', contactInfo: { phone: '+249123000002', email: 'dist@example.com', address: 'أم درمان - المنطقة الصناعية' }, status: 'active', createdBy: 'admin1', createdAt: Date.now(), updatedAt: Date.now() }
      ];
      for (const sup of initialSuppliers) {
        await setDoc(doc(db, 'suppliers', sup.id), sup);
      }
    }

    // 4. Seed Products (New Schema format)
    const productsSnap = await getDocs(collection(db, 'products'));
    if (productsSnap.empty) {
      const initialProducts: SchemaProduct[] = [
        { id: 'sugar', name: 'سكر كنانة مستورد فاخر', description: 'سكر نقي ناصع البياض سريع الذوبان مستورد من أجود المزارع العالمية.', basePrice: 4000, images: [], supplierIds: [defaultSupplierId1], status: 'active', createdBy: 'admin1', createdAt: Date.now(), updatedAt: Date.now(), unit: 'كيس ١٠ كجم' },
        { id: 'flour', name: 'دقيق الخيرات فاخر', description: 'دقيق قمح ممتاز متعدد الاستعمالات للمخبوزات والحلويات الراقية.', basePrice: 3500, images: [], supplierIds: [defaultSupplierId1], status: 'active', createdBy: 'admin1', createdAt: Date.now(), updatedAt: Date.now(), unit: 'علبة ١ كجم' },
        { id: 'rice', name: 'أرز بسمتي درجة أولى', description: 'أرز بسمتي هندي طويل الحبة ذو نكهة ورائحة عطرية زكية.', basePrice: 5500, images: [], supplierIds: [defaultSupplierId2], status: 'active', createdBy: 'admin1', createdAt: Date.now(), updatedAt: Date.now(), unit: 'جوال ٥ كجم' },
        { id: 'oil', name: 'زيت صباح نقي مكرر', description: 'زيت نباتي نقي مكرر وخفيف ومناسب لجميع أنواع الطبخ والقلي.', basePrice: 3000, images: [], supplierIds: [defaultSupplierId2], status: 'active', createdBy: 'admin1', createdAt: Date.now(), updatedAt: Date.now(), unit: 'زجاجة ١.٥ لتر' },
      ];
      for (const prod of initialProducts) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }
    }

    // 5. Seed Currency Rates
    const ratesSnap = await getDocs(collection(db, 'currencyRates'));
    if (ratesSnap.empty) {
      const initialRates: CurrencyRate[] = [
        { id: 'rate-xaf', currencyCode: 'XAF', rateToBase: 5900, contactPhone: '+249912345678', assignedAdminId: 'admin3', officeName: 'مكتب تحويلات العاصمة والفرنك', lastUpdated: Date.now(), updatedBy: 'admin1' },
        { id: 'rate-usd', currencyCode: 'USDT', rateToBase: 3200, contactPhone: '+249923456789', assignedAdminId: 'admin1', officeName: 'مكتب الكريبتو والتتر السريع', lastUpdated: Date.now(), updatedBy: 'admin1' },
        { id: 'rate-egp', currencyCode: 'EGP', rateToBase: 65, contactPhone: '+249934567890', assignedAdminId: 'admin3', officeName: 'مكتب الصرف المصري والقاهرة', lastUpdated: Date.now(), updatedBy: 'admin1' },
        { id: 'rate-ngn', currencyCode: 'NGN', rateToBase: 2500, contactPhone: '+249945678901', assignedAdminId: 'admin3', officeName: 'مكتب تحويلات النايرا والربط الإفريقي', lastUpdated: Date.now(), updatedBy: 'admin1' },
      ];
      for (const r of initialRates) {
        await setDoc(doc(db, 'currencyRates', r.id), r);
      }
    } else {
      // Database already has some rates, let's clean up obsolete ones and ensure the target ones are present
      const validCodes = ['XAF', 'USD', 'USDT', 'EGP', 'NGN'];
      const currentRatesSnap = await getDocs(collection(db, 'currencyRates'));
      for (const d of currentRatesSnap.docs) {
        const data = d.data() as CurrencyRate;
        if (!data.currencyCode || !validCodes.includes(data.currencyCode)) {
          await deleteDoc(doc(db, 'currencyRates', d.id));
        }
      }

      // Ensure NGN is added
      const ngnCheck = await getDoc(doc(db, 'currencyRates', 'rate-ngn'));
      if (!ngnCheck.exists()) {
        await setDoc(doc(db, 'currencyRates', 'rate-ngn'), {
          id: 'rate-ngn',
          currencyCode: 'NGN',
          rateToBase: 2500,
          lastUpdated: Date.now(),
          updatedBy: 'admin1'
        });
      }

      // Ensure USD is mapped to USDT currency code
      const usdCheck = await getDoc(doc(db, 'currencyRates', 'rate-usd'));
      if (usdCheck.exists()) {
        const usdData = usdCheck.data() as CurrencyRate;
        if (usdData.currencyCode !== 'USDT') {
          await setDoc(doc(db, 'currencyRates', 'rate-usd'), {
            id: 'rate-usd',
            currencyCode: 'USDT',
            rateToBase: usdData.rateToBase || 3200,
            lastUpdated: Date.now(),
            updatedBy: usdData.updatedBy || 'admin1'
          });
        }
      } else {
        await setDoc(doc(db, 'currencyRates', 'rate-usd'), {
          id: 'rate-usd',
          currencyCode: 'USDT',
          rateToBase: 3200,
          lastUpdated: Date.now(),
          updatedBy: 'admin1'
        });
      }
    }

    // 6. Seed Alerts
    const alertsSnap = await getDocs(collection(db, 'alerts'));
    if (alertsSnap.empty) {
      const initialAlerts: SystemAlert[] = [
        { id: 'alert-1', title: 'تحديث سعر الصرف', text: 'تم تحديث سعر الفرنك التشادي الآن في السوق الموازي ليكون 5900 ج.س.', time: 'منذ دقيقة', unread: true, createdAt: Date.now() - 60000 },
        { id: 'alert-2', title: 'توفر كمية جديدة', text: 'تم توفير كميات إدارية إضافية من منتج السكر المستورد بجودة ممتازة.', time: 'منذ ساعة', unread: true, createdAt: Date.now() - 3600000 },
      ];
      for (const alert of initialAlerts) {
        await setDoc(doc(db, 'alerts', alert.id), alert);
      }
    }

    // 7. Seed Orders
    const ordersSnap = await getDocs(collection(db, 'orders'));
    if (ordersSnap.empty) {
      const initialOrders: Order[] = [
        { id: 'order-1', productName: 'سكر كنانة مستورد فاخر', price: '4,000', unit: 'كيس ١٠ كجم', timestamp: '١٠:١٥ ص اليوم', status: 'completed', customerName: 'أحمد التاجر', customerPhone: '+249912345678', notes: 'يرجى التوصيل للمستودع', createdAt: Date.now() - 7200000 },
        { id: 'order-2', productName: 'أرز بسمتي درجة أولى', price: '5,500', unit: 'جوال ٥ كجم', timestamp: 'منذ ١٥ دقيقة', status: 'pending', customerName: 'فاطمة صالح', customerPhone: '+249912000010', notes: 'الدفع عند الاستلام', createdAt: Date.now() - 900000 }
      ];
      for (const order of initialOrders) {
        await setDoc(doc(db, 'orders', order.id), order);
      }
    }

    console.log("🔥 Firestore database populated and seeded successfully!");
  } catch (error) {
    console.error("Firestore database seeding failed:", error);
  }
}

// -------------------------------------------------------------------------
// Subscriptions (with mapped objects where necessary for backward compatibility)
// -------------------------------------------------------------------------

export function subscribeCurrencies(onUpdate: (currencies: Currency[]) => void) {
  const q = collection(db, 'currencyRates');
  return onSnapshot(q, (snapshot) => {
    const list: Currency[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data() as CurrencyRate;
      const code = data.currencyCode || 'USD';
      const meta = CURRENCY_METADATA[code] || { name: code, symbol: code, flag: '🏳️', country: '', trend: 'stable' };
      list.push({
        id: doc.id,
        name: meta.name,
        code,
        symbol: meta.symbol,
        price: data.rateToBase || 0,
        lastUpdated: data.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString('ar-EG') : 'الآن',
        flag: meta.flag,
        trend: meta.trend,
        country: meta.country,
        contactPhone: data.contactPhone || '',
        officeName: data.officeName || ''
      });
    });
    // Ensure franc rate is at the top or order them
    onUpdate(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'currencyRates');
  });
}

export function subscribeProducts(onUpdate: (products: Product[]) => void) {
  const q = collection(db, 'products');
  return onSnapshot(q, (snapshot) => {
    const list: Product[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data() as SchemaProduct;
      const catInfo = getCategory(data.name);
      list.push({
        id: doc.id,
        name: data.name,
        price: data.basePrice || 0,
        currencySymbol: 'فرنك',
        category: catInfo.category,
        categoryAr: catInfo.categoryAr,
        imageUrl: data.images && data.images.length > 0 ? data.images[0] : '',
        isAvailable: data.status === 'active',
        unit: data.unit || 'جوال ٥٠ كجم',
        whatsappMessage: `طلب شراء ${data.name}`,
        description: data.description || '',
        supplierIds: data.supplierIds || []
      });
    });
    onUpdate(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'products');
  });
}

export function subscribeOrders(onUpdate: (orders: Order[]) => void) {
  const q = collection(db, 'orders');
  return onSnapshot(q, (snapshot) => {
    const list: Order[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data() as Order;
      list.push({
        ...data,
        id: doc.id
      });
    });
    list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    onUpdate(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'orders');
  });
}

export function subscribeWhatsAppConfig(onUpdate: (config: WhatsAppConfig) => void) {
  return onSnapshot(doc(db, 'config', 'whatsapp'), (docSnap) => {
    if (docSnap.exists()) {
      onUpdate({
        ...(docSnap.data() as WhatsAppConfig),
        // fallback links
        waLink: docSnap.data()?.waLink || 'https://wa.me/249912345678'
      });
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'config/whatsapp');
  });
}

export function subscribeGeneralConfig(onUpdate: (francRate: number) => void) {
  return onSnapshot(doc(db, 'config', 'general'), (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data()?.currentFrancRate || 5900);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'config/general');
  });
}

export function subscribeSystemAlerts(onUpdate: (alerts: SystemAlert[]) => void) {
  const q = collection(db, 'alerts');
  return onSnapshot(q, (snapshot) => {
    const list: SystemAlert[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data() as SystemAlert;
      list.push({
        ...data,
        id: doc.id
      });
    });
    list.sort((a, b) => b.createdAt - a.createdAt);
    onUpdate(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'alerts');
  });
}

// -------------------------------------------------------------------------
// NEW Subscriptions for Admin-Only Collections
// -------------------------------------------------------------------------

export function subscribeAdminUsers(onUpdate: (users: AdminUser[]) => void) {
  return onSnapshot(collection(db, 'adminUsers'), (snapshot) => {
    const list: AdminUser[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data() as AdminUser;
      list.push({
        ...data,
        id: doc.id
      });
    });
    onUpdate(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'adminUsers');
  });
}

export function subscribeSuppliers(onUpdate: (suppliers: Supplier[]) => void) {
  return onSnapshot(collection(db, 'suppliers'), (snapshot) => {
    const list: Supplier[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data() as Supplier;
      list.push({
        ...data,
        id: doc.id
      });
    });
    onUpdate(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'suppliers');
  });
}

export function subscribeSchemaProducts(onUpdate: (products: SchemaProduct[]) => void) {
  return onSnapshot(collection(db, 'products'), (snapshot) => {
    const list: SchemaProduct[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data() as SchemaProduct;
      list.push({
        ...data,
        id: doc.id
      });
    });
    onUpdate(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'products');
  });
}

export function subscribeCurrencyRates(onUpdate: (rates: CurrencyRate[]) => void) {
  return onSnapshot(collection(db, 'currencyRates'), (snapshot) => {
    const list: CurrencyRate[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data() as CurrencyRate;
      list.push({
        ...data,
        id: doc.id
      });
    });
    onUpdate(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'currencyRates');
  });
}

// -------------------------------------------------------------------------
// Mutations / Writes conforming to handleFirestoreError
// -------------------------------------------------------------------------

export async function updateCurrencyInDb(currency: Currency) {
  // Map back to currencyRates collection
  try {
    const docId = currency.id.startsWith('rate-') ? currency.id : `rate-${currency.id}`;
    await setDoc(doc(db, 'currencyRates', docId), {
      id: docId,
      currencyCode: currency.code,
      rateToBase: currency.price,
      lastUpdated: Date.now(),
      updatedBy: 'system'
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `currencyRates/${currency.id}`);
  }
}

export async function deleteCurrencyInDb(id: string) {
  try {
    const docId = id.startsWith('rate-') ? id : `rate-${id}`;
    await deleteDoc(doc(db, 'currencyRates', docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `currencyRates/${id}`);
  }
}

export async function updateProductInDb(product: Product) {
  // Map back to products collection
  try {
    await setDoc(doc(db, 'products', product.id), sanitizeDbData({
      id: product.id,
      name: product.name,
      basePrice: product.price,
      description: product.description || '',
      images: product.imageUrl ? [product.imageUrl] : [],
      status: product.isAvailable ? 'active' : 'inactive',
      supplierIds: product.supplierIds || [],
      unit: product.unit || 'جوال ٥٠ كجم',
      updatedAt: Date.now()
    }), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `products/${product.id}`);
  }
}

export async function deleteProductInDb(id: string) {
  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
  }
}

export async function addOrderToDb(order: Order) {
  try {
    await setDoc(doc(db, 'orders', order.id), {
      ...order,
      createdAt: Date.now()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `orders/${order.id}`);
  }
}

export async function updateOrderInDb(order: Order) {
  try {
    await setDoc(doc(db, 'orders', order.id), order, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `orders/${order.id}`);
  }
}

export async function deleteOrderInDb(id: string) {
  try {
    await deleteDoc(doc(db, 'orders', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `orders/${id}`);
  }
}

export async function updateWhatsAppConfigInDb(config: WhatsAppConfig) {
  try {
    await setDoc(doc(db, 'config', 'whatsapp'), config);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'config/whatsapp');
  }
}

export async function updateGeneralConfigInDb(rate: number) {
  try {
    await setDoc(doc(db, 'config', 'general'), { currentFrancRate: rate });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'config/general');
  }
}

export async function addSystemAlertToDb(alert: SystemAlert) {
  try {
    await setDoc(doc(db, 'alerts', alert.id), alert);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `alerts/${alert.id}`);
  }
}

export async function deleteSystemAlertInDb(id: string) {
  try {
    await deleteDoc(doc(db, 'alerts', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `alerts/${id}`);
  }
}

// -------------------------------------------------------------------------
// NEW Pure admin mutations conforming to user's specification
// -------------------------------------------------------------------------

export async function addAdminUser(user: AdminUser) {
  try {
    await setDoc(doc(db, 'adminUsers', user.id), {
      ...user,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `adminUsers/${user.id}`);
  }
}

export async function updateAdminUser(user: AdminUser) {
  try {
    await setDoc(doc(db, 'adminUsers', user.id), {
      ...user,
      updatedAt: Date.now()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `adminUsers/${user.id}`);
  }
}

export async function deleteAdminUser(id: string) {
  try {
    await deleteDoc(doc(db, 'adminUsers', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `adminUsers/${id}`);
  }
}

export async function addSupplier(sup: Supplier) {
  try {
    await setDoc(doc(db, 'suppliers', sup.id), {
      ...sup,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `suppliers/${sup.id}`);
  }
}

export async function updateSupplier(sup: Supplier) {
  try {
    await setDoc(doc(db, 'suppliers', sup.id), {
      ...sup,
      updatedAt: Date.now()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `suppliers/${sup.id}`);
  }
}

export async function deleteSupplier(id: string) {
  try {
    await deleteDoc(doc(db, 'suppliers', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `suppliers/${id}`);
  }
}

export async function addSchemaProduct(product: SchemaProduct) {
  try {
    await setDoc(doc(db, 'products', product.id), sanitizeDbData({
      ...product,
      status: product.status || 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `products/${product.id}`);
  }
}

export async function updateSchemaProduct(product: SchemaProduct) {
  try {
    await setDoc(doc(db, 'products', product.id), sanitizeDbData({
      ...product,
      status: product.status || 'draft',
      updatedAt: Date.now()
    }), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `products/${product.id}`);
  }
}

export async function deleteSchemaProduct(id: string) {
  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
  }
}

export async function addCurrencyRate(rate: CurrencyRate) {
  try {
    await setDoc(doc(db, 'currencyRates', rate.id), sanitizeDbData({
      ...rate,
      lastUpdated: Date.now()
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `currencyRates/${rate.id}`);
  }
}

export async function updateCurrencyRate(rate: CurrencyRate) {
  try {
    await setDoc(doc(db, 'currencyRates', rate.id), sanitizeDbData({
      ...rate,
      lastUpdated: Date.now()
    }), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `currencyRates/${rate.id}`);
  }
}

export async function deleteCurrencyRate(id: string) {
  try {
    await deleteDoc(doc(db, 'currencyRates', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `currencyRates/${id}`);
  }
}
