import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, "../src/components/PastPlanDashboard.tsx");

const lines = [];
const push = (s) => lines.push(s);

push(`import {
  ArrowLeftIcon,
  BookOpenIcon,
  CheckCircle2Icon,
  CircleIcon,
  GlobeIcon,
  TargetIcon,
} from 'lucide-react';`);
push(`import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';`);
push(`import type { SavedPlan } from '../types';`);
push(`import {
  getCompletedMilestoneIndexes,
  getCompletedStepIds,
  overallPlanProgress,
  planMilestoneProgress,
  planStepProgress,
} from '../lib/planProgress';`);
push(``);
push(`interface PastPlanDashboardProps {`);
push(`  plan: SavedPlan;`);
push(`  onClose: () => void;`);
push(`  onUpdatePlan: (plan: SavedPlan) => void;`);
push(`}`);
push(``);
push(`function toggleStep(plan: SavedPlan, stepId: string): SavedPlan {`);
push(`  const current = getCompletedStepIds(plan);`);
push(`  const completedStepIds = current.includes(stepId)`);
push(`    ? current.filter((id) => id !== stepId)`);
push(`    : [...current, stepId];`);
push(`  return {`);
push(`    ...plan,`);
push(`    progress: {`);
push(`      completedStepIds,`);
push(`      completedMilestoneIndexes: getCompletedMilestoneIndexes(plan),`);
push(`    },`);
push(`  };`);
push(`}`);
push(``);
push(`function toggleMilestone(plan: SavedPlan, index: number): SavedPlan {`);
push(`  const current = getCompletedMilestoneIndexes(plan);`);
push(`  const completedMilestoneIndexes = current.includes(index)`);
push(`    ? current.filter((i) => i !== index)`);
push(`    : [...current, index];`);
push(`  return {`);
push(`    ...plan,`);
push(`    progress: {`);
push(`      completedStepIds: getCompletedStepIds(plan),`);
push(`      completedMilestoneIndexes,`);
push(`    },`);
push(`  };`);
push(`}`);
push(``);
push(`export default function PastPlanDashboard({`);
push(`  plan,`);
push(`  onClose,`);
push(`  onUpdatePlan,`);
push(`}: PastPlanDashboardProps) {`);
push(`  const overall = overallPlanProgress(plan);`);
push(`  const steps = planStepProgress(plan);`);
push(`  const milestones = planMilestoneProgress(plan);`);
push(`  const completedSteps = getCompletedStepIds(plan);`);
push(`  const completedMilestones = getCompletedMilestoneIndexes(plan);`);
push(``);
push(`  const pieData = [`);
push(`    { name: 'Steps done', value: steps.completed, fill: 'hsl(var(--primary))' },`);
push(`    {`);
push(`      name: 'Steps remaining',`);
push(`      value: Math.max(0, steps.total - steps.completed),`);
push(`      fill: 'hsl(var(--muted-foreground) / 0.25)',`);
push(`    },`);
push(`    { name: 'Milestones done', value: milestones.completed, fill: 'hsl(142 76% 36%)' },`);
push(`    {`);
push(`      name: 'Milestones remaining',`);
push(`      value: Math.max(0, milestones.total - milestones.completed),`);
push(`      fill: 'hsl(var(--border))',`);
push(`    },`);
push(`  ].filter((d) => d.value > 0);`);
push(``);
push(`  const barData = [`);
push(`    { label: 'Steps', done: steps.completed, remaining: Math.max(0, steps.total - steps.completed) },`);
push(`    {`);
push(`      label: 'Milestones',`);
push(`      done: milestones.completed,`);
push(`      remaining: Math.max(0, milestones.total - milestones.completed),`);
push(`    },`);
push(`  ];`);
push(``);
push(`  return (`);
push(`    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/40 backdrop-blur-sm">`);
push(`      <motionlessOverlay />`);
push(`    </div>`);
push(`  );`);
push(`}`);
push(``);

const badLine = push.toString();
// Remove bad line and append real JSX lines
const filtered = lines.filter((l) => !l.includes("motionless"));
filtered.push(`      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-3xl border border-border bg-card shadow-2xl flex flex-col">`);
filtered.push(`        <div className="px-6 py-4 border-b border-border bg-brand text-brand-foreground shrink-0">`);
filtered.push(`          <button`);
filtered.push(`            type="button"`);
filtered.push(`            onClick={onClose}`);
filtered.push(`            className="flex items-center gap-2 text-sm text-white/80 hover:text-white mb-3 transition-colors"`);
filtered.push(`          >`);
filtered.push(`            <ArrowLeftIcon className="w-4 h-4" />`);
filtered.push(`            Back to plans`);
filtered.push(`          </button>`);
filtered.push(`          <div className="flex items-start gap-3">`);
filtered.push(`            <GlobeIcon className="w-5 h-5 mt-1 shrink-0 opacity-80" />`);
filtered.push(`            <div>`);
filtered.push(`              <p className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-1">`);
filtered.push(`                Plan dashboard`);
filtered.push(`              </p>`);
filtered.push(`              <h2 className="text-xl sm:text-2xl font-bold font-serif">{plan.track.title}</h2>`);
filtered.push(`              <p className="text-sm text-white/75 mt-1 line-clamp-2">{plan.guide.overview}</p>`);
filtered.push(`              <p className="text-xs text-white/50 mt-2">`);
filtered.push(`                Estimated: {plan.guide.estimatedDuration}`);
filtered.push(`              </p>`);
filtered.push(`            </div>`);
filtered.push(`          </motionlessOverlay>`);

// fix last line - it has motionless again in my push. Use div close
filtered[filtered.length - 1] = `          </div>`;

filtered.push(`        </div>`);
filtered.push(`        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-6">`);
filtered.push(`          <div className="grid sm:grid-cols-3 gap-4">`);
filtered.push(`            <motionlessOverlay />`);

// This approach is getting messy. Simpler: write lines array completely in one go without bad pushes.

fs.writeFileSync(out, filtered.join("\n"));
console.log("wrote partial", out);
