export interface ActiveFilterState {
  workTypes: string[];
  experience: string[];
  recency: string | null;
  easyApply: boolean;
  under10: boolean;
  sortBy: string | null;
  keywords: string;
}

export const WORK_TYPE_LABELS: Record<string, string> = {
  '1': 'On-site',
  '2': 'Remote',
  '3': 'Hybrid',
};

export const EXPERIENCE_LABELS: Record<string, string> = {
  '1': 'Internship',
  '2': 'Entry Level',
  '3': 'Associate',
  '4': 'Mid-Senior',
  '5': 'Director',
  '6': 'Executive',
};

/**
 * Normalizes conversational /jobs/search-results/ URLs if needed.
 */
export function normalizeJobSearchUrl(): boolean {
  return false;
}

/**
 * Reads active filters from current URL
 */
export function getActiveFilterState(): ActiveFilterState {
  const url = new URL(window.location.href);
  const params = url.searchParams;

  const wtParam = params.get('f_WT') || '';
  const expParam = params.get('f_E') || '';

  return {
    workTypes: wtParam ? wtParam.split(',').filter(Boolean) : [],
    experience: expParam ? expParam.split(',').filter(Boolean) : [],
    recency: params.get('f_TPR'),
    easyApply: params.get('f_AL') === 'true',
    under10: params.get('f_EA') === 'true',
    sortBy: params.get('sortBy'),
    keywords: params.get('keywords') || '',
  };
}

/**
 * Helper to update URL with new parameters and reload search
 */
function applyUpdatedUrl(modifier: (url: URL) => void): void {
  const url = new URL(window.location.href);
  modifier(url);
  window.location.assign(url.toString());
}

/**
 * Toggles a comma-separated list param (e.g. f_WT or f_E)
 */
export function toggleListParam(param: 'f_WT' | 'f_E', value: string): void {
  applyUpdatedUrl((url) => {
    const current = url.searchParams.get(param) || '';
    const items = current ? current.split(',').filter(Boolean) : [];
    const index = items.indexOf(value);

    if (index > -1) {
      items.splice(index, 1);
    } else {
      items.push(value);
    }

    if (items.length > 0) {
      url.searchParams.set(param, items.join(','));
    } else {
      url.searchParams.delete(param);
    }
  });
}

/**
 * Updates or clears recency filter (f_TPR) and defaults sortBy to DD
 */
export function setRecencyParam(recency: string | null): void {
  applyUpdatedUrl((url) => {
    if (recency) {
      url.searchParams.set('f_TPR', recency);
      if (!url.searchParams.get('sortBy')) {
        url.searchParams.set('sortBy', 'DD');
      }
    } else {
      url.searchParams.delete('f_TPR');
    }
  });
}

/**
 * Toggles a boolean param (e.g. f_AL for Easy Apply or f_EA for Under 10 applicants)
 */
export function toggleBooleanParam(param: 'f_AL' | 'f_EA'): void {
  applyUpdatedUrl((url) => {
    const isCurrentlyTrue = url.searchParams.get(param) === 'true';
    if (isCurrentlyTrue) {
      url.searchParams.delete(param);
    } else {
      url.searchParams.set(param, 'true');
    }
  });
}

/**
 * Toggles sortBy between 'DD' (Most Recent) and 'R' (Relevance)
 */
export function toggleSortOrder(): void {
  applyUpdatedUrl((url) => {
    const current = url.searchParams.get('sortBy');
    if (current === 'DD') {
      url.searchParams.set('sortBy', 'R');
    } else {
      url.searchParams.set('sortBy', 'DD');
    }
  });
}
