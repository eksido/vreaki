import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const source=(await readFile('public/analytics.js','utf8')).replace('export function track','function track');
function fixture({origin='https://vreaki.vercel.app',id='G-TEST',saved=null}={}){
  const listeners={},scripts=[],storage=new Map(saved?[['vreaki-analytics-consent-v1',JSON.stringify(saved)]]:[]);
  const button=key=>({addEventListener:(event,fn)=>listeners[key]=fn,focus(){}});
  const panel={hidden:true,querySelector:sel=>button(sel)};
  const settings={hidden:true,...button('settings')};
  const document={documentElement:{lang:'en'},title:'Vreaki',cookie:'',querySelector:sel=>sel.startsWith('meta')?{content:id,dataset:{origin:'https://vreaki.vercel.app'}}:sel==='.analytics-consent'?panel:settings,querySelectorAll:()=>[{dataset:{analyticsItem:'package-1'}}],createElement:()=>({}),head:{append:el=>scripts.push(el)}};
  const location={origin,pathname:'/en/',search:'?email=private@example.com',hash:'#private',hostname:'vreaki.vercel.app',reload(){location.reloaded=true;}};
  const context={document,location,window:{},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)}};
  vm.createContext(context);vm.runInContext(source,context);
  return {...context,context,listeners,panel,settings,scripts,track:(name,item)=>context.track(name,item)};
}
test('denial sends nothing; consent emits one clean pageview and safe events; withdrawal unloads tag',()=>{
  const f=fixture(); assert.equal(f.panel.hidden,false);f.track('enquiry_prepared');assert.equal(f.window.dataLayer,undefined);
  f.listeners['[data-consent="no"]']();assert.equal(f.scripts.length,0);
  f.listeners.settings();f.listeners['[data-consent="yes"]']();assert.equal(f.scripts.length,1);
  f.track('select_package','package-1');f.track('enquiry_prepared','private@example.com');f.track('invented_event');
  const events=f.window.dataLayer.filter(e=>e[0]==='event');assert.deepEqual(Array.from(events,e=>e[1]),['page_view','select_package','enquiry_prepared']);
  assert(!JSON.stringify(f.window.dataLayer).includes('private'));assert.equal(events[1][2].item_id,'package-1');
  f.listeners['[data-consent="yes"]']();assert.equal(f.scripts.length,1);
  f.listeners['[data-consent="no"]']();assert.equal(f.window['ga-disable-G-TEST'],true);assert.equal(f.location.reloaded,true);
  const length=f.window.dataLayer.length;f.track('enquiry_prepared');assert.equal(f.window.dataLayer.length,length);
});
test('local and preview hosts cannot send production events, even with saved consent',()=>{
  for(const opts of [{origin:'http://localhost:3000'},{origin:'https://preview.vercel.app'},{id:''}]){
    const f=fixture({...opts,saved:{value:true,expires:Date.now()+100000}});f.track('enquiry_prepared');assert.equal(f.scripts.length,0);assert.equal(f.settings.hidden,opts.id==='');
  }
});
test('saved choices expire and denied visitors remain untracked',()=>{
  const declined=fixture({saved:{value:false,expires:Date.now()+100000}});assert.equal(declined.panel.hidden,true);assert.equal(declined.scripts.length,0);
  const expired=fixture({saved:{value:true,expires:0}});assert.equal(expired.panel.hidden,false);assert.equal(expired.scripts.length,0);
});
