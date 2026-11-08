const { createNextDnsAccount } = require('../admin/lib/nextdns');

// ponytail: on-the-fly NextDNS account creation without local DB. Upgrade to KV storage if you need to track user expiration.
module.exports = async (req, res) => {
  try {
    const profileName = (req.query?.name || req.body?.name || '⚡ Locket_Gold_DNS').trim();
    const account = await createNextDnsAccount({ profileName });

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(200).json({
      success: true,
      profile_id: account.profile_id,
      email: account.email,
      password: account.password,
      dns_url: account.dns_url,
      fly_ip: account.fly_ip,
      rewrites: account.rewrites,
      profile_download_url: `/api/generate-profile?id=${account.profile_id}`
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Lỗi tạo tài khoản NextDNS'
    });
  }
};
