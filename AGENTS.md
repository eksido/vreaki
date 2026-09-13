# Vreaki: instructions for Codex

This is a small bilingual content-lab website. The owner should only need to describe changes in ordinary language. Do the implementation, checks and preview yourself. Read README.md and content/site.json first.

## Structure

- content/site.json is the source of truth for business details, German and English text, page metadata, media paths and brand colors.
- scripts/build.mjs generates static HTML, JSON-LD, social tags, hreflang, sitemap.xml, robots.txt, llms.txt, favicon and 404 page.
- public/styles.css controls responsive presentation; public/video.js is the only browser JS.
- public/assets holds the site's own video, poster and fonts. dist is generated; never edit it.
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
- llms.txt is an optional generated plain-text summary. It is not a standard required by Google and does not guarantee AI visibility. Prioritize clear visible answers, factual identity, crawlability, performance and useful content.
- Review official current guidance whenever asked for an SEO/GEO/AEO audit or when changing search behavior. Use Google Search Central (https://developers.google.com/search/docs/appearance/ai-features), structured-data policies (https://developers.google.com/search/docs/appearance/structured-data/sd-policies), and Bing Webmaster Guidelines (https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a). Never promise a particular ranking or AI citation.
- Retain useful content and do not manufacture FAQs just to increase keyword coverage. New pages need unique metadata, semantic navigation and inclusion in the sitemap/checks.

## Publishing and rollback

Repository: https://github.com/eksido/vreaki. Vercel team: eksidos-projects. Project: vreaki. Production branch: main.

Use the existing Vercel Git integration; push an approved publishing change to main. A branch push creates a preview. If CLI is needed use the pinned command in package.json. First-time setup on a new computer may require `npx vercel@59.16.0 login` and `npx vercel@59.16.0 link --project vreaki --scope eksidos-projects`.

Never commit secrets or .vercel. Do not force-push. To undo a published change, revert its commit and push the revert; verify the new deployment. Avoid changing access permissions or adding integrations for ordinary edits.
