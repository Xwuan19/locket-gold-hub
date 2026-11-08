/**
 * @file locket_revenuecat_response.js
 * Unlock Locket Gold Lifetime via RevenueCat
 * Production bulletproof engine - Unconditional Gold Injection
 */

var obj = {};
try {
  obj = typeof $response.body === "string" ? JSON.parse($response.body) : ($response.body || {});
} catch (e) {
  obj = {};
}

obj.subscriber = obj.subscriber || {};
obj.subscriber.subscriptions = obj.subscriber.subscriptions || {};
obj.subscriber.entitlements = obj.subscriber.entitlements || {};

var expireDate = "9999-01-09T10:10:14Z";
var purchaseDate = "2024-01-01T00:00:00Z";

var goldSubscription = {
  auto_resume_date: null,
  display_name: "locket_1600_1y",
  is_sandbox: false,
  ownership_type: "PURCHASED",
  billing_issues_detected_at: null,
  management_url: "https://apps.apple.com/account/subscriptions",
  period_type: "normal",
  price: {
    amount: 399000.0,
    currency: "VND"
  },
  expires_date: expireDate,
  grace_period_expires_date: null,
  refunded_at: null,
  unsubscribe_detected_at: null,
  original_purchase_date: "2024-01-01T00:00:00Z",
  purchase_date: purchaseDate,
  store: "app_store",
  store_transaction_id: "2000001108724193"
};

var goldEntitlement = {
  grace_period_expires_date: null,
  purchase_date: purchaseDate,
  product_identifier: "locket_1600_1y",
  expires_date: expireDate
};

// Unconditional injection: always assign Gold and gold entitlements
obj.subscriber.subscriptions["locket_1600_1y"] = goldSubscription;
obj.subscriber.subscriptions["com.locket02.premium.yearly"] = goldSubscription;
obj.subscriber.subscriptions["locket_199_1m"] = goldSubscription;
obj.subscriber.subscriptions["locket.premium.yearly"] = goldSubscription;

obj.subscriber.entitlements["Gold"] = goldEntitlement;
obj.subscriber.entitlements["gold"] = goldEntitlement;
obj.subscriber.entitlements["pro"] = goldEntitlement;
obj.subscriber.entitlements["premium"] = goldEntitlement;
obj.subscriber.entitlements["locket_gold"] = goldEntitlement;

obj.Attention = "Locket VIP Activated (Gold Lifetime)!";

$done({ body: JSON.stringify(obj) });
