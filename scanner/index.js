const fs = require('fs');
const path = require('path');
const assert = require('assert');

// ponytail: regex-based static scanner; upgrade to AST parser if obfuscated payloads appear.
const IP_REGEX = /\b(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\b/g;
const URL_HOST_REGEX = /https?:\/\/([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
const RULE_DOMAIN_REGEX = /(?:DOMAIN(?:-SUFFIX)?|hostname|Host)\s*[,=:]\s*([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;

const IGNORED_IPS = new Set(['0.0.0.0', '127.0.0.1']);

function findEndpointsInText(text, filename = '') {
  const ips = new Set();
  const domains = new Set();
  const occurrences = [];

  const lines = text.split('\n');
  lines.forEach((line, idx) => {
    let match;
    while ((match = IP_REGEX.exec(line)) !== null) {
      const ip = match[0];
      if (!IGNORED_IPS.has(ip)) {
        ips.add(ip);
        occurrences.push({ type: 'ip', value: ip, file: filename, line: idx + 1 });
      }
    }

    while ((match = URL_HOST_REGEX.exec(line)) !== null) {
      const host = match[1].toLowerCase();
      domains.add(host);
      occurrences.push({ type: 'domain', value: host, file: filename, line: idx + 1 });
    }

    while ((match = RULE_DOMAIN_REGEX.exec(line)) !== null) {
      const host = match[1].toLowerCase().replace(/^%\w+%,?\s*/, '');
      if (host) {
        domains.add(host);
        occurrences.push({ type: 'rule_domain', value: host, file: filename, line: idx + 1 });
      }
    }
  });

  return { ips: Array.from(ips), domains: Array.from(domains), occurrences };
}

function scanDir(targetDir) {
  const result = { ips: new Set(), domains: new Set(), occurrences: [] };
  if (!fs.existsSync(targetDir)) return { ips: [], domains: [], occurrences: [] };

  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (/\.(js|module|sgmodule|plugin|stoverride|snippet|conf|txt|json)$/i.test(entry.name)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const parsed = findEndpointsInText(content, path.relative(targetDir, fullPath));
        parsed.ips.forEach(ip => result.ips.add(ip));
        parsed.domains.forEach(d => result.domains.add(d));
        result.occurrences.push(...parsed.occurrences);
      }
    }
  }

  walk(targetDir);
  return {
    ips: Array.from(result.ips).sort(),
    domains: Array.from(result.domains).sort(),
    occurrences: result.occurrences
  };
}

if (process.argv.includes('--self-check')) {
  const sample = "fetch('https://locket-vip.workers.dev/api');\nproxy = 192.168.1.50\nDOMAIN,api.revenuecat.com,DIRECT";
  const out = findEndpointsInText(sample, 'sample.js');
  assert.deepStrictEqual(out.ips, ['192.168.1.50']);
  assert.ok(out.domains.includes('locket-vip.workers.dev'));
  assert.ok(out.domains.includes('api.revenuecat.com'));
  console.log('Self-check passed');
  process.exit(0);
}

const dns = require('dns').promises;

if (require.main === module) {
  const target = path.resolve(__dirname, '../shadowrocket');
  const res = scanDir(target);
  console.log('=== Shadowrocket Endpoints & Domains ===');
  console.log('Direct IPs:', res.ips.length ? res.ips : '(None directly hardcoded)');
  console.log('\nDetected Domains / Hosts:');
  
  (async () => {
    const shouldResolve = process.argv.includes('--dns') || process.argv.includes('--resolve');
    for (const d of res.domains) {
      if (shouldResolve) {
        try {
          const { address } = await dns.lookup(d);
          console.log(` - ${d} -> ${address}`);
        } catch {
          console.log(` - ${d} -> (unresolved)`);
        }
      } else {
        console.log(` - ${d}`);
      }
    }
  })();
}

module.exports = { findEndpointsInText, scanDir };
