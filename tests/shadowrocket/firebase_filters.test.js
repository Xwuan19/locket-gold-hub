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

// Test Upsell Features Enabled for Gold features
const upsell = JSON.parse(parsed.entries.upsell_features);
assert.strictEqual(upsell.custom_widget_frames, true, "Expected custom_widget_frames upsell to be true");

// Test Widget Frames & Event
assert.strictEqual(parsed.entries.custom_widget_frames_enabled, "true", "Expected custom_widget_frames_enabled to be true");
assert.strictEqual(parsed.entries.custom_widget_frames, "enabled", "Expected custom_widget_frames to be enabled");
assert.strictEqual(parsed.entries.ios_widget_frame_event_enabled, "true", "Expected ios_widget_frame_event_enabled to be true");
assert.strictEqual(parsed.entries.widget_frame_event_enabled, "true", "Expected widget_frame_event_enabled to be true");
assert.strictEqual(parsed.entries.widget_frame_event_max_images, "5", "Expected widget_frame_event_max_images to be 5");

const widgetFrameEvent = JSON.parse(parsed.entries.widget_frame_event);
assert.strictEqual(widgetFrameEvent.placement, "below", "Expected widget frame placement to be below");
assert(widgetFrameEvent.url, "Expected widget frame url to be present");

// Test Native Filter Configuration (Default system filters)
assert(parsed.entries.camera_filter_config, "Expected camera_filter_config");
const cfg = JSON.parse(parsed.entries.camera_filter_config);
assert(cfg.sheet_filters.some(f => f.title.en === "Goofy"), "Expected Goofy filter group");
assert(cfg.sheet_filters.some(f => f.title.en === "Looks"), "Expected Looks filter group");
assert(cfg.sheet_filters.some(f => f.title.en === "Celebrate"), "Expected Celebrate filter group");
assert(cfg.sheet_filters.some(f => f.title.en === "Cute"), "Expected Cute filter group");
assert(cfg.picker_filters.length > 0, "Expected picker filters");

// Test 30s Recording & Video Upload with Audio
assert.strictEqual(parsed.entries.video_sound_enabled, "true", "Expected video_sound_enabled");
assert.strictEqual(parsed.entries.microphone_enabled, "true", "Expected microphone_enabled");
assert.strictEqual(parsed.entries.camera_microphone_enabled, "true", "Expected camera_microphone_enabled");
assert.strictEqual(parsed.entries.camera_roll_video_sound_enabled, "true", "Expected camera_roll_video_sound_enabled");
assert.strictEqual(parsed.entries.upload_main, "true", "Expected upload_main to be true");
assert.strictEqual(parsed.entries.video_max_duration, "30.0", "Expected video_max_duration to be 30.0");
assert.strictEqual(parsed.entries.camera_roll_video_max_duration, "30.0", "Expected camera_roll_video_max_duration to be 30.0");

// Test Captions
assert(parsed.entries.overlay_items, "Expected overlay_items");
assert(parsed.entries.overlay_dynamic_captions, "Expected overlay_dynamic_captions");

console.log("Shadowrocket Firebase Filter, Widget Frames & Audio test passed!");
