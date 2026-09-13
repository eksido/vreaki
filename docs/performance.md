# Performance baseline — 13 September 2026

Command: `npm run audit -- https://vreaki.vercel.app` using Lighthouse 12.8.2, isolated headless Chrome, default simulated mobile throttling and desktop preset. Tested deployment cbc0202. These are lab measurements, not PageSpeed Insights field data, and were collected before analytics consent. Consenting visitors additionally load Google's asynchronous tag; recheck that state when changing analytics.

| Page | Device | Performance | LCP | CLS | TBT |
| --- | --- | --- | --- | --- | --- |
| German | Mobile | 100 | 1.7 s | 0 | 0 ms |
| English | Mobile | 100 | 1.5 s | 0 | 10 ms |
| German | Desktop | 100 | 0.4 s | 0 | 0 ms |
| English | Desktop | 100 | 0.4 s | 0 | 0 ms |

Accessibility and SEO scored 100 on all four runs. The separate Best Practices category scored 78–79: Lighthouse flags the mailto form fallback as an insecure form action. The site itself uses HTTPS; the fallback opens the visitor's email application when JavaScript is unavailable. Keep this limitation visible rather than removing the working fallback solely for a score. Further opportunities include smaller responsive gallery images and versioned long-lived asset caching. The desktop video remains intentionally larger than the mobile encode.

`npm run check` enforces HTML, image, video and first-party code budgets in scripts/performance.mjs. GA consent, safe event payloads, no production analytics on previews/localhost and enquiry draft validation have automated tests. Both language layouts were checked at 320/375/430px with 16px form input text and no page-level horizontal overflow. The new consent notice and preference controls were exercised in German and English; live GA4 Realtime confirmed select_package and enquiry_prepared. No email was sent.

Repeat audits after performance-sensitive updates; do not claim these scores remain valid forever. Inspect mobile and desktop field Core Web Vitals when sufficient real-user data exists. Re-running npm run audit replaces the ignored JSON reports in test-results/.
