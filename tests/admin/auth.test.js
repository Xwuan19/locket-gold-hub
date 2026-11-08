const test = require('node:test');
const assert = require('node:assert');
const { generateAdminToken, verifyAdminToken, checkPassword, ADMIN_PASSWORD } = require('../../admin/lib/auth');

test('admin auth generates and verifies signed tokens', () => {
  assert.strictEqual(checkPassword(ADMIN_PASSWORD), true);
  assert.strictEqual(checkPassword('wrong_password'), false);

  const tokenSession = generateAdminToken(false);
  assert.ok(tokenSession.includes('.'));
  assert.strictEqual(verifyAdminToken(tokenSession), true);

  const tokenRemember = generateAdminToken(true);
  assert.ok(tokenRemember.includes('.'));
  assert.strictEqual(verifyAdminToken(tokenRemember), true);

  // Invalid tokens
  assert.strictEqual(verifyAdminToken(''), false);
  assert.strictEqual(verifyAdminToken('tampered.signature'), false);
  assert.strictEqual(verifyAdminToken(tokenSession + 'junk'), false);
});
