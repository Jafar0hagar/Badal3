import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/currency.dart';
import '../models/product.dart';

class AppState with ChangeNotifier {
  String _language = 'ar'; // 'ar' or 'en'
  double _currentFrancRate = 5900.0;
  bool _isUpdatingRate = false;
  bool _notificationsEnabled = true;
  String _baseCurrency = 'XAF';
  String _refreshInterval = '5'; // minutes

  String get language => _language;
  double get currentFrancRate => _currentFrancRate;
  bool get isUpdatingRate => _isUpdatingRate;
  bool get notificationsEnabled => _notificationsEnabled;
  String get baseCurrency => _baseCurrency;
  String get refreshInterval => _refreshInterval;

  final List<Currency> _currencies = [
    Currency(id: 'xaf', name: 'الفرنك التشادي', code: 'XAF', symbol: 'FCFA', price: 5900, lastUpdated: 'الآن', flag: 'TD', trend: 'stable', country: 'تشاد'),
    Currency(id: 'usd', name: 'الدولار الأمريكي', code: 'USD', symbol: '\$', price: 3200, lastUpdated: 'الآن', flag: 'US', trend: 'up', country: 'الولايات المتحدة الأمريكية'),
    Currency(id: 'eur', name: 'اليورو', code: 'EUR', symbol: '€', price: 3650, lastUpdated: 'الآن', flag: 'EU', trend: 'down', country: 'الاتحاد الأوروبي'),
    Currency(id: 'sar', name: 'الريال السعودي', code: 'SAR', symbol: 'ر.س', price: 850, lastUpdated: 'الآن', flag: 'SA', trend: 'up', country: 'المملكة العربية السعودية'),
    Currency(id: 'gbp', name: 'الجنيه الإسترليني', code: 'GBP', symbol: '£', price: 4200, lastUpdated: 'الآن', flag: 'GB', trend: 'stable', country: 'المملكة المتحدة'),
    Currency(id: 'egp', name: 'الجنيه المصري', code: 'EGP', symbol: 'ج.م', price: 65, lastUpdated: 'الآن', flag: 'EG', trend: 'stable', country: 'مصر'),
    Currency(id: 'aed', name: 'الدرهم الإماراتي', code: 'AED', symbol: 'د.إ', price: 870, lastUpdated: 'الآن', flag: 'AE', trend: 'up', country: 'دولة الإمارات العربية المتحدة'),
    Currency(id: 'kwd', name: 'الدينار الكويتي', code: 'KWD', symbol: 'د.ك', price: 10400, lastUpdated: 'الآن', flag: 'KW', trend: 'down', country: 'الكويت'),
  ];

  final List<Product> _products = [
    Product(id: 'sugar', name: 'سكر مستورد فاخر', price: 4000, currencySymbol: 'فرنك', category: 'sugar', categoryAr: 'سكر', imageUrl: '', isAvailable: true, unit: 'كيس ١٠ كجم', whatsappMessage: 'طلب شراء سكر مستورد فاخر', description: 'سكر نقي ناصع البياض سريع الذوبان مستورد من أجود المزارع العالمية.'),
    Product(id: 'flour', name: 'دقيق الخيرات فاخر', price: 3500, currencySymbol: 'فرنك', category: 'foodstuffs', categoryAr: 'غذائيات', imageUrl: '', isAvailable: true, unit: 'علبة ١ كجم', whatsappMessage: 'طلب شراء دقيق الخيرات فاخر', description: 'دقيق قمح ممتاز متعدد الاستعمالات للمخبوزات والحلويات الراقية.'),
    Product(id: 'rice', name: 'أرز بسمتي درجة أولى', price: 5500, currencySymbol: 'فرنك', category: 'rice', categoryAr: 'أرز', imageUrl: '', isAvailable: true, unit: 'جوال ٥ كجم', whatsappMessage: 'طلب شراء أرز بسمتي درجة أولى', description: 'أرز بسمتي هندي طويل الحبة ذو نكهة ورائحة عطرية زكية.'),
    Product(id: 'oil', name: 'زيت صباح نقي مكرر', price: 3000, currencySymbol: 'فرنك', category: 'oils', categoryAr: 'زيوت', imageUrl: '', isAvailable: true, unit: 'زجاجة ١.٥ لتر', whatsappMessage: 'طلب شراء زيت صباح نقي مكرر', description: 'زيت نباتي نقي مكرر وخفيف ومناسب لجميع أنواع الطبخ والقلي.'),
    Product(id: 'tea', name: 'شاي الجزيرة الأخضر الفاخر', price: 1500, currencySymbol: 'فرنك', category: 'foodstuffs', categoryAr: 'غذائيات', imageUrl: '', isAvailable: true, unit: '٢٥٠ غرام', whatsappMessage: 'طلب شراء شاي الجزيرة الأخضر الفاخر', description: 'أوراق الشاي الأخضر الطبيعي الفاخرة غنية بمضادات الأكسدة وبطعم مميز.'),
    Product(id: 'pasta', name: 'مكرونة الوادي سريعة التحضير', price: 1000, currencySymbol: 'فرنك', category: 'foodstuffs', categoryAr: 'غذائيات', imageUrl: '', isAvailable: true, unit: '٥٠0 غرام', whatsappMessage: 'طلب شراء مكرونة الوادي سريعة التحضير', description: 'مكرونة مصنوعة من سميد القمح القاسي عالي الجودة وسهلة الإعداد.'),
  ];

  List<Currency> get currencies {
    // Dynamically adjust Chad Franc based on current Franc Rate
    return _currencies.map((c) {
      if (c.id == 'xaf') {
        return c.copyWith(price: _currentFrancRate);
      }
      return c;
    }).toList();
  }

  List<Product> get products => _products;

  void toggleLanguage() {
    _language = _language == 'ar' ? 'en' : 'ar';
    notifyListeners();
  }

  void setLanguage(String lang) {
    _language = lang;
    notifyListeners();
  }

  Future<void> updateFrancRate(double newRate) async {
    _isUpdatingRate = true;
    notifyListeners();

    // Simulate database write delay
    await Future.delayed(const Duration(milliseconds: 600));

    _currentFrancRate = newRate;
    _isUpdatingRate = false;
    notifyListeners();
  }

  void toggleNotifications() {
    _notificationsEnabled = !_notificationsEnabled;
    notifyListeners();
  }

  void setBaseCurrency(String curr) {
    _baseCurrency = curr;
    notifyListeners();
  }

  void setRefreshInterval(String interval) {
    _refreshInterval = interval;
    notifyListeners();
  }

  Future<void> openWhatsApp({required String phone, required String message}) async {
    final countryCodePhone = phone.replaceAll(RegExp(r'[\s+]'), '');
    final encodedMsg = Uri.encodeComponent(message);
    final url = 'https://wa.me/$countryCodePhone?text=$encodedMsg';
    final uri = Uri.parse(url);

    try {
      // Try direct external application launch (works on most devices if app is installed)
      final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (!launched) {
        // Fallback to platform default launch
        await launchUrl(uri);
      }
    } catch (e) {
      // Fallback: copy link to clipboard or try opening in default browser mode
      try {
        await launchUrl(uri, mode: LaunchMode.platformDefault);
      } catch (innerException) {
        debugPrint('Could not launch WhatsApp URL: $innerException');
      }
    }
  }
}
