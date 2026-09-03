import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:in_app_purchase/in_app_purchase.dart';

import '../services/premium_service.dart';
import '../theme/app_theme.dart';

class PaywallScreen extends StatefulWidget {
  const PaywallScreen({super.key});

  @override
  State<PaywallScreen> createState() => _PaywallScreenState();
}

class _PaywallScreenState extends State<PaywallScreen> {
  List<ProductDetails> _products = [];
  bool _loading = true;
  String? _error;

  static const _features = [
    ('Unlimited notes & quotes', Icons.sticky_note_2_rounded, AppColors.coral),
    ('Reading pace & trend insights', Icons.trending_up_rounded, AppColors.sage),
    ('Monthly & yearly breakdowns', Icons.calendar_month_rounded, AppColors.periwinkle),
    ('Priority support', Icons.support_agent_rounded, AppColors.plum),
  ];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final products = await PremiumService.instance.fetchProducts();
      if (!mounted) return;
      setState(() {
        _products = products;
        _error = products.isEmpty ? 'Products unavailable — configure them in Play Console.' : null;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _error = "Couldn't load subscription options.");
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _buy(ProductDetails product) async {
    await PremiumService.instance.buy(product);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.cream,
      appBar: AppBar(backgroundColor: AppColors.cream, title: const Text('Go Premium')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(24, 8, 24, 24),
        children: [
          Center(
            child: Container(
              width: 88,
              height: 88,
              decoration: const BoxDecoration(color: AppColors.yellowPale, shape: BoxShape.circle),
              child: const Icon(Icons.workspace_premium_rounded, size: 44, color: AppColors.yellowDeeper),
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'Read more, remember more',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, letterSpacing: -0.5, color: AppColors.ink),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 6),
          const Text(
            'Everything in Free, plus the tools to build a real reading habit.',
            style: TextStyle(color: AppColors.inkMuted, fontSize: 14),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 28),
          ..._features.map(
            (f) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 7),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(color: f.$3.withValues(alpha: 0.15), shape: BoxShape.circle),
                    child: Icon(f.$2, color: f.$3, size: 20),
                  ),
                  const SizedBox(width: 14),
                  Expanded(child: Text(f.$1, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14.5))),
                ],
              ),
            ),
          ),
          const SizedBox(height: 28),
          if (_loading) const Center(child: CircularProgressIndicator()),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Text(
                _error!,
                textAlign: TextAlign.center,
                style: const TextStyle(color: AppColors.coral),
              ),
            ),
          ..._products.map(
            (product) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: FilledButton(
                onPressed: () => _buy(product),
                child: Text('${product.title} — ${product.price}'),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Center(
            child: TextButton(
              onPressed: () => PremiumService.instance.restorePurchases(),
              child: const Text('Restore purchases'),
            ),
          ),
          if (kDebugMode) ...[
            const Divider(height: 32),
            const Text('Debug only', style: TextStyle(color: AppColors.inkMuted, fontSize: 11)),
            const SizedBox(height: 8),
            OutlinedButton(
              onPressed: () => PremiumService.instance.debugSetPremium(true),
              child: const Text('Force-enable premium (debug)'),
            ),
          ],
        ],
      ),
    );
  }
}
