const SESSION_KEY = 'applyflow_active_ftpr';

export function applyTimeFilter(secondsParam: string | null): void {
  const url = new URL(window.location.href);

  if (secondsParam) {
    sessionStorage.setItem(SESSION_KEY, secondsParam);
    url.searchParams.set('f_TPR', secondsParam);
    url.searchParams.set('sortBy', 'DD'); // Sort by most recent
  } else {
    sessionStorage.removeItem(SESSION_KEY);
    url.searchParams.delete('f_TPR');
    url.searchParams.delete('sortBy');
  }

  // Force full window location assign to bypass LinkedIn SPA router stripping query params
  window.location.assign(url.toString());
}

export function getCurrentTimeFilter(): string | null {
  const url = new URL(window.location.href);
  const urlParam = url.searchParams.get('f_TPR');
  if (urlParam) return urlParam;

  return sessionStorage.getItem(SESSION_KEY);
}

/**
 * Ensures custom time filter is preserved if LinkedIn SPA router tries to strip f_TPR parameter on initial load
 */
export function ensureTimeFilterPreserved(): void {
  const activeFtpr = sessionStorage.getItem(SESSION_KEY);
  if (!activeFtpr) return;

  const url = new URL(window.location.href);
  const currentFtpr = url.searchParams.get('f_TPR');

  if (currentFtpr !== activeFtpr) {
    url.searchParams.set('f_TPR', activeFtpr);
    url.searchParams.set('sortBy', 'DD');
    window.history.replaceState({}, '', url.toString());
  }
}
