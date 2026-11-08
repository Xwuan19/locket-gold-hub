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

// Test Cache Invalidation & Force Update
assert.strictEqual(parsed.state, "UPDATE", "Expected parsed.state to be UPDATE");
assert(parsed.templateVersion, "Expected templateVersion to be set");
assert.strictEqual(parsed.entries.cache_ttl_seconds, "0", "Expected cache_ttl_seconds to be 0");
assert.strictEqual(parsed.entries.client_cache_ttl_sec, "0", "Expected client_cache_ttl_sec to be 0");

// Test Upsell Features Disabled (no paywall triggers)
const upsell = JSON.parse(parsed.entries.upsell_features);
assert.strictEqual(upsell.custom_widget_frames, false, "Expected custom_widget_frames upsell to be false");
assert.strictEqual(upsell.camera_theme, false, "Expected camera_theme upsell to be false");

// Test Widget Frames & Event
assert.strictEqual(parsed.entries.custom_widget_frames_enabled, "true", "Expected custom_widget_frames_enabled to be true");
assert.strictEqual(parsed.entries.custom_widget_frames, "enabled", "Expected custom_widget_frames to be enabled");

const widgetFrameEvent = JSON.parse(parsed.entries.widget_frame_event);
assert.strictEqual(widgetFrameEvent.placement, "below", "Expected widget frame placement to be below");
assert(widgetFrameEvent.url, "Expected widget frame url to be present");

const widgetFramesConfig = JSON.parse(parsed.entries.widget_frames_config);
assert.strictEqual(widgetFramesConfig.enabled, true, "Expected widget_frames_config.enabled to be true");
assert.strictEqual(widgetFramesConfig.default_style, "royal_gold_vip", "Expected default_style to be royal_gold_vip");

// Test Filter Configuration & Prompts
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

const roseFilter = cfg.remote_filters.find(f => f.id === "stk_rose_flower");
assert(roseFilter && roseFilter.prompt.includes("rose in their mouth"), "Expected rose filter to have full AI prompt");

console.log("Shadowrocket Firebase Filter & Widget Frames test passed!");
