import {readFile, access} from 'node:fs/promises';
import assert from 'node:assert/strict';
const site = JSON.parse(await readFile('content/site.json', 'utf8'));
const sitemap = await readFile('dist/sitemap.xml','utf8');
const robots = await readFile('dist/robots.txt','utf8');
const llms = await readFile('dist/llms.txt','utf8');
const preview = process.env.VERCEL_ENV === 'preview';
const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const serviceHeadlineHtml = value => {
  const lines = escape(value).split('\n');
  const headline = lines.length > 1 ? lines.slice(1) : lines;
  return headline.map((line,index)=>`<span${index === 0 ? ' class="service-title-strong"' : ''}>${line}</span>`).join('');
};
assert.equal(typeof site.pricingPublished,'boolean');
assert.match(site.media.heroPosition,/^\d{1,3}% \d{1,3}%$/);
assert.deepEqual(site.pages.de.home.services.map(s=>s.id),site.pages.en.home.services.map(s=>s.id),'Service IDs must agree between languages');
assert.deepEqual(site.pages.de.home.packages.map(p=>p.price),site.pages.en.home.packages.map(p=>p.price),'Package prices must agree between languages');
for (const [lang,page] of Object.entries(site.pages)) {
  const routes = [
    {kind:'home', path:page.path, title:page.title, description:page.description},
    {kind:'about', path:page.about.path, title:page.about.title, description:page.about.description}
  ];
  for (const route of routes) {
  const html = await readFile(`dist${route.path}index.html`,'utf8');
  const url = site.canonicalOrigin + route.path;
  assert(html.includes(`<html lang="${lang}">`));
  assert.equal((html.match(/<h1[ >]/g)||[]).length,1,'Each page needs exactly one H1');
  assert(html.includes(`<link rel="canonical" href="${url}">`));
  assert(html.includes(`<meta property="og:image" content="${site.publicOrigin+site.shareImage}">`));
  assert(html.includes(`<meta name="twitter:image" content="${site.publicOrigin+site.shareImage}">`));
  assert(html.includes(preview ? 'noindex, follow' : 'index, follow, max-image-preview:large'));
  for (const [l,p] of Object.entries(site.pages)) assert(html.includes(`hreflang="${l}" href="${site.canonicalOrigin+(route.kind === 'home' ? p.path : p.about.path)}"`));
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  const webPage = schema['@graph'].find(n=>n['@type']==='WebPage');
  assert.equal(webPage.description,route.description);
  assert.equal(webPage.inLanguage,lang);
  assert.equal(webPage.url,url);
  assert.equal(webPage.dateModified,page.updated);
  assert(sitemap.includes(`<loc>${url}</loc><lastmod>${page.updated}</lastmod>`));
  assert(llms.includes(route.description));
  if(route.kind === 'home') {
  assert(html.includes(`data-recipient="${site.email}"`));
  assert(html.includes('name="email" type="email" autocomplete="email" required'));
  assert(html.includes('class="enquiry-result" hidden'));
  assert(html.includes(escape(page.home.form.note.replaceAll('{email}',site.email))));
  } else {
    assert(!html.includes('class="enquiry-form"'),'About must not use the old email-draft form');
    assert(html.includes('class="about-contact-dialog"'));
    assert(html.includes(escape(page.about.contactForm.title)));
    assert(html.includes(escape(page.about.contactForm.pending)));
    assert(html.includes('type="submit" disabled'),'Do not enable delivery before a provider is configured');
    assert(html.includes(`href="mailto:${site.email}"`),'Keep direct email available');
    assert(html.includes('src="/about.js"'));
  }
  for (const match of html.matchAll(/(?:href|src|poster|data-src)="(\/[^"#]*)"/g)) {
    const path = match[1];
    await access(`dist${path.endsWith('/') ? path+'index.html' : path}`);
  }
  assert(!/wp-content|wp-json|googletagmanager|stats\.wp/.test(html),'Do not restore WordPress dependencies or tracking');
  }
  const html = await readFile(`dist${page.path}index.html`,'utf8');
  assert.equal(page.home.services.length,5);
  assert.equal(page.home.packages.length,3);
  for(const service of page.home.services){
    assert.match(service.id,/^[a-z][a-z-]+$/);
    for(const field of ['label','title','description'])assert(service[field]?.trim());
    assert(service.tags.length>0 && service.tags.every(t=>typeof t==='string'&&t.trim()));
    assert(html.includes(serviceHeadlineHtml(service.title)));
    if(lang==='en')assert(llms.includes(service.description));
  }
  for(const pack of page.home.packages){
    assert(Number.isFinite(pack.price)&&pack.price>0);
    assert(pack.features.length>0&&pack.features.every(f=>typeof f==='string'&&f.trim()));
    assert(html.includes(`data-enquiry="${escape(pack.title)}"`));
    if(site.pricingPublished)assert(html.includes(new Intl.NumberFormat(lang,{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(pack.price)));
  }
  for(const match of html.matchAll(/href="#([^"]+)"/g))assert(html.includes(`id="${match[1]}"`),'Anchor target must exist');
}
assert(robots.includes(`Sitemap: ${site.canonicalOrigin}/sitemap.xml`));
assert(robots.includes(preview ? 'Disallow: /' : 'Allow: /'));
const galleryAssets = site.media.gallery.map(item => typeof item === 'string' ? item : item.src);
for (const asset of [site.video,site.mobileVideo,site.poster,site.shareImage,...galleryAssets]) {
  assert.match(asset,/^\/assets\/[a-zA-Z0-9._-]+$/);
  await access(`dist${asset}`);
}
console.log('PASS: language routes, local assets, canonical URLs, hreflang, indexing rules, sitemap, structured data and AI summary are consistent.');

for (const [lang,page] of Object.entries(site.pages)) {
  const html=await readFile(`dist${page.path}index.html`,'utf8');
  assert(html.includes('class="analytics-consent" hidden'),`${lang}: consent controls required`);
  assert(html.includes('class="analytics-settings" hidden'),`${lang}: consent settings required`);
  for(const text of Object.values(page.home.analytics))assert(text.trim().length>0,`${lang}: analytics labels required`);
  const measurement=process.env.VERCEL_ENV==='preview'?'':site.analytics.measurementId;
  assert(html.includes(`name="vreaki-analytics" content="${measurement}"`),'Preview must disable production analytics');
  assert.equal([...html.matchAll(/data-analytics-item=/g)].length,page.home.services.length+page.home.packages.length,'Each offer needs an analytics ID');
}
