// ============================================================
// Locket VIP: Photobooth 4-Shot Engine & AI Filter Modifier
// Intercepts: POST /generateFilteredImage
// Chống triệt để 100% lỗi "Không thể áp dụng bộ lọc" trên Shadowrocket
// By Xwuan
// ============================================================

(function () {
    const WORKER_HOST = "https://locket-vip.mhiep20077.workers.dev";

    // 1. CHIỀU REQUEST: Điều hướng an toàn qua Worker bảo mật
    // Bắt buộc dùng Secret Key Locket_YouTube để Worker Cloudflare ủy quyền xử lý thành công (trả 200 OK thay vì 403)
    if (typeof $response === "undefined") {
        try {
            if (!$request) return $done({});

            const targetUrl = `${WORKER_HOST}/generateFilteredImage?module=Locket_YouTube`;
            let headers = Object.assign({}, ($request && $request.headers) || {});
            headers["Host"] = "locket-vip.mhiep20077.workers.dev";
            headers["host"] = "locket-vip.mhiep20077.workers.dev";
            headers["X-Module-Origin"] = "Locket_YouTube";

            return $done({
                url: targetUrl,
                headers: headers
            });
        } catch (e) {
            return $done({});
        }
    }

    // 2. CHIỀU RESPONSE: Xóa sạch mã lỗi, đảm bảo luôn trả 200 OK cho Locket Camera
    try {
        if (typeof $response !== "undefined" && $response.body) {
            let resObj = {};
            try {
                resObj = JSON.parse($response.body);
            } catch (e) {
                resObj = {};
            }

            delete resObj.error;
            delete resObj.errors;
            if (resObj.result) {
                delete resObj.result.error;
                delete resObj.result.errors;
                resObj.result.status = 200;
            }

            return $done({
                status: 200,
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Access-Control-Allow-Origin": "*"
                },
                body: JSON.stringify(resObj)
            });
        }
    } catch (e) {}

    return $done({});
})();
