// ponytail: re-export from root nextdns module while preserving local constant definitions for test coverage
const nextdns = require('../../nextdns/index');

const DOMAINS_TO_REWRITE = [
  'firebaseremoteconfig.googleapis.com',
  'api.revenuecat.com',
  'us-central1-locket-4252a.cloudfunctions.net',
  'api.locketcamera.com'
];

module.exports = {
  ...nextdns,
  DOMAINS_TO_REWRITE
};
