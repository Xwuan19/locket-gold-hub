const { verifyAdminToken } = require('../../admin/lib/auth');
const { checkNextDnsQueryUsage } = require('../../admin/lib/nextdns');
const { updateQueryUsage } = require('../../admin/lib/db');

function extractToken(req) {
  const header = req.headers['authorization'] || req.headers['x-admin-token'] || req.query?.token || '';
  return header.replace(/^Bearer\s+/i, '').trim();
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  const token = extractToken(req);
  if (!verifyAdminToken(token)) {
    return res.status(401).json({ success: false, error: 'Chưa xác thực quyền quản trị viên' });
  }

  const email = (req.query?.email || req.body?.email || '').trim();
  const password = (req.query?.password || req.body?.password || '').trim();
  const profileId = (req.query?.id || req.body?.id || req.query?.profile_id || req.body?.profile_id || '').trim();

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Thiếu email hoặc mật khẩu NextDNS' });
  }

  try {
    const result = await checkNextDnsQueryUsage({ email, password, profileId });
    if (result.ok && result.queries !== undefined && (profileId || result.profileId)) {
      await updateQueryUsage(profileId || result.profileId, result.queries);
    }
    return res.status(result.ok ? 200 : 400).json({ success: result.ok, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || 'Lỗi kiểm tra thống kê' });
  }
};
