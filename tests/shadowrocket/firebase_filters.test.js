const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const code = fs.readFileSync('shadowrocket/js/locket_firebase_response.js', 'utf8');

const mockObj = { entries: {} };
let capturedDone = null;
const sandbox = {
    $request: { headers: { 'User-Agent': 'Locket/1.0.0' } },
    $response: { body: JSON.stringify(mockObj) },
    $done: function (res) {
        capturedDone = res;
    },
    console: console
};

vm.runInNewContext(code, sandbox);

assert(capturedDone, "Expected $done to be called");
assert(capturedDone.body, "Expected $done to return body");

const parsed = JSON.parse(capturedDone.body);
assert(parsed.entries.camera_filter_config, "Expected camera_filter_config");

const cfg = JSON.parse(parsed.entries.camera_filter_config);
assert.strictEqual(cfg.sheet_filters[0].title.vi, "🎁 Hộp Quà May Mắn");
assert.strictEqual(cfg.sheet_filters[1].title.vi, "🎞️ Photobooth 2 Ảnh");
assert.strictEqual(cfg.sheet_filters[2].title.vi, "📸 Photobooth 4 Ảnh");
assert.strictEqual(cfg.sheet_filters[3].title.vi, "🎂 Sinh Nhật");
assert.strictEqual(cfg.sheet_filters[4].title.vi, "🔥 Sticker & Khung Ảnh (free không cần lượt)");

assert(cfg.remote_filters.length > 0, "Expected remote filters");
assert(cfg.picker_filters.length > 0, "Expected picker filters");
assert(parsed.entries.likeness_enabled === "true", "Expected likeness enabled");

console.log("Shadowrocket Firebase Filter Configuration test passed!");
