/**
 * locketlam.js — Hook RevenueCat (http-response)
 * Bắt: ^https://api.(revenuecat|rc-backup).com/.+/(receipts$|subscribers/[^/]+$)
 *
 * Tác dụng: nhận response RevenueCat trả về, ghi đè phần subscriber/entitlements
 * để App Locket đọc ra là "đã mua gói locket_1600_1y (Gold)" hạn 2099.
 *
 * Ghi chú: file này KHÔNG gọi mạng, KHÔNG đọc/ghi persistentStore, KHÔNG notify.
 * Toàn bộ chỉ sửa JSON trong bộ nhớ rồi trả lại.
 */

const purchaseDate = "2024-05-18T08:30:00Z";
const expiresDate  = "2099-12-31T23:59:59Z";

var obj = {};
try {
  obj = ($response && $response.body) ? JSON.parse($response.body) : {};
} catch (e) {
  obj = {};                      // body lỗi/không phải JSON → coi như object rỗng
}
if (!obj || typeof obj !== "object") {
  obj = {};
}

obj.Attention = "Locket Gold VIP - Kích hoạt thành công bởi DoKhacQuyen (github.com/DoKhacQuyen94)!";

// Object mô tả một "subscription" giả, đúng schema RevenueCat v1
var subscription = {
  auto_resume_date: null,
  display_name: "locket_1600_1y",
  is_sandbox: false,                              // giả là mua thật, không phải TestFlight
  ownership_type: "PURCHASED",
  billing_issues_detected_at: null,
  management_url: "https://apps.apple.com/account/subscriptions",
  period_type: "normal",
  price: { amount: 399000, currency: "VND" },
  expires_date: expiresDate,
  grace_period_expires_date: null,
  refunded_at: null,
  unsubscribe_detected_at: null,
  original_purchase_date: purchaseDate,
  purchase_date: purchaseDate,
  store: "app_store",                             // giả nguồn là App Store
  store_transaction_id: "2000001108724193"        // mã giao dịch bịa
};

// Object mô tả một "entitlement" giả (quyền dùng tính năng)
var entitlement = {
  grace_period_expires_date: null,
  purchase_date: purchaseDate,
  original_purchase_date: purchaseDate,
  product_identifier: "locket_1600_1y",
  expires_date: expiresDate,
  ownership_type: "PURCHASED",
  store: "app_store"
};

obj.subscriber = obj.subscriber || {};
obj.subscriber.first_seen = purchaseDate;
obj.subscriber.original_purchase_date = purchaseDate;
obj.subscriber.management_url = "https://apps.apple.com/account/subscriptions";
obj.subscriber.subscriptions = obj.subscriber.subscriptions || {};
obj.subscriber.entitlements  = obj.subscriber.entitlements  || {};

obj.subscriber.subscriptions.locket_1600_1y = subscription;
// Bơm cùng một entitlement dưới 3 tên khác nhau — App check tên nào cũng khớp
obj.subscriber.entitlements.Gold = entitlement;
obj.subscriber.entitlements.pro  = entitlement;
obj.subscriber.entitlements.vip  = entitlement;

$done({ body: JSON.stringify(obj) });
