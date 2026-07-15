import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../models/product.dart';

class ProductsScreen extends StatefulWidget {
  const ProductsScreen({super.key});

  @override
  State<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  String _selectedCategory = 'all';

  final List<Map<String, String>> _categories = [
    {'id': 'all', 'nameAr': 'الكل', 'nameEn': 'All'},
    {'id': 'sugar', 'nameAr': 'سكر', 'nameEn': 'Sugar'},
    {'id': 'foodstuffs', 'nameAr': 'غذائيات', 'nameEn': 'Foodstuffs'},
    {'id': 'rice', 'nameAr': 'أرز', 'nameEn': 'Rice'},
    {'id': 'oils', 'nameAr': 'زيوت', 'nameEn': 'Oils'},
  ];

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isAr = appState.language == 'ar';
    final products = appState.products;

    final filteredProducts = _selectedCategory == 'all'
        ? products
        : products.where((p) => p.category == _selectedCategory).toList();

    return Scaffold(
      appBar: AppBar(
        title: Text(
          isAr ? 'السلع والمواد الغذائية' : 'Foodstuffs & Commodities',
          style: const TextStyle(fontWeight: FontWeight.black, fontSize: 16),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Category Filter Rail
            SizedBox(
              height: 42,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: _categories.length,
                itemBuilder: (context, index) {
                  final cat = _categories[index];
                  final isSelected = _selectedCategory == cat['id'];
                  final name = isAr ? cat['nameAr']! : cat['nameEn']!;

                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        _selectedCategory = cat['id']!;
                      });
                    },
                    child: Container(
                      margin: const EdgeInsets.only(left: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0xFF850F1D) : Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSelected ? Colors.transparent : Colors.grey[200]!,
                        ),
                      ),
                      child: Center(
                        child: Text(
                          name,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: isSelected ? Colors.white : Colors.stone[600],
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 16),

            // Products Grid / List
            Expanded(
              child: filteredProducts.isEmpty
                  ? Center(
                      child: Text(
                        isAr ? 'لا توجد منتجات متوفرة حالياً' : 'No products available right now',
                        style: const TextStyle(color: Colors.grey),
                      ),
                    )
                  : ListView.builder(
                      physics: const BouncingScrollPhysics(),
                      itemCount: filteredProducts.length,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemBuilder: (context, index) {
                        final product = filteredProducts[index];
                        return _buildProductCard(product, isAr, appState);
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProductCard(Product product, bool isAr, AppState appState) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.015),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
        border: Border.all(color: Colors.grey[100]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: const Color(0xFFFAF7F0),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Center(
                  child: Text(
                    _getProductCategoryEmoji(product.category),
                    style: const TextStyle(fontSize: 28),
                  ),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFF850F1D).withOpacity(0.06),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            isAr ? product.categoryAr : product.category,
                            style: const TextStyle(
                              color: Color(0xFF850F1D),
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.grey[100],
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            product.unit,
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      product.name,
                      style: const TextStyle(
                        fontWeight: FontWeight.black,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      product.description,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: Colors.grey[500],
                        fontSize: 10.5,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Divider(color: Colors.grey[100]),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    isAr ? 'السعر المتوفر بالفرنك:' : 'Available Price:',
                    style: TextStyle(fontSize: 9, color: Colors.grey[500]),
                  ),
                  Row(
                    baseline: TextBaseline.alphabetic,
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    children: [
                      Text(
                        '${product.price.toStringAsFixed(0)} ',
                        style: const TextStyle(
                          color: Color(0xFF850F1D),
                          fontSize: 18,
                          fontWeight: FontWeight.black,
                        ),
                      ),
                      Text(
                        isAr ? 'فرنك / وحدة' : 'FCFA / unit',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              ElevatedButton.icon(
                onPressed: () {
                  final String userMsg = 'مرحباً خدمة مبيعات تطبيق بدل، أريد طلب شراء المنتج: (${product.name}) بسعر (${product.price} فرنك) للوحدة (${product.unit}). يرجى تأكيد الطلب والتوصيل.';
                  appState.openWhatsApp(phone: '+249912345678', message: userMsg);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF25D366),
                  foregroundColor: Colors.white,
                  minimumSize: const Size(120, 38),
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                icon: const Icon(Icons.shopping_cart_outlined, size: 14),
                label: Text(
                  isAr ? 'طلب واتساب' : 'Order WA',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _getProductCategoryEmoji(String category) {
    switch (category) {
      case 'sugar': return '🍬';
      case 'foodstuffs': return '📦';
      case 'rice': return '🌾';
      case 'oils': return '🧴';
      default: return '🛍️';
    }
  }
}
