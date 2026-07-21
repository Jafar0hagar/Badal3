import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Truck, 
  Package, 
  Coins, 
  ShoppingBag, 
  Bell, 
  Lock, 
  Trash2, 
  Edit3, 
  Plus, 
  Search, 
  Check, 
  X, 
  AlertCircle,
  Volume2,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  FileText,
  DollarSign,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import BadalLogo from './BadalLogo';
import { SafeImage } from './SafeImage';

// Import Types
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
import { playNotificationSound } from '../utils/audio';
import { 
  addAdminUser, 
  updateAdminUser, 
  deleteAdminUser, 
  addSupplier, 
  updateSupplier, 
  deleteSupplier, 
  addSchemaProduct, 
  updateSchemaProduct, 
  deleteSchemaProduct, 
  addCurrencyRate, 
  updateCurrencyRate, 
  deleteCurrencyRate,
  subscribeAdminUsers,
  subscribeSuppliers,
  subscribeSchemaProducts,
  subscribeCurrencyRates,
  addSystemAlertToDb,
  deleteSystemAlertInDb,
  hashString
} from '../utils/firebase';

interface DashboardProps {
  currencies: Currency[];
  onUpdateCurrencies: (updated: Currency[]) => void;
  products: Product[];
  onUpdateProducts: (updated: Product[]) => void;
  orders: Order[];
  onUpdateOrders: (updated: Order[]) => void;
  onUpdateFrancRate: (newRate: number) => void;
  currentFrancRate: number;
  whatsAppConfig?: WhatsAppConfig;
  onUpdateWhatsAppConfig?: (config: WhatsAppConfig) => void;
  systemAlerts?: SystemAlert[];
  currentAdmin?: AdminUser | null;
}

export default function Dashboard({
  currencies,
  products: oldProducts,
  orders,
  onUpdateOrders,
  onUpdateFrancRate,
  currentFrancRate,
  systemAlerts = [],
  currentAdmin
}: DashboardProps) {

  // Current logged in admin details
  const admin = currentAdmin || {
    id: 'admin1',
    name: 'مسؤول افتراضي',
    email: 'admin@badal.com',
    role: 'admin_full' as const
  };

  // Active Screen / Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'admins' | 'suppliers' | 'products' | 'currencies' | 'orders' | 'alerts'>('overview');

  // Real-time Firestore state variables for admin portal
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [schemaProducts, setSchemaProducts] = useState<SchemaProduct[]>([]);
  const [currencyRates, setCurrencyRates] = useState<CurrencyRate[]>([]);

  // Search and Filter local states
  const [adminSearch, setAdminSearch] = useState('');
  const [supplierSearch, setSupplierSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [rateSearch, setRateSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'cancelled'>('all');

  // Load Firestore lists on mount
  useEffect(() => {
    const unsubAdmins = subscribeAdminUsers(setAdminUsers);
    const unsubSuppliers = subscribeSuppliers(setSuppliers);
    const unsubProds = subscribeSchemaProducts(setSchemaProducts);
    const unsubRates = subscribeCurrencyRates(setCurrencyRates);

    return () => {
      unsubAdmins();
      unsubSuppliers();
      unsubProds();
      unsubRates();
    };
  }, []);

  // Toast feedback state
  const [dashToast, setDashToast] = useState<string | null>(null);
  const showToast = (message: string) => {
    setDashToast(message);
    setTimeout(() => setDashToast(null), 3500);
  };

  // Modals management states
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [adminForm, setAdminForm] = useState<{
    name: string;
    email: string;
    password: string;
    role: 'admin_full' | 'product_editor' | 'currency_manager';
    assignedCurrency: string;
    assignedProduct: string;
  }>({ name: '', email: '', password: '', role: 'product_editor', assignedCurrency: 'all', assignedProduct: 'all' });

  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierForm, setSupplierForm] = useState<{
    name: string;
    phone: string;
    email: string;
    address: string;
    status: 'active' | 'inactive';
  }>({ name: '', phone: '', email: '', address: '', status: 'active' });

  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SchemaProduct | null>(null);
  const [productForm, setProductForm] = useState<{
    name: string;
    description: string;
    basePrice: number;
    unit: string;
    status: 'active' | 'inactive' | 'draft';
    imagesText: string;
    supplierIds: string[];
    category: 'all' | 'foodstuffs' | 'oils' | 'sugar' | 'rice' | 'other';
  }>({
    name: '',
    description: '',
    basePrice: 0,
    unit: 'جوال ٥٠ كجم',
    status: 'draft',
    imagesText: '',
    supplierIds: [],
    category: 'other'
  });

  const [isAddingRate, setIsAddingRate] = useState(false);
  const [editingRate, setEditingRate] = useState<CurrencyRate | null>(null);
  const [rateForm, setRateForm] = useState({ currencyCode: '', rateToBase: 0 });
  const [localFrancRate, setLocalFrancRate] = useState<number>(currentFrancRate || 5900);

  useEffect(() => {
    if (currentFrancRate !== undefined && currentFrancRate !== null) {
      setLocalFrancRate(currentFrancRate);
    }
  }, [currentFrancRate]);

  const [alertTitle, setAlertTitle] = useState('');
  const [alertText, setAlertText] = useState('');

  const liveAdmin = adminUsers.find(u => u.email === admin.email) || admin;
  const [simulatedRole, setSimulatedRole] = useState<'admin_full' | 'product_editor' | 'currency_manager' | null>(null);
  const activeRole = simulatedRole || liveAdmin.role;

  // Enforce Access Permissions check strictly
  const hasFullAccess = activeRole === 'admin_full';
  const isProductEditor = activeRole === 'product_editor';
  const isCurrencyManager = activeRole === 'currency_manager';

  // Quick Action block helper
  const verifyPermission = (allowedRoles: ('admin_full' | 'product_editor' | 'currency_manager')[]) => {
    if (!allowedRoles.includes(activeRole)) {
      showToast('❌ عذراً! لا تمتلك صلاحيات كافية لتنفيذ هذا الإجراء.');
      return false;
    }
    return true;
  };

  // Check currency edit permission based on assignment
  const canEditCurrency = (currencyCode: string) => {
    if (hasFullAccess) return true;
    if (isCurrencyManager) {
      if (!liveAdmin.assignedCurrency || liveAdmin.assignedCurrency === 'all') return true;
      return liveAdmin.assignedCurrency.toUpperCase() === currencyCode.toUpperCase();
    }
    return false;
  };

  // Check product edit permission based on assignment
  const canEditProduct = (category: string, productId: string) => {
    if (hasFullAccess) return true;
    if (isProductEditor) {
      if (!liveAdmin.assignedProduct || liveAdmin.assignedProduct === 'all') return true;
      // Could match category (e.g. sugar, oils) OR specific product ID
      return liveAdmin.assignedProduct === category || liveAdmin.assignedProduct === productId;
    }
    return false;
  };

  // -------------------------------------------------------------------------
  // Mutation handlers
  // -------------------------------------------------------------------------

  // 1. Admin operations
  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyPermission(['admin_full'])) return;

    if (!adminForm.name || !adminForm.email) {
      showToast('⚠️ يرجى تعبئة كافة الحقول المطلوبة');
      return;
    }

    try {
      if (editingAdmin) {
        // Edit flow
        const updated: AdminUser = {
          ...editingAdmin,
          name: adminForm.name,
          email: adminForm.email,
          role: adminForm.role,
          assignedCurrency: adminForm.assignedCurrency,
          assignedProduct: adminForm.assignedProduct,
        };
        if (adminForm.password) {
          updated.hashedPassword = await hashString(adminForm.password);
        }
        await updateAdminUser(updated);
        showToast('✅ تم تحديث بيانات المشرف بنجاح');
      } else {
        // Create flow
        if (!adminForm.password) {
          showToast('⚠️ يجب إدخال كلمة مرور للمشرف الجديد');
          return;
        }
        const newId = 'admin-' + Math.random().toString(36).substring(2, 9);
        const passHash = await hashString(adminForm.password);
        await addAdminUser({
          id: newId,
          name: adminForm.name,
          email: adminForm.email,
          role: adminForm.role,
          hashedPassword: passHash,
          assignedCurrency: adminForm.assignedCurrency,
          assignedProduct: adminForm.assignedProduct,
        });
        showToast('✅ تم إنشاء المشرف الجديد بنجاح');
      }
      setIsAddingAdmin(false);
      setEditingAdmin(null);
      setAdminForm({ name: '', email: '', password: '', role: 'product_editor', assignedCurrency: 'all', assignedProduct: 'all' });
    } catch (err) {
      showToast('❌ حدث خطأ أثناء الحفظ بقاعدة البيانات');
    }
  };

  const handleDeleteAdminUser = async (id: string) => {
    if (!verifyPermission(['admin_full'])) return;
    if (confirm('هل أنت متأكد من حذف هذا المشرف نهائياً؟')) {
      await deleteAdminUser(id);
      showToast('🗑️ تم حذف المشرف بنجاح');
    }
  };

  // 2. Supplier operations
  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyPermission(['admin_full'])) return;

    if (!supplierForm.name) {
      showToast('⚠️ يرجى كتابة اسم المورد');
      return;
    }

    try {
      if (editingSupplier) {
        await updateSupplier({
          ...editingSupplier,
          name: supplierForm.name,
          contactInfo: {
            phone: supplierForm.phone,
            email: supplierForm.email,
            address: supplierForm.address
          },
          status: supplierForm.status
        });
        showToast('✅ تم تحديث بيانات المورد بنجاح');
      } else {
        const newId = 'supp-' + Math.random().toString(36).substring(2, 9);
        await addSupplier({
          id: newId,
          name: supplierForm.name,
          contactInfo: {
            phone: supplierForm.phone,
            email: supplierForm.email,
            address: supplierForm.address
          },
          status: supplierForm.status,
          createdBy: admin.id
        });
        showToast('✅ تم إضافة المورد الجديد بنجاح');
      }
      setIsAddingSupplier(false);
      setEditingSupplier(null);
      setSupplierForm({ name: '', phone: '', email: '', address: '', status: 'active' });
    } catch (err) {
      showToast('❌ فشل حفظ بيانات المورد');
    }
  };

  const handleDeleteSupplierItem = async (id: string) => {
    if (!verifyPermission(['admin_full'])) return;
    if (confirm('هل أنت متأكد من حذف هذا المورد؟')) {
      await deleteSupplier(id);
      showToast('🗑️ تم إزالة المورد بنجاح');
    }
  };

  // 3. Product operations
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyPermission(['admin_full', 'product_editor'])) return;

    if (!productForm.name || productForm.basePrice <= 0) {
      showToast('⚠️ يرجى ملء اسم السلعة وتحديد السعر الصحيح');
      return;
    }

    if (!canEditProduct(productForm.category, editingProduct ? editingProduct.id : '')) {
      showToast(`⚠️ غير مصرح لك بتعديل أو إضافة سلع في هذا التصنيف (${productForm.category}). صلاحياتك الإدارية مخصصة لسلع/تصنيفات محددة.`);
      return;
    }

    const imagesArray = productForm.imagesText 
      ? productForm.imagesText.split(',').map(s => s.trim()).filter(Boolean) 
      : [];

    try {
      if (editingProduct) {
        await updateSchemaProduct({
          ...editingProduct,
          name: productForm.name,
          description: productForm.description,
          basePrice: Number(productForm.basePrice),
          unit: productForm.unit,
          status: productForm.status,
          images: imagesArray,
          supplierIds: productForm.supplierIds,
          category: productForm.category,
        });
        showToast('✅ تم تحديث تفاصيل المنتج والربط بنجاح');
      } else {
        const newId = 'prod-' + Math.random().toString(36).substring(2, 9);
        await addSchemaProduct({
          id: newId,
          name: productForm.name,
          description: productForm.description,
          basePrice: Number(productForm.basePrice),
          unit: productForm.unit,
          status: productForm.status,
          images: imagesArray,
          supplierIds: productForm.supplierIds,
          createdBy: admin.id,
          category: productForm.category,
        });
        showToast('✅ تم إضافة السلعة التموينية وربطها بنجاح');
      }
      setIsAddingProduct(false);
      setEditingProduct(null);
      setProductForm({ name: '', description: '', basePrice: 0, unit: 'جوال ٥٠ كجم', status: 'draft', imagesText: '', supplierIds: [], category: 'other' });
    } catch (err) {
      showToast('❌ فشل حفظ المنتج في قاعدة البيانات');
    }
  };

  const handleDeleteProductItem = async (id: string) => {
    if (!verifyPermission(['admin_full', 'product_editor'])) return;
    const p = schemaProducts.find(item => item.id === id);
    if (p && !canEditProduct(p.category || 'other', p.id)) {
      showToast('⚠️ غير مصرح لك بحذف هذا المنتج/التصنيف المخصص لمشرف آخر.');
      return;
    }

    if (confirm('هل ترغب في حذف هذه السلعة نهائياً؟')) {
      await deleteSchemaProduct(id);
      showToast('🗑️ تم حذف السلعة بنجاح');
    }
  };

  // Toggle status of a product quickly
  const toggleProductStatus = async (p: SchemaProduct) => {
    if (!verifyPermission(['admin_full', 'product_editor'])) return;
    if (!canEditProduct(p.category || 'other', p.id)) {
      showToast('⚠️ غير مصرح لك بتعديل حالة هذا المنتج/التصنيف المخصص لمشرف آخر.');
      return;
    }
    const nextStatus = p.status === 'active' ? 'inactive' : 'active';
    await updateSchemaProduct({ ...p, status: nextStatus });
    showToast(`🔄 تم تعديل حالة ${p.name} إلى ${nextStatus === 'active' ? 'متاح' : 'غير متوفر'}`);
  };

  // 4. Currency operations
  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyPermission(['admin_full', 'currency_manager'])) return;

    if (!rateForm.currencyCode || rateForm.rateToBase <= 0) {
      showToast('⚠️ يرجى إدخال رمز العملة والسعر بصورة صحيحة');
      return;
    }

    try {
      const codeUpper = rateForm.currencyCode.toUpperCase().trim();
      const docId = `rate-${codeUpper.toLowerCase()}`;

      if (!canEditCurrency(codeUpper)) {
        showToast(`⚠️ غير مصرح لك بتعديل العملة (${codeUpper}). صلاحياتك الإدارية مقتصرة على عملة معينة.`);
        return;
      }

      if (editingRate) {
        await updateCurrencyRate({
          ...editingRate,
          currencyCode: codeUpper,
          rateToBase: Number(rateForm.rateToBase),
          updatedBy: admin.id
        });
        showToast('✅ تم تحديث سعر صرف العملة بنجاح');
      } else {
        await addCurrencyRate({
          id: docId,
          currencyCode: codeUpper,
          rateToBase: Number(rateForm.rateToBase),
          updatedBy: admin.id
        });
        showToast('✅ تم إضافة العملة الجديدة لجدول الأسعار');
      }

      // Sync Franc rate if editing XAF
      if (codeUpper === 'XAF') {
        await onUpdateFrancRate(Number(rateForm.rateToBase));
      }

      setIsAddingRate(false);
      setEditingRate(null);
      setRateForm({ currencyCode: '', rateToBase: 0 });
    } catch (err) {
      showToast('❌ فشل حفظ سعر الصرف السحابي');
    }
  };

  const handleDeleteRateItem = async (id: string) => {
    if (!verifyPermission(['admin_full'])) return;
    if (confirm('هل ترغب في حذف هذه العملة؟')) {
      await deleteCurrencyRate(id);
      showToast('🗑️ تم إزالة العملة بنجاح');
    }
  };

  // 5. Orders handling
  const handleUpdateOrderStatus = async (orderId: string, newStatus: any) => {
    if (!verifyPermission(['admin_full'])) return;
    const matched = orders.find(o => o.id === orderId);
    if (matched) {
      const updatedList = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
      onUpdateOrders(updatedList);
      showToast(`📦 تم تحديث حالة طلب الشراء رقم #${orderId.substring(6)} بنجاح`);
    }
  };

  // 6. Alert Broadcasting
  const handleBroadcastAlert = async () => {
    if (!verifyPermission(['admin_full'])) return;
    if (!alertTitle.trim() || !alertText.trim()) {
      showToast('⚠️ يرجى كتابة عنوان وتفاصيل التنبيه العاجل!');
      return;
    }

    const newAlert = {
      id: 'alert-' + Date.now(),
      title: alertTitle,
      text: alertText,
      time: 'الآن',
      unread: true,
      createdAt: Date.now()
    };

    await addSystemAlertToDb(newAlert);
    playNotificationSound(undefined, 'price_updated');
    showToast('🚨 تم بث وتوجيه التنبيه العاجل لجميع العملاء والمشتركين فورياً');
    setAlertTitle('');
    setAlertText('');
  };

  const handleDeleteAlertItem = async (id: string) => {
    if (!verifyPermission(['admin_full'])) return;
    await deleteSystemAlertInDb(id);
    showToast('🗑️ تم حذف وبث إلغاء التنبيه العاجل');
  };

  // Filter lists based on searches
  const filteredAdmins = adminUsers.filter(u => 
    (u.name?.toLowerCase().includes(adminSearch.toLowerCase()) || 
     u.email?.toLowerCase().includes(adminSearch.toLowerCase()))
  );

  const filteredSuppliers = suppliers.filter(s => 
    s.name?.toLowerCase().includes(supplierSearch.toLowerCase()) ||
    s.contactInfo?.address?.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  const filteredProducts = schemaProducts.filter(p => 
    p.name?.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.description?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredRates = currencyRates.filter(r => 
    r.currencyCode?.toLowerCase().includes(rateSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 font-tajawal text-stone-200" dir="rtl">
      
      {/* Dynamic Toast Feedback inside Dashboard */}
      <AnimatePresence>
        {dashToast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 max-w-sm bg-amber-500/95 border border-amber-600 text-stone-950 font-bold px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{dashToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Side navigation bar inside Slate Slate */}
      <aside className="w-full md:w-64 shrink-0 bg-[#0E0B08]/90 backdrop-blur-md rounded-2xl border border-amber-500/10 p-5 flex flex-col gap-5 shadow-2xl">
        
        {/* Admin Avatar & Role status */}
        <div className="pb-4 border-b border-stone-800 space-y-3 text-right">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-600 flex items-center justify-center text-stone-950 font-black text-lg select-none">
              {admin.name.charAt(0)}
            </div>
            <div>
              <h4 className="text-sm font-black text-stone-100">{admin.name}</h4>
              <p className="text-[10px] text-stone-500 font-bold">{admin.email}</p>
            </div>
          </div>
          
          <div className="space-y-1.5 pt-1">
            <label className="block text-[10px] text-amber-400 font-bold">نوع صلاحية المشرف (تحديد صارم)</label>
            <select
              value={activeRole}
              onChange={(e) => {
                const selected = e.target.value as 'admin_full' | 'product_editor' | 'currency_manager';
                setSimulatedRole(selected);
                showToast(`🛡️ تم تغيير مستوى صلاحية المشرف إلى: ${
                  selected === 'admin_full' ? 'مدير نظام كامل' : selected === 'product_editor' ? 'محرر السلع والتموين' : 'مسؤول العملات'
                }`);
                // Switch back to overview if current tab is locked for the newly selected role
                if (activeTab === 'admins' && selected !== 'admin_full') {
                  setActiveTab('overview');
                } else if (activeTab === 'suppliers' && selected === 'currency_manager') {
                  setActiveTab('overview');
                } else if (activeTab === 'products' && selected === 'currency_manager') {
                  setActiveTab('overview');
                } else if (activeTab === 'currencies' && selected === 'product_editor') {
                  setActiveTab('overview');
                }
              }}
              className="w-full bg-[#110e11] border border-stone-800 focus:border-amber-500 rounded-xl px-2.5 py-2 text-[11px] font-bold text-stone-200 focus:outline-none cursor-pointer"
            >
              <option value="admin_full">مدير نظام كامل (Full Admin)</option>
              <option value="product_editor">محرر السلع والتموين (Product Editor)</option>
              <option value="currency_manager">مسؤول العملات (Currency Manager)</option>
            </select>
          </div>
        </div>

        {/* Navigation buttons */}
        <nav className="flex flex-col gap-1.5">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview' 
                ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/15' 
                : 'hover:bg-amber-500/10 text-stone-400 hover:text-stone-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>لوحة التحكم الرئيسية</span>
          </button>

          {/* Admin tab (admin_full only) */}
          <button
            onClick={() => {
              if (activeTab !== 'overview' && !hasFullAccess) {
                showToast('🔒 غير مصرح لك بزيارة هذا التبويب');
                return;
              }
              setActiveTab('admins');
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
              !hasFullAccess ? 'opacity-50' : ''
            } ${
              activeTab === 'admins' 
                ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/15' 
                : 'hover:bg-amber-500/10 text-stone-400 hover:text-stone-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4" />
              <span>المشرفون وصلاحياتهم</span>
            </div>
            {!hasFullAccess && <Lock className="w-3 h-3 text-stone-500" />}
          </button>

          {/* Suppliers Tab (admin_full & product_editor) */}
          <button
            onClick={() => {
              if (!hasFullAccess && !isProductEditor) {
                showToast('🔒 غير مصرح لك بزيارة هذا التبويب');
                return;
              }
              setActiveTab('suppliers');
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
              (!hasFullAccess && !isProductEditor) ? 'opacity-50' : ''
            } ${
              activeTab === 'suppliers' 
                ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/15' 
                : 'hover:bg-amber-500/10 text-stone-400 hover:text-stone-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Truck className="w-4 h-4" />
              <span>الموردون وتوزيع السلع</span>
            </div>
            {(!hasFullAccess && !isProductEditor) && <Lock className="w-3 h-3 text-stone-500" />}
          </button>

          {/* Products Tab */}
          <button
            onClick={() => {
              if (!hasFullAccess && !isProductEditor) {
                showToast('🔒 غير مصرح لك بزيارة هذا التبويب');
                return;
              }
              setActiveTab('products');
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
              (!hasFullAccess && !isProductEditor) ? 'opacity-50' : ''
            } ${
              activeTab === 'products' 
                ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/15' 
                : 'hover:bg-amber-500/10 text-stone-400 hover:text-stone-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package className="w-4 h-4" />
              <span>إدارة السلع والتموين</span>
            </div>
            {(!hasFullAccess && !isProductEditor) && <Lock className="w-3 h-3 text-stone-500" />}
          </button>

          {/* Currency Rates Tab */}
          <button
            onClick={() => {
              if (!hasFullAccess && !isCurrencyManager) {
                showToast('🔒 غير مصرح لك بزيارة هذا التبويب');
                return;
              }
              setActiveTab('currencies');
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
              (!hasFullAccess && !isCurrencyManager) ? 'opacity-50' : ''
            } ${
              activeTab === 'currencies' 
                ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/15' 
                : 'hover:bg-amber-500/10 text-stone-400 hover:text-stone-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Coins className="w-4 h-4" />
              <span>أسعار الصرف السحابية</span>
            </div>
            {(!hasFullAccess && !isCurrencyManager) && <Lock className="w-3 h-3 text-stone-500" />}
          </button>

          {/* Orders Tab */}
          <button
            onClick={() => {
              if (!hasFullAccess) {
                showToast('🔒 غير مصرح لك بزيارة هذا التبويب');
                return;
              }
              setActiveTab('orders');
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
              !hasFullAccess ? 'opacity-50' : ''
            } ${
              activeTab === 'orders' 
                ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/15' 
                : 'hover:bg-amber-500/10 text-stone-400 hover:text-stone-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4" />
              <span>الطلبات المباشرة</span>
            </div>
            {!hasFullAccess && <Lock className="w-3 h-3 text-stone-500" />}
          </button>

          {/* System Alerts Tab */}
          <button
            onClick={() => {
              if (!hasFullAccess) {
                showToast('🔒 غير مصرح لك بزيارة هذا التبويب');
                return;
              }
              setActiveTab('alerts');
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
              !hasFullAccess ? 'opacity-50' : ''
            } ${
              activeTab === 'alerts' 
                ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/15' 
                : 'hover:bg-amber-500/10 text-stone-400 hover:text-stone-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4" />
              <span>بث التنبيهات العاجلة</span>
            </div>
            {!hasFullAccess && <Lock className="w-3 h-3 text-stone-500" />}
          </button>
        </nav>

        {/* Footer info inside sidebar */}
        <div className="mt-auto pt-4 border-t border-stone-800 text-[10px] text-stone-500 leading-relaxed text-center">
          المزامنة السحابية: <span className="text-emerald-500 font-bold">نشطة ●</span>
          <br />
          قاعدة البيانات: Firestore V2
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-[#0E0B08]/90 border border-amber-500/10 rounded-2xl p-6 shadow-2xl relative min-h-[500px]">
        
        {/* ----------------- 1. Overview Tab ----------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-stone-800">
              <div>
                <h2 className="text-lg font-black text-amber-200">اللوحة الرئيسية لبيانات Badal الإدارية</h2>
                <p className="text-[11px] text-stone-400 mt-1">نظرة عامة على حجم التوزيع والمؤشرات التشغيلية والعمليات</p>
              </div>
              <span className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-lg text-xs font-black border border-amber-500/20 flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>مزامنة مباشرة</span>
              </span>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-stone-900/60 p-4 rounded-xl border border-stone-800/80 flex flex-col justify-between">
                <span className="text-stone-400 text-[10px] font-bold">السلع والمواد المتاحة</span>
                <span className="text-2xl font-black text-amber-400 mt-2">{schemaProducts.length} <span className="text-[10px] text-stone-500 font-bold">أصناف تموينية</span></span>
              </div>
              <div className="bg-stone-900/60 p-4 rounded-xl border border-stone-800/80 flex flex-col justify-between">
                <span className="text-stone-400 text-[10px] font-bold">إجمالي الموردين</span>
                <span className="text-2xl font-black text-stone-100 mt-2">{suppliers.length} <span className="text-[10px] text-stone-500 font-bold">مجمع وموزع</span></span>
              </div>
              <div className="bg-stone-900/60 p-4 rounded-xl border border-stone-800/80 flex flex-col justify-between">
                <span className="text-stone-400 text-[10px] font-bold">الطلبات الواردة</span>
                <span className="text-2xl font-black text-stone-100 mt-2">{orders.length} <span className="text-[10px] text-stone-500 font-bold">طلب شراء</span></span>
              </div>
              <div className="bg-stone-900/60 p-4 rounded-xl border border-stone-800/80 flex flex-col justify-between">
                <span className="text-stone-400 text-[10px] font-bold">المشرفون بالمنصة</span>
                <span className="text-2xl font-black text-stone-100 mt-2">{adminUsers.length} <span className="text-[10px] text-stone-500 font-bold">حسابات نشطة</span></span>
              </div>
            </div>

            {/* Main info row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              {/* Currency rate section */}
              <div className="bg-[#130E0A] p-5 rounded-xl border border-amber-500/10 space-y-4">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-amber-200">سعر الصرف الرئيسي المعتمد (الفرنك التشادي)</h3>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed">
                  يتم استخدام هذا السعر كقاعدة للتحويل التلقائي لأسعار كافة السلع والمواد المعروضة للعميل والشركاء في التطبيق.
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-amber-400">{currentFrancRate} <span className="text-xs text-stone-400 font-bold">جنية سوداني</span></span>
                  <button 
                    onClick={() => setActiveTab('currencies')}
                    className="mr-auto px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 text-[11px] font-black rounded-lg transition-all"
                  >
                    تعديل سعر الصرف
                  </button>
                </div>
              </div>

              {/* Security info card */}
              <div className="bg-stone-900/50 p-5 rounded-xl border border-stone-800/80 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-emerald-400">صلاحيات وهيكلية الحماية النشطة</h3>
                </div>
                <div className="space-y-2 text-xs text-stone-300 leading-relaxed">
                  <p>تعتمد لوحة التحكم نظام الحماية الصارم بالصلاحيات والمستند لملف الأمان السحابي:</p>
                  <ul className="list-disc list-inside space-y-1 text-stone-400 text-[11px] pr-2">
                    <li><strong className="text-amber-200">مدير النظام الكامل (Full Admin):</strong> صلاحيات شاملة (تعديل السلع، الموردين، العملات، والمشرفين).</li>
                    <li><strong className="text-amber-200">محرر المنتجات والتموين (Product Editor):</strong> صلاحيات حصرية للتحكم بالسلع وربطها بالموردين.</li>
                    <li><strong className="text-amber-200">مسؤول أسعار الصرف (Currency Manager):</strong> صلاحية وحيدة لتعديل أسعار صرف العملات.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Active alerts panel */}
            <div className="bg-stone-900/40 p-4 rounded-xl border border-stone-850">
              <h4 className="text-xs font-black text-amber-200 mb-3">آخر التنبيهات العاجلة المبثوثة للزبائن</h4>
              {systemAlerts.length === 0 ? (
                <p className="text-[11px] text-stone-500 py-2">لا توجد تنبيهات عاجلة نشطة حالياً.</p>
              ) : (
                <div className="space-y-2 max-h-[160px] overflow-y-auto no-scrollbar">
                  {systemAlerts.map(alert => (
                    <div key={alert.id} className="flex justify-between items-center bg-stone-900/80 p-2.5 rounded-lg border border-stone-800">
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-amber-400">{alert.title}</span>
                        <p className="text-[10px] text-stone-300 mt-0.5">{alert.text}</p>
                      </div>
                      <span className="text-[9px] text-stone-500 shrink-0">{alert.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ----------------- 2. Admin Management Tab ----------------- */}
        {activeTab === 'admins' && (
          <div className="space-y-6">
            {!hasFullAccess ? (
              <div className="text-center py-16 space-y-4">
                <Lock className="w-16 h-16 text-rose-500/30 mx-auto animate-pulse" />
                <h3 className="text-base font-black text-rose-400">قسم مغلق وغير مصرح لك</h3>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">صلاحيات إدارة المشرفين والمستخدمين وحقوقهم مخصصة حصراً لمدراء النظام ذوي الصلاحيات الكاملة (admin_full).</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-stone-800">
                  <div>
                    <h2 className="text-lg font-black text-amber-200">إدارة المشرفين وصلاحيات الحماية</h2>
                    <p className="text-[11px] text-stone-400 mt-1">تحديد وحماية مستويات الدخول لضبط العمليات وتحديث الأسعار التموينية والعملات</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingAdmin(null);
                      setAdminForm({ name: '', email: '', password: '', role: 'product_editor', assignedCurrency: 'all', assignedProduct: 'all' });
                      setIsAddingAdmin(true);
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 active:scale-95 shadow-md shadow-amber-500/10 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة مشرف جديد</span>
                  </button>
                </div>

                {/* Search box */}
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-500 absolute right-3.5 top-3.5" />
                  <input
                    type="text"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    placeholder="ابحث بالاسم أو البريد الإلكتروني للمشرف..."
                    className="w-full bg-[#110e11] border border-stone-800 focus:border-amber-500 rounded-xl py-3 pr-10 pl-4 text-xs text-stone-200 placeholder-stone-600 focus:outline-none transition-all"
                  />
                </div>

                {/* Admins Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-stone-800 text-stone-400 font-bold">
                        <th className="py-3 px-2">الاسم</th>
                        <th className="py-3 px-2">البريد الإلكتروني</th>
                        <th className="py-3 px-2">الدور الإداري المفوّض</th>
                        <th className="py-3 px-2">التعيين / التخصيص</th>
                        <th className="py-3 px-2 text-left">العمليات والمحاسبة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAdmins.map(u => (
                        <tr key={u.id} className="border-b border-stone-900/50 hover:bg-stone-900/30 transition-colors">
                          <td className="py-3.5 px-2 font-black text-stone-100">{u.name}</td>
                          <td className="py-3.5 px-2 font-mono text-stone-400">{u.email}</td>
                          <td className="py-3.5 px-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              u.role === 'admin_full' 
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                                : u.role === 'product_editor'
                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {u.role === 'admin_full' ? 'صلاحيات كاملة' : u.role === 'product_editor' ? 'محرر تموين' : 'مسؤول صرف'}
                            </span>
                          </td>
                          <td className="py-3.5 px-2">
                            <div className="flex flex-col gap-1 text-[11px]">
                              {u.role === 'admin_full' ? (
                                <span className="text-stone-500 font-bold">جميع العملات والسلع</span>
                              ) : (
                                <>
                                  {u.role === 'currency_manager' && (
                                    <span className="text-amber-400">
                                      العملة: {u.assignedCurrency === 'all' || !u.assignedCurrency ? 'الكل' : u.assignedCurrency}
                                    </span>
                                  )}
                                  {u.role === 'product_editor' && (
                                    <span className="text-indigo-400">
                                      السلع: {u.assignedProduct === 'all' || !u.assignedProduct ? 'الكل' : (
                                        u.assignedProduct === 'sugar' ? 'السكر' :
                                        u.assignedProduct === 'oils' ? 'الزيوت' :
                                        u.assignedProduct === 'rice' ? 'الأرز' :
                                        u.assignedProduct === 'foodstuffs' ? 'الغذائيات' :
                                        u.assignedProduct === 'other' ? 'أخرى' : u.assignedProduct
                                      )}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-2 text-left space-x-2 space-x-reverse">
                            <button
                              onClick={() => {
                                setEditingAdmin(u);
                                setAdminForm({ 
                                  name: u.name || '', 
                                  email: u.email || '', 
                                  password: '', 
                                  role: u.role || 'product_editor',
                                  assignedCurrency: u.assignedCurrency || 'all',
                                  assignedProduct: u.assignedProduct || 'all'
                                });
                                setIsAddingAdmin(true);
                              }}
                              className="p-1.5 bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-300 rounded-lg transition-colors cursor-pointer"
                              title="تعديل"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAdminUser(u.id)}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors cursor-pointer"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ----------------- 3. Supplier Management Tab ----------------- */}
        {activeTab === 'suppliers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-stone-800">
              <div>
                <h2 className="text-lg font-black text-amber-200">الموردون والشركات المتعاقدة</h2>
                <p className="text-[11px] text-stone-400 mt-1">تتبع وإضافة شركات ومستودعات التموين الكبرى لربط السلع بالمخازن المعتمدة</p>
              </div>
              {hasFullAccess && (
                <button
                  onClick={() => {
                    setEditingSupplier(null);
                    setSupplierForm({ name: '', phone: '', email: '', address: '', status: 'active' });
                    setIsAddingSupplier(true);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 active:scale-95 shadow-md shadow-amber-500/10 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة مورد جديد</span>
                </button>
              )}
            </div>

            {/* Search box */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-500 absolute right-3.5 top-3.5" />
              <input
                type="text"
                value={supplierSearch}
                onChange={(e) => setSupplierSearch(e.target.value)}
                placeholder="ابحث باسم المورد أو المقر..."
                className="w-full bg-[#110e11] border border-stone-800 focus:border-amber-500 rounded-xl py-3 pr-10 pl-4 text-xs text-stone-200 placeholder-stone-600 focus:outline-none transition-all"
              />
            </div>

            {/* Suppliers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSuppliers.map(sup => (
                <div key={sup.id} className="bg-stone-900/50 p-4 rounded-xl border border-stone-800/80 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="font-black text-stone-100 text-sm">{sup.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        sup.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-stone-850 text-stone-500 border border-stone-800'
                      }`}>
                        {sup.status === 'active' ? 'نشط ومعتمد' : 'غير نشط'}
                      </span>
                    </div>
                    <div className="mt-3 space-y-1.5 text-[11px] text-stone-400">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-amber-500" />
                        <span>الهاتف: {sup.contactInfo?.phone || 'غير مسجل'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-amber-500" />
                        <span>البريد: {sup.contactInfo?.email || 'غير مسجل'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-500" />
                        <span>المقر: {sup.contactInfo?.address || 'غير مسجل'}</span>
                      </div>
                    </div>
                  </div>

                  {hasFullAccess && (
                    <div className="flex justify-end gap-2 pt-2 border-t border-stone-850">
                      <button
                        onClick={() => {
                          setEditingSupplier(sup);
                          setSupplierForm({
                            name: sup.name || '',
                            phone: sup.contactInfo?.phone || '',
                            email: sup.contactInfo?.email || '',
                            address: sup.contactInfo?.address || '',
                            status: sup.status || 'active'
                          });
                          setIsAddingSupplier(true);
                        }}
                        className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDeleteSupplierItem(sup.id)}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        حذف
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------- 4. Commodity/Products Tab ----------------- */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-stone-800">
              <div>
                <h2 className="text-lg font-black text-amber-200">إدارة مستودعات السلع الغذائية والتموينية</h2>
                <p className="text-[11px] text-stone-400 mt-1">تحديث الأسعار، كميات التوريد والربط التلقائي بمجمع الموردين والشركاء</p>
              </div>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({ name: '', description: '', basePrice: 0, unit: 'جوال ٥٠ كجم', status: 'draft', imagesText: '', supplierIds: [], category: 'other' });
                  setIsAddingProduct(true);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 active:scale-95 shadow-md shadow-amber-500/10 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة منتج تمويني جديد</span>
              </button>
            </div>

            {/* Search box */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-500 absolute right-3.5 top-3.5" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="ابحث باسم السلعة أو الوصف..."
                className="w-full bg-[#110e11] border border-stone-800 focus:border-amber-500 rounded-xl py-3 pr-10 pl-4 text-xs text-stone-200 placeholder-stone-600 focus:outline-none transition-all"
              />
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 font-bold">
                    <th className="py-3 px-2">السلعة</th>
                    <th className="py-3 px-2">السعر الأساسي (فرنك)</th>
                    <th className="py-3 px-2">العلبة / الوحدة</th>
                    <th className="py-3 px-2">الموردون المعتمدون</th>
                    <th className="py-3 px-2 text-center">حالة التوفر بالمخزون</th>
                    <th className="py-3 px-2 text-left">العمليات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(prod => {
                    // Match supplier names
                    const matchedSups = suppliers.filter(s => prod.supplierIds?.includes(s.id));
                    return (
                      <tr key={prod.id} className="border-b border-stone-900/50 hover:bg-stone-900/30 transition-colors">
                        <td className="py-3.5 px-2">
                          <div className="flex items-center gap-3">
                            {prod.images && prod.images.length > 0 && prod.images[0] ? (
                              <SafeImage 
                                src={prod.images[0]} 
                                alt={prod.name} 
                                fallbackSrc="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=60&w=150"
                                className="w-10 h-10 object-cover rounded-xl border border-stone-800 bg-stone-900/60"
                              />
                            ) : (
                              <div className="w-10 h-10 flex items-center justify-center rounded-xl border border-stone-800 bg-stone-950 text-stone-600 font-bold text-[10px]">
                                لا صورة
                              </div>
                            )}
                            <div>
                              <span className="font-black text-stone-100 block">{prod.name}</span>
                              {prod.description && <p className="text-[10px] text-stone-400 mt-0.5 max-w-xs line-clamp-1">{prod.description}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-2 font-mono text-amber-400 font-bold">{prod.basePrice?.toLocaleString()} فرنك</td>
                        <td className="py-3.5 px-2 text-stone-300">{prod.unit || 'جوال ٥٠ كجم'}</td>
                        <td className="py-3.5 px-2">
                          <div className="flex flex-wrap gap-1">
                            {matchedSups.length === 0 ? (
                              <span className="text-stone-500 text-[10px]">غير مربوط بمورد</span>
                            ) : (
                              matchedSups.map(s => (
                                <span key={s.id} className="bg-stone-900 text-stone-300 text-[9px] font-bold px-2 py-0.5 rounded border border-stone-800">
                                  {s.name.split(' ')[0]}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-2 text-center">
                          <button
                            onClick={() => toggleProductStatus(prod)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                              prod.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                                : prod.status === 'draft'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
                            }`}
                          >
                            {prod.status === 'active' ? 'متاح / نشط' : prod.status === 'draft' ? 'مسودة' : 'غير متوفر'}
                          </button>
                        </td>
                        <td className="py-3.5 px-2 text-left space-x-2 space-x-reverse">
                          <button
                            onClick={() => {
                              setEditingProduct(prod);
                              setProductForm({
                                name: prod.name || '',
                                description: prod.description || '',
                                basePrice: prod.basePrice || 0,
                                unit: prod.unit || 'جوال ٥٠ كجم',
                                status: prod.status || 'draft',
                                imagesText: prod.images ? prod.images.join(', ') : '',
                                supplierIds: prod.supplierIds || [],
                                category: prod.category || 'other'
                              });
                              setIsAddingProduct(true);
                            }}
                            className="p-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {hasFullAccess && (
                            <button
                              onClick={() => handleDeleteProductItem(prod.id)}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ----------------- 5. Currency rates Tab ----------------- */}
        {activeTab === 'currencies' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-stone-800">
              <div>
                <h2 className="text-lg font-black text-amber-200">أسعار صرف العملات الأجنبية</h2>
                <p className="text-[11px] text-stone-400 mt-1">تحديث أسعار صرف السلع والتحويل السريع مقابل الجنيه والفرنك لحظة بلحظة</p>
              </div>
              <button
                onClick={() => {
                  setEditingRate(null);
                  setRateForm({ currencyCode: '', rateToBase: 0 });
                  setIsAddingRate(true);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 active:scale-95 shadow-md shadow-amber-500/10 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة عملة جديدة</span>
              </button>
            </div>

            {/* Quick edit Franc rate panel */}
            <div className="bg-[#18130E] p-4 rounded-xl border border-amber-500/20 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-right">
                <span className="text-xs font-bold text-amber-400">تحديث أسعار الصرف (الفرنك التشادي)</span>
                <p className="text-[10px] text-stone-400 mt-0.5">قم بكتابة السعر الجديد للفرنك بالأسفل ثم اضغط على زر حفظ لتحديثه في قاعدة البيانات فورياً</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto items-center">
                <input
                  type="number"
                  value={localFrancRate ?? ''}
                  onChange={(e) => setLocalFrancRate(Number(e.target.value))}
                  className="w-24 bg-[#110e11] border border-amber-500/20 focus:border-amber-500 rounded-lg p-2 text-center text-xs font-black text-amber-400 focus:outline-none"
                />
                <span className="bg-stone-900 border border-stone-800 px-3 py-2 text-[10px] font-bold text-stone-300 rounded-lg flex items-center justify-center shrink-0">
                  جنيهاً سودانياً
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    await onUpdateFrancRate(localFrancRate);
                    showToast('✅ تم تحديث سعر صرف الفرنك التشادي بنجاح');
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-black rounded-lg transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  حفظ
                </button>
              </div>
            </div>

            {/* Rates Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 font-bold">
                    <th className="py-3 px-2">العملة</th>
                    <th className="py-3 px-2">الرمز</th>
                    <th className="py-3 px-2">سعر الصرف ونوع الحساب</th>
                    <th className="py-3 px-2 text-left">العمليات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRates.map(rate => {
                    const code = rate.currencyCode?.toUpperCase();
                    let name = code;
                    let flag = '🏳️';
                    let rateDescription = 'ج.س.';
                    
                    if (code === 'XAF') {
                      name = 'الفرنك التشادي';
                      flag = '🇹🇩';
                      rateDescription = 'ج.س (لكل ١,٠٠٠ فرنك)';
                    } else if (code === 'USDT' || code === 'USD') {
                      name = 'تتر (USDT)';
                      flag = '🇺🇸';
                      rateDescription = 'ج.س (لكل ١ تتر)';
                    } else if (code === 'EGP') {
                      name = 'الجنيه المصري';
                      flag = '🇪🇬';
                      rateDescription = 'ج.س (لكل ١ جنيه مصري)';
                    } else if (code === 'NGN') {
                      name = 'النايرا النيجيرية';
                      flag = '🇳🇬';
                      rateDescription = 'نايرا نيجيرية (لكل ١,٠٠٠ فرنك)';
                    }

                    return (
                      <tr key={rate.id} className="border-b border-stone-900/50 hover:bg-stone-900/30 transition-colors">
                        <td className="py-3.5 px-2 font-bold text-stone-100">
                          <span className="ml-1.5">{flag}</span>
                          <span>{name}</span>
                        </td>
                        <td className="py-3.5 px-2 font-black font-mono text-amber-500/80">{code}</td>
                        <td className="py-3.5 px-2 font-mono text-stone-200">
                          <span className="font-black text-amber-400 text-sm ml-1">{rate.rateToBase?.toLocaleString()}</span>
                          <span className="text-[10px] text-stone-400 font-tajawal">{rateDescription}</span>
                        </td>
                        <td className="py-3.5 px-2 text-left space-x-2 space-x-reverse">
                          {canEditCurrency(code) ? (
                            <button
                              onClick={() => {
                                setEditingRate(rate);
                                setRateForm({ currencyCode: rate.currencyCode || '', rateToBase: rate.rateToBase || 0 });
                                setIsAddingRate(true);
                              }}
                              className="p-1.5 bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-300 rounded-lg transition-colors cursor-pointer"
                              title="تعديل السعر"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-stone-500 bg-stone-900/40 border border-stone-800/50 px-2 py-1 rounded-md">
                              <Lock className="w-2.5 h-2.5 text-stone-600" />
                              <span>مغلق</span>
                            </span>
                          )}
                          {hasFullAccess && (
                            <button
                              onClick={() => handleDeleteRateItem(rate.id)}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ----------------- 6. Orders list Tab ----------------- */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {!hasFullAccess ? (
              <div className="text-center py-16 space-y-4">
                <Lock className="w-16 h-16 text-rose-500/30 mx-auto animate-pulse" />
                <h3 className="text-base font-black text-rose-400">قسم مغلق وغير مصرح لك</h3>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">صلاحية مراجعة طلبات الشراء للعملاء مقتصرة فقط على حسابات المدير المفوّض.</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-stone-800">
                  <div>
                    <h2 className="text-lg font-black text-amber-200">طلبات الشراء الواردة من العملاء</h2>
                    <p className="text-[11px] text-stone-400 mt-1">تتبع، فرز، والتواصل مع أصحاب الطلبات لتوصيل المشتريات التموينية</p>
                  </div>
                  <div className="flex gap-1 bg-stone-900/60 p-1 rounded-xl border border-stone-800/80">
                    {(['all', 'pending', 'processing', 'completed', 'cancelled'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setOrderFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          orderFilter === f 
                            ? 'bg-amber-500 text-stone-950 font-black' 
                            : 'text-stone-400 hover:text-stone-100'
                        }`}
                      >
                        {f === 'all' ? 'الكل' : f === 'pending' ? 'قيد الانتظار' : f === 'processing' ? 'جاري التنفيذ' : f === 'completed' ? 'مكتمل' : 'ملغي'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orders grid */}
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12 text-stone-500 text-xs">لا توجد طلبات شراء مطابقة للمعايير المحددة.</div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredOrders.map(o => (
                      <div key={o.id} className="bg-stone-900/40 p-4 rounded-xl border border-stone-850 flex flex-col md:flex-row justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-stone-100 text-sm">{o.productName}</span>
                            <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/25 font-bold">
                              {o.price} فرنك • {o.unit}
                            </span>
                            <span className="text-[10px] text-stone-500">{o.timestamp}</span>
                          </div>
                          <div className="space-y-1 text-xs text-stone-400 leading-relaxed">
                            <p>الزبون: <strong className="text-stone-200">{o.customerName}</strong> • الهاتف: <strong className="text-stone-200">{o.customerPhone}</strong></p>
                            {o.notes && <p className="text-stone-500 text-[11px] bg-stone-950/40 p-2 rounded-lg border border-stone-900">ملاحظات الزبون: {o.notes}</p>}
                          </div>
                        </div>

                        <div className="flex flex-row md:flex-col justify-end items-end gap-3 shrink-0">
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as any)}
                            className="bg-stone-900 border border-stone-800 text-stone-300 text-[11px] font-bold py-1 px-2.5 rounded-lg focus:outline-none cursor-pointer"
                          >
                            <option value="pending">قيد الانتظار</option>
                            <option value="processing">جاري المعالجة والتوريد</option>
                            <option value="completed">تم التوصيل والتسوية</option>
                            <option value="cancelled">طلب ملغي</option>
                          </select>
                          <a
                            href={`https://wa.me/${o.customerPhone.replace(/[\s+]/g, '')}?text=مرحباً ${o.customerName}، لقد استلمنا طلبكم بخصوص ${o.productName}.`}
                            target="_blank"
                            referrerPolicy="no-referrer"
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-stone-950 text-[10px] font-black rounded-lg transition-colors flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>تواصل واتساب</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ----------------- 7. System alerts broadcasting Tab ----------------- */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            {!hasFullAccess ? (
              <div className="text-center py-16 space-y-4">
                <Lock className="w-16 h-16 text-rose-500/30 mx-auto animate-pulse" />
                <h3 className="text-base font-black text-rose-400">قسم مغلق وغير مصرح لك</h3>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">بث التنبيهات والرسائل العاجلة لعامة العملاء والمستخدمين مقتصرة فقط على حسابات المدير الفوّض.</p>
              </div>
            ) : (
              <>
                <div className="pb-4 border-b border-stone-800">
                  <h2 className="text-lg font-black text-amber-200">بث وتوجيه التنبيهات العاجلة فورياً</h2>
                  <p className="text-[11px] text-stone-400 mt-1">إرسال رسائل مالية أو تسويقية تظهر في واجهة تطبيق الزبائن بالهاتف مباشرة مع رنين تنبيهي</p>
                </div>

                <div className="bg-stone-900/50 p-5 rounded-xl border border-stone-800 space-y-4 max-w-2xl">
                  <h3 className="text-xs font-bold text-amber-400">محرر التنبيه العاجل النشط</h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-stone-400">عنوان التنبيه الرئيسي</label>
                      <input
                        type="text"
                        value={alertTitle}
                        onChange={(e) => setAlertTitle(e.target.value)}
                        placeholder="مثال: تحديث عاجل لأسعار الصرف..."
                        className="w-full bg-[#110e11] border border-stone-800 focus:border-amber-500 rounded-xl p-3 text-xs text-stone-200 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-stone-400">تفاصيل الرسالة التنبيهية</label>
                      <textarea
                        value={alertText}
                        onChange={(e) => setAlertText(e.target.value)}
                        placeholder="اكتب التحديث السعري المالي أو خبر توفر المواد والمستودعات..."
                        rows={4}
                        className="w-full bg-[#110e11] border border-stone-800 focus:border-amber-500 rounded-xl p-3 text-xs text-stone-200 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={handleBroadcastAlert}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg active:scale-98 cursor-pointer"
                    >
                      <Bell className="w-4 h-4" />
                      <span>بث وإرسال التنبيه العاجل فورياً</span>
                    </button>
                  </div>
                </div>

                {/* List of active alerts */}
                <div className="space-y-3 pt-4">
                  <h4 className="text-xs font-bold text-amber-200">التنبيهات السحابية النشطة بالمشهد</h4>
                  {systemAlerts.length === 0 ? (
                    <p className="text-xs text-stone-500">لا توجد رسائل منشورة حالياً بالبث الحي.</p>
                  ) : (
                    <div className="space-y-2">
                      {systemAlerts.map(alert => (
                        <div key={alert.id} className="bg-stone-900/60 p-3.5 rounded-xl border border-stone-800 flex justify-between items-center">
                          <div className="text-right">
                            <span className="text-xs font-bold text-stone-100">{alert.title}</span>
                            <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">{alert.text}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteAlertItem(alert.id)}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="إزالة وبث الإلغاء"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* 8. MODAL WINDOWS FOR ADMINISTRATORS */}
      {/* ========================================================================= */}

      {/* 1. Admin Add/Edit Modal */}
      {isAddingAdmin && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-[9999] flex justify-center items-center p-4">
          <div className="bg-[#0E0B08] border border-amber-500/20 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative text-right">
            <button 
              onClick={() => setIsAddingAdmin(false)}
              className="absolute top-4 left-4 text-stone-500 hover:text-stone-300"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-black text-amber-200">
              {editingAdmin ? 'تعديل بيانات المشرف' : 'إضافة مشرف جديد وصلاحياته'}
            </h3>
            
            <form onSubmit={handleSaveAdmin} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-[10px] text-stone-400 font-bold">اسم المشرف</label>
                <input
                  type="text"
                  required
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  placeholder="مثال: محمد عثمان..."
                  className="w-full bg-[#110e11] border border-stone-850 focus:border-amber-500 rounded-xl p-2.5 text-xs text-stone-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-stone-400 font-bold">البريد الإلكتروني المفوّض</label>
                <input
                  type="email"
                  required
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  placeholder="admin@example.com"
                  className="w-full bg-[#110e11] border border-stone-850 focus:border-amber-500 rounded-xl p-2.5 text-xs text-stone-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-stone-400 font-bold">
                  كلمة المرور {editingAdmin && '(اترك فارغاً للاحتفاظ بكلمة المرور الحالية)'}
                </label>
                <input
                  type="password"
                  required={!editingAdmin}
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-[#110e11] border border-stone-850 focus:border-amber-500 rounded-xl p-2.5 text-xs text-stone-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-stone-400 font-bold">مستوى المفوضية الإدارية</label>
                <select
                  value={adminForm.role}
                  onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value as any })}
                  className="w-full bg-[#110e11] border border-stone-850 focus:border-amber-500 rounded-xl p-2.5 text-xs text-stone-200 focus:outline-none"
                >
                  <option value="admin_full">صلاحيات كاملة شاملة (Full Admin)</option>
                  <option value="product_editor">محرر السلع والتموين فقط (Product Editor)</option>
                  <option value="currency_manager">مسؤول أسعار صرف العملات فقط (Currency Manager)</option>
                </select>
              </div>

              {adminForm.role === 'currency_manager' && (
                <div className="space-y-1 animate-fade-in">
                  <label className="block text-[10px] text-amber-400 font-bold">تحديد عملة التعيين المخصصة</label>
                  <select
                    value={adminForm.assignedCurrency}
                    onChange={(e) => setAdminForm({ ...adminForm, assignedCurrency: e.target.value })}
                    className="w-full bg-[#110e11] border border-stone-850 focus:border-amber-500 rounded-xl p-2.5 text-xs text-stone-200 focus:outline-none"
                  >
                    <option value="all">كل العملات المتوفرة (الوصول العام)</option>
                    {currencies.map(c => (
                      <option key={c.id} value={c.code}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>
              )}

              {adminForm.role === 'product_editor' && (
                <div className="space-y-1 animate-fade-in">
                  <label className="block text-[10px] text-indigo-400 font-bold">تحديد سلع التعيين المخصصة</label>
                  <select
                    value={adminForm.assignedProduct}
                    onChange={(e) => setAdminForm({ ...adminForm, assignedProduct: e.target.value })}
                    className="w-full bg-[#110e11] border border-stone-850 focus:border-amber-500 rounded-xl p-2.5 text-xs text-stone-200 focus:outline-none"
                  >
                    <option value="all">كل السلع والمنتجات (الوصول العام)</option>
                    <optgroup label="التصنيفات العامة للتموين" className="text-stone-400">
                      <option value="sugar">تصنيف: السكر</option>
                      <option value="oils">تصنيف: الزيوت</option>
                      <option value="rice">تصنيف: الأرز</option>
                      <option value="foodstuffs">تصنيف: الغذائيات</option>
                      <option value="other">تصنيف: سلع أخرى</option>
                    </optgroup>
                    {schemaProducts.length > 0 && (
                      <optgroup label="أصناف سلع تموينية معينة" className="text-stone-400">
                        {schemaProducts.map(p => (
                          <option key={p.id} value={p.id}>سلعة: {p.name}</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-black py-2 rounded-xl text-xs mt-4 transition-all"
              >
                حفظ وحماية الحساب
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Supplier Add/Edit Modal */}
      {isAddingSupplier && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-[9999] flex justify-center items-center p-4">
          <div className="bg-[#0E0B08] border border-amber-500/20 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative text-right">
            <button 
              onClick={() => setIsAddingSupplier(false)}
              className="absolute top-4 left-4 text-stone-500 hover:text-stone-300"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-black text-amber-200">
              {editingSupplier ? 'تعديل بيانات المورد' : 'إضافة شركة أو مستودع مورد'}
            </h3>
            
            <form onSubmit={handleSaveSupplier} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-[10px] text-stone-400 font-bold">اسم الشركة الموردة</label>
                <input
                  type="text"
                  required
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  placeholder="مثال: Nile Trading..."
                  className="w-full bg-[#110e11] border border-stone-850 focus:border-amber-500 rounded-xl p-2.5 text-xs text-stone-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-stone-400 font-bold">رقم الهاتف للتوريد</label>
                <input
                  type="text"
                  value={supplierForm.phone}
                  onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                  placeholder="+249..."
                  className="w-full bg-[#110e11] border border-stone-850 focus:border-amber-500 rounded-xl p-2.5 text-xs text-stone-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-stone-400 font-bold">البريد الإلكتروني للشركة</label>
                <input
                  type="email"
                  value={supplierForm.email}
                  onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                  placeholder="supplier@example.com"
                  className="w-full bg-[#110e11] border border-stone-850 focus:border-amber-500 rounded-xl p-2.5 text-xs text-stone-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-stone-400 font-bold">العنوان ومستودع الشركة</label>
                <input
                  type="text"
                  value={supplierForm.address}
                  onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                  placeholder="المقر أو موقع المستودع"
                  className="w-full bg-[#110e11] border border-stone-850 focus:border-amber-500 rounded-xl p-2.5 text-xs text-stone-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-stone-400 font-bold">حالة المورد بالمشهد</label>
                <select
                  value={supplierForm.status}
                  onChange={(e) => setSupplierForm({ ...supplierForm, status: e.target.value as any })}
                  className="w-full bg-[#110e11] border border-stone-850 focus:border-amber-500 rounded-xl p-2.5 text-xs text-stone-200 focus:outline-none"
                >
                  <option value="active">نشط معتمد للتوريد</option>
                  <option value="inactive">غير نشط / مجمّد مؤقتاً</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-black py-2 rounded-xl text-xs mt-4 transition-all"
              >
                حفظ بيانات التوريد
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Product Add/Edit Modal */}
      {isAddingProduct && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-[9999] flex justify-center items-center p-4">
          <div className="bg-[#0E0B08] border border-amber-500/20 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-right">
            <button 
              onClick={() => setIsAddingProduct(false)}
              className="absolute top-4 left-4 text-stone-500 hover:text-stone-300"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-black text-amber-200">
              {editingProduct ? 'تعديل السلعة التموينية' : 'إضافة سلعة غذائية / تموينية'}
            </h3>
            
            <form onSubmit={handleSaveProduct} className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              <div className="space-y-1">
                <label className="block text-[10px] text-stone-400 font-bold">اسم السلعة</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="مثال: سكر كنانة مستورد..."
                  className="w-full bg-[#110e11] border border-stone-850 focus:border-amber-500 rounded-xl p-2 text-xs text-stone-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-stone-400 font-bold">الوصف التعريفي للسلعة</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="وصف جودة ونوع السلعة للزبون..."
                  rows={2}
                  className="w-full bg-[#110e11] border border-stone-850 focus:border-amber-500 rounded-xl p-2 text-xs text-stone-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] text-stone-400 font-bold">السعر الأساسي بالفرنك</label>
                  <input
                    type="number"
                    required
                    value={productForm.basePrice}
                    onChange={(e) => setProductForm({ ...productForm, basePrice: Number(e.target.value) })}
                    placeholder="السعر بالفرنك التشادي"
                    className="w-full bg-[#110e11] border border-stone-850 focus:border-amber-500 rounded-xl p-2 text-xs text-stone-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-stone-400 font-bold">العلبة / الوحدة السلعية</label>
                  <input
                    type="text"
                    required
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    placeholder="مثال: كيس ١٠ كجم..."
                    className="w-full bg-[#110e11] border border-stone-850 focus:border-amber-500 rounded-xl p-2 text-xs text-stone-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-stone-400 font-bold">صور السلعة (روابط مفصولة بفاصلة)</label>
                <input
                  type="text"
                  value={productForm.imagesText}
                  onChange={(e) => setProductForm({ ...productForm, imagesText: e.target.value })}
                  placeholder="https://example.com/img1.png, https://example.com/img2.png"
                  className="w-full bg-[#110e11] border border-stone-850 focus:border-amber-500 rounded-xl p-2 text-xs text-stone-200 focus:outline-none font-mono text-[10px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] text-stone-400 font-bold">حالة التوفر</label>
                  <select
                    value={productForm.status}
                    onChange={(e) => setProductForm({ ...productForm, status: e.target.value as any })}
                    className="w-full bg-[#110e11] border border-stone-850 focus:border-amber-500 rounded-xl p-2 text-xs text-stone-200 focus:outline-none"
                  >
                    <option value="active">متاح / نشط للبيع</option>
                    <option value="inactive">غير متوفر / مجمّد</option>
                    <option value="draft">مسودة إدارية</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-indigo-400 font-bold">تصنيف السلعة</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value as any })}
                    className="w-full bg-[#110e11] border border-stone-850 focus:border-amber-500 rounded-xl p-2 text-xs text-stone-200 focus:outline-none"
                  >
                    <option value="sugar">السكر (sugar)</option>
                    <option value="oils">الزيوت (oils)</option>
                    <option value="rice">الأرز (rice)</option>
                    <option value="foodstuffs">الغذائيات (foodstuffs)</option>
                    <option value="other">أخرى (other)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-stone-400 font-bold mb-1">ربط السلعة بمجمع الموردين المعتمدين</label>
                <div className="bg-[#110e11] border border-stone-850 rounded-xl p-3 space-y-2 max-h-[100px] overflow-y-auto no-scrollbar">
                  {suppliers.length === 0 ? (
                    <span className="text-stone-500 text-[10px]">لا يوجد موردون مسجلون لربط السلعة بهم</span>
                  ) : (
                    suppliers.map(s => {
                      const isLinked = productForm.supplierIds.includes(s.id);
                      return (
                        <div key={s.id} className="flex items-center gap-2 select-none">
                          <input
                            type="checkbox"
                            id={`link-sup-${s.id}`}
                            checked={isLinked}
                            onChange={(e) => {
                              const nextList = e.target.checked 
                                ? [...productForm.supplierIds, s.id]
                                : productForm.supplierIds.filter(id => id !== s.id);
                              setProductForm({ ...productForm, supplierIds: nextList });
                            }}
                            className="w-3.5 h-3.5 accent-amber-500 rounded border-stone-850 text-amber-500"
                          />
                          <label htmlFor={`link-sup-${s.id}`} className="text-[11px] text-stone-300 font-bold cursor-pointer hover:text-white">
                            {s.name}
                          </label>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-black py-2 rounded-xl text-xs mt-3 transition-all"
              >
                حفظ تفاصيل المنتج والربط السحابي
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. Currency rate Modal */}
      {isAddingRate && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-[9999] flex justify-center items-center p-4">
          <div className="bg-[#0E0B08] border border-amber-500/20 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative text-right">
            <button 
              onClick={() => setIsAddingRate(false)}
              className="absolute top-4 left-4 text-stone-500 hover:text-stone-300"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-black text-amber-200">
              {editingRate ? 'تعديل سعر الصرف السحابي' : 'إضافة عملة صرف جديدة'}
            </h3>
            
            <form onSubmit={handleSaveRate} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-[10px] text-stone-400 font-bold">رمز العملة (XAF, USDT, EGP, NGN)</label>
                <input
                  type="text"
                  required
                  disabled={!!editingRate}
                  value={rateForm.currencyCode}
                  onChange={(e) => setRateForm({ ...rateForm, currencyCode: e.target.value })}
                  placeholder="USDT"
                  className="w-full bg-[#110e11] border border-stone-850 focus:border-amber-500 rounded-xl p-2.5 text-xs text-stone-200 focus:outline-none font-mono"
                />
                {!editingRate && (
                  <p className="text-[9px] text-stone-500 mt-0.5">
                    العملات المعتمدة: XAF (الفرنك)، USDT (التتر)، EGP (المصري)، NGN (النايرا).
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-stone-400 font-bold">
                  {rateForm.currencyCode?.toUpperCase() === 'NGN' 
                    ? 'سعر صرف النايرا مقابل ١,٠٠٠ فرنك (عدد النايرا)'
                    : rateForm.currencyCode?.toUpperCase() === 'XAF'
                    ? 'سعر صرف الفرنك مقابل الجنيه (ج.س لكل ١,٠٠٠ فرنك)'
                    : rateForm.currencyCode?.toUpperCase() === 'EGP'
                    ? 'سعر صرف الجنيه المصري مقابل الجنيه السوداني (ج.س لكل ١ جنيه مصري)'
                    : 'سعر صرف العملة مقابل الجنيه السوداني (ج.س لكل وحدة واحدة)'}
                </label>
                <input
                  type="number"
                  required
                  value={rateForm.rateToBase}
                  onChange={(e) => setRateForm({ ...rateForm, rateToBase: Number(e.target.value) })}
                  placeholder={
                    rateForm.currencyCode?.toUpperCase() === 'NGN'
                      ? "مثال: 2500"
                      : "مثال: 5900"
                  }
                  className="w-full bg-[#110e11] border border-stone-850 focus:border-amber-500 rounded-xl p-2.5 text-xs text-stone-200 focus:outline-none"
                />
                <p className="text-[9px] text-amber-500/85 leading-relaxed mt-1">
                  {rateForm.currencyCode?.toUpperCase() === 'NGN' && "💡 توضيح: إدخال قيمة نايرا نيجيرية لكل ١,٠٠٠ فرنك تشادي."}
                  {rateForm.currencyCode?.toUpperCase() === 'XAF' && "💡 توضيح: قيمة الجنيه السوداني (ج.س) لكل ١,٠٠٠ فرنك تشادي."}
                  {rateForm.currencyCode?.toUpperCase() === 'EGP' && "💡 توضيح: قيمة الجنيه السوداني (ج.س) لكل جنيه مصري واحد."}
                  {rateForm.currencyCode?.toUpperCase() === 'USDT' && "💡 توضيح: قيمة الجنيه السوداني (ج.س) لكل تتر (USDT) واحد."}
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-black py-2 rounded-xl text-xs mt-4 transition-all"
              >
                تحديث وحفظ السعر بالشبكة
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
