const test = require('node:test');
const assert = require('node:assert');
const {
  generateMobileconfig,
  getCACertBase64,
  getSignedProfile,
  UPLOCKET_DOH_URL,
  SUPPLEMENTAL_MATCH_DOMAINS
} = require('../../admin/lib/mobileconfig');
const generateProfileApi = require('../../admin/api/generate-profile');

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

test('generateMobileconfig default uses Xwuan_DNS and UpLocket DoH server with SupplementalMatchDomains', () => {
  const xml = generateMobileconfig();
  assert.ok(xml.includes('Xwuan_DNS'), 'Must include Xwuan_DNS display name');
  assert.ok(xml.includes(UPLOCKET_DOH_URL), 'Must include UpLocket DoH URL');
  assert.ok(xml.includes('SupplementalMatchDomains'), 'Must include SupplementalMatchDomains');
  for (const domain of ['api.revenuecat.com', 'firebaseremoteconfig.googleapis.com', 'spclient.wg.spotify.com']) {
    assert.ok(xml.includes(domain), `Must include match domain ${domain}`);
  }
});

test('getSignedProfile loads valid signed mobileconfig', () => {
  const signed = getSignedProfile();
  assert.ok(signed, 'Signed profile should be found');
  assert.ok(Buffer.isBuffer(signed), 'Signed profile must be a Buffer');
  assert.ok(signed.length > 5000, 'Signed profile should be > 5KB');
});

test('generateProfileApi serves signed profile with Aspen headers', () => {
  const headers = {};
  let statusCode = null;
  let sentData = null;

  const req = { query: {}, body: {} };
  const res = {
    setHeader(key, val) {
      headers[key] = val;
    },
    status(code) {
      statusCode = code;
      return this;
    },
    send(data) {
      sentData = data;
      return this;
    }
  };

  generateProfileApi(req, res);

  assert.strictEqual(statusCode, 200);
  assert.strictEqual(headers['Content-Type'], 'application/x-apple-aspen-config; charset=utf-8');
  assert.strictEqual(headers['Content-Disposition'], 'attachment; filename="Xwuan_DNS.mobileconfig"');
  assert.ok(Buffer.isBuffer(sentData), 'Should serve signed Buffer by default');
});
