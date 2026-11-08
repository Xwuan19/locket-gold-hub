// ============================================================
// Locket-XVIP: Photobooth 4-Shot Engine & AI Filter Modifier
// Intercepts: POST /generateFilteredImage
// Luồng ghép 4 ảnh: Chụp 1-3 lưu session, chụp 4 tự động ghép vào khung photobooth
// ============================================================

(function () {
    const WORKER_HOST = "https://locket-vip.mhiep20077.workers.dev";

    // Chiều Request: Chuyển hướng xử lý qua Photobooth Engine Worker
    if (typeof $response === "undefined") {
        try {
            if (!$request) return $done({});

            const targetUrl = `${WORKER_HOST}/generateFilteredImage?module=Locket_XVIP`;
            let headers = Object.assign({}, ($request && $request.headers) || {});
            headers["Host"] = "locket-vip.mhiep20077.workers.dev";
            headers["host"] = "locket-vip.mhiep20077.workers.dev";
            headers["X-Module-Origin"] = "Locket_XVIP";

            return $done({
                url: targetUrl,
                headers: headers
            });
        } catch (e) {
            return $done({});
        }
    }

    // Chiều Response: Xóa sạch mã lỗi, đảm bảo luôn trả 200 OK
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
