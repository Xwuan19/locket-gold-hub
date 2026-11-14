# Handoff — Locket Gold Hub (Xwuan_DNS) Remake & Parity

**Written:** 2026-11-14T15:02:00+07:00
**Repo state:** branch main · clean · last commit 889fa5b fix(copy): remove commercial pricing tiers and restore 100% free community messaging

## Goal

Provide a 100% free, 1-click installable Apple-signed DNS profile (`Xwuan_DNS.mobileconfig`) for Locket Gold without NextDNS registration dependencies, while having a polished web UI matching the visual aesthetics of `uplocket.io.vn` on both mobile and desktop.

## Current state

- **Landing UI (`public/index.html` & `admin/public/index.html`)**:
  - Full visual parity with `uplocket.io.vn`: warm cream palette, authentic floating memory stickers, centered tilted phone mockup with 2x2 photo widget and Laurel avatar pill.
  - Desktop QR code card rendered in pure `#ffffff` with black SVG QR code, 12° tilt, anchored to the bottom-right of the phone mockup with tooltip.
  - Mobile layout verified: exactly 2 framing stickers on iPhone viewport, sticky mobile bottom bar with safe area padding.
  - 100% free messaging: all commercial pricing tiers (20k/30k, trial, purchase CTA) replaced with 3 free VIP privilege cards.
- **DNS Delivery**:
  - `/Xwuan_DNS.mobileconfig` and API endpoint `api/profile.js` serve the Apple-signed configuration profile (signed by Jarrett Samuels).
- **Backend & Tests**:
  - All 14 tests pass (`tests/*.test.js`, `tests/*/*.test.js`).

## Decisions taken

- **No commercial pricing**: The user's project is completely free. Replaced the 20k/30k subscription tiers with 3 free feature showcase cards while keeping the same visual card layout.
- **Direct signed mobileconfig instead of NextDNS**: Replaced NextDNS dynamic account generation with direct 1-click download of signed `Xwuan_DNS.mobileconfig` to eliminate registration failure risks.
- **Explicit `#ffffff` styling**: Overrode `.qr-card` and tooltip styles with `background: #ffffff !important` because the vendor stylesheet `202soeubg-ydc.72604.css` redefines `--color-white: #1a1200`.

## Files touched

| File | Change | Status |
|---|---|---|
| `public/index.html` | Remade hero collage, pure white QR card, replaced pricing with free VIP features | done |
| `admin/public/index.html` | Synced 1:1 with `public/index.html` | done |
| `public/Xwuan_DNS.mobileconfig` | Apple-signed DoH profile | done |
| `admin/public/Xwuan_DNS.mobileconfig` | Apple-signed DoH profile | done |
| `api/profile.js` | Serves signed profile with Aspen headers | done |

## Next steps

1. If resuming work in the future, check if user requests custom domain binding, analytics, or additional FAQ items.
2. Verify live deployment on Vercel at `https://locket-gold-hub.vercel.app` after any new changes.

## Verification

Run test suite:
```bash
node --test tests/*.test.js tests/*/*.test.js
```

Expected output:
```
✔ admin auth generates and verifies signed tokens
✔ Supabase db functions handle connection gracefully
✔ public/index.html contains mobile-first Xwuan_DNS UI without NextDNS dependency
✔ createNextDnsAccount registers account and rewrites correctly or handles rate-limits gracefully
✔ getCACertBase64 extracts valid base64 certificate
✔ generateMobileconfig creates valid Apple XML plist
✔ generateMobileconfig default uses Xwuan_DNS and UpLocket DoH server with SupplementalMatchDomains
✔ getSignedProfile loads valid signed mobileconfig
✔ generateProfileApi serves signed profile with Aspen headers
✔ camera_filter_config.json contains full frames, stickers and photobooth config
✔ NextDNS rewrite domains covers all necessary Locket endpoints
✔ scanner detects IPs, URLs and rule hostnames correctly
✔ scanner extracts domains from shadowrocket folder
✔ tests\shadowrocket\firebase_filters.test.js
ℹ tests 14
ℹ suites 0
ℹ pass 14
ℹ fail 0
```

## Open questions / blockers

none. Project is paused by user request. All pending changes are committed and pushed.

## Do not

- Do not use Tailwind utility class `bg-white` inside `.site-index` containers; the CSS defines `--color-white: #1a1200`, which turns `bg-white` into black. Use inline `background: #ffffff !important` or scoped CSS.
- Do not re-introduce commercial pricing or subscription cards (20k, 30k, Trial). This is a 100% free community project.
- Do not make the DNS download dependent on NextDNS API account creation.
