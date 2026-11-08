const fs = require('fs');
const path = require('path');

// ponytail: default embedded certificate matches ca/root-ca.crt. Upgrade to dynamic cert rotation if multi-tenant CA needed.
const DEFAULT_CA_B64 = "MIIFczCCA1ugAwIBAgIUQOJ9wGZR++DILyclU4kND3QX83cwDQYJKoZIhvcNAQELBQAwQTELMAkGA1UEBhMCVVMxFDASBgNVBAoMC0xvY2tldCBYVklQMRwwGgYDVQQDDBNMb2NrZXQgWFZJUCBSb290IENBMB4XDTI2MTEwODA5MzkxMloXDTM2MTEwNTA5MzkxMlowQTELMAkGA1UEBhMCVVMxFDASBgNVBAoMC0xvY2tldCBYVklQMRwwGgYDVQQDDBNMb2NrZXQgWFZJUCBSb290IENBMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAkCQM0LvQg4DRh/D+FdzIHRZr2uITgx5hLDSNNh9wV3XxS8ggqDhThHaOC6EzGTL+/x8jufJtF8bIM0TalxbfYW7aKo7/f0WNcsm4a40jbdqbmqgnO2d5HE1Q1sJyO+vtihHkExRALnm2DVJCIBLd1sW5ZLqQN6a5RpBDXJSxcFS+kU7lHQQ9oGEdaYOishyzmspdys3ZuFJKIqYY7V32ZfFBfaCLfYfuVfsPkFZEW4FM3+sgMeh0R1W0MHRXs2y8Uz1Q7cV1Qw7woA7+QQoC93bL1r1S5CI9V3Ysv8CjKR4bH62CnHIW270d6sgSOLAS2tjzTZ1Cly2fKFrxAr6ZGk2WUis8JBHRDBgzHObMBlp/Nh0Zy7GXcGBjLpES6eqbW9IHIrO7uupA/FSqmULnKz9j/oVMIOuFp0As6AxRrRiY6VBY7wNrUpzFyf1XuLcXKUDNq6H5YQWL2nid3+4gGeti8yYLF+5ID32vzXe5EOiOAcvAldpW9Va+EEGxYVSO5t2HxJbNZ5xPr9tOHu1uhAsJG1EHFaMa6x3qFq3/okDGSOm2dYOaI6dqEj/N1eXzHN1H5+sqPOGJOUvV8RYw+sUxxp0IzWFy+je/Gfur7lh71AMQjXH/V2lObDRx5zdNoUQgyhtLwDy2lu9fYY0Jq52wsu5ghwfRkHQuZs0WopMCAwEAAaNjMGEwHQYDVR0OBBYEFAGFfCibZ6nMB+ZRjRWkr3R7icZXMB8GA1UdIwQYMBaAFAGFfCibZ6nMB+ZRjRWkr3R7icZXMA8GA1UdEwEB/wQFMAMBAf8wDgYDVR0PAQH/BAQDAgEGMA0GCSqGSIb3DQEBCwUAA4ICAQAzckMcyqNAWZditAFYpYrg1SnIoWpdMv4vICz4B6nT9AmJ3ebPnOBBhbPZgGd1Cs1wOjnfauzfStJ1EN7zumX8uoz/rCw2njndkuT/AJJCnFujyqElWZaXNb3PO1iLUjqQbI3btogRF2KhXtDzSnQXlM3dVE4mq6XcEBO1XOXTm52twrlYx026UfRsK2YtqhW4TpQxdFydewFVf0k9GC7Krjl+MO6LgX8lJPYd4EzZb+Ht4nJ2SuUm47cuowIGCiW8SHlcHL/tQny6f3gdsnIWU/JTXv6UbhW4yYahqYKrVcTRxPTI5GzfKHGeGWhCEOn/b0b9CCbQ3Oq7N3iWlJUVjxJ4mTI4iUBCfs8RQNerwbW4s16iFo02MAr+/TvLaP/2i1CCjyMqm0ntoVI4tWQBhZfzdGt7pAxKzLLYraMGwkcMS4rcFtZX51zT0W/j2OKGKeNwTSxUOmUEYAY8dQ5NQ+OMJjhmZWggOGj4wlHtswTGU2gC3DlE3IFhY5Ma/lAMiHAAO5cKIUEeAgGs1Y/VM1V6UAnV+I1pl+24OAufFW9HX7qWfKo/JNbZLwSAaihehN5N4DlXUbjp+bYPtqlnyQ2CEWznR+VFuH2LI9Y3a4bLn/Me1epp1R/PtNSI0wAf8OvvUoNa7hQWRp5Yf19KFlhNH16TKSqMX6LZ1nM3RQ==";

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

function generateMobileconfig(nextDnsId = '') {
  const profileId = nextDnsId || process.env.NEXTDNS_PROFILE_ID || 'locket-gold';
  const caB64 = getCACertBase64();

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
			<string>Root Certificate for Locket TLS Interception</string>
			<key>PayloadDisplayName</key>
			<string>Locket XVIP Root CA</string>
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
				<string>https://dns.nextdns.io/${profileId}</string>
			</dict>
			<key>PayloadDescription</key>
			<string>NextDNS DoH Resolver for Locket</string>
			<key>PayloadDisplayName</key>
			<string>Locket NextDNS DoH</string>
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
	<string>Cấu hình Locket XVIP Root CA &amp; NextDNS DoH</string>
	<key>PayloadDisplayName</key>
	<string>Locket XVIP Gold Profile</string>
	<key>PayloadIdentifier</key>
	<string>com.locket.xvip.profile</string>
	<key>PayloadOrganization</key>
	<string>Locket XVIP</string>
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

module.exports = { generateMobileconfig, getCACertBase64 };
