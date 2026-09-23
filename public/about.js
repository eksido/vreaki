import './about-scroll.js';
import { track } from './analytics.js';

const dialog = document.querySelector('.about-contact-dialog');
const opener = document.querySelector('[data-open-contact]');
opener.hidden = false;
opener.addEventListener('click', () => dialog.showModal());
dialog.querySelector('.contact-close').addEventListener('click', () => dialog.close());
// This local preview must never submit personal data before delivery is configured.
dialog.querySelector('form').addEventListener('submit', event => event.preventDefault());
document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
  link.addEventListener('click', () => track('contact_email_click'));
});
document.querySelectorAll('.footer-bottom a[target="_blank"]').forEach(link => {
  link.addEventListener('click', () => track('social_click'));
});
