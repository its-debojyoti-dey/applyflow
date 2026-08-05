import { processJobCardsForBlocklist } from './modules/companyBlocker';
import { injectRecruiterOutreachBanner } from './modules/recruiterCard';
import { translateEasyApplyForm } from './modules/translator';
import { ensureTimeFilterPreserved } from './modules/timeFilter';
import { LINKEDIN_SELECTORS } from '../shared/constants';

function runModulesSweep() {
  ensureTimeFilterPreserved();
  const cards = Array.from(document.querySelectorAll<HTMLElement>(LINKEDIN_SELECTORS.jobCard));
  if (cards.length > 0) {
    processJobCardsForBlocklist(cards);
  }
  injectRecruiterOutreachBanner();
  translateEasyApplyForm();
}

function initApplyFlow() {
  // Initial immediate sweep
  runModulesSweep();

  // MutationObserver sweep for dynamic scroll & updates
  const observer = new MutationObserver(() => {
    runModulesSweep();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Fallback periodic sweep every 1.5s to handle dynamic AJAX loading
  setInterval(runModulesSweep, 1500);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApplyFlow);
} else {
  initApplyFlow();
}
