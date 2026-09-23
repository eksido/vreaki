const section = document.querySelector('.cs-scroll-type');
const word = section?.querySelector('.cs-scroll-word');

if (word) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;

  function update() {
    frame = 0;
    if (reducedMotion.matches || navigator.connection?.saveData) {
      word.style.removeProperty('--scroll-x');
      section.style.overflowX = 'auto';
      return;
    }
    section.style.overflowX = 'hidden';
    const rect = section.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (innerHeight - rect.top) / (innerHeight + rect.height)));
    const start = section.clientWidth * 0.2;
    const end = Math.min(0, section.clientWidth - word.scrollWidth);
    word.style.setProperty('--scroll-x', `${start + (end - start) * progress}px`);
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  reducedMotion.addEventListener('change', schedule);
  new ResizeObserver(schedule).observe(section);
  document.fonts.ready.then(schedule);
  schedule();
}
