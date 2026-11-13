const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('public/index.html contains mobile-first Xwuan_DNS UI without NextDNS dependency', () => {
  const htmlPath = path.resolve(__dirname, '../../public/index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  // Branding
  assert.ok(html.includes('Xwuan_DNS'), 'Should feature Xwuan_DNS branding');
  assert.ok(html.includes('UpLocket'), 'Should feature UpLocket Network branding');

  // Direct Install CTA
  assert.ok(html.includes('/Xwuan_DNS.mobileconfig'), 'Should link directly to /Xwuan_DNS.mobileconfig');
  assert.ok(html.includes('📲 Cài Đặt Xwuan_DNS Ngay'), 'Should have clear CTA title');

  // Sticky bottom bar
  assert.ok(html.includes('mobile-bottom-bar'), 'Should include mobile-bottom-bar class');
  assert.ok(html.includes('env(safe-area-inset-bottom)'), 'Should support iOS safe area');

  // 4-step iOS guide
  assert.ok(html.includes('Tải về bằng Safari'), 'Step 1 should guide Safari download');
  assert.ok(html.includes('Đã tải về hồ sơ'), 'Step 2 should guide Settings profile install');
  assert.ok(html.includes('UpLocket Custom Root CA'), 'Step 3 should guide Root CA trust');
  assert.ok(html.includes('quay video 30 giây'), 'Step 4 should guide opening Locket for 30s video');

  // FAQ
  assert.ok(html.includes('Bộ lọc AI'), 'FAQ should mention AI filters');
  assert.ok(html.includes('Quay video 30 giây'), 'FAQ should explain 30s video');
  assert.ok(html.includes('huy hiệu Gold'), 'FAQ should explain profile gold badge behavior');

  // Removed NextDNS account dependency
  assert.ok(!html.includes('id="btnCreate"'), 'Should not have NextDNS account creation button');
  assert.ok(!html.includes('id="checkEmail"'), 'Should not have NextDNS email input');
  assert.ok(!html.includes('id="checkPassword"'), 'Should not have NextDNS password input');
});
