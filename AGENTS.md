# Vreaki: instructions for Codex

This is a small bilingual content-lab website. The visual direction is the owner's vreaki-homepage-visual.html, inspired by https://mcdonalds.es/: video hero, bold type, overlapping intro cards, moving image strip, colorful service carousel, and pricing cards. The owner should only need to describe changes in ordinary language. Do the implementation, checks and preview yourself. Read README.md and content/site.json first.

## Structure

- content/site.json is the source of truth for business details, German and English text, page metadata, media paths and brand colors.
- scripts/build.mjs generates static HTML, JSON-LD, social tags, hreflang, sitemap.xml, robots.txt, llms.txt, favicon and 404 page.
- public/styles.css controls responsive presentation; public/site.js controls motion, the service carousel and enquiry UI. public/enquiry.js formats email drafts.
- public/assets holds the site's own video, poster and fonts. dist is generated; never edit it.
- templates/home.mjs renders semantic sections from each page.home object. Keep all editable wording, service lists, package prices and form labels in content/site.json.
- No runtime dependencies, database, CMS, WordPress, API keys or environment variables are needed. Node 22+ runs the tooling.

## Every content or layout change

1. Make the smallest coherent edit in the source. Preserve the established visual identity unless asked to redesign. Do not add a framework for routine updates.
2. Update both German and English for equivalent content changes. Translate naturally; do not invent services, clients, awards, addresses, claims or statistics. Ask only for essential missing facts.
3. Revisit each affected page's title and description so they accurately summarize visible content. Update its `updated` field when the content meaning changes; never change dates merely to signal freshness.
4. Keep schema grounded in visible facts. Organization and WebPage schema are generated. Any future FAQ schema must match visible questions and answers; no hidden keyword blocks, fabricated testimonials or unsupported rating schema.
5. Run `npm run check`. The Vercel build also runs these checks, so failures block deployment. Fix failures; do not disable the checks.
6. Run `npm run dev` and check `/` and `/en/` in a browser at desktop and mobile widths (including 375px). Verify no horizontal overflow, readable text, language navigation, contact links, poster fallback and video pause/play. Use the browser tools available in the current Codex session.
7. Explain the actual change in plain language and show the preview. If publishing was requested, commit, push and verify the Vercel production deployment. Otherwise keep the work local or on a preview branch: pushing main publishes automatically once the repository integration is connected.

## SEO / GEO / AEO maintenance

The build regenerates technical metadata on every update. This is consistency automation, not an autonomous research service or guarantee of ranking, indexing or AI citations.

- Important content must remain in the delivered HTML and accessible without JavaScript.
- Preserve a single visible H1, descriptive document titles, correct lang, reciprocal hreflang, absolute canonical URLs, social cards and stable URLs.
- `canonicalOrigin` currently points to https://vreaki.com because this is a copy and that domain remains the original primary site. Do not point it at random preview deployments. If the owner chooses a new primary domain, change it once in content/site.json and verify that domain serves these files, then rebuild.
- Vercel preview builds generate noindex and disallow crawling. Production points to the configured canonical origin. Do not change production-domain DNS unless requested.
- `publicOrigin` is https://vreaki.vercel.app and is used for social images hosted by this deployment. When migrating the primary domain, update both publicOrigin and canonicalOrigin to the verified new domain. Never advertise an image URL that is not publicly served.
- llms.txt is an optional generated plain-text summary. It is not a standard required by Google and does not guarantee AI visibility. Prioritize clear visible answers, factual identity, crawlability, performance and useful content.
- Review official current guidance whenever asked for an SEO/GEO/AEO audit or when changing search behavior. Use Google Search Central (https://developers.google.com/search/docs/appearance/ai-features), structured-data policies (https://developers.google.com/search/docs/appearance/structured-data/sd-policies), and Bing Webmaster Guidelines (https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a). Never promise a particular ranking or AI citation.
- Retain useful content and do not manufacture FAQs just to increase keyword coverage. New pages need unique metadata, semantic navigation and inclusion in the sitemap/checks.

## Publishing and rollback

Repository: https://github.com/eksido/vreaki. Vercel team: eksidos-projects. Project: vreaki. Production branch: main.

Use the existing Vercel Git integration; push an approved publishing change to main. A branch push creates a preview. If CLI is needed use the pinned command in package.json. First-time setup on a new computer may require `npx vercel@59.16.0 login` and `npx vercel@59.16.0 link --project vreaki --scope eksidos-projects`.

Never commit secrets or .vercel. Do not force-push. To undo a published change, revert its commit and push the revert; verify the new deployment. Avoid changing access permissions or adding integrations for ordinary edits.

## Enquiries and pricing

The owner approved hello@vreaki.com and starting prices EUR 490 / 990 / 1900. Update both languages together. pricingPublished controls whether draft prices appear. Do not invent VAT, billing intervals, payment terms or delivery promises.

The owner explicitly chose an email-preparation form with no external service. Package and service buttons preselect the relevant enquiry. The form validates inputs and displays a reviewable draft; the visitor must click Open email app and send from their email client. A copy option supports webmail. Do not describe this as an enquiry already sent, save form input, add analytics for form data, or add an email provider without a request. `node --test scripts/enquiry.test.mjs` tests formatting and validation without sending messages.

Desktop service cards move horizontally as the user scrolls; arrow buttons and keyboard navigation work too. Mobile, short screens, reduced motion and no-JavaScript use native horizontal scrolling. Preserve access to every card in each mode. Motion controls pause autoplay video and the image strip.

## Mobile refinements

Keep primary touch targets at least 44px high, readable form input text at 16px, and service-card snap padding aligned with the visible gutter. The hero uses mobileVideo at widths up to 700px; replace both video encodes when changing source media. The hero video pauses when offscreen. On phones, motion controls belong within the hero and image-strip sections so they never cover form fields. Touch devices use native service scrolling even on larger screens. Check 320px, 375px and 430px widths in both languages, plus desktop, after layout edits.

## Measurement on every prompt

For every feature, content or interaction update, consider which business question useful analytics would answer. Add or update meaningful GA4 events in the same change when useful; do not wait for a separate tracking prompt. Reuse the site's shared consent-aware tracking function and stable event names. Document the trigger and safe parameters in docs/analytics.md. Do not track decorative animation, every scroll tick or every keystroke.

Track real outcomes precisely: an email draft is prepared, an email app is opened, or text is copied. None proves that an enquiry was sent; never emit generate_lead or purchase for these actions. Never include names, email addresses, briefs, typed values, mailto URLs, query strings or other personal data in analytics. Use only curated service/package IDs and static interaction labels. Keep automatic form tracking disabled. Track only after analytics consent, with an equally accessible decline option and a way to change preferences. Local development and Vercel previews must not pollute production reports. Verify consent denied, consent granted, withdrawal and one event per completed action.

## PageSpeed and mobile are ongoing requirements

Treat mobile usability and performance as acceptance criteria for every prompt, including content, media and analytics changes. Preserve the concept and desktop layout. Check both languages at 320, 375 and 430px, keyboard/focus behavior, touch targets, form usability and horizontal overflow when affected. Use reduced-motion and data-saving fallbacks.

Run npm run check, including asset budgets, before publishing. After changes to layout, media, fonts, scripts or tracking, run npm run audit against the local production build or deployed preview, compare mobile and desktop Lighthouse results, and fix material regressions. Target performance 90+, LCP <=2.5s and CLS <=0.1 in the lab; investigate real-user INP >200ms when field data is available. Report actual measurements and environment, never promise a permanent score or confuse lab measurements with field data. Do not silently relax budgets or remove checks to pass a build.

Keep the poster discoverable and high priority, reserve media dimensions, lazy-load below-fold images, use local subset WOFF2 fonts, defer noncritical scripts and load analytics asynchronously only after consent. Keep responsive video encodes and avoid competing with the first meaningful paint. Do not add large libraries or third-party widgets for simple interactions. Review new assets against the budgets in scripts/performance.mjs.
