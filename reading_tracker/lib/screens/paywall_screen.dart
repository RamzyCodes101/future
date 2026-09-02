import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:in_app_purchase/in_app_purchase.dart';

import '../services/premium_service.dart';

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
    ('Unlimited notes & quotes', Icons.sticky_note_2_outlined),
    ('Reading pace & trend insights', Icons.trending_up),
    ('Monthly & yearly breakdowns', Icons.calendar_month_outlined),
    ('Priority support', Icons.support_agent_outlined),
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
      appBar: AppBar(title: const Text('Go Premium')),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          Icon(Icons.workspace_premium, size: 56, color: Theme.of(context).colorScheme.primary),
          const SizedBox(height: 16),
          Text(
            'Read more, remember more',
            style: Theme.of(context).textTheme.headlineSmall,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ..._features.map(
            (f) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: Row(
                children: [
                  Icon(f.$2, color: Theme.of(context).colorScheme.primary),
                  const SizedBox(width: 12),
                  Expanded(child: Text(f.$1)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          if (_loading) const Center(child: CircularProgressIndicator()),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Text(
                _error!,
                textAlign: TextAlign.center,
                style: TextStyle(color: Theme.of(context).colorScheme.error),
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
          TextButton(
            onPressed: () => PremiumService.instance.restorePurchases(),
            child: const Text('Restore purchases'),
          ),
          if (kDebugMode) ...[
            const Divider(height: 32),
            Text('Debug only', style: Theme.of(context).textTheme.labelSmall),
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
