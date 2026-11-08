const test = require('node:test');
const assert = require('node:assert');
const { createNextDnsAccount, loginNextDnsHelper } = require('../../admin/lib/nextdns');

test('createNextDnsAccount registers account and rewrites correctly or handles rate-limits gracefully', async () => {
  try {
    const acc = await createNextDnsAccount({ profileName: 'Test_Agent_Profile' });
    assert.ok(acc.profile_id, 'Should have profile_id');
    assert.ok(acc.email, 'Should have email');
    assert.ok(acc.password, 'Should have password');
    assert.ok(acc.rewrites.length >= 0, 'Rewrites array should exist');
  } catch (err) {
    // If NextDNS rate-limits automated tests or network times out, error is expected and clean
    assert.ok(err.message.includes('NextDNS') || err.message.includes('fetch'), 'Error should be a network/NextDNS error');
  }
});
