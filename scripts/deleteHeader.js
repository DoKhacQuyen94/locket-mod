/**
 * deleteHeader.js — Hook chặn request (http-request)
 * Bắt: ^https://api.(revenuecat|rc-backup).com/.+/(receipts|subscribers)
 *
 * Tác dụng: xoá các header cache (ETag / If-None-Match).
 * Lý do: nếu để nguyên, RevenueCat trả 304 Not Modified → App dùng bản cache cũ
 * (chưa bị sửa) → hook locketlam.js mất tác dụng.
 * Xoá đi thì server buộc phải trả 200 kèm body mới, hook mới ghi đè được.
 *
 * Ghi chú: chỉ sửa header, không gọi mạng.
 */

var modifiedHeaders = ($request && $request.headers)
  ? Object.assign({}, $request.headers)
  : {};

var removeTargets = {
  "x-revenuecat-etag": true,
  "if-none-match": true
};

for (var key in modifiedHeaders) {
  if (Object.prototype.hasOwnProperty.call(modifiedHeaders, key) && removeTargets[key.toLowerCase()]) {
    delete modifiedHeaders[key];
  }
}

$done({ headers: modifiedHeaders });
