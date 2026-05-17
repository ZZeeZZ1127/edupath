import { useEffect } from 'react';
import {
  ArrowLeftIcon,
  BookOpenIcon,
  CheckCircle2Icon,
  CircleIcon,
  GlobeIcon,
  TargetIcon,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const CHART = {
  stepDone: `#2563eb`,
  stepRemain: `#93c5fd`,
  milestoneDone: `#10b981`,
  milestoneRemain: `#a7f3d0`,
  barDone: `#2563eb`,
  barRemain: `#e2e8f0`,
  emptyRing: `#e2e8f0`,
  grid: `#e8eef8`,
  axis: `#6b7a99`,
} as const;
import type { SavedPlan } from '../types';
import PastPlanStepRow from './PastPlanStepRow';
import {
  getCompletedMilestoneIndexes,
  getCompletedStepIds,
  overallPlanProgress,
  planMilestoneProgress,
  planStepProgress,
} from '../lib/planProgress';

interface PastPlanDashboardProps {
  plan: SavedPlan;
  onClose: () => void;
  onUpdatePlan: (plan: SavedPlan) => void;
}

function withProgress(plan: SavedPlan, patch: Partial<NonNullable<SavedPlan['progress']>>): SavedPlan {
  return {
    ...plan,
    progress: {
      completedStepIds: getCompletedStepIds(plan),
      completedMilestoneIndexes: getCompletedMilestoneIndexes(plan),
      stepDetails: plan.progress?.stepDetails,
      ...patch,
    },
  };
}

function toggleStep(plan: SavedPlan, stepId: string): SavedPlan {
  const current = getCompletedStepIds(plan);
  const completedStepIds = current.includes(stepId)
    ? current.filter((id) => id !== stepId)
    : [...current, stepId];
  return withProgress(plan, { completedStepIds });
}

function toggleMilestone(plan: SavedPlan, index: number): SavedPlan {
  const current = getCompletedMilestoneIndexes(plan);
  const completedMilestoneIndexes = current.includes(index)
    ? current.filter((i) => i !== index)
    : [...current, index];
  return withProgress(plan, { completedMilestoneIndexes });
}

export default function PastPlanDashboard({
  plan,
  onClose,
  onUpdatePlan,
}: PastPlanDashboardProps) {
  const overall = overallPlanProgress(plan);
  const steps = planStepProgress(plan);
  const milestones = planMilestoneProgress(plan);
  const completedSteps = getCompletedStepIds(plan);
  const completedMilestones = getCompletedMilestoneIndexes(plan);
  const pieData =
    steps.total + milestones.total === 0
      ? [{ name: `Not started`, value: 1, fill: CHART.emptyRing }]
      : [
          { name: `Steps done`, value: steps.completed, fill: CHART.stepDone },
          {
            name: `Steps remaining`,
            value: Math.max(0, steps.total - steps.completed),
            fill: CHART.stepRemain,
          },
          { name: `Milestones done`, value: milestones.completed, fill: CHART.milestoneDone },
          {
            name: `Milestones remaining`,
            value: Math.max(0, milestones.total - milestones.completed),
            fill: CHART.milestoneRemain,
          },
        ].filter((d) => d.value > 0);

  const barData = [
    { label: 'Steps', done: steps.completed, remaining: Math.max(0, steps.total - steps.completed) },
    {
      label: 'Milestones',
      done: milestones.completed,
      remaining: Math.max(0, milestones.total - milestones.completed),
    },
  ];

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === `Escape`) onClose();
    };
    window.addEventListener(`keydown`, onKeyDown);
    return () => window.removeEventListener(`keydown`, onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/45 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-3xl border border-border bg-card shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="plan-dashboard-title"
      >
        <div className="px-6 py-4 border-b border-border bg-brand text-brand-foreground shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 text-sm text-white/80 hover:text-white mb-3 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to plans
          </button>
          <div className="flex items-start gap-3">
            <GlobeIcon className="w-5 h-5 mt-1 shrink-0 opacity-80" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-1">
                Plan dashboard
              </p>
              <h2 id="plan-dashboard-title" className="text-xl sm:text-2xl font-bold font-serif">{plan.track.title}</h2>
              <p className="text-sm text-white/75 mt-1 line-clamp-2">{plan.guide.overview}</p>
              <p className="text-xs text-white/50 mt-2">
                Estimated: {plan.guide.estimatedDuration}
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-muted border border-border text-center">
              <div className="text-3xl font-bold text-primary">{overall.percent}%</div>
              <div className="text-xs text-muted-foreground mt-1">Overall progress</div>
            </div>
            <div className="p-4 rounded-2xl bg-muted border border-border text-center">
              <div className="text-2xl font-bold text-foreground">{steps.completed}/{steps.total}</div>
              <div className="text-xs text-muted-foreground mt-1">Steps complete</div>
            </div>
            <div className="p-4 rounded-2xl bg-muted border border-border text-center">
              <div className="text-2xl font-bold text-foreground">{milestones.completed}/{milestones.total}</div>
              <div className="text-xs text-muted-foreground mt-1">Milestones</div>
            </div>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl border border-border bg-card shadow-custom">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <TargetIcon className="w-4 h-4 text-primary" />
                Progress breakdown
              </h3>
              <div className="relative h-56">
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{overall.percent}%</div>
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">complete</div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="46%"
                      innerRadius={52}
                      outerRadius={76}
                      paddingAngle={3}
                      stroke="#ffffff"
                      strokeWidth={2}
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: `1px solid #e8eef8`,
                        boxShadow: `0 4px 16px rgba(26, 60, 110, 0.08)`,
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      formatter={(value) => (
                        <span className="text-xs text-muted-foreground">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Mark steps below to update your charts
              </p>
            </div>
            <div className="p-5 rounded-2xl border border-border bg-card shadow-custom">
              <h3 className="text-sm font-semibold text-foreground mb-4">Completed vs remaining</h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8eef8" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: `#6b7a99` }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: `#6b7a99` }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: `1px solid #e8eef8`,
                        boxShadow: `0 4px 16px rgba(26, 60, 110, 0.08)`,
                      }}
                    />
                    <Bar dataKey="done" stackId="a" fill="#2563eb" name="Done" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="remaining" stackId="a" fill="#e2e8f0" name="Remaining" radius={[0, 0, 6, 6]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="p-5 rounded-2xl border border-border bg-card shadow-custom">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <BookOpenIcon className="w-4 h-4 text-primary" />
              Step-by-step instructions
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Click the <strong className="text-foreground">numbered circle</strong> for detailed Amazon Bedrock
              guidance. Click the step title to mark complete.
            </p>
            <div className="flex flex-col gap-3">
              {plan.guide.steps.map((step, index) => (
                <PastPlanStepRow
                  key={step.id}
                  plan={plan}
                  step={step}
                  index={index}
                  done={completedSteps.includes(step.id)}
                  onUpdatePlan={onUpdatePlan}
                  onToggleComplete={() => onUpdatePlan(toggleStep(plan, step.id))}
                />
              ))}
            </div>
          </div>
          {plan.guide.weeklyMilestones.length > 0 && (
            <div className="p-5 rounded-2xl border border-border bg-card shadow-custom">
              <h3 className="text-sm font-semibold text-foreground mb-4">Weekly milestones</h3>
              <div className="flex flex-col gap-2">
                {plan.guide.weeklyMilestones.map((milestone, index) => {
                  const done = completedMilestones.includes(index);
                  return (
                    <button
                      key={milestone}
                      type="button"
                      onClick={() => onUpdatePlan(toggleMilestone(plan, index))}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left text-sm transition-all ${
                        done
                          ? 'bg-emerald-muted/30 border-emerald/30 text-foreground'
                          : 'bg-muted border-border hover:border-primary/30 text-muted-foreground'
                      }`}
                    >
                      {done ? (
                        <CheckCircle2Icon className="w-4 h-4 text-emerald shrink-0" />
                      ) : (
                        <CircleIcon className="w-4 h-4 shrink-0" />
                      )}
                      {milestone}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}