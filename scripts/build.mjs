import { renderHome } from '../templates/home.mjs';
import { renderAbout } from '../templates/about.mjs';
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
const localizedPages = Object.entries(site.pages).flatMap(([lang,page]) => [
  {kind:'home', lang, page, path:page.path, title:page.title, description:page.description, updated:page.updated, render:()=>renderHome(site,page,lang,esc)},
  {kind:'about', lang, page, path:page.about.path, title:page.about.title, description:page.about.description, updated:page.updated, render:()=>renderAbout(site,page,lang,esc)}
]);
const routeFor = (kind, lang) => kind === 'home' ? site.pages[lang].path : site.pages[lang].about.path;
for (const entry of localizedPages) {
  const {kind, lang, page, path, title, description, updated} = entry;
  assert.equal(page.path, lang === 'de' ? '/' : '/en/');
  assert.equal(page.about.path, lang === 'de' ? '/about/' : '/en/about/');
  assert(path === routeFor(kind, lang));
  assert(title.length >= 10 && title.length <= 70, `${lang} ${kind}: title must be 10–70 characters`);
  assert(description.length >= 50 && description.length <= 180, `${lang} ${kind}: description must be 50–180 characters`);
  assert(page.paragraphs.length >= 2 && page.paragraphs.every(p => typeof p === 'string' && p.trim().length > 20));
  assert.match(page.updated, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(new Date(page.updated).toISOString().slice(0,10), page.updated);
  assert(page.updated <= new Date().toISOString().slice(0,10), 'Do not future-date content');
  const url = absolute(path);
  const graph = {
    '@context':'https://schema.org', '@graph':[
      {'@type':'Organization','@id':absolute('/#organization'),name:site.name,url:absolute('/'),email:site.email,sameAs:site.socials.map(s=>s.url),location:{'@type':'Place',name:site.location}},
      {'@type':'WebSite','@id':absolute('/#website'),url:absolute('/'),name:site.name,inLanguage:['de','en'],publisher:{'@id':absolute('/#organization')}},
      {'@type':'WebPage','@id':`${url}#webpage`,url,name:title,description,inLanguage:lang,dateModified:updated,isPartOf:{'@id':absolute('/#website')},about:{'@id':absolute('/#organization')}}
    ]
  };
  const html = `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="${preview ? 'noindex, follow' : 'index, follow, max-image-preview:large'}">
  <link rel="canonical" href="${url}">
  ${Object.keys(site.pages).map(l=>`<link rel="alternate" hreflang="${l}" href="${absolute(routeFor(kind,l))}">`).join('\n  ')}
  <link rel="alternate" hreflang="x-default" href="${absolute(routeFor(kind,'de'))}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(site.name)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:locale" content="${lang === 'de' ? 'de_DE' : 'en_GB'}">
  <meta property="og:image" content="${new URL(site.shareImage, publicOrigin).href}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(site.name)} – AI Content Lab Barcelona">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${new URL(site.shareImage, publicOrigin).href}">
  <meta name="vreaki-analytics" content="${preview ? '' : site.analytics.measurementId}" data-origin="${site.publicOrigin}">
  <meta name="theme-color" content="${site.theme.header}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="/assets/carrois-gothic.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/kaleko-105-thin.ttf" as="font" type="font/ttf" crossorigin>
  <link rel="stylesheet" href="/styles.css">
  <style>:root{--header:${site.theme.header};--background:${site.theme.background};--text:${site.theme.text};--overlay:${site.theme.overlay};--blue:${site.theme.blue};--yellow:${site.theme.yellow};--hero-position:${site.media.heroPosition};--poster-image:url('${site.poster}')}</style>
  <script type="application/ld+json">${JSON.stringify(graph).replace(/</g,'\\u003c')}</script>
  <script type="module" src="/${kind === 'about' ? 'about' : 'site'}.js"></script>
</head>
<body>
  ${entry.render()}
</body>
</html>\n`;
  const dir = `dist${path}`;
  await mkdir(dir, {recursive:true});
  await writeFile(`${dir}index.html`, html);
}
await writeFile('dist/robots.txt', `User-agent: *\n${preview ? 'Disallow: /' : 'Allow: /'}\n\nSitemap: ${absolute('/sitemap.xml')}\n`);
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${localizedPages.map(entry=>`\n<url><loc>${absolute(entry.path)}</loc><lastmod>${entry.updated}</lastmod>${Object.keys(site.pages).map(l=>`<xhtml:link rel="alternate" hreflang="${l}" href="${absolute(routeFor(entry.kind,l))}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${absolute(routeFor(entry.kind,'de'))}"/></url>`).join('')}\n</urlset>\n`);
const llms = `# ${site.name}

> ${site.pages.en.description}

${site.pages.en.paragraphs.join('\n\n')}

## Services
${site.pages.en.home.services.map(s=>`### ${s.label}\n${s.title}\n${s.description}`).join('\n\n')}

## Packages
${site.pages.en.home.packages.map(p=>`### ${p.title}\n${p.description}\n${p.features.join('; ')}${site.pricingPublished ? `\nFrom EUR ${p.price}` : '\nRequest a quote.'}`).join('\n\n')}

## Official pages
${localizedPages.map(entry=>`- [${entry.lang.toUpperCase()} ${entry.kind}](${absolute(entry.path)}): ${entry.description}`).join('\n')}

## Contact
- Email: ${site.email}
${site.socials.map(s=>`- [${s.label}](${s.url})`).join('\n')}
`;
await writeFile('dist/llms.txt', llms);
await writeFile('dist/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="${site.theme.header}"/><text x="32" y="46" text-anchor="middle" fill="${site.theme.background}" font-family="sans-serif" font-size="48" font-weight="100">v</text></svg>`);
await writeFile('dist/404.html', '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="robots" content="noindex"><title>Page not found | Vreaki</title><h1>Page not found</h1><p><a href="/">Vreaki — Home</a></p></html>');
console.log('Built German and English pages, structured data, social metadata, sitemap, robots.txt and llms.txt.');
