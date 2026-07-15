import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../models/currency.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with SingleTickerProviderStateMixin {
  final TextEditingController _rateController = TextEditingController();
  final TextEditingController _calcController = TextEditingController();
  double _calculatedResult = 0.0;
  bool _isAdminExpanded = false;
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    final appState = Provider.of<AppState>(context, listen: false);
    _rateController.text = appState.currentFrancRate.toStringAsFixed(0);
    
    // Create custom pulsing effect for the "Live Status" indicator
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _rateController.dispose();
    _calcController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  void _calculateExchange(String value, double rate) {
    if (value.isEmpty) {
      setState(() {
        _calculatedResult = 0.0;
      });
      return;
    }
    final double? parsedVal = double.tryParse(value);
    if (parsedVal != null) {
      setState(() {
        _calculatedResult = parsedVal * (rate / 1000.0);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isAr = appState.language == 'ar';
    final currentRate = appState.currentFrancRate;
    final primaryColor = const Color(0xFF850F1D);

    return Scaffold(
      backgroundColor: const Color(0xFFFAF7F0),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Premium App Bar / Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 44.r,
                        height: 44.r,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(16.r),
                          boxShadow: [
                            BoxShadow(
                              color: primaryColor.withOpacity(0.2),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(16.r),
                          child: Image.asset(
                            'assets/images/badal_logo.jpg',
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return Container(
                                alignment: Alignment.center,
                                decoration: const BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [Color(0xFF850F1D), Color(0xFFB41E2D)],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  ),
                                ),
                                child: Icon(
                                  Icons.swap_horizontal_circle_rounded,
                                  color: Colors.white,
                                  size: 24.r,
                                ),
                              );
                            },
                          ),
                        ),
                      ),
                      SizedBox(width: 12.w),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            isAr ? 'بَدَل للخدمات والعملات' : 'Badal Hub & Exchange',
                            style: TextStyle(
                              fontSize: 16.sp,
                              fontWeight: FontWeight.black,
                              color: primaryColor,
                              letterSpacing: -0.5,
                            ),
                          ),
                          Text(
                            isAr ? 'منصتك المالية الموثوقة لأسعار الصرف' : 'Your Premier Real-Time Trading Companion',
                            style: TextStyle(
                              color: Colors.stone[600],
                              fontSize: 10.sp,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  
                  // Interactive Premium Language Toggle Widget
                  GestureDetector(
                    onTap: () {
                      appState.toggleLanguage();
                    },
                    child: Container(
                      padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14.r),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.03),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                        border: Border.all(color: Colors.stone[200]!),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.translate, size: 14.r, color: primaryColor),
                          SizedBox(width: 6.w),
                          Text(
                            isAr ? 'English' : 'العربية',
                            style: TextStyle(
                              fontSize: 11.sp,
                              fontWeight: FontWeight.black,
                              color: primaryColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              SizedBox(height: 20.h),

              // 2. Main Live Interactive Fintech Card
              Container(
                width: double.infinity,
                padding: EdgeInsets.all(22.r),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF52060E), Color(0xFF850F1D), Color(0xFFA61827)],
                    stops: [0.0, 0.6, 1.0],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(26.r),
                  boxShadow: [
                    BoxShadow(
                      color: primaryColor.withOpacity(0.35),
                      blurRadius: 24,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 5.h),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(20.r),
                          ),
                          child: Row(
                            children: [
                              Text(
                                '🇨🇦', // Simulated Flag representing FCFA
                                style: TextStyle(fontSize: 13.sp),
                              ),
                              SizedBox(width: 6.w),
                              Text(
                                isAr ? 'السعر المباشر اليومي' : 'Daily Live Parallel Index',
                                style: TextStyle(
                                  color: Colors.white.withOpacity(0.95),
                                  fontSize: 10.sp,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 0.2,
                                ),
                              ),
                            ],
                          ),
                        ),
                        
                        // Pulsing Live Indicator
                        Row(
                          children: [
                            ScaleTransition(
                              scale: Tween(begin: 0.75, end: 1.2).animate(
                                CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
                              ),
                              child: Container(
                                width: 7.r,
                                height: 7.r,
                                decoration: const BoxDecoration(
                                  color: Color(0xFF10B981), // Emerald bright pulse
                                  shape: BoxShape.circle,
                                ),
                              ),
                            ),
                            SizedBox(width: 6.w),
                            Text(
                              isAr ? 'نشط' : 'LIVE',
                              style: TextStyle(
                                color: const Color(0xFF10B981),
                                fontSize: 10.sp,
                                fontWeight: FontWeight.black,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    SizedBox(height: 20.h),
                    Text(
                      isAr ? 'الفرنك التشادي مقابل الجنيه السوداني' : 'Chad Franc (XAF) to Sudanese Pound',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.8),
                        fontSize: 12.sp,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    SizedBox(height: 6.h),
                    
                    // Main Rate Figure
                    Row(
                      baseline: TextBaseline.alphabetic,
                      crossAxisAlignment: CrossAxisAlignment.baseline,
                      children: [
                        Text(
                          '1,000 FCFA = ',
                          style: TextStyle(
                            color: Colors.white60,
                            fontSize: 18.sp,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        Text(
                          '${currentRate.toStringAsFixed(0)} ',
                          style: TextStyle(
                            color: const Color(0xFFF59E0B), // Vibrant Amber gold
                            fontSize: 34.sp,
                            fontWeight: FontWeight.black,
                            letterSpacing: -0.5,
                          ),
                        ),
                        Text(
                          'SDG',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16.sp,
                            fontWeight: FontWeight.black,
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 16.h),
                    Container(
                      height: 1,
                      color: Colors.white.withOpacity(0.12),
                    ),
                    SizedBox(height: 12.h),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.check_circle_outline, color: const Color(0xFFF59E0B), size: 13.r),
                            SizedBox(width: 6.w),
                            Text(
                              isAr ? 'معتمد ومضمون للتحويل' : 'Certified Safe Exchange',
                              style: TextStyle(
                                color: Colors.white60,
                                fontSize: 10.sp,
                              ),
                            ),
                          ],
                        ),
                        Text(
                          isAr ? 'تحديث تلقائي مستمر' : 'Refreshed 1m ago',
                          style: TextStyle(
                            color: const Color(0xFFF59E0B),
                            fontSize: 10.sp,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              SizedBox(height: 22.h),

              // 3. Fast Interactive Conversion Calculator Block
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    isAr ? '🧮 المحاسب المالي السريع' : '🧮 Fast Exchange Calculator',
                    style: TextStyle(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.black,
                      color: Colors.stone[800],
                    ),
                  ),
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 3.h),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF59E0B).withOpacity(0.12),
                      borderRadius: BorderRadius.circular(8.r),
                    ),
                    child: Text(
                      isAr ? 'دقة ١٠٠٪' : '100% Accurate',
                      style: TextStyle(
                        fontSize: 9.sp,
                        fontWeight: FontWeight.bold,
                        color: const Color(0xFFD97706),
                      ),
                    ),
                  ),
                ],
              ),
              SizedBox(height: 10.h),
              Container(
                padding: EdgeInsets.all(18.r),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24.r),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.02),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                  border: Border.all(color: Colors.stone[150] ?? const Color(0xFFE5E5E5)),
                ),
                child: Column(
                  children: [
                    TextField(
                      controller: _calcController,
                      keyboardType: TextInputType.number,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 16.sp,
                        fontWeight: FontWeight.bold,
                        color: Colors.stone[800],
                      ),
                      decoration: InputDecoration(
                        hintText: isAr ? 'أدخل المبلغ بالفرنك (مثلاً 50,000)' : 'Enter FCFA (e.g., 50,000)',
                        hintStyle: TextStyle(fontSize: 13.sp, color: Colors.grey[400]),
                        suffixText: 'FCFA',
                        suffixStyle: TextStyle(fontWeight: FontWeight.bold, color: primaryColor),
                        filled: true,
                        fillColor: const Color(0xFFFAF7F0),
                        contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 14.h),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16.r),
                          borderSide: BorderSide.none,
                        ),
                      ),
                      onChanged: (val) => _calculateExchange(val, currentRate),
                    ),
                    SizedBox(height: 14.h),
                    
                    // Displaying result with a custom transition visual box
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      padding: EdgeInsets.all(14.r),
                      decoration: BoxDecoration(
                        color: primaryColor.withOpacity(0.04),
                        borderRadius: BorderRadius.circular(16.r),
                        border: Border.all(color: primaryColor.withOpacity(0.1)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Icon(Icons.account_balance_wallet_rounded, size: 16.r, color: primaryColor),
                              SizedBox(width: 8.w),
                              Text(
                                isAr ? 'المبلغ المستحق بالجنيه:' : 'Receivable (SDG):',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12.sp,
                                  color: Colors.stone[700],
                                ),
                              ),
                            ],
                          ),
                          Text(
                            '${_calculatedResult.toStringAsFixed(0)} SDG',
                            style: TextStyle(
                              color: primaryColor,
                              fontWeight: FontWeight.black,
                              fontSize: 18.sp,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(height: 20.h),

              // 4. Compact Trend Spotlight of Other Main Currencies
              Text(
                isAr ? '📈 لمحة سريعة على الأسواق' : '📈 Markets Trend Overview',
                style: TextStyle(
                  fontSize: 14.sp,
                  fontWeight: FontWeight.black,
                  color: Colors.stone[800],
                ),
              ),
              SizedBox(height: 10.h),
              SizedBox(
                height: 84.h,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  children: [
                    _buildTrendMiniCard('🇺🇸 USD', '3,200', 'up', isAr),
                    _buildTrendMiniCard('🇪🇺 EUR', '3,650', 'down', isAr),
                    _buildTrendMiniCard('🇸🇦 SAR', '850', 'up', isAr),
                    _buildTrendMiniCard('🇦🇪 AED', '870', 'stable', isAr),
                  ],
                ),
              ),
              SizedBox(height: 22.h),

              // 5. Advanced Expandable Live Simulation Engine (For Admins)
              Container(
                decoration: BoxDecoration(
                  color: Colors.amber[50],
                  borderRadius: BorderRadius.circular(22.r),
                  border: Border.all(color: Colors.amber[200]!),
                ),
                child: Theme(
                  data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
                  child: ExpansionTile(
                    title: Text(
                      isAr ? '⚙️ لوحة محاكاة تحديث الأسعار فوري' : '⚙️ Instant Rate Simulation Panel',
                      style: TextStyle(
                        color: Colors.amber[900],
                        fontWeight: FontWeight.black,
                        fontSize: 11.sp,
                      ),
                    ),
                    subtitle: Text(
                      isAr ? 'قم بتحديث سعر الصرف لمراقبته فوراً' : 'Simulate direct database change here',
                      style: TextStyle(fontSize: 9.sp, color: Colors.amber[800]),
                    ),
                    trailing: Icon(
                      _isAdminExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                      color: Colors.amber[900],
                    ),
                    onExpansionChanged: (expanded) {
                      setState(() {
                        _isAdminExpanded = expanded;
                      });
                    },
                    children: [
                      Padding(
                        padding: EdgeInsets.only(left: 16.w, right: 16.w, bottom: 16.h),
                        child: Column(
                          children: [
                            Container(
                              height: 1,
                              color: Colors.amber[200],
                              margin: EdgeInsets.only(bottom: 12.h),
                            ),
                            Text(
                              isAr 
                                ? 'تعديل السعر هنا يغير السعر الفعلي عبر كامل شاشات التطبيق والحاسبة الذكية بالوقت الحقيقي.'
                                : 'Updating the rate below overrides state across all app panels and live converters.',
                              style: TextStyle(
                                fontSize: 10.sp,
                                color: Colors.amber[800],
                                height: 1.4,
                              ),
                            ),
                            SizedBox(height: 12.h),
                            Row(
                              children: [
                                Expanded(
                                  child: TextField(
                                    controller: _rateController,
                                    keyboardType: TextInputType.number,
                                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14.sp),
                                    decoration: InputDecoration(
                                      labelText: isAr ? 'السعر الجديد (لكل 1000 فرنك)' : 'New Rate / 1000 XAF',
                                      labelStyle: TextStyle(fontSize: 11.sp),
                                      filled: true,
                                      fillColor: Colors.white,
                                      contentPadding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 12.h),
                                      border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(12.r),
                                        borderSide: BorderSide(color: Colors.amber[300]!),
                                      ),
                                    ),
                                  ),
                                ),
                                SizedBox(width: 8.w),
                                ElevatedButton(
                                  onPressed: appState.isUpdatingRate
                                      ? null
                                      : () async {
                                          final double? rate = double.tryParse(_rateController.text);
                                          if (rate != null) {
                                            await appState.updateFrancRate(rate);
                                            _calculateExchange(_calcController.text, rate);
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              SnackBar(
                                                content: Text(isAr ? '✅ تم تحديث سعر صرف الفرنك بنجاح!' : '✅ Exchange rate updated!'),
                                                backgroundColor: primaryColor,
                                              ),
                                            );
                                          }
                                        },
                                  style: ElevatedButton.styleFrom(
                                    minimumSize: Size(75.w, 46.h),
                                    backgroundColor: primaryColor,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12.r),
                                    ),
                                  ),
                                  child: appState.isUpdatingRate
                                      ? SizedBox(
                                          width: 18.r,
                                          height: 18.r,
                                          child: const CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                        )
                                      : Text(isAr ? 'حفظ' : 'Save', style: TextStyle(fontSize: 12.sp, color: Colors.white)),
                                ),
                              ],
                            ),
                          ],
                        ),
                      )
                    ],
                  ),
                ),
              ),
              SizedBox(height: 20.h),

              // 6. Direct VIP Support WhatsApp Connect Widget
              Container(
                padding: EdgeInsets.all(16.r),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [const Color(0xFF25D366).withOpacity(0.06), const Color(0xFF128C7E).withOpacity(0.12)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(22.r),
                  border: Border.all(color: const Color(0xFF25D366).withOpacity(0.2)),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: EdgeInsets.all(11.r),
                      decoration: const BoxDecoration(
                        color: Color(0xFF25D366),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(Icons.chat_rounded, color: Colors.white, size: 20.r),
                    ),
                    SizedBox(width: 14.w),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            isAr ? 'تحويل فوري فائق الأمان' : 'VIP Secured Trading Direct',
                            style: TextStyle(
                              fontWeight: FontWeight.black,
                              fontSize: 12.sp,
                              color: const Color(0xFF128C7E),
                            ),
                          ),
                          SizedBox(height: 2.h),
                          Text(
                            isAr ? 'تواصل معنا مباشرة عبر واتساب لتأكيد تحويلاتك الفورية بأمان وسرية.' : 'Message our official desk directly to execute transfers securely with full transparency.',
                            style: TextStyle(
                              fontSize: 10.sp,
                              color: Colors.stone[700],
                              height: 1.3,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: () {
                        appState.openWhatsApp(
                          phone: '+249912345678',
                          message: 'السلام عليكم، أود إجراء عملية تحويل عملة عبر تطبيق بدل.',
                        );
                      },
                      icon: Icon(
                        Icons.arrow_forward_ios_rounded,
                        size: 16.r,
                        color: const Color(0xFF128C7E),
                      ),
                    )
                  ],
                ),
              ),
              SizedBox(height: 10.h),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTrendMiniCard(String title, String rate, String trend, bool isAr) {
    Color tColor = Colors.grey;
    IconData tIcon = Icons.trending_flat;

    if (trend == 'up') {
      tColor = Colors.green;
      tIcon = Icons.trending_up;
    } else if (trend == 'down') {
      tColor = Colors.red;
      tIcon = Icons.trending_down;
    }

    return Container(
      width: 110.w,
      margin: EdgeInsets.only(right: 8.w),
      padding: EdgeInsets.all(12.r),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(color: Colors.stone[100]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 10.sp,
              fontWeight: FontWeight.bold,
              color: Colors.stone[800],
            ),
          ),
          SizedBox(height: 4.h),
          Row(
            children: [
              Text(
                rate,
                style: TextStyle(
                  fontSize: 12.sp,
                  fontWeight: FontWeight.black,
                  color: const Color(0xFF850F1D),
                ),
              ),
              const Spacer(),
              Icon(tIcon, color: tColor, size: 14.r),
            ],
          ),
        ],
      ),
    );
  }
}
