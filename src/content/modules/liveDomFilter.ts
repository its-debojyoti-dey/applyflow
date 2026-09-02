import { getStorage } from '../../shared/storage';
import { LINKEDIN_SELECTORS, COMMON_STAFFING_AGENCIES } from '../../shared/constants';

export interface FilterStats {
  total: number;
  visible: number;
  promoted: number;
  titleMismatch: number;
  agencies: number;
}

let currentStats: FilterStats = {
  total: 0,
  visible: 0,
  promoted: 0,
  titleMismatch: 0,
  agencies: 0,
};

type StatsListener = (stats: FilterStats) => void;
const listeners: Set<StatsListener> = new Set();

export function onFilterStatsChange(cb: StatsListener): () => void {
  listeners.add(cb);
  cb(currentStats);
  return () => listeners.delete(cb);
}

export function getFilterStats(): FilterStats {
  return currentStats;
}

function notifyListeners() {
  for (const cb of listeners) {
    cb(currentStats);
  }
}

/**
 * Checks whether a job card is marked as Promoted/Sponsored by LinkedIn
 */
function isPromotedCard(card: HTMLElement): boolean {
  // Check for badge or text containing 'Promoted'
  const footers = card.querySelectorAll<HTMLElement>(LINKEDIN_SELECTORS.promotedBadge);
  for (const footer of footers) {
    const text = footer.textContent?.trim().toLowerCase() || '';
    if (text === 'promoted' || text.startsWith('promoted by') || text.includes('promoted')) {
      return true;
    }
  }

  // Fallback text search across specific sub-elements
  const subtextElements = card.querySelectorAll<HTMLElement>('.job-card-container__footer-item, .t-12, [class*="footer"]');
  for (const el of subtextElements) {
    if (el.textContent?.trim().toLowerCase() === 'promoted') {
      return true;
    }
  }

  return false;
}

/**
 * Checks whether the job title matches the search keywords strictly
 */
function isTitleMismatch(card: HTMLElement, rawKeywords: string): boolean {
  if (!rawKeywords) return false;

  const titleElem = card.querySelector<HTMLElement>(LINKEDIN_SELECTORS.jobTitle);
  if (!titleElem) return false;

  const titleText = (titleElem.textContent || '').toLowerCase();
  
  // Extract words from search query, removing Boolean syntax and punctuation
  const cleanKeywords = rawKeywords
    .toLowerCase()
    .replace(/[()"]/g, ' ')
    .replace(/\b(and|or|not)\b/g, ' ')
    .trim();

  const words = cleanKeywords.split(/\s+/).filter((w) => w.length > 2);
  if (words.length === 0) return false;

  // Title must match at least the core terms or quoted terms
  // If there are quoted terms in original query, check them strictly
  const quotedMatches = rawKeywords.match(/"([^"]+)"/g);
  if (quotedMatches && quotedMatches.length > 0) {
    for (const q of quotedMatches) {
      const phrase = q.replace(/"/g, '').trim().toLowerCase();
      if (phrase && !titleText.includes(phrase)) {
        return true; // Missing mandatory quoted phrase
      }
    }
    return false;
  }

  // Check if at least 50% of the significant keyword words match the title
  const matched = words.filter((w) => titleText.includes(w));
  return matched.length === 0;
}

/**
 * Checks if the company is a known staffing agency
 */
function isStaffingAgency(card: HTMLElement): boolean {
  const companyElem = card.querySelector<HTMLElement>(LINKEDIN_SELECTORS.companyName);
  if (!companyElem) return false;

  const companyName = (companyElem.textContent || '').toLowerCase().trim();
  if (!companyName) return false;

  return COMMON_STAFFING_AGENCIES.some((agency) => companyName.includes(agency));
}

/**
 * Processes visible job cards for Promoted, Title mismatch, and Staffing agency filters
 */
export async function processJobCardsLiveFilter(cards: HTMLElement[]): Promise<void> {
  const storage = await getStorage();
  const filterSettings = storage.settings.filterBar || {
    enabled: true,
    hidePromoted: true,
    strictTitleMatch: false,
    hideAgencies: true,
  };

  if (!filterSettings.enabled) {
    // Unhide anything previously hidden by live filter
    cards.forEach((card) => {
      if (card.getAttribute('data-applyflow-live-hidden')) {
        card.removeAttribute('data-applyflow-live-hidden');
        if (!card.getAttribute('data-applyflow-applied-hidden') && !card.getAttribute('data-applyflow-blocked-hidden')) {
          card.style.display = '';
        }
      }
    });
    currentStats = { total: cards.length, visible: cards.length, promoted: 0, titleMismatch: 0, agencies: 0 };
    notifyListeners();
    return;
  }

  const url = new URL(window.location.href);
  const rawKeywords = url.searchParams.get('keywords') || '';

  let promotedCount = 0;
  let mismatchCount = 0;
  let agencyCount = 0;
  let visibleCount = 0;

  cards.forEach((card) => {
    let hideReason = '';

    if (filterSettings.hidePromoted && isPromotedCard(card)) {
      hideReason = 'promoted';
      promotedCount++;
    } else if (filterSettings.hideAgencies && isStaffingAgency(card)) {
      hideReason = 'agency';
      agencyCount++;
    } else if (filterSettings.strictTitleMatch && isTitleMismatch(card, rawKeywords)) {
      hideReason = 'title_mismatch';
      mismatchCount++;
    }

    if (hideReason) {
      card.setAttribute('data-applyflow-live-hidden', hideReason);
      card.style.display = 'none';
    } else {
      if (card.getAttribute('data-applyflow-live-hidden')) {
        card.removeAttribute('data-applyflow-live-hidden');
        // Only unhide if not hidden by applied or blocked modules
        if (!card.getAttribute('data-applyflow-applied-hidden') && !card.getAttribute('data-applyflow-blocked-hidden')) {
          card.style.display = '';
        }
      }
      visibleCount++;
    }
  });

  currentStats = {
    total: cards.length,
    visible: visibleCount,
    promoted: promotedCount,
    titleMismatch: mismatchCount,
    agencies: agencyCount,
  };

  notifyListeners();
}
