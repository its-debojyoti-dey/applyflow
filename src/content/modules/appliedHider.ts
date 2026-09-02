import { getStorage, saveAppliedJob } from '../../shared/storage';
import { LINKEDIN_SELECTORS } from '../../shared/constants';
import { AppliedJobRecord } from '../../shared/types';

export async function processAppliedJobs(cards: HTMLElement[]): Promise<void> {
  const storage = await getStorage();
  const appliedStore = storage.appliedJobs || {};

  cards.forEach((card) => {
    const componentKey = card.getAttribute('componentkey') || '';
    const matchKey = componentKey.match(/job-card-component-ref-(\d+)/);
    const jobId = card.dataset.jobId || card.dataset.occludableJobId || (matchKey ? matchKey[1] : '');

    // Check if card contains "Applied" status text in footer, badge or text content
    const footerItems = Array.from(card.querySelectorAll(LINKEDIN_SELECTORS.appliedBadge));
    const isAppliedBadge =
      footerItems.some((item) => item.textContent?.trim().toLowerCase().includes('applied')) ||
      Array.from(card.querySelectorAll('p, span')).some((el) => el.textContent?.trim().toLowerCase() === 'applied');

    const isAlreadyStored = jobId && Boolean(appliedStore[jobId]);

    if (isAppliedBadge || isAlreadyStored) {
      card.dataset.applied = 'true';

      // Automatically capture & store application record if not already stored
      if (jobId && !isAlreadyStored) {
        const titleElem = card.querySelector(LINKEDIN_SELECTORS.jobTitle);
        const companyElem = card.querySelector(LINKEDIN_SELECTORS.companyName);
        const locationElem = card.querySelector('.job-card-container__metadata-wrapper li, [class*="metadata"] li, p[class*="e01bf4c6"]');

        const record: AppliedJobRecord = {
          jobId,
          title: titleElem?.textContent?.trim() || 'Applied Position',
          company: companyElem?.textContent?.trim() || 'Company',
          location: locationElem?.textContent?.trim() || 'Remote / Unspecified',
          url: `https://www.linkedin.com/jobs/view/${jobId}/`,
          appliedAt: Date.now(),
        };

        saveAppliedJob(record);
      }

      // Hide or dim applied card based on setting
      if (storage.settings.autoHideApplied) {
        card.style.display = 'none';
      } else {
        card.style.opacity = '0.35';
        card.style.filter = 'grayscale(80%)';
      }
    }
  });
}

/**
 * Scans active job detail panel for recent "Applied" confirmations and auto-logs them
 */
export async function autoLogActiveJobApplication(): Promise<void> {
  const appliedFeedback = document.querySelector('.jobs-s-apply .artdeco-inline-feedback--success, .jobs-s-apply__application-link');
  if (!appliedFeedback) return;

  const urlParams = new URLSearchParams(window.location.search);
  const currentJobId = urlParams.get('currentJobId') || window.location.pathname.match(/\/view\/(\d+)/)?.[1];
  if (!currentJobId) return;

  const storage = await getStorage();
  if (storage.appliedJobs[currentJobId]) return; // Already logged

  const titleElem = document.querySelector('.jobs-unified-top-card__job-title, .job-details-jobs-unified-top-card__job-title, a[href*="/jobs/view/"]');
  const companyElem = document.querySelector('.jobs-unified-top-card__company-name, .job-details-jobs-unified-top-card__company-name, a[href*="/company/"]');
  const locationElem = document.querySelector('.jobs-unified-top-card__bullet, .job-details-jobs-unified-top-card__tertiary-description-container span, p[class*="e01bf4c6"]');

  const record: AppliedJobRecord = {
    jobId: currentJobId,
    title: titleElem?.textContent?.trim() || 'Applied Position',
    company: companyElem?.textContent?.trim() || 'Company',
    location: locationElem?.textContent?.trim() || 'Remote / Unspecified',
    url: window.location.href,
    appliedAt: Date.now(),
  };

  await saveAppliedJob(record);
}
