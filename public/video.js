const video = document.querySelector('video');
const button = document.querySelector('.video-toggle');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
function sync() {
  button.textContent = video.paused ? button.dataset.play : button.dataset.pause;
  button.setAttribute('aria-label', button.textContent);
}
if (!motion.matches && !navigator.connection?.saveData) {
  video.src = video.dataset.src;
  video.play().catch(sync);
}
button.hidden = false;
button.addEventListener('click', () => {
  if (!video.src) video.src = video.dataset.src;
  if (video.paused) { video.style.display = 'block'; video.play().catch(sync); }
  else video.pause();
});
motion.addEventListener('change', () => { if (motion.matches) video.pause(); });
video.addEventListener('play', sync);
video.addEventListener('pause', sync);
sync();
