# ApplyFlow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build **ApplyFlow**, a privacy-first Chrome Extension (Manifest V3) that enhances LinkedIn job searching with custom time filters (1h-24h), company blocklisting, applied job hiding, recruiter profile extraction with cold outreach generators, and multilingual form translation.

**Architecture:** Built using React 19 + TypeScript + Vite + CRXJS. Extension content scripts observe LinkedIn DOM changes via MutationObserver and inject UI controls cleanly inside an isolated Shadow DOM. State is persisted locally using Chrome Storage API.

**Tech Stack:** React 19, TypeScript 5.x, Vite 7.x, @crxjs/vite-plugin, Lucide React (icons), Chrome Storage API, Shadow DOM.

## Global Constraints

- Platform: Google Chrome Extension (Manifest V3)
- Target Site: `https://www.linkedin.com/jobs/*`
- Language: TypeScript (strict mode)
- Project Directory: `D:\Debojyoti\Projects\applyflow`
- Safety: Pure DOM reading & URL manipulation. Zero automated apply or connection requests.

---

### Task 1: Project Initialization & Build Setup

**Files:**
- Create: `D:\Debojyoti\Projects\applyflow\package.json`
- Create: `D:\Debojyoti\Projects\applyflow\tsconfig.json`
- Create: `D:\Debojyoti\Projects\applyflow\vite.config.ts`
- Create: `D:\Debojyoti\Projects\applyflow\manifest.json`
- Create: `D:\Debojyoti\Projects\applyflow\public\icons\icon16.png`
- Create: `D:\Debojyoti\Projects\applyflow\public\icons\icon48.png`
- Create: `D:\Debojyoti\Projects\applyflow\public\icons\icon128.png`

**Interfaces:**
- Consumes: N/A
- Produces: Build infrastructure capable of compiling React 19 + TypeScript Manifest V3 extension to `dist/`.

- [ ] **Step 1: Create package.json**

```json
{
  "name": "applyflow",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint ."
  },
  "dependencies": {
    "lucide-react": "^0.475.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@crxjs/vite-plugin": "^2.0.0-beta.33",
    "@types/chrome": "^0.1.307",
    "@types/node": "^22.13.1",
    "@types/react": "^19.0.8",
    "@types/react-dom": "^19.0.3",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.7.3",
    "vite": "^6.1.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
});
```

- [ ] **Step 4: Create manifest.json**

```json
{
  "manifest_version": 3,
  "name": "ApplyFlow - LinkedIn Job Apply Helper",
  "version": "1.0.0",
  "description": "Smart custom time filters, company blocklists, recruiter profiles, and form translation for LinkedIn job seekers.",
  "action": {
    "default_popup": "src/popup/index.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "permissions": [
    "storage",
    "activeTab",
    "scripting"
  ],
  "host_permissions": [
    "https://www.linkedin.com/*"
  ],
  "background": {
    "service_worker": "src/background/index.ts",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": [
        "https://www.linkedin.com/jobs/*"
      ],
      "js": [
        "src/content/index.ts"
      ]
    }
  ]
}
```

- [ ] **Step 5: Create placeholder entry files & icons**

Create minimal `src/background/index.ts`, `src/content/index.ts`, `src/popup/index.html`, `src/popup/main.tsx`.

- [ ] **Step 6: Run npm install & build test**

Run: `npm install && npm run build`
Expected: Successful build creating `dist/` directory with manifest and assets.

---

### Task 2: Shared Types, Constants & Chrome Storage Wrapper

**Files:**
- Create: `D:\Debojyoti\Projects\applyflow\src\shared\types.ts`
- Create: `D:\Debojyoti\Projects\applyflow\src\shared\constants.ts`
- Create: `D:\Debojyoti\Projects\applyflow\src\shared\storage.ts`

**Interfaces:**
- Consumes: `chrome.storage.local` API
- Produces: `getApplyFlowStorage()`, `setApplyFlowStorage()`, `toggleBlockCompany()`, `logAppliedJob()`, `DEFAULT_STORAGE`.

- [ ] **Step 1: Create src/shared/types.ts**

```typescript
export interface ApplyFlowSettings {
  autoHideApplied: boolean;
  autoHideBlocked: boolean;
  showGhostWarnings: boolean;
  highlightCompetition: boolean;
  autoTranslateForms: boolean;
  targetLanguage: string;
}

export interface BlockedCompany {
  id: string;
  name: string;
  addedAt: number;
}

export interface AppliedJobRecord {
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
}

export interface OutreachTemplate {
  id: string;
  title: string;
  content: string;
}

export interface ApplyFlowStorage {
  settings: ApplyFlowSettings;
  blockedCompanies: BlockedCompany[];
  appliedJobs: Record<string, AppliedJobRecord>;
  templates: OutreachTemplate[];
}
```

- [ ] **Step 2: Create src/shared/constants.ts**

```typescript
import { ApplyFlowStorage } from './types';

export const DEFAULT_STORAGE: ApplyFlowStorage = {
  settings: {
    autoHideApplied: true,
    autoHideBlocked: true,
    showGhostWarnings: true,
    highlightCompetition: true,
    autoTranslateForms: true,
    targetLanguage: 'en',
  },
  blockedCompanies: [],
  appliedJobs: {},
  templates: [
    {
      id: 'default-outreach',
      title: 'Standard Cold Outreach',
      content: 'Hi {recruiter_name}, I noticed you are hiring for {job_title} at {company_name}. My experience matches this role well and I would love to connect!',
    },
  ],
};

export const TIME_FILTER_PRESETS = [
  { label: '1h', seconds: 3600, param: 'r3600' },
  { label: '3h', seconds: 10800, param: 'r10800' },
  { label: '6h', seconds: 21600, param: 'r21600' },
  { label: '12h', seconds: 43200, param: 'r43200' },
  { label: '24h', seconds: 86400, param: 'r86400' },
];

export const LINKEDIN_SELECTORS = {
  jobCard: '.job-card-container, .jobs-search-results__list-item',
  companyName: '.job-card-container__primary-description, .job-card-container__company-name',
  jobTitle: '.job-card-list__title',
  appliedBadge: '.job-card-container__footer-item',
  recruiterCard: '.hirer-card__hirer-information, .jobs-unified-top-card__hiring-team',
  recruiterName: '.hirer-card__hirer-information .jobs-hirer-profile-card__name, .jobs-unified-top-card__hiring-team a',
  easyApplyModal: '.jobs-easy-apply-modal',
  formLabels: '.jobs-easy-apply-form-element label',
};
```

- [ ] **Step 3: Create src/shared/storage.ts**

```typescript
import { ApplyFlowStorage, BlockedCompany, AppliedJobRecord } from './types';
import { DEFAULT_STORAGE } from './constants';

export async function getStorage(): Promise<ApplyFlowStorage> {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    return DEFAULT_STORAGE;
  }
  return new Promise((resolve) => {
    chrome.storage.local.get(DEFAULT_STORAGE, (res) => {
      resolve(res as ApplyFlowStorage);
    });
  });
}

export async function setStorage(data: Partial<ApplyFlowStorage>): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage) return;
  return new Promise((resolve) => {
    chrome.storage.local.set(data, resolve);
  });
}

export async function addBlockedCompany(companyName: string): Promise<void> {
  const normalized = companyName.trim().toLowerCase();
  if (!normalized) return;
  const store = await getStorage();
  const exists = store.blockedCompanies.some((c) => c.name.toLowerCase() === normalized);
  if (!exists) {
    const updated = [
      ...store.blockedCompanies,
      { id: normalized, name: companyName.trim(), addedAt: Date.now() },
    ];
    await setStorage({ blockedCompanies: updated });
  }
}

export async function removeBlockedCompany(id: string): Promise<void> {
  const store = await getStorage();
  const updated = store.blockedCompanies.filter((c) => c.id !== id);
  await setStorage({ blockedCompanies: updated });
}

export async function saveAppliedJob(record: AppliedJobRecord): Promise<void> {
  const store = await getStorage();
  const updated = { ...store.appliedJobs, [record.jobId]: record };
  await setStorage({ appliedJobs: updated });
}
```

- [ ] **Step 4: Build verification**

Run: `npm run build`
Expected: Build passes without TypeScript errors.

---

### Task 3: URL Custom Time Filter Engine (`timeFilter.ts`)

**Files:**
- Create: `D:\Debojyoti\Projects\applyflow\src\content\modules\timeFilter.ts`

**Interfaces:**
- Consumes: `TIME_FILTER_PRESETS` from `src/shared/constants.ts`
- Produces: `applyTimeFilter(secondsParam: string): void`

- [ ] **Step 1: Implement src/content/modules/timeFilter.ts**

```typescript
export function applyTimeFilter(secondsParam: string): void {
  const url = new URL(window.location.href);
  url.searchParams.set('f_TPR', secondsParam);
  url.searchParams.set('sortBy', 'DD'); // Sort by most recent
  window.location.href = url.toString();
}

export function getCurrentTimeFilter(): string | null {
  const url = new URL(window.location.href);
  return url.searchParams.get('f_TPR');
}
```

- [ ] **Step 2: Build verification**

Run: `npm run build`
Expected: PASS

---

### Task 4: Company Blocklist & Card Collapser (`companyBlocker.ts`)

**Files:**
- Create: `D:\Debojyoti\Projects\applyflow\src\content\modules\companyBlocker.ts`

**Interfaces:**
- Consumes: `getStorage()`, `addBlockedCompany()` from `src/shared/storage.ts`
- Produces: `processJobCardsForBlocklist(cards: HTMLElement[]): void`

- [ ] **Step 1: Implement src/content/modules/companyBlocker.ts**

```typescript
import { getStorage, addBlockedCompany } from '../../shared/storage';
import { LINKEDIN_SELECTORS } from '../../shared/constants';

export async function processJobCardsForBlocklist(cards: HTMLElement[]): Promise<void> {
  const storage = await getStorage();
  if (!storage.settings.autoHideBlocked) return;

  const blockedMap = new Set(storage.blockedCompanies.map((c) => c.name.toLowerCase()));

  cards.forEach((card) => {
    if (card.dataset.applyflowProcessed) return;

    const companyElem = card.querySelector(LINKEDIN_SELECTORS.companyName);
    if (!companyElem) return;

    const rawCompany = companyElem.textContent?.trim() || '';
    const normCompany = rawCompany.toLowerCase();

    // Add Block Button if not present
    if (!card.querySelector('.applyflow-block-btn')) {
      const blockBtn = document.createElement('button');
      blockBtn.className = 'applyflow-block-btn';
      blockBtn.textContent = '🚫 Block';
      blockBtn.style.cssText = 'margin-left: 8px; padding: 2px 6px; font-size: 11px; background: #fee2e2; color: #991b1b; border: 1px solid #f87171; border-radius: 4px; cursor: pointer;';
      blockBtn.onclick = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        await addBlockedCompany(rawCompany);
        card.style.display = 'none';
      };
      companyElem.appendChild(blockBtn);
    }

    if (blockedMap.has(normCompany)) {
      card.style.opacity = '0.3';
      card.style.filter = 'grayscale(100%)';
      card.dataset.blocked = 'true';
    }

    card.dataset.applyflowProcessed = 'true';
  });
}
```

- [ ] **Step 2: Build verification**

Run: `npm run build`
Expected: PASS

---

### Task 5: Recruiter Profile Extractor & Outreach Generator (`recruiterCard.ts`)

**Files:**
- Create: `D:\Debojyoti\Projects\applyflow\src\content\modules\recruiterCard.ts`

**Interfaces:**
- Consumes: `LINKEDIN_SELECTORS`, `getStorage()`
- Produces: `injectRecruiterOutreachBanner(): void`

- [ ] **Step 1: Implement src/content/modules/recruiterCard.ts**

```typescript
import { LINKEDIN_SELECTORS } from '../../shared/constants';
import { getStorage } from '../../shared/storage';

export async function injectRecruiterOutreachBanner(): Promise<void> {
  const recruiterElem = document.querySelector(LINKEDIN_SELECTORS.recruiterCard);
  if (!recruiterElem || recruiterElem.querySelector('.applyflow-recruiter-banner')) return;

  const nameElem = recruiterElem.querySelector(LINKEDIN_SELECTORS.recruiterName);
  const recruiterName = nameElem?.textContent?.trim() || 'Recruiter';

  const jobTitleElem = document.querySelector('.jobs-unified-top-card__job-title');
  const jobTitle = jobTitleElem?.textContent?.trim() || 'this role';

  const companyElem = document.querySelector('.jobs-unified-top-card__company-name');
  const companyName = companyElem?.textContent?.trim() || 'your company';

  const banner = document.createElement('div');
  banner.className = 'applyflow-recruiter-banner';
  banner.style.cssText = 'margin: 12px 0; padding: 10px 14px; background: #e0f2fe; border: 1px solid #38bdf8; border-radius: 8px; font-size: 13px; color: #0369a1; display: flex; align-items: center; justify-content: space-between;';

  const titleText = document.createElement('span');
  titleText.innerHTML = `👤 <strong>${recruiterName}</strong> is hiring for this role`;

  const copyBtn = document.createElement('button');
  copyBtn.textContent = '📩 Copy Cold Outreach';
  copyBtn.style.cssText = 'padding: 4px 10px; background: #0284c7; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 12px;';
  
  copyBtn.onclick = async () => {
    const store = await getStorage();
    const template = store.templates[0]?.content || 'Hi {recruiter_name}, I noticed you are hiring for {job_title} at {company_name}.';
    const message = template
      .replace('{recruiter_name}', recruiterName)
      .replace('{job_title}', jobTitle)
      .replace('{company_name}', companyName);
    
    await navigator.clipboard.writeText(message);
    copyBtn.textContent = '✅ Copied to Clipboard!';
    setTimeout(() => { copyBtn.textContent = '📩 Copy Cold Outreach'; }, 2000);
  };

  banner.appendChild(titleText);
  banner.appendChild(copyBtn);
  recruiterElem.prepend(banner);
}
```

- [ ] **Step 2: Build verification**

Run: `npm run build`
Expected: PASS

---

### Task 6: Multilingual Form & Job Translator (`translator.ts`)

**Files:**
- Create: `D:\Debojyoti\Projects\applyflow\src\content\modules\translator.ts`

**Interfaces:**
- Consumes: `LINKEDIN_SELECTORS`
- Produces: `translateEasyApplyForm(): void`

- [ ] **Step 1: Implement src/content/modules/translator.ts**

```typescript
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
```

- [ ] **Step 2: Build verification**

Run: `npm run build`
Expected: PASS

---

### Task 7: Shadow DOM Container & Content Script Observer (`index.ts` & `shadow-mount.tsx`)

**Files:**
- Create: `D:\Debojyoti\Projects\applyflow\src\content\shadow-mount.tsx`
- Modify: `D:\Debojyoti\Projects\applyflow\src\content\index.ts`

**Interfaces:**
- Consumes: All content modules (`timeFilter`, `companyBlocker`, `recruiterCard`, `translator`)
- Produces: Injected Floating Toolbar & MutationObserver on LinkedIn page.

- [ ] **Step 1: Implement Floating Toolbar in shadow-mount.tsx**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { applyTimeFilter } from './modules/timeFilter';
import { TIME_FILTER_PRESETS } from '../shared/constants';

export function mountFloatingToolbar(): void {
  let host = document.getElementById('applyflow-shadow-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'applyflow-shadow-host';
    host.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 99999;';
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });
    const mountPoint = document.createElement('div');
    shadow.appendChild(mountPoint);

    const root = ReactDOM.createRoot(mountPoint);
    root.render(<FloatingToolbar />);
  }
}

function FloatingToolbar() {
  return (
    <div style={{
      background: '#0f172a',
      color: '#f8fafc',
      padding: '10px 14px',
      borderRadius: '24px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontFamily: 'sans-serif',
      fontSize: '12px'
    }}>
      <span style={{ fontWeight: 700, color: '#38bdf8' }}>⚡ ApplyFlow</span>
      <span style={{ color: '#64748b' }}>|</span>
      {TIME_FILTER_PRESETS.map((p) => (
        <button
          key={p.label}
          onClick={() => applyTimeFilter(p.param)}
          style={{
            background: '#1e293b',
            color: '#e2e8f0',
            border: '1px solid #334155',
            padding: '4px 8px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '11px'
          }}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Implement main Observer in content/index.ts**

```typescript
import { mountFloatingToolbar } from './shadow-mount';
import { processJobCardsForBlocklist } from './modules/companyBlocker';
import { injectRecruiterOutreachBanner } from './modules/recruiterCard';
import { translateEasyApplyForm } from './modules/translator';
import { LINKEDIN_SELECTORS } from '../shared/constants';

function initApplyFlow() {
  mountFloatingToolbar();

  const observer = new MutationObserver(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>(LINKEDIN_SELECTORS.jobCard));
    if (cards.length > 0) {
      processJobCardsForBlocklist(cards);
    }
    injectRecruiterOutreachBanner();
    translateEasyApplyForm();
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApplyFlow);
} else {
  initApplyFlow();
}
```

- [ ] **Step 3: Build verification**

Run: `npm run build`
Expected: PASS

---

### Task 8: Popup Dashboard UI (React 19)

**Files:**
- Create: `D:\Debojyoti\Projects\applyflow\src\popup\index.html`
- Create: `D:\Debojyoti\Projects\applyflow\src\popup\main.tsx`
- Create: `D:\Debojyoti\Projects\applyflow\src\popup\App.tsx`
- Create: `D:\Debojyoti\Projects\applyflow\src\popup\popup.css`

**Interfaces:**
- Consumes: `getStorage()`, `setStorage()`, `removeBlockedCompany()`
- Produces: Chrome Extension Popup window with 4 Tabs (Filters, Blocklist, Tracker, Settings).

- [ ] **Step 1: Create src/popup/index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ApplyFlow Dashboard</title>
</head>
<body style="width: 360px; height: 480px; margin: 0; padding: 0; background: #0f172a; color: #f8fafc; font-family: system-ui, sans-serif;">
  <div id="root"></div>
  <script type="module" src="./main.tsx"></script>
</body>
</html>
```

- [ ] **Step 2: Create src/popup/App.tsx**

```tsx
import React, { useEffect, useState } from 'react';
import { getStorage, removeBlockedCompany } from '../shared/storage';
import { ApplyFlowStorage } from '../shared/types';
import { TIME_FILTER_PRESETS } from '../shared/constants';

export default function App() {
  const [data, setData] = useState<ApplyFlowStorage | null>(null);
  const [activeTab, setActiveTab] = useState<'filters' | 'blocklist' | 'tracker'>('filters');

  useEffect(() => {
    getStorage().then(setData);
  }, []);

  if (!data) return <div style={{ padding: 20 }}>Loading ApplyFlow...</div>;

  return (
    <div style={{ padding: 16 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18, color: '#38bdf8' }}>⚡ ApplyFlow</h2>
        <span style={{ fontSize: 11, background: '#1e293b', padding: '2px 8px', borderRadius: 10, color: '#94a3b8' }}>v1.0.0</span>
      </header>

      <nav style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['filters', 'blocklist', 'tracker'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '6px 0',
              background: activeTab === tab ? '#0284c7' : '#1e293b',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 12,
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </nav>

      {activeTab === 'filters' && (
        <div>
          <h4 style={{ margin: '0 0 8px 0', color: '#94a3b8' }}>Custom Time Search</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {TIME_FILTER_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  chrome.tabs.create({ url: `https://www.linkedin.com/jobs/search/?f_TPR=${p.param}&sortBy=DD` });
                }}
                style={{
                  padding: 10,
                  background: '#1e293b',
                  color: '#e2e8f0',
                  border: '1px solid #334155',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Jobs in Past {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'blocklist' && (
        <div>
          <h4 style={{ margin: '0 0 8px 0', color: '#94a3b8' }}>Blocked Companies ({data.blockedCompanies.length})</h4>
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {data.blockedCompanies.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: 13 }}>No blocked companies yet. Click '🚫 Block' on any LinkedIn job card.</p>
            ) : (
              data.blockedCompanies.map((c) => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: '#1e293b', borderRadius: 4, marginBottom: 6 }}>
                  <span style={{ fontSize: 13 }}>{c.name}</span>
                  <button
                    onClick={async () => {
                      await removeBlockedCompany(c.id);
                      setData(await getStorage());
                    }}
                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 12 }}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'tracker' && (
        <div>
          <h4 style={{ margin: '0 0 8px 0', color: '#94a3b8' }}>Applied Jobs Log</h4>
          <p style={{ fontSize: 12, color: '#64748b' }}>{Object.keys(data.appliedJobs).length} applications tracked locally.</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create main.tsx**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 4: Build verification**

Run: `npm run build`
Expected: PASS

---

### Task 9: Final Verification & Extension Bundle Audit

**Files:**
- Audit: Entire `dist/` bundle

- [ ] **Step 1: Run full production build**

Run: `npm run build`
Expected: Output files generated clean in `dist/` without any bundling or TypeScript errors.

- [ ] **Step 2: Check manifest & background worker bundle integrity**

Verify `dist/manifest.json` correctly points to compiled service worker and content script assets.
