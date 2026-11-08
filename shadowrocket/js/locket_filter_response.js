// ============================================================
// Locket-XVIP: API Modifier, Unblur & Gold Profile Badge
// Intercepts: api.locketcamera.com
// ============================================================

(function () {
    // 1. CHIỀU REQUEST
    if (typeof $response === "undefined") {
        const reqUrl = (typeof $request !== "undefined" && $request.url) ? $request.url : "";
        if (reqUrl.includes("changeProfileInfo")) {
            return $done({
                response: {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json; charset=utf-8",
                        "Access-Control-Allow-Origin": "*"
                    },
                    body: JSON.stringify({
                        data: { badge: "locket_gold", badge_tier: "gold", is_gold: true, success: true },
                        result: { badge: "locket_gold", badge_tier: "gold", is_gold: true, success: true }
                    })
                }
            });
        }

        let headers = Object.assign({}, ($request && $request.headers) || {});
        for (let k of Object.keys(headers)) {
            if (['if-none-match', 'if-modified-since', 'x-revenuecat-etag'].includes(k.toLowerCase())) {
                delete headers[k];
            }
        }
        return $done({ headers: headers });
    }

    // 2. CHIỀU RESPONSE
    const reqUrl = (typeof $request !== "undefined" && $request.url) ? $request.url : "";
    if (reqUrl.includes("generateFilteredImage")) {
        return $done({});
    }

    let body = $response.body;
    let status = $response.status || $response.statusCode || 200;

    function applyGoldBadge(target) {
        if (!target || typeof target !== "object") return;
        target.badge = "locket_gold";
        target.badge_tier = "gold";
        target.show_badge = true;
        target.is_gold = true;
        target.has_gold = true;
        target.gold = true;
        target.gold_subscription = true;
        target.has_gold_subscription = true;
        target.tier = "gold";
        target.subscription_status = "active";
    }

    if (body && typeof body === "string") {
        try {
            let obj = JSON.parse(body);
            const isFriendsOrFeed = /getFriends|getUsers|fetchFriends|getRecipients|recipients|moments|fetchMoments|getMoments|contacts/i.test(reqUrl);

            // Gỡ lỗi 402/403 cho filter mà không ảnh hưởng friends/moments
            if (!isFriendsOrFeed && (status === 402 || status === 403 || status === 400)) {
                status = 200;
            }

            function transformNode(node) {
                if (!node || typeof node !== "object") return;
                if (Array.isArray(node)) {
                    for (let i = 0; i < node.length; i++) transformNode(node[i]);
                    return;
                }

                // Gỡ các cờ khóa trả phí & unblur ảnh
                const falseFlags = ["is_locked", "locked", "requires_gold", "require_gold", "gold_only", "is_gold_only", "paywall", "show_paywall", "blurred", "is_blurred"];
                for (let f of falseFlags) {
                    if (f in node) node[f] = false;
                }
                const trueFlags = ["can_view", "unlocked", "is_unlocked", "is_free", "free", "can_use_filter", "can_use_filters"];
                for (let t of trueFlags) {
                    if (t in node) node[t] = true;
                }

                const clearUrl = node.unblurred_url || node.unlocked_url || node.result_url || node.transformed_image_url;
                if (clearUrl && typeof clearUrl === "string" && clearUrl.startsWith("http")) {
                    if ("blurred_url" in node) node.blurred_url = clearUrl;
                    if ("blurred_image_url" in node) node.blurred_image_url = clearUrl;
                    if ("preview_url" in node && node.is_blurred) node.preview_url = clearUrl;
                }

                for (let k of Object.keys(node)) {
                    if (k !== "badge" && k !== "is_gold" && typeof node[k] === "object") {
                        transformNode(node[k]);
                    }
                }
            }

            transformNode(obj);
            applyGoldBadge(obj);
            if (obj.data) applyGoldBadge(obj.data);
            if (obj.result) applyGoldBadge(obj.result);
            if (obj.user) applyGoldBadge(obj.user);

            body = JSON.stringify(obj);
        } catch (e) {}
    }

    let respHeaders = Object.assign({}, ($response && $response.headers) || {});
    delete respHeaders["Content-Encoding"];
    delete respHeaders["content-encoding"];
    delete respHeaders["Content-Length"];
    delete respHeaders["content-length"];
    respHeaders["content-type"] = "application/json; charset=utf-8";

    return $done({
        status: status,
        headers: respHeaders,
        body: body
    });
})();
