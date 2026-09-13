import {readFile, access} from 'node:fs/promises';
import assert from 'node:assert/strict';
const site = JSON.parse(await readFile('content/site.json', 'utf8'));
const sitemap = await readFile('dist/sitemap.xml','utf8');
const robots = await readFile('dist/robots.txt','utf8');
const llms = await readFile('dist/llms.txt','utf8');
const preview = process.env.VERCEL_ENV === 'preview';
const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
assert.equal(typeof site.pricingPublished,'boolean');
assert.match(site.media.heroPosition,/^\d{1,3}% \d{1,3}%$/);
assert.deepEqual(site.pages.de.home.services.map(s=>s.id),site.pages.en.home.services.map(s=>s.id),'Service IDs must agree between languages');
assert.deepEqual(site.pages.de.home.packages.map(p=>p.price),site.pages.en.home.packages.map(p=>p.price),'Package prices must agree between languages');
for (const [lang,page] of Object.entries(site.pages)) {
  const html = await readFile(`dist${page.path}index.html`,'utf8');
  const url = site.canonicalOrigin + page.path;
  assert(html.includes(`<html lang="${lang}">`));
  assert.equal((html.match(/<h1[ >]/g)||[]).length,1,'Each page needs exactly one H1');
  assert(html.includes(`<link rel="canonical" href="${url}">`));
  assert(html.includes(`<meta property="og:image" content="${site.publicOrigin+site.shareImage}">`));
  assert(html.includes(`<meta name="twitter:image" content="${site.publicOrigin+site.shareImage}">`));
  assert(html.includes(preview ? 'noindex, follow' : 'index, follow, max-image-preview:large'));
  for (const [l,p] of Object.entries(site.pages)) assert(html.includes(`hreflang="${l}" href="${site.canonicalOrigin+p.path}"`));
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  const webPage = schema['@graph'].find(n=>n['@type']==='WebPage');
  assert.equal(webPage.description,page.description);
  assert.equal(webPage.inLanguage,lang);
  assert.equal(webPage.url,url);
  assert.equal(webPage.dateModified,page.updated);
  assert(sitemap.includes(`<loc>${url}</loc><lastmod>${page.updated}</lastmod>`));
  assert(llms.includes(page.description));
  assert.equal(page.home.services.length,6);
  assert.equal(page.home.packages.length,3);
  for(const service of page.home.services){
    assert.match(service.id,/^[a-z][a-z-]+$/);
    for(const field of ['label','title','description'])assert(service[field]?.trim());
    assert(service.tags.length>0 && service.tags.every(t=>typeof t==='string'&&t.trim()));
    assert(html.includes(escape(service.title)));
    if(lang==='en')assert(llms.includes(service.description));
  }
  for(const pack of page.home.packages){
    assert(Number.isFinite(pack.price)&&pack.price>0);
    assert(pack.features.length>0&&pack.features.every(f=>typeof f==='string'&&f.trim()));
    assert(html.includes(`data-enquiry="${escape(pack.title)}"`));
    if(site.pricingPublished)assert(html.includes(new Intl.NumberFormat(lang,{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(pack.price)));
  }
  for(const match of html.matchAll(/href="#([^"]+)"/g))assert(html.includes(`id="${match[1]}"`),'Anchor target must exist');
  assert(html.includes(`data-recipient="${site.email}"`));
  assert(html.includes('name="email" type="email" autocomplete="email" required'));
  assert(html.includes('class="enquiry-result" hidden'));
  assert(html.includes(escape(page.home.form.note.replaceAll('{email}',site.email))));
  for (const match of html.matchAll(/(?:href|src|poster|data-src)="(\/[^"#]*)"/g)) {
    const path = match[1];
    await access(`dist${path.endsWith('/') ? path+'index.html' : path}`);
  }
  assert(!/wp-content|wp-json|googletagmanager|stats\.wp/.test(html),'Do not restore WordPress dependencies or tracking');
}
assert(robots.includes(`Sitemap: ${site.canonicalOrigin}/sitemap.xml`));
assert(robots.includes(preview ? 'Disallow: /' : 'Allow: /'));
for (const asset of [site.video,site.mobileVideo,site.poster,site.shareImage,...site.media.gallery]) {
  assert.match(asset,/^\/assets\/[a-zA-Z0-9._-]+$/);
  await access(`dist${asset}`);
}
console.log('PASS: language routes, local assets, canonical URLs, hreflang, indexing rules, sitemap, structured data and AI summary are consistent.');
