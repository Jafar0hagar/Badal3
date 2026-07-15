import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _isAdminLoggedIn = false;

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _showAdminLoginDialog(BuildContext context, bool isAr) {
    showDialog(
      context: context,
      builder: (context) {
        return Directionality(
          textDirection: isAr ? TextDirection.rtl : TextDirection.ltr,
          child: AlertDialog(
            title: Text(
              isAr ? 'تسجيل دخول لوحة الإشراف' : 'Admin Portal Login',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: _usernameController,
                  decoration: InputDecoration(
                    labelText: isAr ? 'اسم المستخدم' : 'Username',
                    border: const OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _passwordController,
                  obscureText: true,
                  decoration: InputDecoration(
                    labelText: isAr ? 'كلمة المرور' : 'Password',
                    border: const OutlineInputBorder(),
                  ),
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: Text(isAr ? 'إلغاء' : 'Cancel'),
              ),
              ElevatedButton(
                onPressed: () {
                  if (_usernameController.text == 'admin' && _passwordController.text == 'badal2026') {
                    setState(() {
                      _isAdminLoggedIn = true;
                    });
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(isAr ? '🔓 تم تسجيل دخول المشرف بنجاح!' : '🔓 Admin Logged in Successfully!'),
                        backgroundColor: const Color(0xFF850F1D),
                      ),
                    );
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(isAr ? '❌ بيانات الدخول خاطئة!' : '❌ Incorrect credentials!'),
                        backgroundColor: Colors.red,
                      ),
                    );
                  }
                },
                child: Text(isAr ? 'دخول' : 'Login'),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isAr = appState.language == 'ar';

    return Scaffold(
      appBar: AppBar(
        title: Text(
          isAr ? 'إعدادات التطبيق العامة' : 'General App Settings',
          style: const TextStyle(fontWeight: FontWeight.black, fontSize: 16),
        ),
      ),
      body: SafeArea(
        child: ListView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.all(16),
          children: [
            // Preference section
            _buildSectionHeader(isAr ? 'تخصيص الواجهة واللغة' : 'Personalization & Language', isAr),
            
            // Language selector row
            _buildSettingCard(
              icon: Icons.language,
              title: isAr ? 'لغة واجهة التطبيق' : 'Interface Language',
              subtitle: isAr ? 'العربية' : 'English',
              trailing: Switch(
                value: appState.language == 'en',
                onChanged: (val) {
                  appState.setLanguage(val ? 'en' : 'ar');
                },
                activeColor: const Color(0xFF850F1D),
              ),
            ),

            // Base Currency Row
            _buildSettingCard(
              icon: Icons.currency_bitcoin,
              title: isAr ? 'العملة الأساسية للتقييم' : 'Base Pricing Currency',
              subtitle: appState.baseCurrency,
              trailing: DropdownButton<String>(
                value: appState.baseCurrency,
                underline: const SizedBox(),
                items: <String>['XAF', 'USD', 'EUR', 'SDG'].map((String val) {
                  return DropdownMenuItem<String>(
                    value: val,
                    child: Text(val, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  );
                }).toList(),
                onChanged: (newVal) {
                  if (newVal != null) appState.setBaseCurrency(newVal);
                },
              ),
            ),

            _buildSectionHeader(isAr ? 'التحديثات والإشعارات' : 'Notifications & Updates', isAr),
            
            // Notification toggle
            _buildSettingCard(
              icon: Icons.notifications_active_outlined,
              title: isAr ? 'تنبيهات الأسعار العاجلة' : 'Instant Rate Alerts',
              subtitle: isAr ? 'إرسال إشعارات عند تغير السعر' : 'Send push alerts when price fluctuates',
              trailing: Switch(
                value: appState.notificationsEnabled,
                onChanged: (val) {
                  appState.toggleNotifications();
                },
                activeColor: const Color(0xFF850F1D),
              ),
            ),

            // Refresh Speed Interval
            _buildSettingCard(
              icon: Icons.av_timer_outlined,
              title: isAr ? 'سرعة تحديث المؤشرات' : 'Rate Refresh Interval',
              subtitle: isAr ? 'كل ${appState.refreshInterval} دقائق تلقائياً' : 'Every ${appState.refreshInterval} minutes automatically',
              trailing: DropdownButton<String>(
                value: appState.refreshInterval,
                underline: const SizedBox(),
                items: <String>['1', '5', '10', '30'].map((String val) {
                  return DropdownMenuItem<String>(
                    value: val,
                    child: Text(isAr ? 'كل $val د' : '$val min', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  );
                }).toList(),
                onChanged: (newVal) {
                  if (newVal != null) appState.setRefreshInterval(newVal);
                },
              ),
            ),

            _buildSectionHeader(isAr ? 'بوابة الإشراف والحماية' : 'Security & Administration', isAr),

            // Admin configuration panel login
            _buildSettingCard(
              icon: _isAdminLoggedIn ? Icons.lock_open : Icons.lock_outline,
              title: isAr ? 'بوابة مدير الأسعار والسلع' : 'System Administrator Panel',
              subtitle: _isAdminLoggedIn 
                  ? (isAr ? '✅ مصدق ومسجل دخول حالياً' : '✅ Verified & Authenticated') 
                  : (isAr ? 'تسجيل الدخول لتغيير أسعار السوق' : 'Log in to update market live feeds'),
              trailing: ElevatedButton(
                onPressed: _isAdminLoggedIn 
                    ? () {
                        setState(() {
                          _isAdminLoggedIn = false;
                        });
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(isAr ? '🔒 تم تسجيل الخروج بنجاح!' : '🔒 Logged out successfully!'),
                            backgroundColor: Colors.stone[700],
                          ),
                        );
                      }
                    : () => _showAdminLoginDialog(context, isAr),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _isAdminLoggedIn ? Colors.red[800] : const Color(0xFF850F1D),
                  minimumSize: const Size(80, 34),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                child: Text(
                  _isAdminLoggedIn ? (isAr ? 'خروج' : 'Logout') : (isAr ? 'دخول' : 'Login'),
                  style: const TextStyle(fontSize: 11),
                ),
              ),
            ),

            const SizedBox(height: 24),
            // Footer Version Signatures
            Center(
              child: Column(
                children: [
                  const Text(
                    'تطبيق بَدَل للخدمات والعملات • إصدار الفلاتر v1.0.0',
                    style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Badal Premium Mobile Application © 2026',
                    style: TextStyle(color: Colors.grey[400], fontSize: 8),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, bool isAr) {
    return Padding(
      padding: const EdgeInsets.only(top: 18, bottom: 8, left: 4, right: 4),
      child: Text(
        title,
        style: const TextStyle(
          color: Color(0xFF850F1D),
          fontWeight: FontWeight.black,
          fontSize: 12,
        ),
      ),
    );
  }

  Widget _buildSettingCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required Widget trailing,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[100]!),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(icon, color: const Color(0xFF850F1D), size: 20),
              const SizedBox(width: 14),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(
                      color: Colors.grey[500],
                      fontSize: 9.5,
                    ),
                  ),
                ],
              ),
            ],
          ),
          trailing,
        ],
      ),
    );
  }
}
