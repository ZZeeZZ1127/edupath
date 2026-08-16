import { useEffect, useRef, useState } from 'react';
import {
  BookOpenIcon,
  CheckCircle2Icon,
  CircleIcon,
  HomeIcon,
  Loader2Icon,
  LogOutIcon,
  SparklesIcon,
  FileTextIcon,
  CalendarIcon,
  BuildingIcon,
  TargetIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import type { ActionGuide, SavedPlan, StudentProfile, TrackRecommendation } from '../types';
import { fetchActionGuide } from '../services/api';
import WorkflowStepper from './WorkflowStepper';
import EduPathBrand from './EduPathBrand';
import DataModeBadge from './DataModeBadge';

interface ActionGuidePageProps {
  userId: string;
  profile: StudentProfile;
  track: TrackRecommendation;
  pastPlans?: SavedPlan[];
  initialGuide?: ActionGuide | null;
  viewingSaved?: boolean;
  onGuideReady?: (guide: ActionGuide) => void;
  onGoToHub?: () => void;
  onHome?: () => void;
  onBack?: () => void;
  onLogout?: () => void;
  onStartOver?: () => void;
}

const FIT_COLORS: Record<string, string> = {
  reach: `bg-rose-muted text-rose border-rose/20`,
  match: `bg-amber-muted text-amber border-amber/20`,
  safety: `bg-emerald-muted text-emerald border-emerald/20`,
};

export default function ActionGuidePage({
  userId,
  profile,
  track,
  pastPlans = [],
  initialGuide = null,
  viewingSaved = false,
  onGuideReady = () => {},
  onGoToHub = () => {},
  onHome = () => {},
  onBack = () => {},
  onLogout = () => {},
  onStartOver = () => {},
}: ActionGuidePageProps) {
  const [guide, setGuide] = useState<ActionGuide | null>(initialGuide);
  const [loading, setLoading] = useState(!initialGuide);
  const savedKeyRef = useRef<string | null>(null);
  const onGuideReadyRef = useRef(onGuideReady);
  const pastPlansRef = useRef(pastPlans);

  onGuideReadyRef.current = onGuideReady;
  pastPlansRef.current = pastPlans;

  const requestKey = `${track.track_id}:${viewingSaved ? `saved` : `new`}`;

  useEffect(() => {
    savedKeyRef.current = null;
  }, [requestKey]);

  useEffect(() => {
    if (initialGuide) {
      setGuide(initialGuide);
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setGuide(null);
      setLoading(true);
      try {
        const result = await fetchActionGuide(profile, track, pastPlansRef.current, userId);
        if (cancelled) return;
        setGuide(result);
        setLoading(false);
        if (!viewingSaved && savedKeyRef.current !== requestKey) {
          savedKeyRef.current = requestKey;
          onGuideReadyRef.current(result);
        }
      } catch {
        if (!cancelled) {
          toast.error(`Could not generate your action plan.`);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [requestKey, initialGuide, profile, track, viewingSaved]);

  const showHubLink = !viewingSaved || !!guide;

  return (
    <div data-cmp="ActionGuidePage" className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center gap-3 px-6 py-4 border-b border-border bg-card">
        <EduPathBrand onHome={onHome} iconSize="sm" />
        <DataModeBadge />
        <button
          type="button"
          onClick={onGoToHub}
          className="ml-auto flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <HomeIcon className="w-4 h-4" />
          My EduPath
        </button>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-rose transition-colors ml-3"
        >
          <LogOutIcon className="w-4 h-4" />
        </button>
      </header>

      <WorkflowStepper
        current="action-guide"
        showHubLink={showHubLink}
        onGoToHub={onGoToHub}
      />

      <main className="flex-1 overflow-y-auto px-6 py-8 scrollbar-thin">
        <div className="max-w-3xl mx-auto">
          {viewingSaved && guide && (
            <p className="text-xs text-muted-foreground mb-4 px-3 py-2 rounded-lg bg-muted border border-border">
              Viewing a saved plan from your history — AI will reference this when suggesting your next tracks.
            </p>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2Icon className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Building your step-by-step guide for{' '}
                <strong>{track.label}</strong>…
              </p>
            </div>
          ) : guide ? (
            <div className="fade-in space-y-8">
              <div className="p-6 rounded-2xl bg-brand text-brand-foreground shadow-custom">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-70 mb-2">
                  <TargetIcon className="w-4 h-4" />
                  Action plan
                </div>
                <h1 className="text-2xl font-bold mb-2">{guide.label}</h1>
                <p className="text-sm opacity-90 leading-relaxed">{track.description}</p>
                <p className="text-xs opacity-70 mt-3">
                  {guide.tasks.length} tasks · {guide.tasks.reduce((s, t) => s + t.action_items.length, 0)} action items
                </p>
              </div>

              {/* Tasks */}
              <section>
                <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BookOpenIcon className="w-4 h-4 text-primary" />
                  Tasks & action items
                </h2>
                <div className="flex flex-col gap-4">
                  {guide.tasks.map((task, i) => (
                    <div
                      key={task.task_id}
                      className="p-5 rounded-2xl border border-border bg-card shadow-custom"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <h3 className="font-semibold text-foreground">{task.label}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed ml-10 mb-3">
                        {task.match_reasoning}
                      </p>

                      {/* Materials */}
                      {task.materials_needed.length > 0 && (
                        <div className="ml-10 mb-3">
                          <div className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                            <FileTextIcon className="w-3.5 h-3.5" /> Materials needed
                          </div>
                          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                            {task.materials_needed.map((m, j) => <li key={j}>{m}</li>)}
                          </ul>
                        </div>
                      )}

                      {/* Action items */}
                      <div className="ml-10">
                        <div className="text-xs font-semibold text-muted-foreground mb-1.5">Action items</div>
                        <ul className="space-y-1.5">
                          {task.action_items.map((action, j) => (
                            <li key={j} className="flex items-start gap-2 text-xs text-foreground">
                              <CircleIcon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                              <span className="leading-relaxed">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Deadline */}
                      {task.deadlines.application && (
                        <div className="ml-10 mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          <span>Deadline: {task.deadlines.application}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* College fit chart */}
              {guide.college_fit_chart && guide.college_fit_chart.length > 0 && (
                <section>
                  <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <BuildingIcon className="w-4 h-4 text-primary" />
                    College fit chart
                  </h2>
                  <div className="flex flex-col gap-3">
                    {guide.college_fit_chart.map((school) => {
                      const fitStyle = FIT_COLORS[school.fit_type] ?? FIT_COLORS.match;
                      return (
                        <div
                          key={school.school}
                          className="p-4 rounded-xl border border-border bg-card"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-foreground text-sm">{school.school}</h3>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${fitStyle}`}>
                              {school.fit_type}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{school.why_it_fits}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span>GPA: {school.requirements.gpa}</span>
                            <span>Tests: {school.requirements.test_scores}</span>
                            {school.application_deadline && <span>Apply by: {school.application_deadline}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={onGoToHub}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 shadow-custom"
                >
                  <HomeIcon className="w-4 h-4" />
                  Go to My EduPath
                </button>
                {!viewingSaved && (
                  <>
                    <button
                      onClick={onBack}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      ← Choose a different track
                    </button>
                    <button
                      onClick={onStartOver}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Update my profile
                    </button>
                  </>
                )}
                {viewingSaved && (
                  <button
                    onClick={onBack}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    ← Back to past plans
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">Something went wrong. Go back and try again.</p>
          )}
        </div>
      </main>
    </div>
  );
}
