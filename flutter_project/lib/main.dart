import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'state/app_state.dart';
import 'screens/main_navigation.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (context) => AppState(),
      child: const BadalApp(),
    ),
  );
}

class BadalApp extends StatelessWidget {
  const BadalApp({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isArabic = appState.language == 'ar';

    return ScreenUtilInit(
      designSize: const Size(390, 844),
      minTextAdapt: true,
      splitScreenMode: true,
      builder: (context, child) {
        return MaterialApp(
          title: 'تطبيق بدل - Badal',
          debugShowCheckedModeBanner: false,
          locale: Locale(appState.language),
          supportedLocales: const [
            Locale('ar', ''),
            Locale('en', ''),
          ],
          localizationsDelegates: const [
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          theme: ThemeData(
            useMaterial3: true,
            scaffoldBackgroundColor: const Color(0xFFFAF7F0), // Clean off-white
            colorScheme: ColorScheme.fromSeed(
              seedColor: const Color(0xFF850F1D), // Crimson Burgundy #850F1D
              primary: const Color(0xFF850F1D),
              secondary: const Color(0xFFF59E0B), // Golden/Amber #F59E0B
              surface: Colors.white,
              background: const Color(0xFFFAF7F0),
            ),
            textTheme: isArabic
                ? GoogleFonts.cairoTextTheme(ThemeData.light().textTheme).copyWith(
                    displayLarge: GoogleFonts.tajawal(fontWeight: FontWeight.bold),
                    displayMedium: GoogleFonts.tajawal(fontWeight: FontWeight.bold),
                    titleLarge: GoogleFonts.tajawal(fontWeight: FontWeight.bold),
                  )
                : GoogleFonts.interTextTheme(ThemeData.light().textTheme),
            appBarTheme: const AppBarTheme(
              backgroundColor: Colors.transparent,
              elevation: 0,
              scrolledUnderElevation: 0,
              centerTitle: true,
              iconTheme: IconThemeData(color: Color(0xFF850F1D)),
            ),
            elevatedButtonTheme: ElevatedButtonThemeData(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF850F1D),
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 50),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                textStyle: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontFamily: isArabic ? 'Cairo' : 'Inter',
                ),
              ),
            ),
          ),
          home: const MainNavigation(),
        );
      },
    );
  }
}
