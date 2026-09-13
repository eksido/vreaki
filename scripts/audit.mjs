import { spawnSync } from 'node:child_process';
import { mkdir, readFile } from 'node:fs/promises';
const base=process.argv[2] || 'http://localhost:3000';
await mkdir('test-results',{recursive:true});
for(const lang of ['de','en']) for(const device of ['mobile','desktop']) {
  const file=`test-results/lighthouse-${lang}-${device}.json`;
  const url=new URL(lang==='en'?'/en/':'/',base).href;
  const args=['--yes','lighthouse@12.8.2',url,'--quiet','--chrome-flags=--headless --no-sandbox','--only-categories=performance,accessibility,best-practices,seo','--output=json',`--output-path=${file}`];
  if(device==='desktop')args.push('--preset=desktop');
  const run=spawnSync('npx',args,{stdio:'inherit'});
  if(run.status!==0)process.exit(run.status||1);
  const r=JSON.parse(await readFile(file,'utf8'));
  console.log(lang,device,Object.fromEntries(Object.entries(r.categories).map(([k,v])=>[k,Math.round(v.score*100)])),Object.fromEntries(['largest-contentful-paint','cumulative-layout-shift','total-blocking-time'].map(k=>[k,r.audits[k].displayValue])));
}
