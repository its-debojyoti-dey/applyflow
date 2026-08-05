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
  jobCard: '.job-card-container, .jobs-search-results__list-item, .jobs-search-results-list__list-item, .scaffold-layout__list-item, .job-card-job-posting, div[data-job-id], li[data-occluded-card-index], .jobs-search-two-pane__job-card-container',
  companyName: '.job-card-container__primary-description, .job-card-container__company-name, .job-card-list__company-name, .job-card-list__subtitle, .artdeco-entity-lockup__subtitle, span.job-card-container__primary-description, a.job-card-container__company-name, [data-test-job-card-company-name], a[href*="/company/"], span[class*="primary-description"], span[class*="company-name"], span[class*="subtitle"]',
  jobTitle: '.job-card-list__title, .job-card-container__link, a[class*="job-title"]',
  appliedBadge: '.job-card-container__footer-item, span[class*="applied-line"]',
  recruiterCard: '.hirer-card__hirer-information, .jobs-unified-top-card__hiring-team, .hiring-team, [class*="hiring-team"]',
  recruiterName: '.hirer-card__hirer-information .jobs-hirer-profile-card__name, .jobs-unified-top-card__hiring-team a, .hirer-card__hirer-information a',
  easyApplyModal: '.jobs-easy-apply-modal, div[role="dialog"]',
  formLabels: '.jobs-easy-apply-form-element label, div[class*="easy-apply"] label',
};
