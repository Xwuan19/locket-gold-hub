const crypto = require('crypto');

// ponytail: NextDNS API client & rewrite manager. Upgrade to official SDK if NextDNS releases one.
const DEFAULT_FLY_IP = process.env.FLY_PROXY_IP || '66.241.124.216';
const DOMAINS_TO_REWRITE = [
  'firebaseremoteconfig.googleapis.com',
  'api.revenuecat.com',
  'us-central1-locket-4252a.cloudfunctions.net',
  'api.locketcamera.com'
];

function genNextDnsPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#';
  let pwd = 'Xw@';
  for (let i = 0; i < 9; i++) {
    pwd += chars[crypto.randomInt(0, chars.length)];
  }
  return pwd;
}

async function getTempEmailHelper() {
  const fallbackEmail = `locket_${Date.now()}_${crypto.randomBytes(3).toString('hex')}@uberip.com`;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 1500);
    const dRes = await fetch('https://api.mail.tm/domains', {
      headers: { 'Accept': 'application/json' },
      signal: ctrl.signal
    });
    clearTimeout(timer);
    if (dRes.ok) {
      const dData = await dRes.json();
      const domain = dData['hydra:member']?.[0]?.domain;
      if (domain) {
        const username = `lk${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`;
        const email = `${username}@${domain}`;
        const password = `Tmp${Math.random().toString(36).substring(2, 10)}!1A`;
        const ctrl2 = new AbortController();
        const timer2 = setTimeout(() => ctrl2.abort(), 1500);
        const accRes = await fetch('https://api.mail.tm/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: email, password }),
          signal: ctrl2.signal
        });
        clearTimeout(timer2);
        if (accRes.ok) return email;
      }
    }
  } catch (_) {}
  return fallbackEmail;
}

function extractNextDnsSid(res) {
  if (!res || !res.headers) return '';
  let list = [];
  if (typeof res.headers.getSetCookie === 'function') {
    list = res.headers.getSetCookie();
  } else {
    const raw = res.headers.get('set-cookie') || '';
    list = raw.split(/,(?=[^ ])/);
  }
  for (const c of list) {
    const m = c.match(/(?:^|[\s;,])(_?sid=[^;]+)/i);
    if (m) return m[1].trim();
  }
  return '';
}

async function createNextDnsAccount({ profileName = '⚡ Locket_Gold_DNS', flyIp = DEFAULT_FLY_IP } = {}) {
  const email = await getTempEmailHelper();
  const password = genNextDnsPassword();

  const ctrlSignup = new AbortController();
  const timerSignup = setTimeout(() => ctrlSignup.abort(), 6000);
  const signupRes = await fetch('https://api.nextdns.io/accounts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Origin': 'https://my.nextdns.io'
    },
    body: JSON.stringify({
      email,
      password,
      profile: {
        name: profileName,
        security: { threatIntelligenceFeeds: true, googleSafeBrowsing: true, cryptojacking: true },
        privacy: { blocklists: [{ id: 'nextdns-recommended' }], disguisedTrackers: true },
        settings: { logs: { enabled: true }, performance: { ecs: true } }
      }
    }),
    signal: ctrlSignup.signal
  });
  clearTimeout(timerSignup);

  if (!signupRes.ok) {
    const errText = await signupRes.text().catch(() => '');
    throw new Error(`NextDNS sign-up failed (${signupRes.status}): ${errText}`);
  }

  let signupData = {};
  const rawBody = await signupRes.text().catch(() => '');
  try {
    signupData = JSON.parse(rawBody);
  } catch (_) {
    throw new Error(`NextDNS response not valid JSON: ${rawBody}`);
  }
  const profileId = signupData.id || (signupData.profiles && signupData.profiles[0]?.id) || '';
  if (!profileId) {
    throw new Error('NextDNS không trả về Profile ID hợp lệ');
  }

  const sidCookie = extractNextDnsSid(signupRes);

  const rewriteResults = [];
  for (const domain of DOMAINS_TO_REWRITE) {
    try {
      const ctrlRw = new AbortController();
      const timerRw = setTimeout(() => ctrlRw.abort(), 3000);
      const rwRes = await fetch(`https://api.nextdns.io/profiles/${profileId}/rewrites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': sidCookie,
          'User-Agent': 'Mozilla/5.0'
        },
        body: JSON.stringify({ name: domain, answer: flyIp }),
        signal: ctrlRw.signal
      });
      clearTimeout(timerRw);
      rewriteResults.push({ domain, ok: rwRes.ok, status: rwRes.status });
    } catch (e) {
      rewriteResults.push({ domain, ok: false, error: e.message });
    }
  }

  return {
    email,
    password,
    profile_id: profileId,
    dns_url: `https://dns.nextdns.io/${profileId}`,
    fly_ip: flyIp,
    rewrites: rewriteResults
  };
}

async function loginNextDnsSession(email, password) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  const res = await fetch('https://api.nextdns.io/accounts/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0',
      'Origin': 'https://my.nextdns.io'
    },
    body: JSON.stringify({ email, password }),
    signal: ctrl.signal
  });
  clearTimeout(timer);

  if (!res.ok) {
    return { ok: false, error: `Login failed (${res.status})` };
  }
  const sid = extractNextDnsSid(res);
  const data = await res.json().catch(() => ({}));
  const profileId = (data.profiles && data.profiles[0]?.id) || '';
  return { ok: true, sid, profileId, profiles: data.profiles || [] };
}

async function checkNextDnsQueryUsage({ email, password, profileId = '' }) {
  const session = await loginNextDnsSession(email, password);
  if (!session.ok) return session;

  const targetProfile = profileId || session.profileId;
  if (!targetProfile) {
    return { ok: false, error: 'Không tìm thấy Profile ID trên tài khoản NextDNS' };
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  const analyticsRes = await fetch(`https://api.nextdns.io/profiles/${targetProfile}/analytics/status`, {
    headers: {
      'Cookie': session.sid,
      'User-Agent': 'Mozilla/5.0'
    },
    signal: ctrl.signal
  });
  clearTimeout(timer);

  if (!analyticsRes.ok) {
    return { ok: false, error: `Analytics fetch failed (${analyticsRes.status})` };
  }

  const stats = await analyticsRes.json();
  const queries = stats.queries || stats.queriesCount || 0;
  const limit = stats.queriesLimit || 300000;
  const percent = limit > 0 ? Math.min(100, Math.round((queries / limit) * 100)) : 0;

  return {
    ok: true,
    profileId: targetProfile,
    queries,
    limit,
    percent,
    devices: stats.devices || [],
    is_active: (stats.devices && stats.devices.length > 0) || queries > 0,
    last_query_at: stats.lastQueryAt || null,
    last_query_ago_minutes: stats.lastQueryAt ? Math.round((Date.now() - new Date(stats.lastQueryAt).getTime()) / 60000) : null
  };
}

module.exports = {
  createNextDnsAccount,
  checkNextDnsQueryUsage,
  loginNextDnsSession,
  DEFAULT_FLY_IP,
  DOMAINS_TO_REWRITE
};
