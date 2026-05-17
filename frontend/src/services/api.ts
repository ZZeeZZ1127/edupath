import type {
  ActionGuide,
  GuideStep,
  SavedPlan,
  StepDetail,
  StudentProfile,
  TrackRecommendation,
  UserSession,
} from '../types';
import { generateActionGuide, generateStepDetail, generateTrackRecommendations } from './mockAi';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, ``) ?? ``;

function storageKey(userId: string, suffix: string) {
  return `edupath:${suffix}:${userId}`;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
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

// ── Profile ────────────────────────────────────────────

export async function saveProfile(session: UserSession, profile: StudentProfile): Promise<void> {
  if (API_BASE) {
    // Match create_profile Lambda: flat fields + userId
    await postJson(`/profile`, {
      userId: session.userId,
      name: profile.name,
      age: profile.age,
      grade: profile.grade,
      interests: profile.interests,
      extracurriculars: profile.extracurriculars,
      goals: profile.goals,
      conversationHistory: [],
    });
    return;
  }
  localStorage.setItem(storageKey(session.userId, `profile`), JSON.stringify(profile));
  await new Promise((r) => setTimeout(r, 900));
}

export async function loadProfile(session: UserSession): Promise<StudentProfile | null> {
  if (API_BASE) {
    try {
      const data = await getJson<{ profile?: StudentProfile }>(
        `/profile?userId=${encodeURIComponent(session.userId)}`
      );
      return data.profile ?? null;
    } catch {
      return null;
    }
  }
  const raw = localStorage.getItem(storageKey(session.userId, `profile`));
  return raw ? (JSON.parse(raw) as StudentProfile) : null;
}

// ── Past plans (mock-only — no backend endpoint yet) ───

export async function loadPastPlans(userId: string): Promise<SavedPlan[]> {
  if (API_BASE) {
    // Backend does not yet expose GET /plans; return empty until it's added
    return [];
  }
  const raw = localStorage.getItem(storageKey(userId, `pastPlans`));
  if (!raw) return [];
  const plans = JSON.parse(raw) as SavedPlan[];
  const deduped = dedupePastPlans(plans);
  if (deduped.length !== plans.length) {
    localStorage.setItem(storageKey(userId, `pastPlans`), JSON.stringify(deduped));
  }
  return deduped;
}

function dedupePastPlans(plans: SavedPlan[]): SavedPlan[] {
  const byTrack = new Map<string, SavedPlan>();
  for (const plan of plans) {
    const prev = byTrack.get(plan.track.id);
    if (!prev || plan.createdAt > prev.createdAt) {
      byTrack.set(plan.track.id, plan);
    }
  }
  return [...byTrack.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function savePastPlan(plan: SavedPlan): Promise<void> {
  if (API_BASE) {
    // Backend does not yet expose POST /plans; no-op for now
    return;
  }
  const existing = await loadPastPlans(plan.userId);
  const next = [
    plan,
    ...existing.filter((p) => p.id !== plan.id && p.track.id !== plan.track.id),
  ];
  localStorage.setItem(storageKey(plan.userId, `pastPlans`), JSON.stringify(next));
}

export async function updatePastPlan(userId: string, updated: SavedPlan): Promise<void> {
  const withTimestamp: SavedPlan = {
    ...updated,
    progress: {
      completedStepIds: updated.progress?.completedStepIds ?? [],
      completedMilestoneIndexes: updated.progress?.completedMilestoneIndexes ?? [],
      stepDetails: updated.progress?.stepDetails,
      updatedAt: new Date().toISOString(),
    },
  };
  await savePastPlan(withTimestamp);
}

export function buildSavedPlan(
  userId: string,
  profile: StudentProfile,
  track: TrackRecommendation,
  guide: ActionGuide,
  existingId?: string
): SavedPlan {
  return {
    id: existingId ?? `plan-${track.id}-${Date.now()}`,
    userId,
    track,
    guide,
    profileSnapshot: profile,
    createdAt: new Date().toISOString(),
    status: `active`,
    progress: {
      completedStepIds: [],
      completedMilestoneIndexes: [],
    },
  };
}

// ── Track recommendations ──────────────────────────────

export async function selectTrack(userId: string, track: TrackRecommendation): Promise<void> {
  if (API_BASE) {
    await postJson(`/select-track`, { userId, track });
    return;
  }
  localStorage.setItem(storageKey(userId, `selectedTrack`), JSON.stringify(track));
}

export async function fetchTrackRecommendations(
  profile: StudentProfile,
  pastPlans: SavedPlan[] = [],
  userId?: string
): Promise<TrackRecommendation[]> {
  if (API_BASE) {
    try {
      // Match recommend Lambda: sends userId, loads profile from DB
      const data = await postJson<{ tracks: TrackRecommendation[] }>(`/recommend`, {
        userId: userId ?? profile.name.toLowerCase().replace(/[^a-z0-9]/g, `-`),
      });
      return data.tracks;
    } catch {
      /* fall through to mock */
    }
  }
  return generateTrackRecommendations(profile, pastPlans);
}

// ── Action guide (plan) ────────────────────────────────

export async function fetchActionGuide(
  profile: StudentProfile,
  track: TrackRecommendation,
  pastPlans: SavedPlan[] = [],
  userId?: string
): Promise<ActionGuide> {
  if (API_BASE) {
    try {
      // First persist the selected track, then generate the plan
      const uid = userId ?? profile.name.toLowerCase().replace(/[^a-z0-9]/g, `-`);
      await selectTrack(uid, track);
      const data = await postJson<{ plan: ActionGuide }>(`/plan`, { userId: uid });
      return data.plan;
    } catch {
      /* fall through to mock */
    }
  }
  return generateActionGuide(profile, track, pastPlans);
}

// ── Step detail ────────────────────────────────────────

export async function fetchStepDetail(
  profile: StudentProfile,
  track: TrackRecommendation,
  step: GuideStep,
  guide: ActionGuide
): Promise<StepDetail> {
  if (API_BASE) {
    try {
      // Backend does not yet expose POST /step-detail
      // In a full implementation this would call Bedrock for deep-dive guidance
      throw new Error(`Not implemented`);
    } catch {
      /* fall through to mock */
    }
  }
  return generateStepDetail(profile, track, step, guide);
}

// ── Local helpers ──────────────────────────────────────

export function persistSelectedTrack(userId: string, track: TrackRecommendation) {
  localStorage.setItem(storageKey(userId, `selectedTrack`), JSON.stringify(track));
}

export function loadSelectedTrack(userId: string): TrackRecommendation | null {
  const raw = localStorage.getItem(storageKey(userId, `selectedTrack`));
  return raw ? (JSON.parse(raw) as TrackRecommendation) : null;
}
