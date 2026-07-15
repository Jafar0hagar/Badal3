import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../models/currency.dart';

class PricesScreen extends StatefulWidget {
  const PricesScreen({super.key});

  @override
  State<PricesScreen> createState() => _PricesScreenState();
}

class _PricesScreenState extends State<PricesScreen> {
  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isAr = appState.language == 'ar';
    final currencies = appState.currencies;

    final filteredCurrencies = currencies.where((c) {
      final nameMatches = c.name.toLowerCase().contains(_searchQuery.toLowerCase());
      final codeMatches = c.code.toLowerCase().contains(_searchQuery.toLowerCase());
      final countryMatches = c.country.toLowerCase().contains(_searchQuery.toLowerCase());
      return nameMatches || codeMatches || countryMatches;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: Text(
          isAr ? 'أسعار العملات الموازية' : 'Parallel Currency Rates',
          style: const TextStyle(fontWeight: FontWeight.black, fontSize: 16),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Search Input
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: TextField(
                onChanged: (value) {
                  setState(() {
                    _searchQuery = value;
                  });
                },
                decoration: InputDecoration(
                  hintText: isAr ? 'ابحث باسم العملة أو الدولة...' : 'Search by currency or country...',
                  prefixIcon: const Icon(Icons.search, color: Color(0xFF850F1D)),
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: const EdgeInsets.symmetric(vertical: 0),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide(color: Colors.grey[200]!),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide(color: Colors.grey[200]!),
                  ),
                ),
              ),
            ),
            
            // Currency List View
            Expanded(
              child: filteredCurrencies.isEmpty
                  ? Center(
                      child: Text(
                        isAr ? 'لم يتم العثور على نتائج' : 'No currencies found',
                        style: const TextStyle(color: Colors.grey),
                      ),
                    )
                  : ListView.builder(
                      physics: const BouncingScrollPhysics(),
                      itemCount: filteredCurrencies.length,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      itemBuilder: (context, index) {
                        final currency = filteredCurrencies[index];
                        return _buildCurrencyCard(currency, isAr);
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCurrencyCard(Currency currency, bool isAr) {
    Color trendColor = Colors.grey;
    IconData trendIcon = Icons.trending_flat;

    if (currency.trend == 'up') {
      trendColor = Colors.green;
      trendIcon = Icons.trending_up;
    } else if (currency.trend == 'down') {
      trendColor = Colors.red;
      trendIcon = Icons.trending_down;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
        border: Border.all(color: Colors.grey[100]!),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: const Color(0xFFFAF7F0),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Center(
                  child: Text(
                    _getFlagEmoji(currency.flag),
                    style: const TextStyle(fontSize: 22),
                  ),
                ),
              ),
              const SizedBox(width: 14),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    currency.name,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${currency.code} • ${currency.country}',
                    style: TextStyle(
                      color: Colors.grey[500],
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Row(
                children: [
                  Text(
                    '${currency.price.toStringAsFixed(0)} ',
                    style: const TextStyle(
                      fontWeight: FontWeight.black,
                      fontSize: 15,
                      color: Color(0xFF850F1D),
                    ),
                  ),
                  Text(
                    isAr ? 'جنيه' : 'SDG',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  Icon(trendIcon, color: trendColor, size: 14),
                  const SizedBox(width: 4),
                  Text(
                    isAr ? 'نشط الآن' : 'Active now',
                    style: TextStyle(
                      fontSize: 9,
                      color: Colors.grey[400],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _getFlagEmoji(String flagCode) {
    // Utility to fetch accurate visual flag representing currency origin
    switch (flagCode.toUpperCase()) {
      case 'TD': return '🇨🇦'; // Chad / XAF representative
      case 'US': return '🇺🇸';
      case 'EU': return '🇪🇺';
      case 'SA': return '🇸🇦';
      case 'GB': return '🇬🇧';
      case 'EG': return '🇪🇬';
      case 'AE': return '🇦🇪';
      case 'KW': return '🇰🇼';
      default: return '🏳️';
    }
  }
}
