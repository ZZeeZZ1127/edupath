import {
  ArrowRightIcon,
  BrainCircuitIcon,
  HistoryIcon,
  PlusCircleIcon,
  SparklesIcon,
  TrendingUpIcon,
} from 'lucide-react';
import type { SavedPlan, StudentProfile } from '../types';

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

  return (
    <div data-cmp="HubHomePanel" className="flex flex-col h-full overflow-y-auto scrollbar-thin">
      <div className="px-6 py-4 border-b border-border bg-card shrink-0">
        <h1 className="text-lg font-bold text-foreground">Welcome back, {profile.name}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Your personal EduPath hub</p>
      </div>

      <div className="p-6 max-w-2xl flex flex-col gap-6">
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
                Complete your first track and action plan — EduPath will save it here and use it to
                personalize your next steps.
              </>
            )}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-border bg-card">
            <TrendingUpIcon className="w-5 h-5 text-emerald mb-2" />
            <div className="text-2xl font-bold text-foreground">{pastPlans.length}</div>
            <p className="text-xs text-muted-foreground">Saved plans</p>
          </div>
          <div className="p-4 rounded-2xl border border-border bg-card">
            <SparklesIcon className="w-5 h-5 text-primary mb-2" />
            <div className="text-2xl font-bold text-foreground">Grade {profile.grade}</div>
            <p className="text-xs text-muted-foreground">Current level</p>
          </div>
        </div>

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

        {latest && (
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
        )}
      </div>
    </div>
  );
}
