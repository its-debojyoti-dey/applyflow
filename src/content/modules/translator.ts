const COMMON_DICTIONARY: Record<string, string> = {
  'berufserfahrung': 'Work Experience',
  'ausbildung': 'Education',
  'telefonnummer': 'Phone Number',
  'sprachen': 'Languages',
  'gehaltsvorstellung': 'Expected Salary',
  'expérience': 'Experience',
  'numéro de téléphone': 'Phone Number',
  'experiencia': 'Experience',
  'teléfono': 'Phone',
};

export function translateEasyApplyForm(): void {
  const modal = document.querySelector('.jobs-easy-apply-modal');
  if (!modal) return;

  const labels = modal.querySelectorAll('label');
  labels.forEach((label) => {
    if (label.dataset.applyflowTranslated) return;

    const originalText = label.textContent?.trim() || '';
    const lowerText = originalText.toLowerCase();

    for (const [key, val] of Object.entries(COMMON_DICTIONARY)) {
      if (lowerText.includes(key)) {
        const badge = document.createElement('span');
        badge.textContent = ` 🌐 [${val}]`;
        badge.style.cssText = 'color: #2563eb; font-weight: 600; font-size: 11px; margin-left: 4px;';
        label.appendChild(badge);
        break;
      }
    }

    label.dataset.applyflowTranslated = 'true';
  });
}
