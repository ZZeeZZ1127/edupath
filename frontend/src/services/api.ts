import type {
  ActionGuide,
  SavedPlan,
  StudentProfile,
  TrackRecommendation,
  UserSession,
} from '../types';
import { generateActionGuide, generateTrackRecommendations } from './mockAi';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, ``) ?? ``;

function storageKey(userId: string, suffix: string) {
  return `edupath:${suffix}:${userId}`;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: `POST`,
    headers: { 'Content-Type': `application/json` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function saveProfile(session: UserSession, profile: StudentProfile): Promise<void> {
  if (API_BASE) {
    await postJson(`/profile`, { userId: session.userId, email: session.email, profile });
    return;
  }
  localStorage.setItem(storageKey(session.userId, `profile`), JSON.stringify(profile));
  await new Promise((r) => setTimeout(r, 900));
}

export async function loadProfile(session: UserSession): Promise<StudentProfile | null> {
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/profile?userId=${encodeURIComponent(session.userId)}`);
      if (!res.ok) return null;
      const data = (await res.json()) as { profile?: StudentProfile };
      return data.profile ?? null;
    } catch {
      return null;
    }
  }
  const raw = localStorage.getItem(storageKey(session.userId, `profile`));
  return raw ? (JSON.parse(raw) as StudentProfile) : null;
}

export async function loadPastPlans(userId: string): Promise<SavedPlan[]> {
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/plans?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) return [];
      const data = (await res.json()) as { plans?: SavedPlan[] };
      return data.plans ?? [];
    } catch {
      return [];
    }
  }
  const raw = localStorage.getItem(storageKey(userId, `pastPlans`));
  if (!raw) return [];
  const plans = JSON.parse(raw) as SavedPlan[];
  return plans.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function savePastPlan(plan: SavedPlan): Promise<void> {
  if (API_BASE) {
    await postJson(`/plans`, plan);
    return;
  }
  const existing = await loadPastPlans(plan.userId);
  const next = [plan, ...existing.filter((p) => p.id !== plan.id)];
  localStorage.setItem(storageKey(plan.userId, `pastPlans`), JSON.stringify(next));
}

export function buildSavedPlan(
  userId: string,
  profile: StudentProfile,
  track: TrackRecommendation,
  guide: ActionGuide
): SavedPlan {
  return {
    id: `plan-${Date.now()}`,
    userId,
    track,
    guide,
    profileSnapshot: profile,
    createdAt: new Date().toISOString(),
    status: `active`,
  };
}

export async function fetchTrackRecommendations(
  profile: StudentProfile,
  pastPlans: SavedPlan[] = []
): Promise<TrackRecommendation[]> {
  if (API_BASE) {
    try {
      const data = await postJson<{ tracks: TrackRecommendation[] }>(`/recommendations`, {
        profile,
        pastPlans,
      });
      return data.tracks;
    } catch {
      /* fall through to mock */
    }
  }
  return generateTrackRecommendations(profile, pastPlans);
}

export async function fetchActionGuide(
  profile: StudentProfile,
  track: TrackRecommendation,
  pastPlans: SavedPlan[] = []
): Promise<ActionGuide> {
  if (API_BASE) {
    try {
      const data = await postJson<{ guide: ActionGuide }>(`/action-guide`, {
        profile,
        track,
        pastPlans,
      });
      return data.guide;
    } catch {
      /* fall through to mock */
    }
  }
  return generateActionGuide(profile, track, pastPlans);
}

export function persistSelectedTrack(userId: string, track: TrackRecommendation) {
  localStorage.setItem(storageKey(userId, `selectedTrack`), JSON.stringify(track));
}

export function loadSelectedTrack(userId: string): TrackRecommendation | null {
  const raw = localStorage.getItem(storageKey(userId, `selectedTrack`));
  return raw ? (JSON.parse(raw) as TrackRecommendation) : null;
}
