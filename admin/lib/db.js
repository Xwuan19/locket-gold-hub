const SUPABASE_URL = process.env.SUPABASE_URL || 'https://fobdawpbeeccgwiviljc.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';

// ponytail: native fetch PostgREST client without external dependencies. Returns false silently if key is not configured.
async function saveNextDnsAccount(account) {
  if (!SUPABASE_KEY) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/nextdns_accounts`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        profile_id: account.profile_id,
        email: account.email,
        password: account.password,
        dns_url: account.dns_url,
        fly_ip: account.fly_ip,
        rewrites: account.rewrites
      })
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function updateQueryUsage(profileId, queryCount) {
  if (!SUPABASE_KEY) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/nextdns_accounts?profile_id=eq.${encodeURIComponent(profileId)}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query_count: queryCount,
        updated_at: new Date().toISOString()
      })
    });
    return res.ok;
  } catch {
    return false;
  }
}

module.exports = { saveNextDnsAccount, updateQueryUsage, SUPABASE_URL };
