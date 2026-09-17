export const COMPARISON_STORAGE_KEY = "fauji-compare:ids";
export const COMPARISON_MAX = 3;
export const COMPARISON_CHANGE_EVENT = "fauji-compare-change";

const PROPERTY_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isComparisonId(value: unknown): value is string {
  return typeof value === "string" && PROPERTY_ID_PATTERN.test(value);
}

export function normalizeComparisonIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const ids: string[] = [];
  const seen = new Set<string>();

  for (const item of value) {
    if (!isComparisonId(item) || seen.has(item)) continue;
    seen.add(item);
    ids.push(item);
    if (ids.length >= COMPARISON_MAX) break;
  }

  return ids;
}

export function parseComparisonIds(raw: string | null): string[] {
  if (!raw) return [];

  try {
    return normalizeComparisonIds(JSON.parse(raw) as unknown);
  } catch {
    return [];
  }
}

export function readComparisonIds(): string[] {
  try {
    const raw = window.localStorage.getItem(COMPARISON_STORAGE_KEY);
    if (raw === null) return [];

    try {
      JSON.parse(raw);
    } catch {
      window.localStorage.removeItem(COMPARISON_STORAGE_KEY);
      return [];
    }

    return parseComparisonIds(raw);
  } catch {
    try {
      window.localStorage.removeItem(COMPARISON_STORAGE_KEY);
    } catch {
      // Ignore storage access errors (private mode, disabled storage).
    }
    return [];
  }
}

export function writeComparisonIds(ids: string[]): void {
  const normalized = normalizeComparisonIds(ids);

  try {
    if (normalized.length === 0) {
      window.localStorage.removeItem(COMPARISON_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    // Ignore quota / access errors so comparison still works for the current session.
  }
}
