// Basic consent mode: no Google request or event queue before opt-in.
const config = document.querySelector('meta[name="vreaki-analytics"]');
const panel = document.querySelector('.analytics-consent');
const settings = document.querySelector('.analytics-settings');
const id = config?.content;
const enabled = Boolean(id && location.origin === config.dataset.origin);
const key = 'vreaki-analytics-consent-v1';
let consent = false;
let loaded = false;
function gtag() { (window.dataLayer ||= []).push(arguments); }
const locationSafe = location.origin + location.pathname;
const language = document.documentElement.lang;
const events = new Set(['select_service','select_package','enquiry_prepared','email_app_open','enquiry_copied','contact_email_click','social_click']);
const items = new Set([...document.querySelectorAll('[data-analytics-item]')].map(el=>el.dataset.analyticsItem));
export function track(name, item) {
  if (!enabled || !consent || !events.has(name)) return;
  const params = {language, page_location:locationSafe};
  if (items.has(item)) params.item_id = item;
  gtag('event', name, params);
}
function start() {
  if (!enabled || loaded || !consent) return;
  loaded = true;
  window[`ga-disable-${id}`] = false;
  gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  gtag('consent','update',{analytics_storage:'granted'});
  gtag('js',new Date());
  gtag('config',id,{send_page_view:false,page_location:locationSafe,page_referrer:'',allow_google_signals:false,allow_ad_personalization_signals:false,cookie_expires:15552000});
  gtag('event','page_view',{page_location:locationSafe,page_referrer:'',page_title:document.title,language});
  const script=document.createElement('script');
  script.async=true;
  script.src=`https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.append(script);
}
function remember(value) {
  try { localStorage.setItem(key,JSON.stringify({value,expires:Date.now()+15552000000})); } catch { /* Session-only choice if storage is unavailable. */ }
}
function clearCookies() {
  for(const entry of document.cookie.split(';')) {
    const name=entry.split('=')[0].trim();
    if(!/^_ga(?:_|$)/.test(name))continue;
    const parts=location.hostname.split('.');
    document.cookie=`${name}=; Max-Age=0; Path=/`;
    for(let i=0;i<parts.length-1;i++)document.cookie=`${name}=; Max-Age=0; Path=/; Domain=.${parts.slice(i).join('.')}`;
  }
}
function choose(value) {
  consent=value;
  remember(value);
  panel.hidden=true;
  settings.focus({preventScroll:true});
  if(value) start();
  else {
    window[`ga-disable-${id}`]=true;
    clearCookies();
    // Unload the already-running library; future pages remain completely untracked.
    if(loaded) location.reload();
  }
}
if (id) {
  settings.hidden=false;
  let saved;
  try {saved=JSON.parse(localStorage.getItem(key));}catch{}
  if(saved && saved.expires>Date.now() && typeof saved.value==='boolean'){
    consent=saved.value;
    if(consent)start();
  } else panel.hidden=false;
  settings.addEventListener('click',()=>{panel.hidden=false;panel.querySelector('button').focus();});
  panel.querySelector('[data-consent="yes"]').addEventListener('click',()=>choose(true));
  panel.querySelector('[data-consent="no"]').addEventListener('click',()=>choose(false));
}
