import { useEffect, useState } from 'react';
import {
  ArrowRightIcon,
  BrainCircuitIcon,
  HomeIcon,
  Loader2Icon,
  LogOutIcon,
  SparklesIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CircleIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import type { SavedPlan, StudentProfile, TrackRecommendation, TrackTask } from '../types';
import { fetchTrackRecommendations } from '../services/api';
import WorkflowStepper from './WorkflowStepper';
import EduPathBrand from './EduPathBrand';
import DataModeBadge from './DataModeBadge';

interface TrackSelectionPageProps {
  userId: string;
  profile: StudentProfile;
  pastPlans?: SavedPlan[];
  onSelectTrack: (track: TrackRecommendation) => void;
  onBack?: () => void;
  onGoToHub?: () => void;
  onHome?: () => void;
  onLogout?: () => void;
}

const CATEGORY_LABEL: Record<string, string> = {
  research: `Research`,
  internship: `Internship / Program`,
  college: `College prep`,
  competition: `Competition`,
  extracurricular: `Extracurricular`,
  'skill-building': `Skill building`,
};

function difficultyLabel(d: number): { label: string; style: string } {
  if (d >= 60) return { label: `Challenging`, style: `bg-rose-muted text-rose border-rose/20` };
  if (d >= 35) return { label: `Moderate`, style: `bg-amber-muted text-amber border-amber/20` };
  return { label: `Accessible`, style: `bg-emerald-muted text-emerald border-emerald/20` };
}

function dominantCategory(tasks: TrackTask[]): string {
  const freq: Record<string, number> = {};
  for (const t of tasks) freq[t.category] = (freq[t.category] ?? 0) + 1;
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? `extracurricular`;
}

export default function TrackSelectionPage({
  userId,
  profile,
  pastPlans = [],
  onSelectTrack,
  onBack = () => {},
  onGoToHub = () => {},
  onHome = () => {},
  onLogout = () => {},
}: TrackSelectionPageProps) {
  const [tracks, setTracks] = useState<TrackRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const result = await fetchTrackRecommendations(profile, pastPlans, userId);
        if (!cancelled) setTracks(result);
      } catch {
        if (!cancelled) toast.error(`Could not load recommendations. Please try again.`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profile, pastPlans]);

  const handleContinue = () => {
    const track = tracks.find((t) => t.track_id === selectedId);
    if (!track) return;
    setSubmitting(true);
    onSelectTrack(track);
  };

  return (
    <div data-cmp="TrackSelectionPage" className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center gap-3 px-6 py-4 border-b border-border bg-card">
        <EduPathBrand onHome={onHome} iconSize="sm" />
        <DataModeBadge />
        {pastPlans.length > 0 && (
          <button
            type="button"
            onClick={onGoToHub}
            className="ml-auto flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <HomeIcon className="w-4 h-4" />
            My EduPath
          </button>
        )}
        <button
          onClick={onLogout}
          className={`flex items-center gap-2 text-sm text-muted-foreground hover:text-rose transition-colors ${pastPlans.length > 0 ? `ml-3` : `ml-auto`}`}
        >
          <LogOutIcon className="w-4 h-4" />
          Sign out
        </button>
      </header>

      <WorkflowStepper
        current="recommendations"
        showHubLink={pastPlans.length > 0}
        onGoToHub={onGoToHub}
      />

      <main className="flex-1 overflow-y-auto px-6 py-8 scrollbar-thin">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center shrink-0">
              <BrainCircuitIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">
                What should you focus on right now?
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Our recommendation AI read your profile
                {pastPlans.length > 0
                  ? ` and ${pastPlans.length} past plan${pastPlans.length > 1 ? `s` : ``} `
                  : ` `}
                from the database and generated{' '}
                {loading ? `options` : `${tracks.length} tracks`} tailored for{' '}
                <strong>{profile.name}</strong>. Choose one to get a detailed action plan.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2Icon className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Analyzing your profile with Bedrock…</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {tracks.map((track) => {
                const selected = selectedId === track.track_id;
                const diff = difficultyLabel(track.difficulty);
                const isExpanded = expandedId === track.track_id;
                const cat = dominantCategory(track.tasks);

                return (
                  <button
                    key={track.track_id}
                    type="button"
                    onClick={() => setSelectedId(track.track_id)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all ${
                      selected
                        ? `border-primary bg-accent/50 shadow-custom ring-2 ring-primary/20`
                        : `border-border bg-card hover:border-primary/40`
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">{track.label}</h3>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${diff.style}`}
                      >
                        {diff.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{track.description}</p>
                    <div className="p-3 rounded-xl bg-accent border border-accent-foreground/10 mb-3">
                      <div className="flex items-start gap-2">
                        <SparklesIcon className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                        <p className="text-xs text-accent-foreground leading-relaxed">
                          {track.tasks.length} tasks across {[...new Set(track.tasks.map((t) => t.category))].map((c) => CATEGORY_LABEL[c] ?? c).join(`, `)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="px-2 py-0.5 rounded-full bg-muted border border-border capitalize">
                        {CATEGORY_LABEL[cat] ?? cat}
                      </span>
                      <span>{track.tasks.length} tasks</span>
                      <span>Difficulty: {track.difficulty}%</span>
                    </div>

                    {/* Expandable tasks preview */}
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedId(isExpanded ? null : track.track_id);
                        }}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        {isExpanded ? <ChevronUpIcon className="w-3.5 h-3.5" /> : <ChevronDownIcon className="w-3.5 h-3.5" />}
                        {isExpanded ? `Hide tasks` : `Show ${track.tasks.length} tasks`}
                      </button>
                      {isExpanded && (
                        <div className="mt-3 space-y-2">
                          {track.tasks.map((task) => (
                            <div key={task.task_id} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50 border border-border">
                              <CircleIcon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                              <div>
                                <span className="text-xs font-medium text-foreground">{task.label}</span>
                                <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {!loading && (
            <div className="flex items-center justify-between mt-10">
              <button
                onClick={onBack}
                className="text-sm text-muted-foreground hover:text-foreground font-medium"
              >
                ← Edit profile
              </button>
              <button
                onClick={handleContinue}
                disabled={!selectedId || submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-all shadow-custom"
              >
                {submitting ? (
                  <Loader2Icon className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Generate my action plan
                    <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
