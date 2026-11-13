const fs = require('fs');
const path = require('path');

// ponytail: default embedded certificate matches ca/root-ca.crt.
const DEFAULT_CA_B64 = "MIIFczCCA1ugAwIBAgIUQOJ9wGZR++DILyclU4kND3QX83cwDQYJKoZIhvcNAQELBQAwQTELMAkGA1UEBhMCVVMxFDASBgNVBAoMC0xvY2tldCBYVklQMRwwGgYDVQQDDBNMb2NrZXQgWFZJUCBSb290IENBMB4XDTI2MTEwODA5MzkxMloXDTM2MTEwNTA5MzkxMlowQTELMAkGA1UEBhMCVVMxFDASBgNVBAoMC0xvY2tldCBYVklQMRwwGgYDVQQDDBNMb2NrZXQgWFZJUCBSb290IENBMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAkCQM0LvQg4DRh/D+FdzIHRZr2uITgx5hLDSNNh9wV3XxS8ggqDhThHaOC6EzGTL+/x8jufJtF8bIM0TalxbfYW7aKo7/f0WNcsm4a40jbdqbmqgnO2d5HE1Q1sJyO+vtihHkExRALnm2DVJCIBLd1sW5ZLqQN6a5RpBDXJSxcFS+kU7lHQQ9oGEdaYOishyzmspdys3ZuFJKIqYY7V32ZfFBfaCLfYfuVfsPkFZEW4FM3+sgMeh0R1W0MHRXs2y8Uz1Q7cV1Qw7woA7+QQoC93bL1r1S5CI9V3Ysv8CjKR4bH62CnHIW270d6sgSOLAS2tjzTZ1Cly2fKFrxAr6ZGk2WUis8JBHRDBgzHObMBlp/Nh0Zy7GXcGBjLpES6eqbW9IHIrO7uupA/FSqmULnKz9j/oVMIOuFp0As6AxRrRiY6VBY7wNrUpzFyf1XuLcXKUDNq6H5YQWL2nid3+4gGeti8yYLF+5ID32vzXe5EOiOAcvAldpW9Va+EEGxYVSO5t2HxJbNZ5xPr9tOHu1uhAsJG1EHFaMa6x3qFq3/okDGSOm2dYOaI6dqEj/N1eXzHN1H5+sqPOGJOUvV8RYw+sUxxp0IzWFy+je/Gfur7lh71AMQjXH/V2lObDRx5zdNoUQgyhtLwDy2lu9fYY0Jq52wsu5ghwfRkHQuZs0WopMCAwEAAaNjMGEwHQYDVR0OBBYEFAGFfCibZ6nMB+ZRjRWkr3R7icZXMB8GA1UdIwQYMBaAFAGFfCibZ6nMB+ZRjRWkr3R7icZXMA8GA1UdEwEB/wQFMAMBAf8wDgYDVR0PAQH/BAQDAgEGMA0GCSqGSIb3DQEBCwUAA4ICAQAzckMcyqNAWZditAFYpYrg1SnIoWpdMv4vICz4B6nT9AmJ3ebPnOBBhbPZgGd1Cs1wOjnfauzfStJ1EN7zumX8uoz/rCw2njndkuT/AJJCnFujyqElWZaXNb3PO1iLUjqQbI3btogRF2KhXtDzSnQXlM3dVE4mq6XcEBO1XOXTm52twrlYx026UfRsK2YtqhW4TpQxdFydewFVf0k9GC7Krjl+MO6LgX8lJPYd4EzZb+Ht4nJ2SuUm47cuowIGCiW8SHlcHL/tQny6f3gdsnIWU/JTXv6UbhW4yYahqYKrVcTRxPTI5GzfKHGeGWhCEOn/b0b9CCbQ3Oq7N3iWlJUVjxJ4mTI4iUBCfs8RQNerwbW4s16iFo02MAr+/TvLaP/2i1CCjyMqm0ntoVI4tWQBhZfzdGt7pAxKzLLYraMGwkcMS4rcFtZX51zT0W/j2OKGKeNwTSxUOmUEYAY8dQ5NQ+OMJjhmZWggOGj4wlHtswTGU2gC3DlE3IFhY5Ma/lAMiHAAO5cKIUEeAgGs1Y/VM1V6UAnV+I1pl+24OAufFW9HX7qWfKo/JNbZLwSAaihehN5N4DlXUbjp+bYPtqlnyQ2CEWznR+VFuH2LI9Y3a4bLn/Me1epp1R/PtNSI0wAf8OvvUoNa7hQWRp5Yf19KFlhNH16TKSqMX6LZ1nM3RQ==";

const UPLOCKET_DOH_URL = 'https://dns.uplocket.io.vn/dns-query/7860777d4e5b655be71c884d557670044320518811c035877d690e9d9a38c9c7';

const SUPPLEMENTAL_MATCH_DOMAINS = [
  'api.revenuecat.com',
  'revenuecat.com',
  'analytics.revenuecat.com',
  'rc-cdn.revenuecat.com',
  'sdk.revenuecat.com',
  'gateway.revenuecat.com',
  'errors.revenuecat.com',
  'identity.revenuecat.com',
  'customer.revenuecat.com',
  'subscriptions.revenuecat.com',
  'firebaseremoteconfig.googleapis.com',
  'firebaseremoteconfigrealtime.googleapis.com',
  'us-central1-locket-4252a.cloudfunctions.net',
  'spclient.wg.spotify.com',
  'spclient.spotify.com',
  'gae2-spclient.spotify.com',
  'gew4-spclient.spotify.com',
  'guc3-spclient.spotify.com',
  'apresolve.spotify.com',
  'youtubei.googleapis.com',
  'googlevideo.com',
  'firebaselogging.googleapis.com',
  'firebaselogging-pa.googleapis.com',
  'googleads.g.doubleclick.net',
  'pagead2.googlesyndication.com',
  'ad.doubleclick.net',
  'pubads.g.doubleclick.net',
  'securepubads.g.doubleclick.net',
  'imasdk.googleapis.com',
  'ads.youtube.com',
  'ad.youtube.com',
  'audio-ak-spotify-com.akamaized.net',
  'gads.current.spotify.com',
  'crashdump.spotify.com',
  'adclick.g.doubleclick.net',
  'adeventtracker.spotify.com',
  'log.spotify.com',
  'amplitude.com',
  'spotify.com'
];

function getCACertBase64() {
  if (process.env.ROOT_CA_CRT_B64) {
    return process.env.ROOT_CA_CRT_B64.trim();
  }
  try {
    const certPath = path.resolve(__dirname, '../../ca/root-ca.crt');
    if (fs.existsSync(certPath)) {
      const raw = fs.readFileSync(certPath, 'utf8');
      return raw.replace(/-----BEGIN CERTIFICATE-----/, '')
                .replace(/-----END CERTIFICATE-----/, '')
                .replace(/\s+/g, '');
    }
  } catch (_) {}
  return DEFAULT_CA_B64;
}

function getSignedProfile() {
  const candidates = [
    path.resolve(__dirname, '../../public/Xwuan_DNS.mobileconfig'),
    path.resolve(__dirname, '../public/Xwuan_DNS.mobileconfig'),
    path.resolve(process.cwd(), 'public/Xwuan_DNS.mobileconfig'),
    path.resolve(process.cwd(), 'admin/public/Xwuan_DNS.mobileconfig')
  ];
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        return fs.readFileSync(candidate);
      }
    } catch (_) {}
  }
  return null;
}

function generateMobileconfig(profileId = '') {
  const trimmedId = (profileId || '').trim();
  let serverUrl = UPLOCKET_DOH_URL;
  let profileName = 'Xwuan_DNS';

  if (trimmedId && trimmedId !== 'Xwuan_DNS') {
    if (trimmedId.startsWith('http://') || trimmedId.startsWith('https://')) {
      serverUrl = trimmedId;
    } else {
      serverUrl = `https://dns.nextdns.io/${trimmedId}`;
    }
    profileName = `Xwuan_DNS - ${trimmedId}`;
  }

  const caB64 = getCACertBase64();
  const domainsXml = SUPPLEMENTAL_MATCH_DOMAINS.map(d => `\t\t\t\t\t<string>${d}</string>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>PayloadContent</key>
	<array>
		<dict>
			<key>PayloadCertificateFileName</key>
			<string>root-ca.crt</string>
			<key>PayloadContent</key>
			<data>${caB64}</data>
			<key>PayloadDescription</key>
			<string>Sau khi cài hồ sơ, vào Cài đặt > Cài đặt chung > Giới thiệu > Cài đặt tin cậy chứng nhận và bật tin cậy.</string>
			<key>PayloadDisplayName</key>
			<string>UpLocket Root CA</string>
			<key>PayloadIdentifier</key>
			<string>com.locket.xvip.ca</string>
			<key>PayloadType</key>
			<string>com.apple.security.root</string>
			<key>PayloadUUID</key>
			<string>8A1F867A-0C0E-4813-A3B0-802F3A154001</string>
			<key>PayloadVersion</key>
			<integer>1</integer>
		</dict>
		<dict>
			<key>DNSSettings</key>
			<dict>
				<key>DNSProtocol</key>
				<string>HTTPS</string>
				<key>ServerURL</key>
				<string>${serverUrl}</string>
				<key>SupplementalMatchDomains</key>
				<array>
${domainsXml}
				</array>
			</dict>
			<key>PayloadDescription</key>
			<string>Xwuan_DNS DoH Resolver for Locket</string>
			<key>PayloadDisplayName</key>
			<string>Xwuan_DNS DoH</string>
			<key>PayloadIdentifier</key>
			<string>com.locket.xvip.dns</string>
			<key>PayloadType</key>
			<string>com.apple.dnsSettings.managed</string>
			<key>PayloadUUID</key>
			<string>5E89F023-7A3E-4B0E-A1CD-802F3A154002</string>
			<key>PayloadVersion</key>
			<integer>1</integer>
		</dict>
	</array>
	<key>PayloadDescription</key>
	<string>⚡ Máy chủ DNS riêng tư kích hoạt Locket Gold 30s chính chủ.</string>
	<key>PayloadDisplayName</key>
	<string>${profileName}</string>
	<key>PayloadIdentifier</key>
	<string>com.locket.xvip.profile</string>
	<key>PayloadOrganization</key>
	<string>UpLocket Network</string>
	<key>PayloadRemovalDisallowed</key>
	<false/>
	<key>PayloadType</key>
	<string>Configuration</string>
	<key>PayloadUUID</key>
	<string>B41C2DF6-1D96-41B9-BE77-802F3A154000</string>
	<key>PayloadVersion</key>
	<integer>1</integer>
</dict>
</plist>`;
}

module.exports = {
  generateMobileconfig,
  getCACertBase64,
  getSignedProfile,
  UPLOCKET_DOH_URL,
  SUPPLEMENTAL_MATCH_DOMAINS
};
