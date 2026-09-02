import {
  getActiveFilterState,
  toggleListParam,
  setRecencyParam,
  toggleBooleanParam,
  toggleSortOrder,
  EXPERIENCE_LABELS,
} from './filterEngine';
import { onFilterStatsChange, FilterStats, getFilterStats } from './liveDomFilter';
import { getStorage, setStorage } from '../../shared/storage';
import { LINKEDIN_SELECTORS } from '../../shared/constants';

const HOST_ID = 'applyflow-filterbar-host';

export async function mountFilterBar(): Promise<void> {
  const isJobPage = window.location.pathname.includes('/jobs');
  if (!isJobPage) return;

  const storage = await getStorage();
  const filterSettings = storage.settings.filterBar || {
    enabled: true,
    hidePromoted: true,
    strictTitleMatch: false,
    hideAgencies: true,
  };

  if (!filterSettings.enabled) {
    const existing = document.getElementById(HOST_ID);
    if (existing) existing.remove();
    return;
  }

  let host = document.getElementById(HOST_ID);
  if (host && host.shadowRoot) {
    // Already mounted; update dynamic state
    updateFilterBarContent(host.shadowRoot);
    return;
  }

  // Find suitable injection container
  let listHeader =
    document.querySelector('header.scaffold-layout__list-header') ||
    document.querySelector('.jobs-search-results-list__title-heading') ||
    document.querySelector('#workspace header');

  let isLeftColumnContainer = false;

  if (!listHeader) {
    // Check modern /jobs/search-results/ layout
    const leftCol =
      document.querySelector<HTMLElement>('div.f6fa1d28') ||
      document.querySelector<HTMLElement>(LINKEDIN_SELECTORS.filterBarAnchor);
    if (leftCol) {
      listHeader = leftCol;
      isLeftColumnContainer = true;
    }
  }

  if (!listHeader) {
    return;
  }

  host = document.createElement('div');
  host.id = HOST_ID;
  host.style.cssText = `
    display: block;
    width: 100%;
    box-sizing: border-box;
    margin: 8px 0;
    z-index: 10;
    position: relative;
  `;

  const shadow = host.attachShadow({ mode: 'open' });
  renderFilterBar(shadow);

  // Insert cleanly right below the header or at top of the job list
  if (isLeftColumnContainer) {
    listHeader.prepend(host);
  } else if (listHeader.nextSibling && listHeader.parentElement) {
    listHeader.parentElement.insertBefore(host, listHeader.nextSibling);
  } else if (listHeader.parentElement) {
    listHeader.parentElement.appendChild(host);
  } else {
    listHeader.prepend(host);
  }

  // Subscribe to live stats
  onFilterStatsChange((stats) => {
    updateStatsDisplay(shadow, stats);
  });
}

function updateFilterBarContent(shadow: ShadowRoot) {
  renderFilterBar(shadow);
}

function updateStatsDisplay(shadow: ShadowRoot, stats: FilterStats) {
  const statsElem = shadow.getElementById('applyflow-filter-stats');
  if (!statsElem) return;

  const filteredTotal = stats.promoted + stats.titleMismatch + stats.agencies;
  if (filteredTotal > 0) {
    statsElem.innerHTML = `
      <span class="badge badge-warning">
        Showing ${stats.visible} / ${stats.total} jobs
        <span class="breakdown">(${stats.promoted} promoted, ${stats.titleMismatch} non-matching, ${stats.agencies} agency hidden)</span>
      </span>
    `;
    statsElem.style.display = 'inline-flex';
  } else if (stats.total > 0) {
    statsElem.innerHTML = `<span class="badge badge-neutral">${stats.total} jobs</span>`;
    statsElem.style.display = 'inline-flex';
  } else {
    statsElem.style.display = 'none';
  }
}

async function renderFilterBar(shadow: ShadowRoot) {
  const state = getActiveFilterState();
  const storage = await getStorage();
  const settings = storage.settings.filterBar;

  const recencyPresets = [
    { label: 'Any time', value: null },
    { label: 'Past 1h', value: 'r3600' },
    { label: 'Past 3h', value: 'r10800' },
    { label: 'Past 12h', value: 'r43200' },
    { label: 'Past 24h', value: 'r86400' },
    { label: 'Past Week', value: 'r604800' },
  ];

  shadow.innerHTML = '';

  const style = document.createElement('style');
  style.textContent = `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    :host {
      display: block;
      font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 12px;
      color: #1f2937;
      padding: 0 12px;
    }
    .panel {
      background: #ffffff;
      border: 1px solid #e0e7ff;
      border-radius: 10px;
      padding: 10px 12px;
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.06);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
    }
    .row-header {
      justify-content: space-between;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 6px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 5px;
      font-weight: 700;
      font-size: 12px;
      color: #4f46e5;
    }
    .pill {
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      color: #334155;
      padding: 3px 9px;
      border-radius: 14px;
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      user-select: none;
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      line-height: 1.4;
    }
    .pill:hover {
      background: #f1f5f9;
      border-color: #94a3b8;
    }
    .pill.active {
      background: #4f46e5;
      color: #ffffff;
      border-color: #4338ca;
      font-weight: 600;
    }
    .pill-toggle.active {
      background: #ecfdf5;
      color: #047857;
      border-color: #a7f3d0;
      font-weight: 600;
    }
    .pill-toggle.inactive {
      background: #f8fafc;
      color: #64748b;
      border-color: #e2e8f0;
    }
    .badge {
      font-size: 10px;
      padding: 2px 7px;
      border-radius: 8px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .badge-status {
      background: #eef2ff;
      color: #4338ca;
      border: 1px solid #c7d2fe;
    }
    .badge-warning {
      background: #fffbeb;
      color: #b45309;
      border: 1px solid #fde68a;
    }
    .badge-neutral {
      background: #f3f4f6;
      color: #4b5563;
    }
    .label-caption {
      font-size: 10px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .divider {
      width: 1px;
      height: 14px;
      background: #e2e8f0;
      margin: 0 3px;
    }
  `;
  shadow.appendChild(style);

  const container = document.createElement('div');
  container.className = 'panel';
  container.innerHTML = `
      <!-- Top header bar with brand & live filter statistics -->
      <div class="row row-header">
        <div class="brand">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          ApplyFlow Classic Filters
        </div>
        <div id="applyflow-filter-stats" style="display: none;"></div>
      </div>

      <!-- Main URL Query Filters: Work Type & Recency -->
      <div class="row">
        <span class="label-caption">Work Type:</span>
        <button class="pill ${state.workTypes.includes('2') ? 'active' : ''}" id="btn-wt-2">
          ${state.workTypes.includes('2') ? '✓ ' : ''}Remote
        </button>
        <button class="pill ${state.workTypes.includes('3') ? 'active' : ''}" id="btn-wt-3">
          ${state.workTypes.includes('3') ? '✓ ' : ''}Hybrid
        </button>
        <button class="pill ${state.workTypes.includes('1') ? 'active' : ''}" id="btn-wt-1">
          ${state.workTypes.includes('1') ? '✓ ' : ''}On-site
        </button>

        <div class="divider"></div>

        <span class="label-caption">Recency:</span>
        ${recencyPresets
          .map(
            (p) => `
          <button class="pill ${state.recency === p.value || (!state.recency && p.value === null) ? 'active' : ''}" data-recency="${p.value || ''}">
            ${p.label}
          </button>
        `
          )
          .join('')}

        <div class="divider"></div>

        <button class="pill ${state.sortBy === 'DD' ? 'active' : ''}" id="btn-sort">
          ⚡ ${state.sortBy === 'DD' ? 'Most Recent (DD)' : 'Relevance'}
        </button>
      </div>

      <!-- Secondary Row: Experience Level, Easy Apply & Live DOM Cleaners -->
      <div class="row">
        <span class="label-caption">Level:</span>
        ${Object.entries(EXPERIENCE_LABELS)
          .filter(([code]) => ['2', '3', '4'].includes(code))
          .map(
            ([code, label]) => `
          <button class="pill ${state.experience.includes(code) ? 'active' : ''}" data-exp="${code}">
            ${state.experience.includes(code) ? '✓ ' : ''}${label}
          </button>
        `
          )
          .join('')}

        <div class="divider"></div>

        <button class="pill ${state.easyApply ? 'active' : ''}" id="btn-easy-apply">
          ${state.easyApply ? '✓ ' : ''}Easy Apply
        </button>
        <button class="pill ${state.under10 ? 'active' : ''}" id="btn-under-10">
          ${state.under10 ? '✓ ' : ''}&lt; 10 Applicants
        </button>

        <div class="divider"></div>

        <span class="label-caption">Clean Feed:</span>
        <button class="pill-toggle pill ${settings.hidePromoted ? 'active' : 'inactive'}" id="btn-hide-promoted" title="Hide sponsored & promoted postings in feed">
          ${settings.hidePromoted ? '✓ ' : ''}Hide Promoted
        </button>
        <button class="pill-toggle pill ${settings.strictTitleMatch ? 'active' : 'inactive'}" id="btn-strict-title" title="Only show jobs with search words in title">
          ${settings.strictTitleMatch ? '✓ ' : ''}Strict Title
        </button>
        <button class="pill-toggle pill ${settings.hideAgencies ? 'active' : 'inactive'}" id="btn-hide-agencies" title="Hide known staffing agency recruiters">
          ${settings.hideAgencies ? '✓ ' : ''}Hide Agencies
        </button>
      </div>
    </div>
  `;
  shadow.appendChild(container);

  // Attach Event Listeners
  shadow.getElementById('btn-wt-2')?.addEventListener('click', () => toggleListParam('f_WT', '2'));
  shadow.getElementById('btn-wt-3')?.addEventListener('click', () => toggleListParam('f_WT', '3'));
  shadow.getElementById('btn-wt-1')?.addEventListener('click', () => toggleListParam('f_WT', '1'));

  shadow.querySelectorAll<HTMLButtonElement>('button[data-recency]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-recency') || null;
      setRecencyParam(val);
    });
  });

  shadow.querySelectorAll<HTMLButtonElement>('button[data-exp]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const expCode = btn.getAttribute('data-exp');
      if (expCode) toggleListParam('f_E', expCode);
    });
  });

  shadow.getElementById('btn-easy-apply')?.addEventListener('click', () => toggleBooleanParam('f_AL'));
  shadow.getElementById('btn-under-10')?.addEventListener('click', () => toggleBooleanParam('f_EA'));
  shadow.getElementById('btn-sort')?.addEventListener('click', () => toggleSortOrder());

  // Live DOM Filter switches (save to storage)
  shadow.getElementById('btn-hide-promoted')?.addEventListener('click', async () => {
    settings.hidePromoted = !settings.hidePromoted;
    await setStorage({ settings: { ...storage.settings, filterBar: settings } });
    renderFilterBar(shadow);
  });

  shadow.getElementById('btn-strict-title')?.addEventListener('click', async () => {
    settings.strictTitleMatch = !settings.strictTitleMatch;
    await setStorage({ settings: { ...storage.settings, filterBar: settings } });
    renderFilterBar(shadow);
  });

  shadow.getElementById('btn-hide-agencies')?.addEventListener('click', async () => {
    settings.hideAgencies = !settings.hideAgencies;
    await setStorage({ settings: { ...storage.settings, filterBar: settings } });
    renderFilterBar(shadow);
  });

  // Initial stats render
  updateStatsDisplay(shadow, getFilterStats());
}
