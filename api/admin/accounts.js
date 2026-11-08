const { verifyAdminToken } = require('../../admin/lib/auth');
const { listNextDnsAccounts, updateNextDnsAccount, deleteNextDnsAccount } = require('../../admin/lib/db');
const { renameNextDnsProfile, deleteNextDnsProfile } = require('../../admin/lib/nextdns');

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

  // GET: List accounts
  if (req.method === 'GET') {
    const accounts = await listNextDnsAccounts();
    return res.status(200).json({ success: true, count: accounts.length, accounts });
  }

  // PATCH: Rename or update account notes
  if (req.method === 'PATCH') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const id = body.id;
    const profileId = body.profile_id;
    const profileName = (body.profile_name !== undefined) ? String(body.profile_name).trim() : null;
    const notes = (body.notes !== undefined) ? String(body.notes).trim() : null;
    const email = body.email;
    const password = body.password;

    if (!id) {
      return res.status(400).json({ success: false, error: 'Thiếu ID tài khoản cần cập nhật' });
    }

    // Optionally rename on NextDNS API
    if (profileName !== null && email && password && profileId) {
      await renameNextDnsProfile({ email, password, profileId, name: profileName }).catch(() => {});
    }

    const updates = {};
    if (profileName !== null) updates.profile_name = profileName;
    if (notes !== null) updates.notes = notes;

    const ok = await updateNextDnsAccount(id, updates);
    return res.status(ok ? 200 : 500).json({ success: ok });
  }

  // DELETE: Delete account
  if (req.method === 'DELETE') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const id = body.id || req.query?.id;
    const profileId = body.profile_id || req.query?.profile_id;
    const email = body.email || req.query?.email;
    const password = body.password || req.query?.password;

    if (!id) {
      return res.status(400).json({ success: false, error: 'Thiếu ID tài khoản cần xóa' });
    }

    // Try deleting from NextDNS API
    if (email && password && profileId) {
      await deleteNextDnsProfile({ email, password, profileId }).catch(() => {});
    }

    const ok = await deleteNextDnsAccount(id);
    return res.status(ok ? 200 : 500).json({ success: ok });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
};
