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
        profile_name: account.profile_name || '',
        notes: account.notes || '',
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

async function listNextDnsAccounts() {
  if (!SUPABASE_KEY) return [];
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/nextdns_accounts?select=*&order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Accept': 'application/json'
      }
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function updateNextDnsAccount(id, fields = {}) {
  if (!SUPABASE_KEY || !id) return false;
  try {
    const body = { ...fields, updated_at: new Date().toISOString() };
    const res = await fetch(`${SUPABASE_URL}/rest/v1/nextdns_accounts?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function deleteNextDnsAccount(id) {
  if (!SUPABASE_KEY || !id) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/nextdns_accounts?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
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

module.exports = {
  saveNextDnsAccount,
  listNextDnsAccounts,
  updateNextDnsAccount,
  deleteNextDnsAccount,
  updateQueryUsage,
  SUPABASE_URL
};
