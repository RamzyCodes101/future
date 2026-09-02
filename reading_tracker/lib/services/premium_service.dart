import 'dart:async';

import 'package:in_app_purchase/in_app_purchase.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Wraps Play Billing (via `in_app_purchase`) for the two subscription
/// products configured in Play Console. Product IDs must match exactly
/// what's set up there before release.
///
/// NOTE: this caches entitlement locally via SharedPreferences for a fast,
/// offline-friendly UI. Before shipping, pair this with server-side receipt
/// validation (e.g. via RevenueCat or your own backend hitting the Play
/// Developer API) so entitlement can't be spoofed by editing local storage.
class PremiumService {
  PremiumService._();
  static final PremiumService instance = PremiumService._();

  static const String monthlyId = 'reading_tracker_premium_monthly';
  static const String yearlyId = 'reading_tracker_premium_yearly';
  static const Set<String> productIds = {monthlyId, yearlyId};

  static const _premiumPrefKey = 'is_premium';

  final InAppPurchase _iap = InAppPurchase.instance;
  StreamSubscription<List<PurchaseDetails>>? _subscription;
  SharedPreferences? _prefs;

  final _premiumController = StreamController<bool>.broadcast();
  Stream<bool> get premiumStream => _premiumController.stream;

  bool _isPremium = false;
  bool get isPremium => _isPremium;

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
    _isPremium = _prefs?.getBool(_premiumPrefKey) ?? false;
    _premiumController.add(_isPremium);

    final available = await _iap.isAvailable();
    if (!available) return;

    _subscription = _iap.purchaseStream.listen(
      _onPurchaseUpdate,
      onDone: () => _subscription?.cancel(),
      onError: (_) {},
    );
  }

  Future<List<ProductDetails>> fetchProducts() async {
    final available = await _iap.isAvailable();
    if (!available) return [];
    final response = await _iap.queryProductDetails(productIds);
    return response.productDetails;
  }

  Future<void> buy(ProductDetails product) async {
    final purchaseParam = PurchaseParam(productDetails: product);
    await _iap.buyNonConsumable(purchaseParam: purchaseParam);
  }

  Future<void> restorePurchases() async {
    await _iap.restorePurchases();
  }

  Future<void> _onPurchaseUpdate(List<PurchaseDetails> purchases) async {
    for (final purchase in purchases) {
      if (purchase.status == PurchaseStatus.purchased ||
          purchase.status == PurchaseStatus.restored) {
        if (productIds.contains(purchase.productID)) {
          await _setPremium(true);
        }
        if (purchase.pendingCompletePurchase) {
          await _iap.completePurchase(purchase);
        }
      } else if (purchase.status == PurchaseStatus.error) {
        if (purchase.pendingCompletePurchase) {
          await _iap.completePurchase(purchase);
        }
      }
    }
  }

  Future<void> _setPremium(bool value) async {
    _isPremium = value;
    await _prefs?.setBool(_premiumPrefKey, value);
    _premiumController.add(value);
  }

  /// Debug/dev helper to flip entitlement without hitting Play Billing.
  Future<void> debugSetPremium(bool value) => _setPremium(value);

  void dispose() {
    _subscription?.cancel();
    _premiumController.close();
  }
}
