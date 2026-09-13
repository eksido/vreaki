import {readFile, access} from 'node:fs/promises';
import assert from 'node:assert/strict';
const site = JSON.parse(await readFile('content/site.json', 'utf8'));
const sitemap = await readFile('dist/sitemap.xml','utf8');
const robots = await readFile('dist/robots.txt','utf8');
const llms = await readFile('dist/llms.txt','utf8');
const preview = process.env.VERCEL_ENV === 'preview';
for (const [lang,page] of Object.entries(site.pages)) {
  const html = await readFile(`dist${page.path}index.html`,'utf8');
  const url = site.canonicalOrigin + page.path;
  assert(html.includes(`<html lang="${lang}">`));
  assert.equal((html.match(/<h1[ >]/g)||[]).length,1,'Each page needs exactly one H1');
  assert(html.includes(`<link rel="canonical" href="${url}">`));
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
  for (const match of html.matchAll(/(?:href|src|poster|data-src)="(\/[^"#]*)"/g)) {
    const path = match[1];
    await access(`dist${path.endsWith('/') ? path+'index.html' : path}`);
  }
  assert(!/wp-content|wp-json|googletagmanager|stats\.wp/.test(html),'Do not restore WordPress dependencies or tracking');
}
assert(robots.includes(`Sitemap: ${site.canonicalOrigin}/sitemap.xml`));
assert(robots.includes(preview ? 'Disallow: /' : 'Allow: /'));
for (const asset of [site.video,site.poster,site.shareImage]) {
  assert.match(asset,/^\/assets\/[a-zA-Z0-9._-]+$/);
  await access(`dist${asset}`);
}
console.log('PASS: language routes, local assets, canonical URLs, hreflang, indexing rules, sitemap, structured data and AI summary are consistent.');
