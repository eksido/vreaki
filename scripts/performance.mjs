import { readFile, stat, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const site = JSON.parse(await readFile('content/site.json','utf8'));
const limit = async (file, bytes) => assert((await stat(file)).size <= bytes, `${file} exceeds ${Math.round(bytes/1024)} KiB budget; optimize the asset`);
const galleryAssets = site.media.gallery.map(item => typeof item === 'string' ? {type:'image',src:item} : item);
for (const p of Object.values(site.pages)) await limit(`dist${p.path}index.html`, 50*1024);
await limit(`dist${site.mobileVideo}`, 1500*1024);
await limit(`dist${site.video}`, 3300*1024);
await limit(`dist${site.poster}`, 120*1024);
for (const item of new Map(galleryAssets.map(item => [item.src,item])).values()) {
  await limit(`dist${item.src}`, item.type === 'video' ? 7500*1024 : 120*1024);
}
let code=0;
for (const file of await readdir('dist')) if (/\.(css|js)$/.test(file)) code+=(await stat(`dist/${file}`)).size;
assert(code<=60*1024,'First-party CSS + JavaScript exceeds 60 KiB; keep the site lightweight');
console.log(`Performance budgets passed: ${Math.round(code/1024)} KiB CSS + JavaScript.`);
