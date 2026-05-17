import { INTEREST_CATALOG, searchCatalog } from '../data/interestCatalog';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, ``) ?? ``;
const CUSTOM_KEY = `edupath:customInterests`;

export interface InterestSearchResult {
  name: string;
  source: 'database' | 'custom';
}

function loadCustomInterests(): string[] {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveCustomInterests(names: string[]) {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(names));
}

export function getAllKnownInterests(): string[] {
  const custom = loadCustomInterests();
  const merged = [...INTEREST_CATALOG];
  for (const c of custom) {
    if (!merged.some((m) => m.toLowerCase() === c.toLowerCase())) merged.push(c);
  }
  return merged;
}

export async function searchInterests(query: string): Promise<InterestSearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/interests/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = (await res.json()) as { interests?: { name: string }[] };
        return (data.interests ?? []).map((i) => ({ name: i.name, source: `database` as const }));
      }
    } catch {
      /* fall through */
    }
  }

  const fromDb = searchCatalog(q, 20);
  const custom = loadCustomInterests().filter((name) => name.toLowerCase().includes(q.toLowerCase()));

  const seen = new Set<string>();
  const results: InterestSearchResult[] = [];

  for (const name of fromDb) {
    const key = name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      results.push({ name, source: `database` });
    }
  }
  for (const name of custom) {
    const key = name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      results.push({ name, source: `custom` });
    }
  }

  return results;
}

export function interestExistsInDatabase(name: string): boolean {
  const lower = name.trim().toLowerCase();
  return (
    INTEREST_CATALOG.some((i) => i.toLowerCase() === lower) ||
    loadCustomInterests().some((i) => i.toLowerCase() === lower)
  );
}

export async function createCustomInterest(name: string): Promise<string> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error(`Interest name is required`);

  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/interests`, {
        method: `POST`,
        headers: { 'Content-Type': `application/json` },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.ok) {
        const data = (await res.json()) as { name?: string };
        return data.name ?? trimmed;
      }
    } catch {
      /* fall through */
    }
  }

  const custom = loadCustomInterests();
  if (!custom.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
    custom.push(trimmed);
    saveCustomInterests(custom);
  }
  return trimmed;
}
