const { checkPassword, generateAdminToken, verifyAdminToken } = require('../../admin/lib/auth');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const password = String(body.password || '').trim();
    const remember = Boolean(body.remember);

    if (!checkPassword(password)) {
      return res.status(401).json({ success: false, error: 'Mật khẩu quản trị không chính xác' });
    }

    const token = generateAdminToken(remember);
    const maxAge = remember ? 30 * 24 * 3600 : 24 * 3600;
    return res.status(200).json({
      success: true,
      token,
      expires_in: maxAge
    });
  }

  // GET: verify existing token
  const authHeader = req.headers['authorization'] || req.headers['x-admin-token'] || req.query?.token || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!verifyAdminToken(token)) {
    return res.status(401).json({ success: false, error: 'Phiên làm việc hết hạn hoặc không hợp lệ' });
  }

  return res.status(200).json({ success: true, valid: true });
};
