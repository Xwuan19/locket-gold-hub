const crypto = require('crypto');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'locket@2026';

// ponytail: stateless signed token with HMAC-SHA256. 30 days if rememberDevice, 1 day otherwise.
function generateAdminToken(rememberDevice = false) {
  const duration = rememberDevice ? 30 * 24 * 3600 * 1000 : 24 * 3600 * 1000;
  const exp = Date.now() + duration;
  const payload = Buffer.from(JSON.stringify({ exp, remember: !!rememberDevice })).toString('base64url');
  const sig = crypto.createHmac('sha256', ADMIN_PASSWORD).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyAdminToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', ADMIN_PASSWORD).update(payload).digest('base64url');
  if (sig !== expectedSig) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return Boolean(data.exp && data.exp > Date.now());
  } catch {
    return false;
  }
}

function checkPassword(pass) {
  return String(pass || '') === ADMIN_PASSWORD;
}

module.exports = {
  generateAdminToken,
  verifyAdminToken,
  checkPassword,
  ADMIN_PASSWORD
};
