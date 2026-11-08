const { checkNextDnsQueryUsage } = require('../admin/lib/nextdns');
const { updateQueryUsage } = require('../admin/lib/db');

// ponytail: direct analytics query via NextDNS session. Upgrade to Redis caching if check frequency exceeds 60 req/min.
module.exports = async (req, res) => {
  const email = (req.query?.email || req.body?.email || '').trim();
  const password = (req.query?.password || req.body?.password || '').trim();
  const profileId = (req.query?.id || req.body?.id || req.query?.profile_id || req.body?.profile_id || '').trim();

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Thiếu email hoặc mật khẩu NextDNS để kiểm tra lượt truy vấn'
    });
  }

  try {
    const result = await checkNextDnsQueryUsage({ email, password, profileId });
    if (result.ok && result.queries !== undefined && (profileId || result.profileId)) {
      await updateQueryUsage(profileId || result.profileId, result.queries);
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    if (!result.ok) {
      return res.status(400).json({ success: false, error: result.error });
    }
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Lỗi kiểm tra thống kê NextDNS'
    });
  }
};
