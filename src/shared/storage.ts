import { ApplyFlowStorage, BlockedCompany, AppliedJobRecord } from './types';
import { DEFAULT_STORAGE } from './constants';

export async function getStorage(): Promise<ApplyFlowStorage> {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.runtime?.id) {
    return DEFAULT_STORAGE;
  }
  return new Promise((resolve) => {
    try {
      chrome.storage.local.get(DEFAULT_STORAGE, (res) => {
        if (chrome?.runtime?.lastError) {
          resolve(DEFAULT_STORAGE);
        } else {
          resolve((res as ApplyFlowStorage) || DEFAULT_STORAGE);
        }
      });
    } catch {
      resolve(DEFAULT_STORAGE);
    }
  });
}

export async function setStorage(data: Partial<ApplyFlowStorage>): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.runtime?.id) return;
  return new Promise((resolve) => {
    try {
      chrome.storage.local.set(data, () => {
        resolve();
      });
    } catch {
      resolve();
    }
  });
}

export async function addBlockedCompany(companyName: string): Promise<void> {
  const normalized = companyName.trim().toLowerCase();
  if (!normalized) return;
  const store = await getStorage();
  const exists = store.blockedCompanies.some((c) => c.name.toLowerCase() === normalized);
  if (!exists) {
    const updated: BlockedCompany[] = [
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
