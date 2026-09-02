import { getStorage, saveAppliedJob, removeAppliedJob, saveNoEmailJob, removeNoEmailJob } from '../../shared/storage';
import { AppliedJobRecord } from '../../shared/types';

const APPLIED_BUTTON_CLASS = 'applyflow-yc-applied-btn';
const NOEMAIL_BUTTON_CLASS = 'applyflow-yc-noemail-btn';
const CONTAINER_CLASS = 'applyflow-yc-btn-group';

export async function processYcCompanyCards(): Promise<void> {
  // YC Company card links match href="/companies/<slug>"
  const companyCards = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('a[href^="/companies/"]')
  ).filter((a) => {
    const href = a.getAttribute('href') || '';
    // Exclude root /companies links or filter links
    return href !== '/companies' && !href.startsWith('/companies?');
  });

  if (companyCards.length === 0) return;

  const storage = await getStorage();
  const appliedStore = storage.appliedJobs || {};
  const noEmailStore = storage.noEmailJobs || {};

  companyCards.forEach((card) => {
    const href = card.getAttribute('href') || '';
    const slugMatch = href.match(/\/companies\/([^\/\?]+)/);
    if (!slugMatch) return;

    const slug = slugMatch[1];
    const jobId = `yc-${slug}`;
    const isApplied = Boolean(appliedStore[jobId]);
    const isNoEmail = Boolean(noEmailStore[jobId]);

    // Extract metadata
    const nameElem = card.querySelector<HTMLElement>('span[class*="_coName_"]') || card.querySelector<HTMLElement>('span');
    const locationElem = card.querySelector<HTMLElement>('span[class*="_coLocation_"]');
    const companyName = nameElem?.textContent?.trim() || slug;
    const location = locationElem?.textContent?.trim() || 'Remote / Unspecified';
    const fullUrl = `https://www.ycombinator.com${href}`;

    // Apply card opacity styling based on state
    if (isApplied) {
      card.style.opacity = '0.4';
      card.style.filter = 'grayscale(60%)';
      card.setAttribute('data-applyflow-applied', 'true');
      card.removeAttribute('data-applyflow-noemail');
    } else if (isNoEmail) {
      card.style.opacity = '0.75';
      card.style.filter = 'none';
      card.setAttribute('data-applyflow-noemail', 'true');
      card.removeAttribute('data-applyflow-applied');
    } else {
      card.style.opacity = '1';
      card.style.filter = 'none';
      card.removeAttribute('data-applyflow-applied');
      card.removeAttribute('data-applyflow-noemail');
    }

    // Get or create button container
    let btnGroup = card.querySelector<HTMLElement>(`.${CONTAINER_CLASS}`);
    if (!btnGroup) {
      const flexRightContainer =
        card.querySelector<HTMLElement>('.flex.flex-1.items-center.justify-between') ||
        card.querySelector<HTMLElement>('.relative.flex') ||
        card;

      btnGroup = document.createElement('div');
      btnGroup.className = CONTAINER_CLASS;
      btnGroup.style.display = 'inline-flex';
      btnGroup.style.alignItems = 'center';
      btnGroup.style.gap = '6px';
      btnGroup.style.marginLeft = 'auto';
      btnGroup.style.marginRight = '8px';
      btnGroup.style.zIndex = '20';
      btnGroup.style.flexShrink = '0';

      flexRightContainer.appendChild(btnGroup);
    }

    // 1. Applied Button
    let appliedBtn = btnGroup.querySelector<HTMLButtonElement>(`.${APPLIED_BUTTON_CLASS}`);
    if (!appliedBtn) {
      appliedBtn = document.createElement('button');
      appliedBtn.className = APPLIED_BUTTON_CLASS;
      appliedBtn.type = 'button';

      appliedBtn.addEventListener('click', async (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const currentStorage = await getStorage();
        const currentlyApplied = Boolean(currentStorage.appliedJobs[jobId]);

        if (currentlyApplied) {
          await removeAppliedJob(jobId);
          updateAppliedButtonUI(appliedBtn!, false);
          updateCardOpacity(card, false, Boolean(currentStorage.noEmailJobs?.[jobId]));
        } else {
          const record: AppliedJobRecord = {
            jobId,
            title: 'YC Startup Application',
            company: companyName,
            location: location,
            url: fullUrl,
            appliedAt: Date.now(),
          };
          await saveAppliedJob(record);
          updateAppliedButtonUI(appliedBtn!, true);
          updateCardOpacity(card, true, Boolean(currentStorage.noEmailJobs?.[jobId]));
        }
      });

      btnGroup.appendChild(appliedBtn);
    }
    updateAppliedButtonUI(appliedBtn, isApplied);

    // 2. No Email Button
    let noEmailBtn = btnGroup.querySelector<HTMLButtonElement>(`.${NOEMAIL_BUTTON_CLASS}`);
    if (!noEmailBtn) {
      noEmailBtn = document.createElement('button');
      noEmailBtn.className = NOEMAIL_BUTTON_CLASS;
      noEmailBtn.type = 'button';

      noEmailBtn.addEventListener('click', async (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const currentStorage = await getStorage();
        const currentlyNoEmail = Boolean(currentStorage.noEmailJobs?.[jobId]);

        if (currentlyNoEmail) {
          await removeNoEmailJob(jobId);
          updateNoEmailButtonUI(noEmailBtn!, false);
          updateCardOpacity(card, Boolean(currentStorage.appliedJobs?.[jobId]), false);
        } else {
          const record: AppliedJobRecord = {
            jobId,
            title: 'YC Startup Application',
            company: companyName,
            location: location,
            url: fullUrl,
            appliedAt: Date.now(),
          };
          await saveNoEmailJob(record);
          updateNoEmailButtonUI(noEmailBtn!, true);
          updateCardOpacity(card, Boolean(currentStorage.appliedJobs?.[jobId]), true);
        }
      });

      btnGroup.appendChild(noEmailBtn);
    }
    updateNoEmailButtonUI(noEmailBtn, isNoEmail);
  });
}

function updateCardOpacity(card: HTMLElement, isApplied: boolean, isNoEmail: boolean): void {
  if (isApplied) {
    card.style.opacity = '0.4';
    card.style.filter = 'grayscale(60%)';
    card.setAttribute('data-applyflow-applied', 'true');
    card.removeAttribute('data-applyflow-noemail');
  } else if (isNoEmail) {
    card.style.opacity = '0.75';
    card.style.filter = 'none';
    card.setAttribute('data-applyflow-noemail', 'true');
    card.removeAttribute('data-applyflow-applied');
  } else {
    card.style.opacity = '1';
    card.style.filter = 'none';
    card.removeAttribute('data-applyflow-applied');
    card.removeAttribute('data-applyflow-noemail');
  }
}

function applyCommonButtonStyles(btn: HTMLButtonElement): void {
  btn.style.padding = '5px 12px';
  btn.style.borderRadius = '9999px';
  btn.style.fontSize = '12px';
  btn.style.fontWeight = '600';
  btn.style.cursor = 'pointer';
  btn.style.display = 'inline-flex';
  btn.style.alignItems = 'center';
  btn.style.gap = '4px';
  btn.style.transition = 'all 0.2s ease-in-out';
  btn.style.outline = 'none';
  btn.style.flexShrink = '0';
}

function updateAppliedButtonUI(btn: HTMLButtonElement, isApplied: boolean): void {
  applyCommonButtonStyles(btn);
  if (isApplied) {
    btn.textContent = '✓ Applied';
    btn.style.backgroundColor = '#10b981';
    btn.style.color = '#ffffff';
    btn.style.border = '1px solid #059669';
    btn.style.boxShadow = '0 1px 2px rgba(16, 185, 129, 0.3)';
  } else {
    btn.textContent = '+ Applied';
    btn.style.backgroundColor = '#ecfdf5';
    btn.style.color = '#047857';
    btn.style.border = '1px solid #6ee7b7';
    btn.style.boxShadow = 'none';
  }
}

function updateNoEmailButtonUI(btn: HTMLButtonElement, isNoEmail: boolean): void {
  applyCommonButtonStyles(btn);
  if (isNoEmail) {
    btn.textContent = '✓ No Email';
    btn.style.backgroundColor = '#f59e0b';
    btn.style.color = '#ffffff';
    btn.style.border = '1px solid #d97706';
    btn.style.boxShadow = '0 1px 2px rgba(245, 158, 11, 0.3)';
  } else {
    btn.textContent = '+ No Email';
    btn.style.backgroundColor = '#fffbeb';
    btn.style.color = '#b45309';
    btn.style.border = '1px solid #fde68a';
    btn.style.boxShadow = 'none';
  }
}
