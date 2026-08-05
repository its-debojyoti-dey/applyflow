import React, { useEffect, useState } from 'react';
import {
  ShieldOff,
  Briefcase,
  Settings,
  Trash2,
  Plus,
  ExternalLink,
  Search,
  CheckCircle2,
  RefreshCw,
  Building2,
  ArrowRight,
  Filter
} from 'lucide-react';
import { getStorage, setStorage, addBlockedCompany, removeBlockedCompany } from '../shared/storage';
import { ApplyFlowStorage, ApplyFlowSettings, BlockedCompany } from '../shared/types';

type TabType = 'filters' | 'blocklist' | 'tracker' | 'settings';

const PRESETS = [
  { label: '1 Hour', seconds: 3600, param: 'r3600', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
  { label: '3 Hours', seconds: 10800, param: 'r10800', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  { label: '6 Hours', seconds: 21600, param: 'r21600', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
  { label: '12 Hours', seconds: 43200, param: 'r43200', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' },
  { label: '24 Hours', seconds: 86400, param: 'r86400', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.1)' },
];

export default function App() {
  const [data, setData] = useState<ApplyFlowStorage | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('filters');
  const [newCompany, setNewCompany] = useState('');
  const [customHours, setCustomHours] = useState<number | ''>('');
  const [blocklistSearch, setBlocklistSearch] = useState('');
  const [trackerSearch, setTrackerSearch] = useState('');
  const [saveNotification, setSaveNotification] = useState(false);

  const refreshStorage = async () => {
    const store = await getStorage();
    setData(store);
  };

  useEffect(() => {
    refreshStorage();
  }, []);

  if (!data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 10, color: '#6366f1' }}>
        <RefreshCw size={22} style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af' }}>Loading ApplyFlow...</span>
      </div>
    );
  }

  const handleOpenTimeFilter = (secondsParam: string) => {
    const targetUrl = `https://www.linkedin.com/jobs/search/?f_TPR=${secondsParam}&sortBy=DD`;
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        if (currentTab?.id && currentTab.url?.includes('linkedin.com')) {
          chrome.tabs.update(currentTab.id, { url: targetUrl });
        } else {
          chrome.tabs.create({ url: targetUrl });
        }
      });
    } else {
      window.open(targetUrl, '_blank');
    }
  };

  const handleCustomTimeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof customHours === 'number' && customHours > 0) {
      const seconds = Math.round(customHours * 3600);
      handleOpenTimeFilter(`r${seconds}`);
    }
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim()) return;
    await addBlockedCompany(newCompany.trim());
    setNewCompany('');
    await refreshStorage();
  };

  const handleRemoveCompany = async (id: string) => {
    await removeBlockedCompany(id);
    await refreshStorage();
  };

  const handleClearAllBlocked = async () => {
    if (confirm('Clear all blocked companies?')) {
      await setStorage({ blockedCompanies: [] });
      await refreshStorage();
    }
  };

  const handleToggleSetting = async (key: keyof ApplyFlowSettings) => {
    if (!data) return;
    const updatedSettings: ApplyFlowSettings = {
      ...data.settings,
      [key]: typeof data.settings[key] === 'boolean' ? !data.settings[key] : data.settings[key],
    };
    await setStorage({ settings: updatedSettings });
    setData({ ...data, settings: updatedSettings });
    triggerSaveNotify();
  };

  const handleLanguageChange = async (lang: string) => {
    if (!data) return;
    const updatedSettings: ApplyFlowSettings = {
      ...data.settings,
      targetLanguage: lang,
    };
    await setStorage({ settings: updatedSettings });
    setData({ ...data, settings: updatedSettings });
    triggerSaveNotify();
  };

  const triggerSaveNotify = () => {
    setSaveNotification(true);
    setTimeout(() => setSaveNotification(false), 2000);
  };

  const filteredBlocklist = data.blockedCompanies.filter((c: BlockedCompany) =>
    c.name.toLowerCase().includes(blocklistSearch.toLowerCase())
  );

  const appliedJobsList = Object.values(data.appliedJobs || {}).filter((job) =>
    job.title.toLowerCase().includes(trackerSearch.toLowerCase()) ||
    job.company.toLowerCase().includes(trackerSearch.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', boxSizing: 'border-box' }}>
      {/* Editorial Header */}
      <header style={{
        padding: '12px 16px',
        background: '#0d0e14',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 12,
            color: '#ffffff'
          }}>
            A
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#f3f4f6', letterSpacing: '-0.01em' }}>ApplyFlow</h1>
          </div>
        </div>

        <span className="mono" style={{
          fontSize: 10,
          background: 'rgba(255, 255, 255, 0.05)',
          color: '#9ca3af',
          border: '1px solid var(--border-subtle)',
          padding: '2px 7px',
          borderRadius: 4,
          fontWeight: 500
        }}>
          v1.0.0
        </span>
      </header>

      {/* Segmented Control Tabs */}
      <nav style={{
        display: 'flex',
        background: '#0d0e14',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '6px 10px',
        gap: 4
      }}>
        {[
          { id: 'filters', label: 'Search', icon: Filter },
          { id: 'blocklist', label: `Blocked (${data.blockedCompanies.length})`, icon: ShieldOff },
          { id: 'tracker', label: `Log (${Object.keys(data.appliedJobs || {}).length})`, icon: Briefcase },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`nav-tab ${isActive ? 'active' : ''}`}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: 14, boxSizing: 'border-box' }}>
        {/* TAB 1: CUSTOM TIME SEARCH */}
        {activeTab === 'filters' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Time Window Presets
                </span>
                <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Sorted by recent</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleOpenTimeFilter(p.param)}
                    className="card"
                    style={{
                      padding: '10px 12px',
                      color: '#f3f4f6',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        padding: '3px 8px',
                        background: p.bg,
                        color: p.color,
                        border: `1px solid ${p.color}33`,
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700
                      }}>
                        {p.label}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>
                        Jobs posted in last {p.label.toLowerCase()}
                      </span>
                    </div>
                    <ArrowRight size={14} color="var(--text-tertiary)" />
                  </button>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
                Custom Duration (Hours)
              </span>
              <form onSubmit={handleCustomTimeSearch} style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number"
                  min="0.25"
                  max="168"
                  step="0.25"
                  placeholder="e.g. 1.5"
                  value={customHours}
                  onChange={(e) => setCustomHours(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="mono"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 6,
                    color: '#f3f4f6',
                    fontSize: 13,
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={!customHours}
                  style={{
                    padding: '8px 14px',
                    background: customHours ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                    color: customHours ? '#ffffff' : 'var(--text-tertiary)',
                    border: 'none',
                    borderRadius: 6,
                    cursor: customHours ? 'pointer' : 'not-allowed',
                    fontWeight: 600,
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: BLOCKLIST MANAGER */}
        {activeTab === 'blocklist' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <form onSubmit={handleAddCompany} style={{ display: 'flex', gap: 6 }}>
              <input
                type="text"
                placeholder="Enter company name to block..."
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 6,
                  color: '#f3f4f6',
                  fontSize: 12,
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '8px 12px',
                  background: 'var(--primary)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Plus size={14} /> Add
              </button>
            </form>

            {data.blockedCompanies.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={12} style={{ position: 'absolute', left: 8, top: 9, color: 'var(--text-tertiary)' }} />
                  <input
                    type="text"
                    placeholder="Search blocklist..."
                    value={blocklistSearch}
                    onChange={(e) => setBlocklistSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 8px 6px 26px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 6,
                      color: '#f3f4f6',
                      fontSize: 11,
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleClearAllBlocked}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    color: '#f43f5e',
                    borderRadius: 6,
                    padding: '5px 8px',
                    cursor: 'pointer',
                    fontSize: 10,
                    fontWeight: 600
                  }}
                >
                  Clear All
                </button>
              </div>
            )}

            <div style={{ maxHeight: 270, overflowY: 'auto' }}>
              {filteredBlocklist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '28px 12px', color: 'var(--text-tertiary)', fontSize: 12 }}>
                  <Building2 size={22} style={{ marginBottom: 6, opacity: 0.4 }} />
                  <p style={{ margin: 0 }}>
                    {data.blockedCompanies.length === 0
                      ? "No blocked companies. Click '🚫 Block' on any LinkedIn job card or add one above."
                      : 'No matching companies found.'}
                  </p>
                </div>
              ) : (
                filteredBlocklist.map((c: BlockedCompany) => (
                  <div
                    key={c.id}
                    className="card"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 10px',
                      marginBottom: 6
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                        color: 'var(--text-secondary)'
                      }}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#f3f4f6' }}>{c.name}</div>
                        <div style={{ fontSize: 9, color: 'var(--text-tertiary)', marginTop: 1 }}>
                          Added {new Date(c.addedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCompany(c.id)}
                      title="Remove from blocklist"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#f43f5e',
                        cursor: 'pointer',
                        padding: 4,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: APPLIED JOBS LOG */}
        {activeTab === 'tracker' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ position: 'relative' }}>
              <Search size={12} style={{ position: 'absolute', left: 8, top: 9, color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Search logged jobs..."
                value={trackerSearch}
                onChange={(e) => setTrackerSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px 6px 26px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 6,
                  color: '#f3f4f6',
                  fontSize: 11,
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {appliedJobsList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '28px 12px', color: 'var(--text-tertiary)', fontSize: 12 }}>
                  <Briefcase size={22} style={{ marginBottom: 6, opacity: 0.4 }} />
                  <p style={{ margin: 0, fontWeight: 500 }}>No applications logged yet.</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: 10 }}>Applied jobs on LinkedIn will automatically save here.</p>
                </div>
              ) : (
                appliedJobsList.map((job) => (
                  <div
                    key={job.jobId}
                    className="card"
                    style={{
                      padding: 10,
                      marginBottom: 6
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-primary)' }}>{job.title}</div>
                      {job.url && (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, fontWeight: 500 }}>{job.company}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 9, color: 'var(--text-tertiary)' }}>
                      <span>{job.location}</span>
                      <span>{new Date(job.appliedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {saveNotification && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '6px 10px',
                borderRadius: 6,
                fontSize: 11,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <CheckCircle2 size={13} /> Settings saved
              </div>
            )}

            <div className="card" style={{ padding: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 10 }}>
                Automation & Feed Control
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { key: 'autoHideBlocked', label: 'Auto-hide blocked companies' },
                  { key: 'autoHideApplied', label: 'Auto-hide already applied jobs' },
                  { key: 'showGhostWarnings', label: 'Show ghost job warnings (>30d)' },
                  { key: 'highlightCompetition', label: 'Highlight applicant competition' },
                ].map((item) => (
                  <label key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: 11, color: 'var(--text-secondary)' }}>
                    <span>{item.label}</span>
                    <span className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={Boolean(data.settings[item.key as keyof ApplyFlowSettings])}
                        onChange={() => handleToggleSetting(item.key as keyof ApplyFlowSettings)}
                      />
                      <span className="toggle-track" />
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 10 }}>
                Translation Engine
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: 11, color: 'var(--text-secondary)' }}>
                  <span>Translate Easy Apply forms</span>
                  <span className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={data.settings.autoTranslateForms}
                      onChange={() => handleToggleSetting('autoTranslateForms')}
                    />
                    <span className="toggle-track" />
                  </span>
                </label>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)' }}>
                  <span>Target Language</span>
                  <select
                    value={data.settings.targetLanguage}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    style={{
                      background: 'var(--bg-input)',
                      color: '#f3f4f6',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 6,
                      padding: '4px 8px',
                      fontSize: 11,
                      outline: 'none'
                    }}
                  >
                    <option value="en">English</option>
                    <option value="de">German</option>
                    <option value="fr">French</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
