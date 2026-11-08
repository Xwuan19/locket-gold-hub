const { generateMobileconfig } = require('../lib/mobileconfig');

// ponytail: direct XML plist response for Safari iOS. Upgrade to signed profile (.mobileconfig) if enterprise MDM validation requires signing identity.
module.exports = (req, res) => {
  const profileId = (req.query && req.query.id) || (req.body && req.body.id) || '';
  const xml = generateMobileconfig(profileId);

  res.setHeader('Content-Type', 'application/x-apple-aspen-config; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="locket-gold.mobileconfig"');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  return res.status(200).send(xml);
};
