import { renderHome } from '../templates/home.mjs';
import { readFile, writeFile, mkdir, rm, cp } from 'node:fs/promises';
import assert from 'node:assert/strict';
export const site = JSON.parse(await readFile('content/site.json', 'utf8'));
const origin = new URL(site.canonicalOrigin);
const publicOrigin = new URL(site.publicOrigin);
assert.equal(publicOrigin.protocol, 'https:', 'publicOrigin must use HTTPS');
assert.equal(publicOrigin.origin, site.publicOrigin, 'publicOrigin must have no path or trailing slash');
assert.equal(origin.protocol, 'https:', 'canonicalOrigin must use HTTPS');
assert.equal(origin.origin, site.canonicalOrigin, 'canonicalOrigin must have no path or trailing slash');
assert.match(site.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
assert.deepEqual(Object.keys(site.pages).sort(), ['de', 'en']);
for (const color of ['header', 'background', 'text', 'blue', 'yellow']) assert.match(site.theme[color], /^#[a-f\d]{6}$/i);
assert(site.theme.overlay >= 0 && site.theme.overlay <= 1);
for (const social of site.socials) assert.equal(new URL(social.url).protocol, 'https:');
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const absolute = path => new URL(path, origin).href;
assert.match(site.analytics.measurementId, /^G-[A-Z0-9]+$/);
const preview = process.env.VERCEL_ENV === 'preview';
await rm('dist', {recursive:true, force:true});
await mkdir('dist', {recursive:true});
await cp('public', 'dist', {recursive:true});
for (const [lang, page] of Object.entries(site.pages)) {
  assert.equal(page.path, lang === 'de' ? '/' : '/en/');
  assert(page.title.length >= 10 && page.title.length <= 70, `${lang}: title must be 10–70 characters`);
  assert(page.description.length >= 50 && page.description.length <= 180, `${lang}: description must be 50–180 characters`);
  assert(page.paragraphs.length >= 2 && page.paragraphs.every(p => typeof p === 'string' && p.trim().length > 20));
  assert.match(page.updated, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(new Date(page.updated).toISOString().slice(0,10), page.updated);
  assert(page.updated <= new Date().toISOString().slice(0,10), 'Do not future-date content');
  const other = lang === 'de' ? 'en' : 'de';
  const url = absolute(page.path);
  const graph = {
    '@context':'https://schema.org', '@graph':[
      {'@type':'Organization','@id':absolute('/#organization'),name:site.name,url:absolute('/'),email:site.email,sameAs:site.socials.map(s=>s.url),location:{'@type':'Place',name:site.location}},
      {'@type':'WebSite','@id':absolute('/#website'),url:absolute('/'),name:site.name,inLanguage:['de','en'],publisher:{'@id':absolute('/#organization')}},
      {'@type':'WebPage','@id':`${url}#webpage`,url,name:page.title,description:page.description,inLanguage:lang,dateModified:page.updated,isPartOf:{'@id':absolute('/#website')},about:{'@id':absolute('/#organization')}}
    ]
  };
  const html = `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(page.title)}</title>
  <meta name="description" content="${esc(page.description)}">
  <meta name="robots" content="${preview ? 'noindex, follow' : 'index, follow, max-image-preview:large'}">
  <link rel="canonical" href="${url}">
  ${Object.entries(site.pages).map(([l,p])=>`<link rel="alternate" hreflang="${l}" href="${absolute(p.path)}">`).join('\n  ')}
  <link rel="alternate" hreflang="x-default" href="${absolute('/')}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(site.name)}">
  <meta property="og:title" content="${esc(page.title)}">
  <meta property="og:description" content="${esc(page.description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:locale" content="${lang === 'de' ? 'de_DE' : 'en_GB'}">
  <meta property="og:image" content="${new URL(site.shareImage, publicOrigin).href}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(site.name)} – AI Content Lab Barcelona">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(page.title)}">
  <meta name="twitter:description" content="${esc(page.description)}">
  <meta name="twitter:image" content="${new URL(site.shareImage, publicOrigin).href}">
  <meta name="vreaki-analytics" content="${preview ? '' : site.analytics.measurementId}" data-origin="${site.publicOrigin}">
  <meta name="theme-color" content="${site.theme.header}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="/assets/carrois-gothic.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/styles.css">
  <style>:root{--header:${site.theme.header};--background:${site.theme.background};--text:${site.theme.text};--overlay:${site.theme.overlay};--blue:${site.theme.blue};--yellow:${site.theme.yellow};--hero-position:${site.media.heroPosition};--poster-image:url('${site.poster}')}</style>
  <script type="application/ld+json">${JSON.stringify(graph).replace(/</g,'\\u003c')}</script>
  <script type="module" src="/site.js"></script>
</head>
<body>
  ${renderHome(site, page, lang, esc)}
</body>
</html>\n`;
  const dir = `dist${page.path}`;
  await mkdir(dir, {recursive:true});
  await writeFile(`${dir}index.html`, html);
}
await writeFile('dist/robots.txt', `User-agent: *\n${preview ? 'Disallow: /' : 'Allow: /'}\n\nSitemap: ${absolute('/sitemap.xml')}\n`);
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${Object.values(site.pages).map(p=>`\n<url><loc>${absolute(p.path)}</loc><lastmod>${p.updated}</lastmod>${Object.entries(site.pages).map(([l,q])=>`<xhtml:link rel="alternate" hreflang="${l}" href="${absolute(q.path)}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${absolute('/')}"/></url>`).join('')}\n</urlset>\n`);
await writeFile('dist/llms.txt', `# ${site.name}\n\n> ${site.pages.en.description}\n\n${site.pages.en.paragraphs.join('\n\n')}\n\n## Services\n${site.pages.en.home.services.map(s=>`### ${s.label}\n${s.title}\n${s.description}`).join('\n\n')}\n\n## Packages\n${site.pages.en.home.packages.map(p=>`### ${p.title}\n${p.description}\n${p.features.join('; ')}${site.pricingPublished ? `\nFrom EUR ${p.price}` : '\nRequest a quote.'}`).join('\n\n')}\n\n## Official pages\n${Object.entries(site.pages).map(([l,p])=>`- [${l.toUpperCase()}](${absolute(p.path)}): ${p.description}`).join('\n')}\n\n## Contact\n- Email: ${site.email}\n${site.socials.map(s=>`- [${s.label}](${s.url})`).join('\n')}\n`);
await writeFile('dist/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="${site.theme.header}"/><text x="32" y="46" text-anchor="middle" fill="${site.theme.background}" font-family="sans-serif" font-size="48" font-weight="100">v</text></svg>`);
await writeFile('dist/404.html', '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="robots" content="noindex"><title>Page not found | Vreaki</title><h1>Page not found</h1><p><a href="/">Vreaki — Home</a></p></html>');
console.log('Built German and English pages, structured data, social metadata, sitemap, robots.txt and llms.txt.');
