# 🚀 ApplyFlow — LinkedIn Job Apply Helper Chrome Extension Design Spec

**Date**: 2026-08-05  
**Project Path**: `D:\Debojyoti\Projects\applyflow`  
**Target Platform**: Google Chrome / Manifest V3 (Chrome Extension)  

---

## 🎯 1. Overview & Objectives

**ApplyFlow** is a privacy-first, read-only Chrome Extension designed to eliminate noise, frustration, and inefficiency from LinkedIn job hunting. It empowers job seekers with:
1. **Custom Time Filters** (1h, 3h, 6h, 12h, 24h) via URL parameter manipulation (`f_TPR`).
2. **Company Blocklist** — hide or collapse job postings from unwanted companies with a 1-click action.
3. **Hide Applied Jobs** — auto-detect "Applied" status badges and hide/dim applied listings.
4. **Recruiter Profile Extractor** — surface hiring manager profiles with 1-click personalized cold outreach message templates.
5. **Multilingual Form & Job Translator** — translate foreign application forms and job descriptions to English.
6. **Ghost Job & Repost Warning** — flag listings older than 30 days or reposted multiple times.
7. **Applicant Competition Heatmap** — color-coded visual indicator for application volume (`<10`, `10-50`, `>50`).
8. **Local Application Tracker & CSV Exporter** — track applied roles locally and export to CSV.

---

## 🏛️ 2. System Architecture & Component Design

The extension is built using **React 19 + TypeScript + Vite + CRXJS**.

```
applyflow/
├── manifest.json                 # Manifest V3 Configuration
├── vite.config.ts                # Vite + CRXJS Setup
├── tsconfig.json                 # TypeScript Config
├── package.json                  # Dependencies (React 19, Lucide, Tailwind/CSS)
├── public/                       # Icons (16px, 48px, 128px)
└── src/
    ├── background/
    │   └── index.ts              # Service Worker for state sync & badge counters
    ├── content/
    │   ├── index.ts              # LinkedIn Page Observer & Content Script Entry
    │   ├── shadow-mount.tsx      # Shadow DOM Mount Manager for Isolated UI
    │   └── modules/
    │       ├── timeFilter.ts     # URL f_TPR filter parameter engine
    │       ├── companyBlocker.ts # Blocklist DOM matching & card collapse engine
    │       ├── appliedHider.ts   # Applied job detection & storage logger
    │       ├── recruiterCard.ts  # Recruiter profile extractor & cold message generator
    │       ├── translator.ts     # Multilingual form translation engine
    │       ├── ghostDetector.ts  # Reposted/stale job flagger
    │       └── competition.ts    # Applicant count heatmap visualizer
    ├── popup/                    # React Popup Dashboard
    │   ├── main.tsx              # Popup Mount point
    │   ├── App.tsx               # Main Popup Tab Shell
    │   ├── components/
    │   │   ├── Header.tsx        # Extension toggle & stats counter
    │   │   ├── TimeFilterTab.tsx # Quick 1-click search launchers
    │   │   ├── BlocklistTab.tsx  # Manage blocked companies
    │   │   ├── AppliedTracker.tsx# Applied jobs tracker & CSV export
    │   │   └── SettingsTab.tsx   # Visual & translation settings
    │   └── popup.css             # Dark mode UI styling
    └── shared/
        ├── types.ts              # TypeScript schemas for storage & state
        ├── storage.ts            # Chrome Storage API wrapper
        └── constants.ts          # LinkedIn selectors & translation dictionaries
```

---

## 💾 3. Data Storage Schema (`chrome.storage.local`)

```typescript
export interface ApplyFlowStorage {
  // Extension Settings
  settings: {
    autoHideApplied: boolean;       // Auto-hide jobs with 'Applied' badge
    autoHideBlocked: boolean;       // Auto-collapse/hide blocked company cards
    showGhostWarnings: boolean;     // Highlight reposted/stale jobs (>30 days)
    highlightCompetition: boolean;   // Color-code applicant counts
    autoTranslateForms: boolean;    // Auto-detect foreign language form fields
    targetLanguage: string;         // Default: 'en'
  };

  // Blocked Companies List
  blockedCompanies: Array<{
    id: string;                      // Company name hash
    name: string;                    // Normalized company name
    addedAt: number;                 // Timestamp
  }>;

  // Application Tracker Log
  appliedJobs: Record<string, {     // Key: LinkedIn Job ID
    jobId: string;
    title: string;
    company: string;
    location: string;
    url: string;
    appliedAt: number;
    recruiter?: {
      name: string;
      title: string;
      profileUrl: string;
    };
  }>;

  // Cold Outreach Templates
  templates: Array<{
    id: string;
    title: string;
    content: string;                 // Variables: {recruiter_name}, {job_title}, {company_name}
  }>;
}
```

---

## 🔧 4. Technical Feature Execution Details

### 4.1 Custom URL Time Filter (`timeFilter.ts`)
Modifies `f_TPR` parameter in the search URL:
- `1 Hour`: `f_TPR=r3600`
- `3 Hours`: `f_TPR=r10800`
- `6 Hours`: `f_TPR=r21600`
- `12 Hours`: `f_TPR=r43200`
- `24 Hours`: `f_TPR=r86400`
Renders quick-filter pills inside a floating UI toolbar on LinkedIn job pages.

### 4.2 Blocklist & Applied Hider (`companyBlocker.ts`, `appliedHider.ts`)
- Uses a `MutationObserver` to observe `.jobs-search-results-list` and `.job-card-container`.
- Matches `.job-card-container__primary-description` against `blockedCompanies`.
- Replaces blocked job cards with a sleek `[ 🚫 Blocked: Company Name (Click to view) ]` collapsed banner.
- Injects a `🚫 Block Company` button on every job card for instantaneous 1-click blocking.

### 4.3 Recruiter Profile Extractor (`recruiterCard.ts`)
- Scans `.hirer-card__hirer-information` and `.jobs-unified-top-card__hiring-team`.
- Extracts Recruiter Name, Title, Avatar, and Profile Link.
- Injects a **Recruiter Profile Card** above the job detail view with a `📩 Copy Outreach Message` button pre-formatted with candidate details.

### 4.4 Multilingual Form Translator (`translator.ts`)
- Detects non-English form fields in `.jobs-easy-apply-modal`.
- Uses a local offline translation dictionary for standard EU/global application questions + MyMemory API fallback for custom questions.
- Adds an inline `🌐 Translate` button near form labels without mutating standard form inputs, ensuring LinkedIn form submission validation passes.

---

## 🔒 5. LinkedIn Safety & TOS Safeguards
1. **Zero Automated Submissions**: No auto-click bots, auto-appliers, or auto-connect scripts.
2. **Shadow DOM Isolation**: Injected extension UI elements live inside a Shadow Root, preventing CSS leakage or LinkedIn DOM interference.
3. **Local Privacy**: 100% of blocklists, settings, and application logs are stored locally via `chrome.storage.local`.

---

## 🧪 6. Testing & Success Criteria
1. **Time Filter**: Selecting 1h/3h/6h updates the URL with correct `f_TPR` and reloads job search cleanly.
2. **Blocklist**: Blocking a company immediately hides/collapses its card and persists across refreshes.
3. **Applied Hider**: Jobs marked as "Applied" are correctly identified and hidden according to settings.
4. **Recruiter Card**: Job view pane correctly displays hiring manager info and copies pre-filled outreach message to clipboard.
5. **Translation**: Non-English form fields trigger translation tooltips without breaking form submit.
6. **Build**: `npm run build` generates a clean, error-free Manifest V3 Chrome Extension bundle.
