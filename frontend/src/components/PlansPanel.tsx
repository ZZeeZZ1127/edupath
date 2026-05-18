import { useState } from 'react';
import {
  TargetIcon,
  CheckCircleIcon,
  CircleIcon,
  ClockIcon,
  CalendarIcon,
  SparklesIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowRightIcon,
  FileTextIcon,
} from 'lucide-react';
import type { ActionGuide, PlanTask, StudentProfile } from '../types';

interface PlansPanelProps {
  profile?: StudentProfile;
  guide?: ActionGuide | null;
}

function TaskCard({ task, onToggleAction }: { task: PlanTask; onToggleAction: (taskId: string, idx: number) => void }) {
  const [expanded, setExpanded] = useState(false);
  const completed = task.action_items.filter((_, i) => task.status !== 'pending').length;
  const statusColor = task.status === 'completed' ? 'text-emerald' : task.status === 'in_progress' ? 'text-amber' : 'text-muted-foreground';

  return (
    <div className={`rounded-xl border transition-all ${task.status === 'completed' ? 'bg-emerald-muted/30 border-emerald/15' : 'bg-card border-border'}`}>
      <button onClick={() => setExpanded((v) => !v)} className="flex items-start gap-3 p-4 w-full text-left">
        <div className={`mt-0.5 shrink-0 ${statusColor}`}>
          {task.status === 'completed' ? <CheckCircleIcon className="w-5 h-5" /> : <CircleIcon className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground">{task.label}</div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.match_reasoning}</p>
          {task.deadlines.application && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
              <CalendarIcon className="w-3 h-3" />
              <span>Deadline: {task.deadlines.application}</span>
            </div>
          )}
        </div>
        {expanded ? <ChevronUpIcon className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDownIcon className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {task.materials_needed.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <FileTextIcon className="w-3 h-3" /> Materials Needed
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                {task.materials_needed.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </div>
          )}

          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-1.5">Action Items</div>
            <div className="space-y-1.5">
              {task.action_items.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => onToggleAction(task.task_id, idx)}
                  className="flex items-start gap-2 w-full text-left hover:bg-muted/50 rounded-lg p-1.5 -mx-1.5 transition-colors"
                >
                  <CircleIcon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-xs text-foreground leading-relaxed">{action}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlansPanel({
  profile = { name: `Maria`, grade: 11, age: 17, interests: [`Biology`, `Debate`], strengths: [], goals: [], extracurriculars: [] },
  guide = null,
}: PlansPanelProps) {
  const [localGuide, setLocalGuide] = useState<ActionGuide | null>(guide);
  const [expanded, setExpanded] = useState(true);

  if (!localGuide || localGuide.tasks.length === 0) {
    return (
      <div data-cmp="PlansPanel" className="flex flex-col items-center justify-center h-full px-6 text-center">
        <TargetIcon className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-bold text-foreground mb-1">No Active Plan</h2>
        <p className="text-sm text-muted-foreground">Select a track and generate a plan to get started.</p>
      </div>
    );
  }

  const totalActions = localGuide.tasks.reduce((s, t) => s + t.action_items.length, 0);
  const completedTasks = localGuide.tasks.filter((t) => t.status === 'completed').length;

  const handleToggleAction = (taskId: string, _idx: number) => {
    setLocalGuide((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.task_id === taskId
            ? { ...t, status: t.status === 'completed' ? ('pending' as const) : ('completed' as const) }
            : t
        ),
      };
    });
  };

  return (
    <div data-cmp="PlansPanel" className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
            <TargetIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Action Plan</h1>
            <p className="text-xs text-muted-foreground">{localGuide.label} — {profile.name}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="mx-6 mt-5 p-5 rounded-2xl bg-brand border border-brand/20 text-brand-foreground shadow-custom">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-xs font-semibold opacity-60 uppercase tracking-wider mb-1">Active Plan</div>
              <h2 className="text-xl font-bold">{localGuide.label}</h2>
              <p className="text-sm opacity-80 mt-0.5">{localGuide.tasks.length} tasks · {totalActions} action items</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-bold">{Math.round((completedTasks / localGuide.tasks.length) * 100)}%</div>
              <div className="text-xs opacity-60">Complete</div>
            </div>
          </div>
          <div className="h-2 rounded-full bg-white/20 mb-3">
            <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${Math.round((completedTasks / localGuide.tasks.length) * 100)}%` }} />
          </div>
        </div>

        {localGuide.tasks.some((t) => t.match_reasoning) && (
          <div className="mx-6 mt-4 p-4 rounded-xl bg-accent border border-accent-foreground/10">
            <div className="flex items-start gap-2">
              <SparklesIcon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-accent-foreground mb-1">Why this fits {profile.name}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{localGuide.tasks[0]?.match_reasoning}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mx-6 mt-5 pb-6">
          <button onClick={() => setExpanded((v) => !v)} className="flex items-center justify-between w-full mb-3">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground text-sm">Tasks</span>
              <span className="text-xs text-muted-foreground">({completedTasks}/{localGuide.tasks.length})</span>
            </div>
            {expanded ? <ChevronUpIcon className="w-4 h-4 text-muted-foreground" /> : <ChevronDownIcon className="w-4 h-4 text-muted-foreground" />}
          </button>

          <div className={`flex flex-col gap-3 ${expanded ? '' : 'hidden'}`}>
            {localGuide.tasks.map((task) => (
              <TaskCard key={task.task_id} task={task} onToggleAction={handleToggleAction} />
            ))}
          </div>
        </div>
        <div className="h-6" />
      </div>

      <div className="px-6 py-4 border-t border-border bg-card shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-foreground">{completedTasks} of {localGuide.tasks.length} tasks complete</div>
            <div className="text-xs text-muted-foreground mt-0.5">Keep going, {profile.name}!</div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all shadow-custom">
            Next Steps
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
