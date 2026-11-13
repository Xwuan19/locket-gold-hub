const { generateMobileconfig, getSignedProfile } = require('../lib/mobileconfig');

// Direct profile response for Safari iOS.
// Serves signed Xwuan_DNS.mobileconfig directly by default; falls back to dynamic XML generator.
module.exports = (req, res) => {
  const profileId = (req.query && req.query.id) || (req.body && req.body.id) || '';
  const forceXml = (req.query && (req.query.xml === '1' || req.query.xml === 'true'));

  res.setHeader('Content-Type', 'application/x-apple-aspen-config; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="Xwuan_DNS.mobileconfig"');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (!forceXml && (!profileId || profileId === 'Xwuan_DNS')) {
    const signed = getSignedProfile();
    if (signed) {
      return res.status(200).send(signed);
    }
  }

  const xml = generateMobileconfig(profileId);
  return res.status(200).send(xml);
};
