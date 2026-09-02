import { ApplyFlowStorage } from './types';

export const DEFAULT_STORAGE: ApplyFlowStorage = {
  settings: {
    autoHideApplied: true,
    autoHideBlocked: true,
    showGhostWarnings: true,
    highlightCompetition: true,
    autoTranslateForms: true,
    targetLanguage: 'en',
    filterBar: {
      enabled: true,
      hidePromoted: true,
      strictTitleMatch: false,
      hideAgencies: true,
    },
  },
  blockedCompanies: [],
  appliedJobs: {},
  noEmailJobs: {},
  templates: [
    {
      id: 'default-outreach',
      title: 'Standard Cold Outreach',
      content: 'Hi {recruiter_name}, I noticed you are hiring for {job_title} at {company_name}. My experience matches this role well and I would love to connect!',
    },
  ],
};

export const COMMON_STAFFING_AGENCIES = [
  'robert half',
  'cybercoders',
  'insight global',
  'teksystems',
  'apex systems',
  'kforce',
  'randstad',
  'aerotek',
  'kelly services',
  'kelly',
  'manpower',
  'hays',
  'adecco',
  'jobot',
  'beacon hill',
  'aston carter',
  'collabera',
  'motion recruitment',
  'hirewell',
  'lhh',
  'michael page',
  'modis',
  'monroe consulting',
  'judge group',
  'diversant',
];

export const TIME_FILTER_PRESETS = [
  { label: '1h', seconds: 3600, param: 'r3600' },
  { label: '3h', seconds: 10800, param: 'r10800' },
  { label: '6h', seconds: 21600, param: 'r21600' },
  { label: '12h', seconds: 43200, param: 'r43200' },
  { label: '24h', seconds: 86400, param: 'r86400' },
];

export const LINKEDIN_SELECTORS = {
  jobCard: 'div[role="button"][componentkey*="job-card-component-ref"], .job-card-container, .jobs-search-results__list-item, .jobs-search-results-list__list-item, .scaffold-layout__list-item, .job-card-job-posting, div[data-job-id], li[data-occluded-card-index], .jobs-search-two-pane__job-card-container',
  companyName: '.job-card-container__primary-description, .job-card-container__company-name, .job-card-list__company-name, .job-card-list__subtitle, .artdeco-entity-lockup__subtitle, span.job-card-container__primary-description, a.job-card-container__company-name, [data-test-job-card-company-name], a[href*="/company/"], p[class*="fdde4d3f"]:not([class*="e01bf4c6"]), span[class*="primary-description"], span[class*="company-name"], span[class*="subtitle"]',
  jobTitle: 'p[class*="_57f61469"] span:not(:empty), span.c83b18a6, .job-card-list__title, .job-card-container__link, a[class*="job-title"], a[href*="/jobs/view/"]',
  appliedBadge: '.job-card-container__footer-item, span[class*="applied-line"], p._1606d8cb._87ffd243, [class*="footer-item"]',
  recruiterCard: '.hirer-card__hirer-information, .jobs-unified-top-card__hiring-team, .hiring-team, [class*="hiring-team"]',
  recruiterName: '.hirer-card__hirer-information .jobs-hirer-profile-card__name, .jobs-unified-top-card__hiring-team a, .hirer-card__hirer-information a',
  easyApplyModal: '.jobs-easy-apply-modal, div[role="dialog"]',
  formLabels: '.jobs-easy-apply-form-element label, div[class*="easy-apply"] label',
  filterBarAnchor: '#workspace header, .scaffold-layout__list-header, .jobs-search-results-list__title-heading, .jobs-search-results-list, .scaffold-layout__list, div.f6fa1d28',
  promotedBadge: '.job-card-container__footer-item, [class*="footer-item"], span[class*="promoted"], .t-12.t-black--light',
};
