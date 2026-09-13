export function renderHome(site, page, lang, esc) {
  const h = page.home;
  const other = lang === 'de' ? 'en' : 'de';
  const contact = () => '#contact';
  const formText = key => esc(h.form[key].replaceAll('{email}',site.email));
  const motionButton = extra => `<button class="motion-toggle ${extra}" hidden data-pause="${esc(h.pause)}" data-play="${esc(h.play)}" aria-pressed="false"></button>`;
  const button = (label, href, primary = false) => `<a class="button${primary ? ' primary' : ''}" href="${href}">${esc(label)}<span aria-hidden="true">↗</span></a>`;
  const heroTitle = h.hero.title.split('\n').map(line => `<span>${esc(line)}</span>`).join('');
  return `
  <a class="skip-link" href="#content">${lang === 'de' ? 'Zum Inhalt' : 'Skip to content'}</a>
  <header class="site-header" id="top">
    <a class="brand" href="${page.path}"><span>${esc(site.wordmark)}</span><small>${esc(h.hero.label)}</small></a>
    <nav aria-label="${lang === 'de' ? 'Hauptnavigation' : 'Main navigation'}">
      <a href="#services">${esc(h.nav.work)}</a><a href="#services">${esc(h.nav.services)}</a><a href="#about">${esc(h.nav.about)}</a><a href="#contact">${esc(h.nav.contact)}</a>
      <a class="language" href="${site.pages[other].path}" lang="${other}" hreflang="${other}" aria-label="${other === 'en' ? 'Switch to English' : 'Auf Deutsch wechseln'}">${other.toUpperCase()}</a>
    </nav>
    <a class="header-cta" href="#contact">${esc(h.hero.primary)} <span aria-hidden="true">↗</span></a>
  </header>
  <main id="content">
    <section class="hero" aria-labelledby="hero-title">
      <div class="story-stage">
        <img class="hero-poster" src="${site.poster}" alt="" fetchpriority="high">
        <video class="hero-video" data-src="${site.video}" data-mobile-src="${site.mobileVideo}" poster="${site.poster}" muted loop playsinline autoplay preload="none" aria-hidden="true"></video>
        <div class="shade" aria-hidden="true"></div>
        <div class="hero-copy">
          <p class="eyebrow">${esc(h.hero.label)}</p>
          <h1 id="hero-title">${heroTitle}</h1>
          <p class="dek">${esc(h.hero.description)}</p>
          <div class="actions">${button(h.hero.primary,contact(h.hero.primary),true)}${button(h.hero.secondary,'#services')}</div>
        </div>
        ${motionButton('motion-hero')}
        <span class="scroll-cue" aria-hidden="true">↓</span>
      </div>
      <div class="hero-dock">
        ${h.dock.map((d,i)=>`<a class="dock-card dock-${i}" href="${i ? '#packages' : '#services'}"><span class="eyebrow">${esc(d.label)}</span><h2>${esc(d.title)}</h2>${d.description ? `<p>${esc(d.description)}</p>` : ''}<span class="card-arrow" aria-hidden="true">↗</span></a>`).join('')}
      </div>
    </section>
    <section class="campaign-marquee" aria-label="${esc(h.galleryLabel)}">
      ${motionButton('motion-gallery')}
      <div class="campaign-track" aria-hidden="true">${[...site.media.gallery,...site.media.gallery].map((image,i)=>`<div class="campaign-frame tint-${i%4}"><img src="${image}" alt="" loading="lazy" width="750" height="1000"><span>${esc(site.wordmark)}</span></div>`).join('')}</div>
    </section>
    <section class="services" id="services" aria-labelledby="services-title">
      <div class="services-stage">
        <div class="section-heading"><div><p class="eyebrow">${esc(h.servicesLabel)}</p><h2 id="services-title">${esc(h.servicesTitle)}</h2></div>
          <div class="rail-controls"><button type="button" data-direction="-1" aria-label="${esc(h.previous)}">←</button><span class="rail-count" aria-live="polite">01 / ${String(h.services.length).padStart(2,'0')}</span><button type="button" data-direction="1" aria-label="${esc(h.next)}">→</button></div>
        </div>
        <div class="service-scroller" tabindex="0" role="region" aria-label="${esc(h.nav.services)}">
          <div class="service-rail">${h.services.map((s,i)=>`<article class="service-card tone-${i%4}" id="${s.id}">
            <div class="service-top"><span class="eyebrow">${esc(s.label)}</span><span class="service-number" aria-hidden="true">0${i+1}</span></div>
            <h3>${esc(s.title)}</h3><p>${esc(s.description)}</p><ul class="tags">${s.tags.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>
            <a class="service-cta" data-analytics-item="${s.id}" data-enquiry="${esc(s.label)}" href="${contact(s.label)}">${esc(h.quote)} <span aria-hidden="true">↗</span></a>
          </article>`).join('')}</div>
        </div>
        <div class="rail-progress" aria-hidden="true"><span></span></div>
      </div>
    </section>
    <section class="pricing-section" id="packages" aria-labelledby="packages-title">
      <div class="pricing-head"><div><p class="eyebrow">${esc(h.nav.packages)}</p><h2 id="packages-title">${esc(h.packagesTitle)}</h2></div><p>${esc(h.packagesDescription)}</p></div>
      <div class="pricing-grid">${h.packages.map((p,i)=>`<article class="price-card${p.featured ? ' featured' : ''}"><span class="eyebrow">${esc(p.label)}</span><h3>${esc(p.title)}</h3><div class="price">${site.pricingPublished ? `<small>${esc(h.from)}</small> ${new Intl.NumberFormat(lang,{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(p.price)}` : esc(h.quote)}</div><p>${esc(p.description)}</p><ul>${p.features.map(f=>`<li>${esc(f)}</li>`).join('')}</ul>${button(p.cta,contact(p.title)).replace('<a ',`<a data-analytics-item="package-${i+1}" data-enquiry="${esc(p.title)}" `)}</article>`).join('')}</div>
    </section>
    <section class="about" id="about" aria-label="${esc(site.name)} — ${site.location}"><p class="eyebrow">${esc(site.name)} · ${site.location}</p><div>${page.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}</div></section>
  </main>
  <footer id="contact" class="site-footer"><p class="eyebrow">${esc(h.contactLabel)}</p><h2>${esc(h.contactTitle)}</h2><a class="email-link" href="mailto:${esc(site.email)}">${esc(site.email)} <span aria-hidden="true">↗</span></a>
    <form action="mailto:${esc(site.email)}" method="post" enctype="text/plain" class="enquiry-form" data-recipient="${esc(site.email)}" data-subject="${esc(h.form.subject)}" data-copied="${formText('copied')}" data-copy-error="${esc(h.form.copyError)}" >
      <h3>${esc(h.form.title)}</h3>
      <div class="form-grid"><label>${esc(h.form.name)}<input name="name" autocomplete="name" required maxlength="100"></label><label>${esc(h.form.email)}<input name="email" type="email" autocomplete="email" required maxlength="254"></label><label>${esc(h.form.brand)}<input name="brand" autocomplete="organization" maxlength="160"></label><label>${esc(h.form.package)}<select name="package"><option value="">${esc(h.form.unsure)}</option>${h.packages.map(p=>`<option value="${esc(p.title)}">${esc(p.title)}</option>`).join('')}${h.services.map(s=>`<option value="${esc(s.label)}">${esc(s.label)}</option>`).join('')}</select></label></div>
      <label>${esc(h.form.message)}<textarea name="message" required minlength="10" maxlength="1200" rows="5"></textarea></label>
      <p class="form-note">${formText('note')}</p><button class="button primary" type="submit">${esc(h.form.submit)} <span aria-hidden="true">↗</span></button>
      <div class="enquiry-result" hidden><p class="result-status" role="status">${esc(h.form.ready)}</p><label>${esc(h.form.draft)}<textarea class="email-preview" readonly rows="8"></textarea></label><div class="actions"><a class="button primary email-draft" href="mailto:${esc(site.email)}">${esc(h.form.open)} ↗</a><button class="button copy-enquiry" type="button">${esc(h.form.copy)}</button></div><p class="copy-status" role="status"></p></div>
    </form>
    <div class="footer-bottom"><span>${esc(site.name)} · ${esc(site.location)}</span><div>${site.socials.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a>`).join('')}<a href="#top">${esc(h.backTop)} ↑</a></div></div><button type="button" class="analytics-settings" hidden>${esc(h.analytics.settings)}</button></footer>
  <aside class="analytics-consent" hidden aria-labelledby="analytics-title">
    <h2 id="analytics-title">${esc(h.analytics.title)}</h2>
    <p>${esc(h.analytics.text)} <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">${esc(h.analytics.privacy)}</a></p>
    <div class="actions"><button type="button" class="button" data-consent="no">${esc(h.analytics.decline)}</button><button type="button" class="button" data-consent="yes">${esc(h.analytics.accept)}</button></div>
  </aside>`;
}
