export function renderAbout(site, page, lang, esc) {
  const h = page.home;
  const about = page.about;
  const other = lang === 'de' ? 'en' : 'de';
  const otherAbout = site.pages[other].about.path;
  const homePath = page.path;
  const form = about.contactForm;
  const button = (label, href, primary = false) => `<a class="button${primary ? ' primary' : ''}" href="${href}">${esc(label)}</a>`;
  const lines = value => esc(value).replaceAll('\n','<br>');
  const faqAnswer = value => esc(value).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replaceAll('\n\n', '<br><br>');
  const spacedWord = word => /[.,]$/.test(word) ? `${esc(word.slice(0,-1))}<i class="${word.endsWith(',') ? 'comma' : 'period'}">${esc(word.at(-1))}</i>` : esc(word);
  return `
  <a class="skip-link" href="#content">${lang === 'de' ? 'Zum Inhalt' : 'Skip to content'}</a>
  <header class="site-header about-header" id="top">
    <a class="brand" href="${homePath}"><span>${esc(site.wordmark)}</span><small>${esc(h.hero.label)}</small></a>
    <nav aria-label="${lang === 'de' ? 'Hauptnavigation' : 'Main navigation'}">
      <a href="${homePath}#services">${esc(h.nav.work)}</a><a href="${homePath}#services">${esc(h.nav.services)}</a><a href="${about.path}">${esc(h.nav.about)}</a><a href="#contact">${esc(h.nav.contact)}</a>
      <a class="language" href="${otherAbout}" lang="${other}" hreflang="${other}" aria-label="${other === 'en' ? 'Switch to English' : 'Auf Deutsch wechseln'}">${other.toUpperCase()}</a>
    </nav>
    <a class="header-cta" href="#contact">${esc(h.hero.primary)}</a>
  </header>
  <main id="content" class="about-page cs-about-page">
    <section class="cs-intro" aria-labelledby="about-title">
      <p class="eyebrow">${esc(about.studioLabel)}</p>
      <div class="cs-intro-content">
        <h1 id="about-title"><span>${esc(about.studioTitle)}</span></h1>
        <p>${esc(about.paragraphs[0])}</p>
      </div>
    </section>
    <section class="cs-scroll-type" aria-labelledby="collab-title">
      <h2 id="collab-title" class="cs-scroll-word">${esc(about.scrollText)}</h2>
    </section>
    <section class="cs-story" aria-labelledby="why-title">
      <div class="cs-story-copy">
        <p class="eyebrow">${esc(about.imageLabel)}</p>
        <h2 id="why-title">${lines(about.proofTitle)}</h2>
        <p>${esc(about.imageText)}</p>
        <strong>${esc(about.proofClosing)}</strong>
      </div>
    </section>
    <section class="about-image-pair" aria-label="${esc(about.officeLabel)}">
      <div class="about-hero-image" aria-hidden="true"></div>
      <div class="about-office-image" aria-hidden="true"></div>
    </section>
    <section class="about-belief-marquee" aria-label="${esc(about.beliefMarquee)}">
      <p class="about-belief-track" aria-hidden="true">${about.beliefMarquee.split(' ').map(word=>`<span>${spacedWord(word)}</span>`).join('')}</p>
    </section>
    <section class="about-quote" aria-labelledby="quote-title">
      <div class="about-quote-portrait" role="img" aria-label="${esc(about.quoteByline)}"></div>
      <figure>
        <p class="eyebrow">${esc(about.quoteLabel)}</p>
        <blockquote id="quote-title">${esc(about.quote)}</blockquote>
        <figcaption>${esc(about.quoteByline)}</figcaption>
      </figure>
    </section>
    <section class="about-work" aria-labelledby="work-title">
      <p class="eyebrow">${esc(about.workLabel)}</p>
      <div class="about-work-content">
        <h2 id="work-title">${esc(about.workTitle)}</h2>
        ${about.workItems.length ? `<div class="about-work-grid">${about.workItems.map(item=>`<article><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></article>`).join('')}</div>` : ''}
        ${about.workTags ? `<p class="about-work-tags">${esc(about.workTags)}</p>` : ''}
        ${about.workNote ? `<p class="about-work-note">${esc(about.workNote)}</p>` : ''}
        <div class="actions">${button(about.workCta, homePath + '#packages', true)}</div>
      </div>
    </section>
    <section class="about-qa" aria-labelledby="qa-title">
      <div class="section-heading"><div><p class="eyebrow">${esc(about.qaLabel)}</p><h2 id="qa-title">${esc(about.qaTitle)}</h2></div></div>
      <div class="qa-list">${about.questions.map(item=>`<details><summary>${esc(item.q)}</summary><p>${faqAnswer(item.a)}</p></details>`).join('')}</div>
    </section>
    <section class="cs-marquee" aria-label="${esc(about.marqueeText)}"><div class="cs-marquee-track" aria-hidden="true">${Array.from({length:8},()=>`<span>${esc(about.marqueeText)} <b>↗</b></span>`).join('')}</div></section>
  </main>
  <footer id="contact" class="site-footer about-footer"><p class="eyebrow">${esc(h.contactLabel)}</p><h2>${esc(h.contactTitle)}</h2><a class="email-link" href="mailto:${esc(site.email)}">${esc(site.email)} <span aria-hidden="true">↗</span></a>
    <div class="actions"><button type="button" class="button" data-open-contact hidden>${esc(form.open)}</button></div>
    <div class="footer-bottom"><span>${esc(site.name)} · ${esc(site.location)}</span><div>${site.socials.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a>`).join('')}<a href="#top">${esc(h.backTop)} ↑</a></div></div><button type="button" class="analytics-settings" hidden>${esc(h.analytics.settings)}</button></footer>
  <dialog class="about-contact-dialog" aria-labelledby="contact-dialog-title" aria-describedby="contact-pending">
    <button type="button" class="contact-close" aria-label="${esc(form.close)}"><span aria-hidden="true">×</span></button>
    <p class="contact-greeting">${esc(form.greeting)}</p>
    <h2 id="contact-dialog-title">${esc(form.title)}</h2>
    <form class="about-contact-form" aria-describedby="contact-pending">
      <label>${esc(form.name)} *<input name="name" autocomplete="name" required maxlength="100"></label>
      <div class="contact-field-pair">
        <label>${esc(form.email)} *<input name="email" type="email" autocomplete="email" required maxlength="254"></label>
        <label>${esc(form.phone)}<input name="phone" type="tel" autocomplete="tel" maxlength="40"></label>
      </div>
      <label>${esc(form.location)}<input name="location" autocomplete="address-level2" maxlength="160"></label>
      <label>${esc(form.website)}<input name="website" maxlength="250"></label>
      <label>${esc(form.message)} *<textarea name="message" rows="2" required maxlength="2000"></textarea></label>
      <div class="contact-field-pair contact-options">
        <fieldset><legend>${esc(form.services)}</legend>${h.services.map(s=>`<label><input type="checkbox" name="service" value="${esc(s.id)}">${esc(s.label)}</label>`).join('')}</fieldset>
        <fieldset><legend>${esc(form.source)}</legend>${form.sources.map((source,i)=>`<label><input type="radio" name="source" value="${i}">${esc(source)}</label>`).join('')}</fieldset>
      </div>
      <p id="contact-pending" class="contact-pending">${esc(form.pending)} <a href="mailto:${esc(site.email)}">${esc(site.email)}</a></p>
      <button class="contact-submit" type="submit" disabled>${esc(form.send)}</button>
    </form>
  </dialog>
  <aside class="analytics-consent" hidden aria-labelledby="analytics-title">
    <h2 id="analytics-title">${esc(h.analytics.title)}</h2>
    <p>${esc(h.analytics.text)} <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">${esc(h.analytics.privacy)}</a></p>
    <div class="actions"><button type="button" class="button" data-consent="no">${esc(h.analytics.decline)}</button><button type="button" class="button" data-consent="yes">${esc(h.analytics.accept)}</button></div>
  </aside>`;
}
