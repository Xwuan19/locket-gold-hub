/**
 * @file locket_revenuecat_request.js
 * Remove X-RevenueCat-ETag header to prevent 304 Not Modified
 * Based on production baseline
 */

function setHeaderValue(e, a, d) {
  var r = a.toLowerCase();
  r in e ? (e[r] = d) : (e[a] = d);
}
var modifiedHeaders = $request.headers || {};
setHeaderValue(modifiedHeaders, "X-RevenueCat-ETag", "");
$done({ headers: modifiedHeaders });
