const test = require('node:test');
const assert = require('node:assert');
const { saveNextDnsAccount, updateQueryUsage } = require('../../admin/lib/db');

test('Supabase db functions handle connection gracefully', async () => {
  const dummyAccount = {
    profile_id: 'ci_test_profile_' + Date.now(),
    email: 'ci_test@example.com',
    password: 'ci_test_password',
    dns_url: 'https://dns.nextdns.io/ci_test',
    fly_ip: '66.241.124.216',
    rewrites: ['firebaseremoteconfig.googleapis.com']
  };

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (!key) {
    // If no key configured in test env, verify it safely returns false without crashing
    const saved = await saveNextDnsAccount(dummyAccount);
    assert.strictEqual(saved, false);
    return;
  }

  const saved = await saveNextDnsAccount(dummyAccount);
  assert.strictEqual(saved, true, 'Dummy account should be inserted to Supabase');

  const updated = await updateQueryUsage(dummyAccount.profile_id, 42);
  assert.strictEqual(updated, true, 'Query count should be updated');

  // Clean up
  const { SUPABASE_URL } = require('../../admin/lib/db');
  await fetch(`${SUPABASE_URL}/rest/v1/nextdns_accounts?profile_id=eq.${dummyAccount.profile_id}`, {
    method: 'DELETE',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
});
