import { getStorage } from '../../shared/storage';

// High-frequency offline dictionary patterns for Spanish, German, French, Italian, Portuguese, Dutch
const PHRASE_DICTIONARY: Array<{ pattern: RegExp; translation: string }> = [
  // Headers & Controls
  { pattern: /preguntas adicionales/i, translation: 'Additional Questions' },
  { pattern: /selecciona una opci[oó]n/i, translation: 'Select an option' },
  { pattern: /w[aä]hlen sie eine option/i, translation: 'Select an option' },
  { pattern: /s[eé]lectionnez une option/i, translation: 'Select an option' },
  
  // Availability & Notice Period
  { pattern: /(disponibilidad|incorporaci[oó]n|cu[aá]les tu disponibilidad)/i, translation: 'Current availability / Notice period (total days)' },
  { pattern: /(k[uü]ndigungsfrist|verf[uü]gbarkeit|ab wann)/i, translation: 'Notice period / Start date availability' },
  { pattern: /(pr[eé]avis|disponibilit[eé])/i, translation: 'Notice period / Availability' },
  
  // Salary Expectations
  { pattern: /(expectativas salariales|salario|remuneraci[oó]n)/i, translation: 'Salary Expectations (Annual Gross)' },
  { pattern: /(gehaltsvorstellung|wunschgehalt|brutto)/i, translation: 'Expected Salary (Annual Gross)' },
  { pattern: /(pr[eé]tentions salariales|pr[eé]tentions de salaire)/i, translation: 'Salary Expectations' },
  
  // Qualifications & Degree
  { pattern: /(titulaci[oó]n|universitaria|ingenier[ií]a|matem[aá]ticas|f[ií]sica)/i, translation: 'University Degree in Computer Eng / Science / Math / Physics' },
  { pattern: /(hochschulabschluss|universit[aä]tsabschluss|abschluss)/i, translation: 'University Degree / Qualification' },
  { pattern: /(dipl[oô]me|formation universitaire)/i, translation: 'University Degree' },
  
  // Experience & Skills
  { pattern: /(experiencia|a[nñ]os de experiencia)/i, translation: 'Years of Experience' },
  { pattern: /(berufserfahrung|erfahrung in jahren)/i, translation: 'Work Experience (Years)' },
  { pattern: /(exp[eé]rience)/i, translation: 'Work Experience' },
  
  // Common Select & Checkbox Options
  { pattern: /^(s[ií]|ja|oui)$/i, translation: 'Yes' },
  { pattern: /^(nein|non)$/i, translation: 'No' },
];

const translationCache = new Map<string, string>();

async function fetchOnlineTranslation(text: string): Promise<string | null> {
  if (translationCache.has(text)) {
    return translationCache.get(text) || null;
  }

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=autodetect|en`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (translated && translated !== text) {
      translationCache.set(text, translated);
      return translated;
    }
  } catch {
    // Return null on network error
  }
  return null;
}

export async function translateEasyApplyForm(): Promise<void> {
  const storage = await getStorage();
  if (!storage.settings.autoTranslateForms) return;

  const modal = document.querySelector('.jobs-easy-apply-modal, div[role="dialog"]');
  if (!modal) return;

  // Query all potential text elements in the form
  const targets = modal.querySelectorAll<HTMLElement>(
    'h2, h3, h4, label, legend, option, .fb-dash-form-element__label, span[class*="label"], div[class*="form-element"] span'
  );

  for (const elem of Array.from(targets)) {
    if (elem.dataset.applyflowTranslated) continue;

    const originalText = elem.textContent?.trim() || '';
    if (!originalText || originalText.length < 2) continue;

    // Check if phrase is non-English or matches pattern
    let matchedTranslation: string | null = null;

    // 1. Offline phrase dictionary match
    for (const item of PHRASE_DICTIONARY) {
      if (item.pattern.test(originalText)) {
        matchedTranslation = item.translation;
        break;
      }
    }

    // 2. Online API fallback for longer custom questions if offline dictionary didn't match
    if (!matchedTranslation && originalText.length > 15 && /[áéíóúñäöüßàèìòù]/i.test(originalText)) {
      matchedTranslation = await fetchOnlineTranslation(originalText);
    }

    if (matchedTranslation) {
      if (elem.tagName === 'OPTION') {
        elem.textContent = `${originalText} (${matchedTranslation})`;
      } else {
        const badge = document.createElement('div');
        badge.className = 'applyflow-translation-badge';
        badge.textContent = `🌐 [English: ${matchedTranslation}]`;
        badge.style.cssText = `
          color: #2563eb;
          font-weight: 600;
          font-size: 11px;
          margin-top: 3px;
          margin-bottom: 2px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          padding: 2px 6px;
          border-radius: 4px;
          display: inline-block;
        `;
        elem.insertAdjacentElement('afterend', badge);
      }
    }

    elem.dataset.applyflowTranslated = 'true';
  }
}
