const test = require('node:test');
const assert = require('node:assert');
const { generateMobileconfig, getCACertBase64 } = require('../../admin/lib/mobileconfig');

test('getCACertBase64 extracts valid base64 certificate', () => {
  const b64 = getCACertBase64();
  assert.ok(b64.length > 500, 'Certificate base64 should be > 500 chars');
  assert.ok(!b64.includes('-----BEGIN'), 'Should not contain PEM header');
});

test('generateMobileconfig creates valid Apple XML plist', () => {
  const xml = generateMobileconfig('test1234');
  assert.ok(xml.includes('<!DOCTYPE plist'), 'Must have plist DOCTYPE');
  assert.ok(xml.includes('com.apple.security.root'), 'Must include root CA payload type');
  assert.ok(xml.includes('com.apple.dnsSettings.managed'), 'Must include managed DoH payload type');
  assert.ok(xml.includes('https://dns.nextdns.io/test1234'), 'Must include target NextDNS DoH URL');
  assert.ok(xml.includes(getCACertBase64()), 'Must embed Root CA base64 cert data');
});
