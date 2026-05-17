import { useState } from 'react';
import { CheckCircle2Icon, Loader2Icon, SparklesIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { GuideStep, SavedPlan, StepDetail } from '../types';
import { fetchStepDetail } from '../services/api';

interface PastPlanStepRowProps {
  plan: SavedPlan;
  step: GuideStep;
  index: number;
  done: boolean;
  onUpdatePlan: (plan: SavedPlan) => void;
  onToggleComplete: () => void;
}

function mergeStepDetail(plan: SavedPlan, stepId: string, detail: StepDetail): SavedPlan {
  return {
    ...plan,
    progress: {
      completedStepIds: plan.progress?.completedStepIds ?? [],
      completedMilestoneIndexes: plan.progress?.completedMilestoneIndexes ?? [],
      stepDetails: { ...plan.progress?.stepDetails, [stepId]: detail },
    },
  };
}

export default function PastPlanStepRow({
  plan,
  step,
  index,
  done,
  onUpdatePlan,
  onToggleComplete,
}: PastPlanStepRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const profile = plan.profileSnapshot;
  const detail = plan.progress?.stepDetails?.[step.id];

  const handleCircleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    if (plan.progress?.stepDetails?.[step.id]) return;

    setLoading(true);
    try {
      const generated = await fetchStepDetail(profile, plan.track, step, plan.guide);
      onUpdatePlan(mergeStepDetail(plan, step.id, generated));
    } catch {
      toast.error(`Could not load AI step guidance. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        done
          ? `bg-emerald-muted/30 border-emerald/30`
          : expanded
            ? `bg-accent/40 border-primary/40`
            : `bg-muted border-border`
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={handleCircleClick}
          aria-expanded={expanded}
          aria-label={`AI details for step ${index + 1}`}
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ring-2 ring-offset-2 transition-all ${
            done
              ? `bg-emerald text-white ring-emerald/30`
              : expanded
                ? `bg-primary text-primary-foreground ring-primary/40`
                : `bg-primary text-primary-foreground ring-transparent hover:ring-primary/30`
          }`}
        >
          {loading ? (
            <Loader2Icon className="w-4 h-4 animate-spin" />
          ) : done ? (
            <CheckCircle2Icon className="w-4 h-4" />
          ) : (
            index + 1
          )}
        </button>
        <button
          type="button"
          onClick={onToggleComplete}
          className="flex-1 min-w-0 text-left hover:opacity-90 transition-opacity"
        >
          <div className="font-medium text-foreground text-sm">{step.title}</div>
          <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
          {done && (
            <span className="inline-block mt-1 text-xs font-medium text-emerald">Completed</span>
          )}
        </button>
      </div>
      {expanded && (
        <div className="mt-4 pt-4 border-t border-border/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-2">
            <SparklesIcon className="w-3.5 h-3.5" />
            Amazon Bedrock guidance
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2Icon className="w-4 h-4 animate-spin text-primary" />
              Generating personalized instructions…
            </div>
          )}
          {!loading && detail && (
            <>
              {detail.estimatedTime && (
                <p className="text-xs text-muted-foreground mb-2">
                  Estimated time: <span className="font-medium text-foreground">{detail.estimatedTime}</span>
                </p>
              )}
              <p className="text-sm text-foreground leading-relaxed mb-3">{detail.overview}</p>
              <p className="text-xs font-semibold text-foreground mb-1.5">What to do</p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground mb-3">
                {detail.actionItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {detail.tips.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-foreground mb-1.5">Pro tips</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    {detail.tips.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
          {!loading && !detail && (
            <p className="text-sm text-muted-foreground">Click the circle again to retry loading guidance.</p>
          )}
        </div>
      )}
    </div>
  );
}
