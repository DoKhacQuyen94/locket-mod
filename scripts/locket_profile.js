/**
 * locket_profile.js — Hook 2 vai (đăng ký 2 lần trong sgmodule)
 *   - http-request  ^https://api.locketcamera.com/changeProfileInfo
 *   - http-response ^https://api.locketcamera.com/.+   (mọi API của Locket)
 *
 * Tác dụng:
 *   1) Chặn đứng request đổi profile → luôn trả về "thành công + is_gold".
 *      (Nghĩa là bạn đổi tên/ảnh đại diện sẽ KHÔNG lưu được, nhưng App không báo lỗi)
 *   2) Với mọi response khác: đệ quy tìm mọi object có field nhận dạng user
 *      (badge / uid / username / first_name / phone_number) → gắn badge Gold vào.
 *
 * Ghi chú: không gọi mạng, không lưu trữ gì.
 */

const url = ($request && $request.url) ? $request.url : "";

function injectBadge(node) {
  if (!node || typeof node !== "object") return;

  // Chỉ tiêm vào object trông giống "user" — tránh làm hỏng config khác
  if (
    "badge" in node || "uid" in node || "username" in node ||
    "first_name" in node || "phone_number" in node
  ) {
    node.badge       = "locket_gold";
    node.badge_tier  = "gold";
    node.is_gold     = true;
    node.show_badge  = true;
  }

  // Đệ quy xuống mọi object con (mảng cũng là object nên duyệt được luôn)
  for (let key in node) {
    if (
      Object.prototype.hasOwnProperty.call(node, key) &&
      typeof node[key] === "object" &&
      node[key] !== null
    ) {
      injectBadge(node[key]);
    }
  }
}

if (url.includes("changeProfileInfo")) {
  // Nuốt request đổi profile, trả thẳng kết quả giả
  $done({
    response: {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        data:   { badge: "locket_gold", badge_tier: "gold", is_gold: true, success: true },
        result: { badge: "locket_gold", badge_tier: "gold", is_gold: true, success: true }
      })
    }
  });
} else {
  let body = ($response && $response.body) ? $response.body : null;
  if (body) {
    try {
      const obj = JSON.parse(body);
      injectBadge(obj);
      $done({ body: JSON.stringify(obj) });
    } catch (e) {
      // body không phải JSON (ảnh, binary...) → trả nguyên, không đụng
      $done({});
    }
  } else {
    $done({});
  }
}
