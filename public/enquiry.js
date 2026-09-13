// Pure formatting function: no network requests, storage or automatic email sending.
export function createEnquiry(recipient, subjectPrefix, fields, language) {
  const de = language === 'de';
  const name = fields.name.trim();
  const email = fields.email.trim();
  const message = fields.message.trim();
  if (!name || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10 || message.length > 1200) throw new Error('Invalid enquiry');
  const subject = `${subjectPrefix} — ${fields.package || fields.brand.trim() || name}`;
  const body = `${de?'Name':'Name'}: ${name}\n${de?'E-Mail':'Email'}: ${email}\n${de?'Marke / Website':'Brand / website'}: ${fields.brand.trim() || '—'}\n${de?'Interesse':'Interested in'}: ${fields.package || '—'}\n\n${message}`;
  return {subject,body,href:`mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`};
}
