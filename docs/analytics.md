# Vreaki measurement

Existing GA4 account **Vreaki (372582203)** and property **vreaki.com (510036688)** are retained. The original WordPress stream is unchanged. New stream **Vreaki — Vercel website (15768655162)** measures https://vreaki.vercel.app using **G-C4XNGFQC50**. These IDs are public configuration in content/site.json, not secrets.

[Open the property](https://analytics.google.com/analytics/web/#/a372582203p510036688/admin/streams/table). Use Stream name or Host name to distinguish this site from the old WordPress site. On domain migration, update this stream URL and publicOrigin, keeping the measurement ID so the replacement site's history continues.

## Events

| Event | Trigger | Parameters beyond safe page URL/language |
| --- | --- | --- |
| page_view | Once per page after consent | Static page title |
| select_service | Click a service enquiry link | item_id: service ID |
| select_package | Click a package enquiry link | item_id: package-1 / package-2 / package-3 |
| enquiry_prepared | Valid email draft generated | None |
| email_app_open | Click Open email app | None |
| enquiry_copied | Clipboard write succeeds | None |
| contact_email_click | Click the public contact email | None |
| social_click | Click a footer social link | None |

Events are sent directly from public/analytics.js and public/site.js. GA4 receives custom event names automatically; do not also create matching events in GA4 and double-count them. If custom parameter reporting is needed, register item_id as an event-scoped custom dimension. Email drafts and email-app clicks are intent signals, not verified leads or sales. No event here is marked as a key event automatically.

Enhanced measurement is disabled for the new stream, including automatic forms, outbound URLs, searches and scrolls. The custom implementation sends neither form contents nor mailto links, query strings or fragments. Advertising consent remains denied and Google signals/personalization are disabled. Referral and campaign detail is deliberately limited by URL sanitization. Do not add personal information to page titles or static event labels.

## Consent and testing

An equal-choice German/English notice offers analytics or no analytics. The tag is not downloaded and events are not queued before opt-in. A footer Privacy & analytics button lets visitors change their choice. The local choice expires in six months. Withdrawal disables collection, clears GA cookies and reloads to unload the library. The enquiry itself is not persisted. Localhost and preview deployments cannot collect production analytics.

Run npm run check for consent, safe-payload and preview isolation tests. In a live browser, decline first and verify no Google tag is present; open settings and consent, then verify the new stream in GA4 Realtime. Test with non-personal example content; never send an email just to verify tracking. Reports may take time to populate; blockers and consent choices reduce measured traffic.

When a prompt changes useful actions, update this table, instrumentation and appropriate tests in the same change. Refer to [Google event setup](https://developers.google.com/analytics/devguides/collection/ga4/events) and [basic consent mode](https://developers.google.com/tag-platform/security/concepts/consent-mode).

Verified on 13 September 2026: GA4 Realtime displayed the new English page title, select_package and enquiry_prepared after a consented test. No tag was present before consent or after declining. Enhanced measurement was confirmed off in the saved stream settings.
