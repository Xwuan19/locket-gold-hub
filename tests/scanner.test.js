const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { scanDir, findEndpointsInText } = require('../scanner/index.js');

test('scanner detects IPs, URLs and rule hostnames correctly', () => {
  const mockText = `
    const HOST = "https://example.com/api";
    const IP = "192.168.1.100";
    // DOMAIN,custom.host.vn,DIRECT
  `;
  const result = findEndpointsInText(mockText, 'test.js');
  assert.deepStrictEqual(result.ips, ['192.168.1.100']);
  assert.ok(result.domains.includes('example.com'));
  assert.ok(result.domains.includes('custom.host.vn'));
});

test('scanner extracts domains from shadowrocket folder', () => {
  const root = path.resolve(__dirname, '../shadowrocket');
  const res = scanDir(root);
  assert.ok(res.domains.includes('locket-vip.mhiep20077.workers.dev'));
  assert.ok(res.domains.includes('uplocket.io.vn'));
});
