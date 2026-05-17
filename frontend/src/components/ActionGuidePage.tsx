import { useEffect, useRef, useState } from 'react';
import {
  BookOpenIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  GlobeIcon,
  GraduationCapIcon,
  HomeIcon,
  Loader2Icon,
  LogOutIcon,
  SparklesIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import type { ActionGuide, SavedPlan, StudentProfile, TrackRecommendation } from '../types';
import { fetchActionGuide } from '../services/api';
import WorkflowStepper from './WorkflowStepper';

interface ActionGuidePageProps {
  profile: StudentProfile;
  track: TrackRecommendation;
  pastPlans?: SavedPlan[];
  initialGuide?: ActionGuide | null;
  viewingSaved?: boolean;
  onGuideReady?: (guide: ActionGuide) => void;
  onGoToHub?: () => void;
  onBack?: () => void;
  onLogout?: () => void;
  onStartOver?: () => void;
}

export default function ActionGuidePage({
  profile,
  track,
  pastPlans = [],
  initialGuide = null,
  viewingSaved = false,
  onGuideReady = () => {},
  onGoToHub = () => {},
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

  const requestKey = `${track.id}:${viewingSaved ? `saved` : `new`}`;

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
        const result = await fetchActionGuide(profile, track, pastPlansRef.current);
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
        <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
          <GraduationCapIcon className="w-4.5 h-4.5 text-white" />
        </div>
        <span className="text-lg font-bold text-brand">EduPath</span>
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
                Researching the web and building your step-by-step guide for{' '}
                <strong>{track.title}</strong>…
              </p>
            </div>
          ) : guide ? (
            <div className="fade-in space-y-8">
              <div className="p-6 rounded-2xl bg-brand text-brand-foreground shadow-custom">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-70 mb-2">
                  <GlobeIcon className="w-4 h-4" />
                  Web-sourced action plan
                </div>
                <h1 className="text-2xl font-bold mb-2">{guide.trackTitle}</h1>
                <p className="text-sm opacity-90 leading-relaxed">{guide.overview}</p>
                <p className="text-xs opacity-70 mt-3">Estimated: {guide.estimatedDuration}</p>
              </div>

              {guide.prerequisites.length > 0 && (
                <section>
                  <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle2Icon className="w-4 h-4 text-emerald" />
                    Before you start
                  </h2>
                  <ul className="flex flex-col gap-2">
                    {guide.prerequisites.map((item) => (
                      <li
                        key={item}
                        className="text-sm text-muted-foreground px-4 py-2.5 rounded-xl bg-muted border border-border"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section>
                <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BookOpenIcon className="w-4 h-4 text-primary" />
                  Step-by-step instructions
                </h2>
                <div className="flex flex-col gap-4">
                  {guide.steps
                    .sort((a, b) => a.order - b.order)
                    .map((step) => (
                      <div
                        key={step.id}
                        className="p-5 rounded-2xl border border-border bg-card shadow-custom"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                            {step.order}
                          </span>
                          <h3 className="font-semibold text-foreground">{step.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed ml-10">
                          {step.description}
                        </p>
                        {step.tips && step.tips.length > 0 && (
                          <ul className="mt-3 ml-10 flex flex-col gap-1.5">
                            {step.tips.map((tip) => (
                              <li key={tip} className="text-xs text-accent-foreground flex gap-2">
                                <SparklesIcon className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                </div>
              </section>

              <section>
                <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <GlobeIcon className="w-4 h-4 text-primary" />
                  Resources from the internet
                </h2>
                <div className="flex flex-col gap-3">
                  {guide.resources.map((res) => (
                    <a
                      key={res.url}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-all group"
                    >
                      <ExternalLinkIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground group-hover:text-primary">
                          {res.title}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{res.description}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-sm font-semibold text-foreground mb-3">Weekly milestones</h2>
                <div className="flex flex-col gap-2">
                  {guide.weeklyMilestones.map((milestone, i) => (
                    <div
                      key={milestone}
                      className="flex items-center gap-3 text-sm px-4 py-3 rounded-xl bg-accent/50 border border-accent-foreground/10"
                    >
                      <span className="text-xs font-bold text-primary w-6">W{i + 1}</span>
                      <span className="text-foreground">{milestone}</span>
                    </div>
                  ))}
                </div>
              </section>

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
