import {
  ArrowRightIcon,
  CalendarIcon,
  HistoryIcon,
  SparklesIcon,
  TargetIcon,
} from 'lucide-react';
import type { SavedPlan, StudentProfile } from '../types';
import { overallPlanProgress } from '../lib/planProgress';

interface PastPlansPanelProps {
  profile: StudentProfile;
  plans: SavedPlan[];
  onOpenPlan: (plan: SavedPlan) => void;
  onNewTrack?: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: `long`,
    day: `numeric`,
    year: `numeric`,
  });
}

export default function PastPlansPanel({
  profile,
  plans,
  onOpenPlan,
  onNewTrack = () => {},
}: PastPlansPanelProps) {
  return (
    <div data-cmp="PastPlansPanel" className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
            <HistoryIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Past plans</h1>
            <p className="text-xs text-muted-foreground">
              {plans.length} saved — AI uses this history to follow your growth
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
        {plans.length === 0 ? (
          <div className="max-w-lg mx-auto text-center py-16">
            <HistoryIcon className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">No plans yet</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Complete the workflow to generate your first action plan. It will appear here so
              EduPath can remember your journey.
            </p>
            <button
              onClick={onNewTrack}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90"
            >
              Start your first plan
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-accent border border-accent-foreground/10 mb-2">
              <div className="flex items-start gap-2">
                <SparklesIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-foreground leading-relaxed">
                  <strong>{profile.name}</strong>, when you request new tracks, EduPath reads your{' '}
                  {plans.length} past plan{plans.length > 1 ? `s` : ``} to suggest what fits your growth
                  next.
                </p>
              </div>
            </div>

            {plans.map((plan, index) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => onOpenPlan(plan)}
                className="w-full text-left p-5 rounded-2xl border border-border bg-card shadow-custom hover:border-primary/40 transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {index === 0 && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-muted text-emerald border border-emerald/20">
                          Latest
                        </span>
                      )}
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                          plan.status === `active`
                            ? `bg-primary/10 text-primary border-primary/20`
                            : `bg-muted text-muted-foreground border-border`
                        }`}
                      >
                        {plan.status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {plan.track.label}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {plan.guide.tasks[0]?.match_reasoning ?? `${plan.guide.tasks.length} tasks`}
                    </p>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary shrink-0 mt-1" />
                </div>
                <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    {formatDate(plan.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <TargetIcon className="w-3.5 h-3.5" />
                    {plan.guide.tasks.length} tasks
                  </span>
                  <span className="text-emerald font-medium">
                    {overallPlanProgress(plan).percent}% progress
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
