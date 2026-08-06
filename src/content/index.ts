import { processJobCardsForBlocklist } from './modules/companyBlocker';
import { injectRecruiterOutreachBanner } from './modules/recruiterCard';
import { translateEasyApplyForm } from './modules/translator';
import { ensureTimeFilterPreserved } from './modules/timeFilter';
import { processAppliedJobs, autoLogActiveJobApplication } from './modules/appliedHider';
import { LINKEDIN_SELECTORS } from '../shared/constants';

let timerId: ReturnType<typeof setInterval> | null = null;
let domObserver: MutationObserver | null = null;

function isContextValid(): boolean {
  return typeof chrome !== 'undefined' && Boolean(chrome.runtime?.id);
}

function runModulesSweep() {
  if (!isContextValid()) {
    // Extension was reloaded or context invalidated - clean up timers and observers gracefully
    if (timerId) clearInterval(timerId);
    if (domObserver) domObserver.disconnect();
    return;
  }

  ensureTimeFilterPreserved();
  const cards = Array.from(document.querySelectorAll<HTMLElement>(LINKEDIN_SELECTORS.jobCard));
  if (cards.length > 0) {
    processJobCardsForBlocklist(cards);
    processAppliedJobs(cards);
  }
  injectRecruiterOutreachBanner();
  translateEasyApplyForm();
  autoLogActiveJobApplication();
}

function initApplyFlow() {
  if (!isContextValid()) return;

  // Initial immediate sweep
  runModulesSweep();

  // MutationObserver sweep for dynamic scroll & updates
  domObserver = new MutationObserver(() => {
    runModulesSweep();
  });

  domObserver.observe(document.body, { childList: true, subtree: true });

  // Fallback periodic sweep every 1.5s to handle dynamic AJAX loading
  timerId = setInterval(runModulesSweep, 1500);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApplyFlow);
} else {
  initApplyFlow();
}
