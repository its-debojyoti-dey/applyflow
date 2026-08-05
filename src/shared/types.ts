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
