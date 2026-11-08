const crypto = require('crypto');

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

/**
 * Đăng ký tài khoản NextDNS riêng biệt (300.000 queries/tháng) và thiết lập DNS Rewrite trỏ về Fly.io
 */
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
    throw new Error(`Đăng ký NextDNS thất bại (${signupRes.status}): ${errText}`);
  }

  const sid = extractNextDnsSid(signupRes);
  if (!sid) throw new Error('Không nhận được session cookie từ NextDNS');

  // Lấy Profile ID
  const ctrlMe = new AbortController();
  const timerMe = setTimeout(() => ctrlMe.abort(), 5000);
  const meRes = await fetch('https://api.nextdns.io/accounts/@me?withProfiles=true', {
    headers: { 'Cookie': sid, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Origin': 'https://my.nextdns.io' },
    signal: ctrlMe.signal
  });
  clearTimeout(timerMe);
  if (!meRes.ok) throw new Error(`Không lấy được profile (${meRes.status})`);

  const meData = await meRes.json();
  const profile = meData?.profiles?.[0];
  if (!profile || !profile.id) throw new Error('Không tìm thấy Profile ID trong tài khoản vừa tạo');

  const profileId = profile.id;
  const dnsUrl = `https://apple.dns.nextdns.io/${profileId}`;

  // Thiết lập 4 DNS Rewrites trỏ về Fly.io
  const domainsToRewrite = DOMAINS_TO_REWRITE;

  const addedRewrites = [];
  await Promise.all(domainsToRewrite.map(async (domain) => {
    const ctrlRw = new AbortController();
    const timerRw = setTimeout(() => ctrlRw.abort(), 5000);
    try {
      const rwRes = await fetch(`https://api.nextdns.io/profiles/${profileId}/rewrites`, {
        method: 'POST',
        headers: {
          'Cookie': sid,
          'Content-Type': 'application/json',
          'Origin': 'https://my.nextdns.io',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: JSON.stringify({ name: domain, content: flyIp }),
        signal: ctrlRw.signal
      });
      if (rwRes.ok || rwRes.status === 204) addedRewrites.push(domain);
    } catch (_) {}
    finally { clearTimeout(timerRw); }
  }));

  return {
    ok: true,
    profile_id: profileId,
    email,
    password,
    dns_url: dnsUrl,
    rewrites: addedRewrites,
    fly_ip: flyIp
  };
}

/**
 * Đăng nhập NextDNS lấy session cookie sid
 */
async function loginNextDnsHelper({ email, password } = {}) {
  const cleanEmail = String(email || '').trim();
  const cleanPassword = String(password || '').trim();
  if (!cleanEmail || !cleanPassword) {
    return { ok: false, error: 'Thiếu email hoặc mật khẩu NextDNS' };
  }

  const ctrlLogin = new AbortController();
  const timerLogin = setTimeout(() => ctrlLogin.abort(), 5000);
  try {
    const loginRes = await fetch('https://api.nextdns.io/accounts/@login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://my.nextdns.io',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      signal: ctrlLogin.signal
    });
    clearTimeout(timerLogin);

    if (!loginRes.ok) {
      return { ok: false, status: loginRes.status, error: `Đăng nhập thất bại (${loginRes.status})` };
    }

    const sid = extractNextDnsSid(loginRes);
    if (!sid) return { ok: false, error: 'Không nhận được session cookie' };
    return { ok: true, sid };
  } catch (err) {
    clearTimeout(timerLogin);
    return { ok: false, error: err.message || 'Lỗi mạng NextDNS' };
  }
}

/**
 * Kiểm tra hạn ngạch sử dụng truy vấn (300.000 / tháng) và Live Logs thiết bị
 */
async function checkNextDnsQueryUsage({ email, password, profileId = null } = {}) {
  const cleanEmail = String(email || '').trim();
  const cleanPassword = String(password || '').trim();
  if (!cleanEmail || !cleanPassword) {
    return { ok: false, error: 'Thiếu email hoặc mật khẩu NextDNS' };
  }

  const login = await loginNextDnsHelper({ email: cleanEmail, password: cleanPassword });
  if (!login.ok) return { ok: false, error: login.error };
  const sid = login.sid;

  let pId = profileId;
  if (!pId) {
    const ctrlMe = new AbortController();
    const timerMe = setTimeout(() => ctrlMe.abort(), 5000);
    try {
      const meRes = await fetch('https://api.nextdns.io/accounts/@me?withProfiles=true', {
        headers: { 'Cookie': sid, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Origin': 'https://my.nextdns.io' },
        signal: ctrlMe.signal
      });
      if (meRes.ok) {
        const meData = await meRes.json();
        pId = meData?.profiles?.[0]?.id;
      }
    } finally {
      clearTimeout(timerMe);
    }
  }

  if (!pId) return { ok: false, error: 'Không tìm thấy profile' };

  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

  const ctrlAnalytics = new AbortController();
  const timerAnalytics = setTimeout(() => ctrlAnalytics.abort(), 5000);
  const ctrlLogs = new AbortController();
  const timerLogs = setTimeout(() => ctrlLogs.abort(), 5000);

  let analyticsRes, logsRes;
  try {
    [analyticsRes, logsRes] = await Promise.all([
      fetch(`https://api.nextdns.io/profiles/${pId}/analytics/status?from=${encodeURIComponent(startOfMonth)}`, {
        headers: { 'Cookie': sid, 'Accept': 'application/json', 'Origin': 'https://my.nextdns.io' },
        signal: ctrlAnalytics.signal
      }).catch(() => null),
      fetch(`https://api.nextdns.io/profiles/${pId}/logs?limit=10`, {
        headers: { 'Cookie': sid, 'Accept': 'application/json', 'Origin': 'https://my.nextdns.io' },
        signal: ctrlLogs.signal
      }).catch(() => null)
    ]);
  } finally {
    clearTimeout(timerAnalytics);
    clearTimeout(timerLogs);
  }

  let totalQueries = 0;
  if (analyticsRes && analyticsRes.ok) {
    const data = await analyticsRes.json().catch(() => ({}));
    let list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
    if (!list.length && data && typeof data === 'object') {
      const nested = data?.data || data;
      list = Array.isArray(nested?.status) ? nested.status : (Array.isArray(nested?.series) ? nested.series : []);
      if (!list.length && (nested?.queries || nested?.totalQueries)) {
        list = [{ queries: Number(nested.queries || nested.totalQueries) }];
      }
    }
    for (const item of list) {
      totalQueries += Number(item?.queries ?? item?.count ?? item?.total ?? 0) || 0;
    }
  }

  let lastQueryAt = null;
  let lastQueryAgoMinutes = null;
  let isActive = false;

  if (logsRes && logsRes.ok) {
    const logsJson = await logsRes.json().catch(() => null);
    const logItems = Array.isArray(logsJson) ? logsJson : (Array.isArray(logsJson?.data) ? logsJson.data : []);
    if (logItems.length > 0) {
      const rawTs = logItems[0]?.timestamp;
      if (rawTs) {
        const tsNum = typeof rawTs === 'number' ? (rawTs > 1e12 ? rawTs : rawTs * 1000) : new Date(rawTs).getTime();
        if (!isNaN(tsNum) && tsNum > 0) {
          lastQueryAt = new Date(tsNum).toISOString();
          const diffMs = Date.now() - tsNum;
          lastQueryAgoMinutes = Math.max(0, Math.round(diffMs / 60000));
          isActive = (diffMs <= 60 * 60 * 1000);
        }
      }
    }
  }

  const limit = 300000;
  return {
    ok: true,
    profile_id: pId,
    queries: totalQueries,
    limit,
    percent: Math.min(100, Math.round((totalQueries / limit) * 100)),
    is_exceeded: totalQueries >= limit,
    last_query_at: lastQueryAt,
    last_query_ago_minutes: lastQueryAgoMinutes,
    is_active: isActive
  };
}

async function renameNextDnsProfile({ email, password, profileId, name }) {
  const login = await loginNextDnsHelper({ email, password });
  if (!login.ok) return { ok: false, error: login.error };
  try {
    const res = await fetch(`https://api.nextdns.io/profiles/${encodeURIComponent(profileId)}`, {
      method: 'PATCH',
      headers: {
        'Cookie': login.sid,
        'Content-Type': 'application/json',
        'Origin': 'https://my.nextdns.io',
        'User-Agent': 'Mozilla/5.0'
      },
      body: JSON.stringify({ name })
    });
    return { ok: res.ok };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function deleteNextDnsProfile({ email, password, profileId }) {
  const login = await loginNextDnsHelper({ email, password });
  if (!login.ok) return { ok: false, error: login.error };
  try {
    const res = await fetch(`https://api.nextdns.io/profiles/${encodeURIComponent(profileId)}`, {
      method: 'DELETE',
      headers: {
        'Cookie': login.sid,
        'Origin': 'https://my.nextdns.io',
        'User-Agent': 'Mozilla/5.0'
      }
    });
    return { ok: res.ok || res.status === 204 };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

module.exports = {
  DEFAULT_FLY_IP,
  DOMAINS_TO_REWRITE,
  createNextDnsAccount,
  checkNextDnsQueryUsage,
  loginNextDnsHelper,
  renameNextDnsProfile,
  deleteNextDnsProfile
};
