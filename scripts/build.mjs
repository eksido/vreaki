import { readFile, writeFile, mkdir, rm, cp } from 'node:fs/promises';
import assert from 'node:assert/strict';
export const site = JSON.parse(await readFile('content/site.json', 'utf8'));
const origin = new URL(site.canonicalOrigin);
assert.equal(origin.protocol, 'https:', 'canonicalOrigin must use HTTPS');
assert.equal(origin.origin, site.canonicalOrigin, 'canonicalOrigin must have no path or trailing slash');
assert.match(site.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
assert.deepEqual(Object.keys(site.pages).sort(), ['de', 'en']);
for (const color of ['header', 'background', 'text']) assert.match(site.theme[color], /^#[a-f\d]{6}$/i);
assert(site.theme.overlay >= 0 && site.theme.overlay <= 1);
for (const social of site.socials) assert.equal(new URL(social.url).protocol, 'https:');
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const absolute = path => new URL(path, origin).href;
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
  <meta property="og:image" content="${absolute(site.shareImage)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(site.name)} – AI Content Lab Barcelona">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(page.title)}">
  <meta name="twitter:description" content="${esc(page.description)}">
  <meta name="twitter:image" content="${absolute(site.shareImage)}">
  <meta name="theme-color" content="${site.theme.header}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="/assets/poppins-200.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/styles.css">
  <style>:root{--header:${site.theme.header};--background:${site.theme.background};--text:${site.theme.text};--overlay:${site.theme.overlay}}</style>
  <script type="application/ld+json">${JSON.stringify(graph).replace(/</g,'\\u003c')}</script>
  <script src="/video.js" defer></script>
</head>
<body>
  <a class="skip-link" href="#content">${lang === 'de' ? 'Zum Inhalt' : 'Skip to content'}</a>
  <header class="site-header">
    <h1>${esc(site.wordmark)}</h1>
    <a class="language" href="${site.pages[other].path}" lang="${other}" hreflang="${other}" aria-label="${other === 'en' ? 'Switch to English' : 'Auf Deutsch wechseln'}">${other.toUpperCase()}</a>
  </header>
  <main id="content" class="hero">
    <img class="hero-poster" src="${site.poster}" alt="" fetchpriority="high">
    <video class="hero-video" data-src="${site.video}" poster="${site.poster}" muted loop playsinline preload="none" aria-hidden="true"></video>
    <div class="shade" aria-hidden="true"></div>
    <div class="hero-content">
      ${page.paragraphs.map(p=>`<p class="intro">${esc(p)}</p>`).join('\n      ')}
      <footer class="contact-links" aria-label="${lang === 'de' ? 'Kontakt' : 'Contact'}">
        <a href="mailto:${esc(site.email)}">EMAIL</a>
        ${site.socials.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a>`).join('\n        ')}
      </footer>
    </div>
    <button class="video-toggle" hidden data-pause="${lang === 'de' ? 'Video pausieren' : 'Pause video'}" data-play="${lang === 'de' ? 'Video abspielen' : 'Play video'}"></button>
  </main>
</body>
</html>\n`;
  const dir = `dist${page.path}`;
  await mkdir(dir, {recursive:true});
  await writeFile(`${dir}index.html`, html);
}
await writeFile('dist/robots.txt', `User-agent: *\n${preview ? 'Disallow: /' : 'Allow: /'}\n\nSitemap: ${absolute('/sitemap.xml')}\n`);
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${Object.values(site.pages).map(p=>`\n<url><loc>${absolute(p.path)}</loc><lastmod>${p.updated}</lastmod>${Object.entries(site.pages).map(([l,q])=>`<xhtml:link rel="alternate" hreflang="${l}" href="${absolute(q.path)}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${absolute('/')}"/></url>`).join('')}\n</urlset>\n`);
await writeFile('dist/llms.txt', `# ${site.name}\n\n> ${site.pages.en.description}\n\n${site.pages.en.paragraphs.join('\n\n')}\n\n## Official pages\n${Object.entries(site.pages).map(([l,p])=>`- [${l.toUpperCase()}](${absolute(p.path)}): ${p.description}`).join('\n')}\n\n## Contact\n- Email: ${site.email}\n${site.socials.map(s=>`- [${s.label}](${s.url})`).join('\n')}\n`);
await writeFile('dist/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="${site.theme.header}"/><text x="32" y="46" text-anchor="middle" fill="${site.theme.text}" font-family="sans-serif" font-size="48" font-weight="100">v</text></svg>`);
await writeFile('dist/404.html', '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="robots" content="noindex"><title>Page not found | Vreaki</title><h1>Page not found</h1><p><a href="/">Vreaki — Home</a></p></html>');
console.log('Built German and English pages, structured data, social metadata, sitemap, robots.txt and llms.txt.');
