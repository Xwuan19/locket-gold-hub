const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { generateMobileconfig, getCACertBase64 } = require('../../admin/lib/mobileconfig');
const { DOMAINS_TO_REWRITE } = require('../../admin/lib/nextdns');

test('camera_filter_config.json contains full frames, stickers and photobooth config', () => {
  const cfgPath = path.resolve(__dirname, '../../proxy/handler/camera_filter_config.json');
  assert.ok(fs.existsSync(cfgPath), 'camera_filter_config.json must exist');

  const raw = fs.readFileSync(cfgPath, 'utf8');
  const cfg = JSON.parse(raw);

  assert.strictEqual(cfg.showFilterButton, true);
  assert.strictEqual(cfg.allowsCustomFilters, true);
  assert.strictEqual(cfg.referenceImageAttachmentEnabled, true);

  // Check picker filters
  assert.ok(Array.isArray(cfg.pickerFilters), 'pickerFilters must be array');
  assert.ok(cfg.pickerFilters.length >= 80, `Expected at least 80 picker filters, got ${cfg.pickerFilters.length}`);
  assert.ok(cfg.pickerFilters.includes('khung_nh_shin_chan_vi_n_m_nh'), 'Shin-chan frame must be in picker');
  assert.ok(cfg.pickerFilters.includes('khung_hello_kitty_pastel_ng_t_ng_o'), 'Hello Kitty frame must be in picker');
  assert.ok(cfg.pickerFilters.includes('photobooth_4cut'), 'photobooth_4cut must be in picker');
  assert.ok(cfg.pickerFilters.includes('looks_maxxing'), 'looks_maxxing must be in picker');
  assert.ok(cfg.pickerFilters.includes('influencer'), 'influencer must be in picker');
  assert.ok(cfg.pickerFilters.includes('stk_rose_flower'), 'stk_rose_flower must be in picker');

  // Check filter groups
  assert.ok(Array.isArray(cfg.filterGroups), 'filterGroups must be array');
  assert.strictEqual(cfg.filterGroups.length, 9, 'Must have 9 structured filter groups');
  assert.ok(cfg.filterGroups.some(g => g.id === 'group_photobooth'), 'Must have group_photobooth');
  assert.ok(cfg.filterGroups.some(g => g.id === 'group_frames'), 'Must have group_frames');
  assert.ok(cfg.filterGroups.some(g => g.id === 'group_hot_ai_3d'), 'Must have group_hot_ai_3d');

  // Check remote filters
  assert.ok(Array.isArray(cfg.remoteFilters), 'remoteFilters must be array');
  assert.ok(cfg.remoteFilters.length >= 100, `Expected >= 100 remote filters, got ${cfg.remoteFilters.length}`);
  assert.ok(cfg.remoteFilters.some(f => f.id === 'khung_nh_shin_chan_vi_n_m_nh'), 'Shin-chan in remote filters');
  assert.ok(cfg.remoteFilters.some(f => f.id === 'stk_dio_orange_wig'), 'stk_dio_orange_wig in remote filters');
  assert.ok(cfg.remoteFilters.some(f => f.id === 'okay_wig'), 'okay_wig in remote filters');
});

test('NextDNS rewrite domains covers all necessary Locket endpoints', () => {
  const nextDnsFile = fs.readFileSync(path.resolve(__dirname, '../../admin/lib/nextdns.js'), 'utf8');
  assert.ok(nextDnsFile.includes('firebaseremoteconfig.googleapis.com'));
  assert.ok(nextDnsFile.includes('api.revenuecat.com'));
  assert.ok(nextDnsFile.includes('us-central1-locket-4252a.cloudfunctions.net'));
  assert.ok(nextDnsFile.includes('api.locketcamera.com'));
});
