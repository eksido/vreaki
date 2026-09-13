const root = document.documentElement;
const video = document.querySelector('.hero-video');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const toggles = [...document.querySelectorAll('.motion-toggle')];
let heroVisible = true;
let paused = motion.matches || Boolean(navigator.connection?.saveData);
function syncMotion() {
  document.body.classList.toggle('motion-paused', paused);
  toggles.forEach(toggle => {
    toggle.textContent = paused ? toggle.dataset.play : toggle.dataset.pause;
    toggle.setAttribute('aria-pressed', String(paused));
  });
  if (paused || !heroVisible || document.hidden) video.pause();
  else {
    video.style.display = 'block';
    if (!video.src) video.src = matchMedia('(max-width: 700px)').matches ? video.dataset.mobileSrc : video.dataset.src;
    video.play().catch(error => {
      if (error.name !== 'AbortError') { paused = true; syncMotion(); }
    });
  }
}
toggles.forEach(toggle => {
  toggle.hidden = false;
  toggle.addEventListener('click', () => {paused = !paused; syncMotion();});
});
motion.addEventListener('change', () => {paused = motion.matches; syncMotion(); setupRail();});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) video.pause();
  else if (!paused && heroVisible) syncMotion();
});
syncMotion();
const heroObserver = new IntersectionObserver(entries => {
  heroVisible = entries[0].isIntersecting;
  syncMotion();
}, {threshold: 0});
heroObserver.observe(document.querySelector('.story-stage'));

const services = document.querySelector('.services');
const scroller = document.querySelector('.service-scroller');
const rail = document.querySelector('.service-rail');
const cards = [...document.querySelectorAll('.service-card')];
const count = document.querySelector('.rail-count');
const previous = document.querySelector('[data-direction="-1"]');
const next = document.querySelector('[data-direction="1"]');
let pinned = false;
let frame = 0;
const clamp = (value,min=0,max=1) => Math.min(Math.max(value,min),max);
function maxTravel(){return Math.max(0,scroller.scrollWidth-scroller.clientWidth);}
function updateCount(){
  const step = cards.length>1 ? cards[1].offsetLeft-cards[0].offsetLeft : 1;
  const index = scroller.scrollLeft >= maxTravel()-2 ? cards.length-1 : clamp(Math.round(scroller.scrollLeft/step),0,cards.length-1);
  const text = `${String(index+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
  if(count.textContent!==text)count.textContent=text;
  previous.disabled = scroller.scrollLeft<2;
  next.disabled = scroller.scrollLeft>=maxTravel()-2;
  root.style.setProperty('--rail-progress',maxTravel() ? scroller.scrollLeft/maxTravel() : 1);
}
function update(){
  frame=0;
  if(pinned)scroller.scrollLeft=clamp(-services.getBoundingClientRect().top,0,maxTravel());
  updateCount();
}
function schedule(){if(!frame)frame=requestAnimationFrame(update);}
function setupRail(){
  pinned = innerWidth>=1000 && innerHeight>=680 && matchMedia('(hover: hover) and (pointer: fine)').matches && !motion.matches;
  services.classList.toggle('is-pinned',pinned);
  services.style.setProperty('--rail-distance',`${maxTravel()}px`);
  schedule();
}
function moveTo(left){
  const target=clamp(left,0,maxTravel());
  if(pinned)window.scrollTo({top:window.scrollY+services.getBoundingClientRect().top+target,behavior:motion.matches?'instant':'smooth'});
  else scroller.scrollTo({left:target,behavior:motion.matches?'instant':'smooth'});
}
document.querySelectorAll('[data-direction]').forEach(button=>button.addEventListener('click',()=>{
  const step=cards[1].offsetLeft-cards[0].offsetLeft;
  moveTo(scroller.scrollLeft+Number(button.dataset.direction)*step);
}));
scroller.addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  const step=cards[1].offsetLeft-cards[0].offsetLeft;
  moveTo(event.key==='Home'?0:event.key==='End'?maxTravel():scroller.scrollLeft+(event.key==='ArrowRight'?step:-step));
});
scroller.addEventListener('focusin',event=>{
  if(!pinned)return;
  const card=event.target.closest('.service-card');
  if(card)moveTo(card.offsetLeft-cards[0].offsetLeft);
});
window.addEventListener('scroll',()=>{if(pinned)schedule();},{passive:true});
window.addEventListener('resize',setupRail);
scroller.addEventListener('scroll',updateCount,{passive:true});
document.fonts.ready.then(setupRail);
setupRail();

// Package buttons select the correct enquiry, then use native anchor navigation.
import { createEnquiry } from './enquiry.js';
const form = document.querySelector('.enquiry-form');
const result = form.querySelector('.enquiry-result');
document.querySelectorAll('[data-enquiry]').forEach(link=>link.addEventListener('click',()=>{
  form.elements.package.value=link.dataset.enquiry;
  result.hidden=true;
}));
form.addEventListener('input',()=>{result.hidden=true;});
form.addEventListener('submit',event=>{
  event.preventDefault();
  if(!form.reportValidity())return;
  const fields=Object.fromEntries(new FormData(form));
  let enquiry;
  try {enquiry=createEnquiry(form.dataset.recipient,form.dataset.subject,fields,document.documentElement.lang);}
  catch {form.elements.message.setCustomValidity(document.documentElement.lang==='de'?'Bitte gib mindestens 10 Zeichen und einen gültigen Namen ein.':'Please enter at least 10 characters and a valid name.');form.reportValidity();return;}
  form.querySelector('.email-preview').value=`${enquiry.subject}\n\n${enquiry.body}`;
  form.querySelector('.email-draft').href=enquiry.href;
  form.querySelector('.copy-status').textContent='';
  result.hidden=false;
  result.scrollIntoView({behavior:motion.matches?'instant':'smooth',block:'nearest'});
});
form.elements.message.addEventListener('input',()=>form.elements.message.setCustomValidity(''));
form.elements.name.addEventListener('input',()=>form.elements.message.setCustomValidity(''));
form.querySelector('.copy-enquiry').addEventListener('click',async()=>{
  try {await navigator.clipboard.writeText(form.querySelector('.email-preview').value);form.querySelector('.copy-status').textContent=form.dataset.copied;}
  catch {form.querySelector('.email-preview').select();form.querySelector('.copy-status').textContent=form.dataset.copyError;}
});
