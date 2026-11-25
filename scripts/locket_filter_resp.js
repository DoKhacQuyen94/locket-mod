/**
 * locket_filter_resp.js — AI Filter Response Unlock (http-response)
 * DoKhacQuyen (github.com/DoKhacQuyen94)
 *
 * Bắt: ^https?:\/\/(us-central1-locket-4252a\.cloudfunctions\.net|api\.locketcamera\.com)\/generateFilteredImage
 * Tác dụng: Mở khóa kết quả generateFilteredImage, gỡ mã lỗi 400/402/403
 * và xóa các trường error/errors, giữ hoàn toàn offline (không gọi mạng ngoài).
 */

(function () {
    if (typeof $response === "undefined" || !$response) {
        $done({});
        return;
    }

    let filterBody = $response.body || "";
    let filterStatus = $response.status || $response.statusCode || 200;

    if (typeof filterBody === "string" && filterBody.trim()) {
        try {
            let filterObj = JSON.parse(filterBody);

            if (filterStatus === 400 || filterStatus === 402 || filterStatus === 403) {
                filterStatus = 200;
                const details = (filterObj && filterObj.error && filterObj.error.details)
                    ? filterObj.error.details
                    : {};
                filterObj = {
                    result: {
                        status: 200,
                        is_gold: true,
                        is_locked: false,
                        requires_gold: false,
                        unlocked: true,
                        data: details
                    }
                };
            } else if (filterObj && typeof filterObj === "object") {
                delete filterObj.error;
                delete filterObj.errors;
                if (filterObj.result && typeof filterObj.result === "object") {
                    delete filterObj.result.error;
                    delete filterObj.result.errors;
                    filterObj.result.is_locked = false;
                    filterObj.result.requires_gold = false;
                    filterObj.result.unlocked = true;
                    filterObj.result.is_gold = true;
                    filterObj.result.status = 200;
                }
            }

            filterBody = JSON.stringify(filterObj);
        } catch (e) {}
    }

    const fh = Object.assign({}, $response.headers || {});
    delete fh["Content-Encoding"];
    delete fh["content-encoding"];
    delete fh["Content-Length"];
    delete fh["content-length"];
    delete fh["Transfer-Encoding"];
    delete fh["transfer-encoding"];
    fh["content-type"] = "application/json; charset=utf-8";

    $done({ status: filterStatus, headers: fh, body: filterBody });
})();
