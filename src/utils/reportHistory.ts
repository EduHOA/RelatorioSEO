import { ReportConfig } from '../types/report';

const HISTORY_KEY = 'liveseo-report-history';
const LEGACY_KEY = 'liveseo-report-config';

function migrateLegacyStorage(): void {
  if (localStorage.getItem(HISTORY_KEY)) return;
  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const config = JSON.parse(legacy) as ReportConfig;
      if (config && config.id) {
        const list: ReportConfig[] = [config];
        localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
      }
      localStorage.removeItem(LEGACY_KEY);
    }
  } catch {
    localStorage.removeItem(LEGACY_KEY);
  }
}

export function getReportHistory(): ReportConfig[] {
  migrateLegacyStorage();
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as ReportConfig[];
    if (!Array.isArray(list)) return [];
    return list.slice().sort((a, b) => {
      const da = a.metadata?.updatedAt ?? a.metadata?.createdAt ?? '';
      const db = b.metadata?.updatedAt ?? b.metadata?.createdAt ?? '';
      return da > db ? -1 : da < db ? 1 : 0;
    });
  } catch {
    return [];
  }
}

export function saveReportToHistory(config: ReportConfig): void {
  const now = new Date().toISOString();
  const updated: ReportConfig = {
    ...config,
    metadata: {
      ...config.metadata,
      updatedAt: now,
      createdAt: config.metadata?.createdAt ?? now,
      createdBy: config.metadata?.createdBy ?? '',
    },
  };

  const list = getReportHistory();
  const idx = list.findIndex((r) => r.id === config.id);
  const next = idx >= 0
    ? list.map((r, i) => (i === idx ? updated : r))
    : [updated, ...list];

  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

export function deleteReportFromHistory(id: string): void {
  const list = getReportHistory().filter((r) => r.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
}

export function clearReportHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}
