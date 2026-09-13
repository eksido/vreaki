# Vreaki — edit by prompting Codex

**Live copy:** https://vreaki.vercel.app · **Repository:** https://github.com/eksido/vreaki · **Vercel project:** https://vercel.com/eksidos-projects/vreaki

A copy of the German and English pages at https://vreaki.com, captured September 13, 2026. The original blue header, thin Poppins typography, background video, text and links are preserved. Local assets remove the WordPress dependency. Accessible video controls and a still-image fallback are added.

## Start here — no coding needed

1. Have repository access to [eksido/vreaki](https://github.com/eksido/vreaki). Open or clone that repository as a project in Codex.
2. Paste the prompt below and replace the bracketed part with what you want.
3. Review the preview. Say **“Publish this version”** when ready.

> Read AGENTS.md and update this website: [describe the change]. Make the changes yourself, keep German and English aligned, and update the relevant SEO/GEO/AEO metadata. Run the checks, verify desktop and mobile, and show me a preview. Explain only what I need to review.

Examples:

- “Change the opening text to … and translate it naturally into English.”
- “Use this attached video as the background, and update its still-image fallback and social sharing image.”
- “Make the text slightly larger on phones while preserving the current desktop design.”
- “Update our contact email to … everywhere, including structured data.”
- “Review the site's SEO and AI-search readiness against current official guidance, fix issues, and show me a preview.”
- “Publish this version and give me the live URL.”
- “Undo the last published change and verify that the previous version is live again.”

`AGENTS.md` is read automatically by Codex. You do not need to remember the technical checklist or edit JSON yourself.

## Simple foundation

| File | Purpose |
| --- | --- |
| `content/site.json` | All text, business details, languages, colors, media and metadata |
| `public/styles.css` | Layout and responsive styling |
| `public/video.js` | Video controls and reduced-motion behavior |
| `public/assets/` | Video, images and fonts |
| `scripts/build.mjs` | Generates complete static pages and search files |
| `scripts/check.mjs` | Checks routes, assets, metadata and indexing consistency |
| `AGENTS.md` | Permanent instructions for Codex |

Node 22+ is the only local prerequisite. No CMS account, database, environment file, paid API or framework setup is needed.

```sh
npm ci
npm run dev
```

Open http://localhost:3000 and refresh after changes. `npm run check` builds and validates everything. Vercel runs the same checks before publishing. GitHub Actions verifies both production and preview indexing rules.

## Search and AI readiness

Every build generates titles, descriptions, canonical links, German/English language alternates, Open Graph and Twitter cards, Organization/WebSite/WebPage JSON-LD, sitemap.xml, robots.txt and an optional llms.txt summary from one content source. Visible HTML works without JavaScript. Dates represent real content changes, not build times. No fabricated schema or hidden search-only content is added.

The build catches technical omissions and inconsistencies; Codex instructions require semantic review whenever content changes. These measures do not guarantee rankings or AI citations, and no system can promise permanent correctness as search platforms evolve. No recurring external monitoring has been configured.

The Vercel copy retains **https://vreaki.com as the canonical origin** to avoid competing with the original. DNS is not changed. If this deployment becomes the primary site, connect the chosen domain and change `canonicalOrigin` once; all search URLs update on build. Until the original domain is served by this project, its current WordPress SEO is unaffected by edits here.

## Deploy

Vercel settings: project `vreaki`, team `eksidos-projects`, framework **Other**, build `npm run build`, output `dist`, Node 22+, repository `eksido/vreaki`, production branch `main`.

With the Git integration connected, pushing main publishes; other branches receive preview deployments. The build fails on invalid metadata or missing assets. Your friend needs repository write access to publish via Git; Vercel access is only necessary for project settings or direct CLI deployment. Access is not granted automatically.

For direct CLI publishing: `npm run deploy`. If prompted, sign in and link to the existing project instead of creating a duplicate. For rollback, ask Codex to revert the relevant commit and push the revert.

## Source assets

Original video and Poppins fonts were copied from the assets served by vreaki.com / vreaki.eksido.io. The poster and social card are frames from that video. This repository does not grant rights to reuse the brand's media for unrelated projects. Poppins is distributed under the SIL Open Font License; see `public/assets/OFL.txt`.
