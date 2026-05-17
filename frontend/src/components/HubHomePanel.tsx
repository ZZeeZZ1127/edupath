import {
  ArrowRightIcon,
  BrainCircuitIcon,
  HistoryIcon,
  PlusCircleIcon,
  SparklesIcon,
  TargetIcon,
  TrendingUpIcon,
} from 'lucide-react';
import type { SavedPlan, StudentProfile } from '../types';
import { getGradeShortLabel } from '../lib/grades';
import { overallPlanProgress } from '../lib/planProgress';
import GrowthTimeline from './GrowthTimeline';

interface HubHomePanelProps {
  profile: StudentProfile;
  pastPlans: SavedPlan[];
  onNewTrack: () => void;
  onViewPlans: () => void;
  onOpenPlan: (plan: SavedPlan) => void;
}

export default function HubHomePanel({
  profile,
  pastPlans,
  onNewTrack,
  onViewPlans,
  onOpenPlan,
}: HubHomePanelProps) {
  const latest = pastPlans[0];
  const levelLabel = getGradeShortLabel(profile.grade);
  const avgProgress =
    pastPlans.length > 0
      ? Math.round(
          pastPlans.reduce((sum, p) => sum + overallPlanProgress(p).percent, 0) / pastPlans.length
        )
      : 0;

  return (
    <div data-cmp="HubHomePanel" className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-card shrink-0">
        <h1 className="text-lg font-bold text-foreground">Welcome back, {profile.name}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Your personal EduPath hub · {levelLabel}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-6 grid lg:grid-cols-5 gap-6 max-w-6xl mx-auto w-full">
          <div className="lg:col-span-2 flex flex-col gap-5 min-w-0">
            <div className="p-5 rounded-2xl bg-brand text-brand-foreground shadow-custom">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-70 mb-2">
                <BrainCircuitIcon className="w-4 h-4" />
                AI growth memory
              </div>
              <p className="text-sm leading-relaxed opacity-95">
                {pastPlans.length > 0 ? (
                  <>
                    EduPath remembers <strong>{pastPlans.length}</strong> past plan
                    {pastPlans.length > 1 ? `s` : ``}. New recommendations and guides build on your
                    history so guidance stays aligned as you grow.
                  </>
                ) : (
                  <>
                    Complete your first track and action plan — EduPath will save it here and use it
                    to personalize your next steps.
                  </>
                )}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl border border-border bg-card">
                <TrendingUpIcon className="w-4 h-4 text-emerald mb-1.5" />
                <div className="text-xl font-bold text-foreground">{pastPlans.length}</div>
                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">Saved plans</p>
              </div>
              <div className="p-3.5 rounded-2xl border border-border bg-card">
                <SparklesIcon className="w-4 h-4 text-primary mb-1.5" />
                <div className="text-sm font-bold text-foreground leading-tight line-clamp-2" title={levelLabel}>
                  {levelLabel}
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">Current level</p>
              </div>
              <div className="p-3.5 rounded-2xl border border-border bg-card">
                <TargetIcon className="w-4 h-4 text-amber mb-1.5" />
                <div className="text-xl font-bold text-foreground">{avgProgress}%</div>
                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">Avg. progress</p>
              </div>
            </div>

            {(profile.interests.length > 0 || profile.goals.length > 0) && (
              <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
                {profile.interests.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Focus areas
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.interests.map((interest) => (
                        <span
                          key={interest}
                          className="text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground font-medium"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {profile.goals.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Goals
                    </p>
                    <ul className="text-sm text-foreground leading-relaxed list-disc list-inside space-y-0.5">
                      {profile.goals.slice(0, 3).map((goal, i) => <li key={i} className="line-clamp-1">{goal}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onNewTrack}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 shadow-custom"
              >
                <PlusCircleIcon className="w-4 h-4" />
                Get new AI tracks
              </button>
              <button
                onClick={onViewPlans}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border bg-card text-sm font-semibold hover:bg-muted transition-all"
              >
                <HistoryIcon className="w-4 h-4" />
                View past plans
              </button>
            </div>

            {latest ? (
              <section>
                <h2 className="text-sm font-semibold text-foreground mb-3">Continue where you left off</h2>
                <button
                  type="button"
                  onClick={() => onOpenPlan(latest)}
                  className="w-full text-left p-5 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all group"
                >
                  <p className="text-xs text-muted-foreground mb-1">Latest plan</p>
                  <h3 className="font-semibold text-foreground group-hover:text-primary">{latest.track.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{latest.guide.overview}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary mt-3">
                    Open full plan
                    <ArrowRightIcon className="w-3 h-3" />
                  </span>
                </button>
              </section>
            ) : (
              <section className="p-5 rounded-2xl border border-dashed border-border bg-muted/30 text-center">
                <p className="text-sm font-medium text-foreground">No plans yet</p>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  Your growth timeline will fill in as you complete tracks.
                </p>
                <button
                  onClick={onNewTrack}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90"
                >
                  Start your first plan
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </section>
            )}
          </div>

          <div className="lg:col-span-3 min-h-[360px] lg:min-h-0 lg:h-[calc(100vh-8rem)]">
            <GrowthTimeline profile={profile} plans={pastPlans} onOpenPlan={onOpenPlan} />
          </div>
        </div>
      </div>
    </div>
  );
}
