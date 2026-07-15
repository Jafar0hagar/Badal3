class Currency {
  final String id;
  final String name;
  final String code;
  final String symbol;
  final double price;
  final String lastUpdated;
  final String flag;
  final String trend; // 'up', 'down', 'stable'
  final String country;

  Currency({
    required this.id,
    required this.name,
    required this.code,
    required this.symbol,
    required this.price,
    required this.lastUpdated,
    required this.flag,
    required this.trend,
    required this.country,
  });

  Currency copyWith({
    String? id,
    String? name,
    String? code,
    String? symbol,
    double? price,
    String? lastUpdated,
    String? flag,
    String? trend,
    String? country,
  }) {
    return Currency(
      id: id ?? this.id,
      name: name ?? this.name,
      code: code ?? this.code,
      symbol: symbol ?? this.symbol,
      price: price ?? this.price,
      lastUpdated: lastUpdated ?? this.lastUpdated,
      flag: flag ?? this.flag,
      trend: trend ?? this.trend,
      country: country ?? this.country,
    );
  }
}
