import { useEffect } from 'react';
import {
  ArrowLeftIcon,
  BookOpenIcon,
  CheckCircle2Icon,
  CircleIcon,
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
  taskDone: `#2563eb`,
  taskRemain: `#93c5fd`,
  barDone: `#2563eb`,
  barRemain: `#e2e8f0`,
  emptyRing: `#e2e8f0`,
  grid: `#e8eef8`,
  axis: `#6b7a99`,
} as const;
import type { SavedPlan } from '../types';
import PastPlanStepRow from './PastPlanStepRow';
import { getCompletedTaskIds, overallPlanProgress } from '../lib/planProgress';

interface PastPlanDashboardProps {
  plan: SavedPlan;
  onClose: () => void;
  onUpdatePlan: (plan: SavedPlan) => void;
}

function withProgress(plan: SavedPlan, patch: Partial<NonNullable<SavedPlan['progress']>>): SavedPlan {
  return {
    ...plan,
    progress: {
      completedTaskIds: getCompletedTaskIds(plan),
      taskDetails: plan.progress?.taskDetails,
      ...patch,
    },
  };
}

function toggleTask(plan: SavedPlan, taskId: string): SavedPlan {
  const current = getCompletedTaskIds(plan);
  const completedTaskIds = current.includes(taskId)
    ? current.filter((id) => id !== taskId)
    : [...current, taskId];
  return withProgress(plan, { completedTaskIds });
}

export default function PastPlanDashboard({
  plan,
  onClose,
  onUpdatePlan,
}: PastPlanDashboardProps) {
  const overall = overallPlanProgress(plan);
  const completedTasks = getCompletedTaskIds(plan);
  const totalTasks = plan.guide.tasks.length;

  const pieData =
    totalTasks === 0
      ? [{ name: `Not started`, value: 1, fill: CHART.emptyRing }]
      : [
          { name: `Tasks done`, value: overall.completed, fill: CHART.taskDone },
          {
            name: `Tasks remaining`,
            value: Math.max(0, totalTasks - overall.completed),
            fill: CHART.taskRemain,
          },
        ].filter((d) => d.value > 0);

  const barData = [
    { label: 'Tasks', done: overall.completed, remaining: Math.max(0, totalTasks - overall.completed) },
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
            <TargetIcon className="w-5 h-5 mt-1 shrink-0 opacity-80" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-1">
                Plan dashboard
              </p>
              <h2 id="plan-dashboard-title" className="text-xl sm:text-2xl font-bold font-serif">{plan.track.label}</h2>
              <p className="text-sm text-white/75 mt-1 line-clamp-2">
                {plan.guide.tasks[0]?.match_reasoning ?? `${totalTasks} tasks`}
              </p>
              <p className="text-xs text-white/50 mt-2">
                {totalTasks} tasks · {overall.percent}% complete
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
              <div className="text-2xl font-bold text-foreground">{overall.completed}/{totalTasks}</div>
              <div className="text-xs text-muted-foreground mt-1">Tasks complete</div>
            </div>
            <div className="p-4 rounded-2xl bg-muted border border-border text-center">
              <div className="text-2xl font-bold text-foreground">{plan.guide.tasks.reduce((s, t) => s + t.action_items.length, 0)}</div>
              <div className="text-xs text-muted-foreground mt-1">Action items</div>
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
                Mark tasks below to update your charts
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
              Tasks
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Click the <strong className="text-foreground">numbered circle</strong> for detailed Amazon Bedrock
              guidance. Click the task title to mark complete.
            </p>
            <div className="flex flex-col gap-3">
              {plan.guide.tasks.map((task, index) => (
                <PastPlanStepRow
                  key={task.task_id}
                  plan={plan}
                  task={task}
                  index={index}
                  done={completedTasks.includes(task.task_id)}
                  onUpdatePlan={onUpdatePlan}
                  onToggleComplete={() => onUpdatePlan(toggleTask(plan, task.task_id))}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
