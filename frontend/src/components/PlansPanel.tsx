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
  AlertCircleIcon,
  FileTextIcon,
  ArrowRightIcon,
} from 'lucide-react';
import type { ApplicationPlan, PlanMaterial, ActionItem, StudentProfile } from '../types';
import { mockApplicationPlan } from '../data/mockData';

interface PlansPanelProps {
  profile?: StudentProfile;
  initialPlan?: ApplicationPlan | null;
}

const STATUS_CONFIG = {
  not_started: { icon: CircleIcon, label: `Not Started`, color: `text-muted-foreground`, bg: `bg-muted` },
  in_progress: { icon: ClockIcon, label: `In Progress`, color: `text-amber`, bg: `bg-amber-muted` },
  completed: { icon: CheckCircleIcon, label: `Completed`, color: `text-emerald`, bg: `bg-emerald-muted` },
};

const PRIORITY_CONFIG = {
  high: { color: `text-rose border-rose/20 bg-rose-muted`, label: `High Priority` },
  medium: { color: `text-amber border-amber/20 bg-amber-muted`, label: `Medium` },
  low: { color: `text-muted-foreground border-border bg-muted`, label: `Low` },
};

function MaterialCard({ material, onStatusChange }: { material: PlanMaterial; onStatusChange: (id: string, status: PlanMaterial['status']) => void }) {
  const config = STATUS_CONFIG[material.status];
  const Icon = config.icon;
  const STATUSES: PlanMaterial['status'][] = [`not_started`, `in_progress`, `completed`];

  const cycleStatus = () => {
    const idx = STATUSES.indexOf(material.status);
    onStatusChange(material.id, STATUSES[(idx + 1) % STATUSES.length]);
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${material.status === `completed` ? `bg-emerald-muted/30 border-emerald/15` : `bg-card border-border`}`}>
      <button onClick={cycleStatus} className="mt-0.5 shrink-0 hover:scale-110 transition-transform">
        <Icon className={`w-5 h-5 ${config.color}`} />
      </button>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${material.status === `completed` ? `line-through text-muted-foreground` : `text-foreground`}`}>
          {material.item}
        </div>
        {material.notes && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{material.notes}</p>
        )}
        {material.dueDate && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
            <CalendarIcon className="w-3 h-3" />
            <span>Due {material.dueDate}</span>
          </div>
        )}
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${config.bg} ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
}

function ActionCard({ item, onToggle }: { item: ActionItem; onToggle: (id: string) => void }) {
  const pConfig = PRIORITY_CONFIG[item.priority];
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${item.completed ? `bg-muted border-border opacity-60` : `bg-card border-border`}`}>
      <button onClick={() => onToggle(item.id)} className="mt-0.5 shrink-0">
        {item.completed
          ? <CheckCircleIcon className="w-5 h-5 text-emerald" />
          : <CircleIcon className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
        }
      </button>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${item.completed ? `line-through text-muted-foreground` : `text-foreground`}`}>
          {item.task}
        </div>
        {item.dueDate && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
            <ClockIcon className="w-3 h-3" />
            <span>{item.dueDate}</span>
          </div>
        )}
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${pConfig.color}`}>
        {pConfig.label}
      </span>
    </div>
  );
}

export default function PlansPanel({
  profile = { name: `Maria`, grade: 11, age: 17, interests: [`Biology`, `Debate`], strengths: [], goals: [], extracurriculars: [] },
  initialPlan = null,
}: PlansPanelProps) {
  const [plan, setPlan] = useState<ApplicationPlan>(initialPlan ?? mockApplicationPlan);
  const [activeSection, setActiveSection] = useState<`materials` | `actions`>(`materials`);
  const [materialsExpanded, setMaterialsExpanded] = useState(true);
  const [actionsExpanded, setActionsExpanded] = useState(true);

  const completedMaterials = plan.materials.filter((m) => m.status === `completed`).length;
  const completedActions = plan.actionItems.filter((a) => a.completed).length;
  const progressPct = Math.round(((completedMaterials + completedActions) / (plan.materials.length + plan.actionItems.length)) * 100);

  const handleMaterialStatus = (id: string, status: PlanMaterial['status']) => {
    setPlan((prev) => ({
      ...prev,
      materials: prev.materials.map((m) => m.id === id ? { ...m, status } : m),
    }));
  };

  const handleActionToggle = (id: string) => {
    setPlan((prev) => ({
      ...prev,
      actionItems: prev.actionItems.map((a) => a.id === id ? { ...a, completed: !a.completed } : a),
    }));
  };

  return (
    <div data-cmp="PlansPanel" className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
            <TargetIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">My Plans</h1>
            <p className="text-xs text-muted-foreground">Application tracker for {profile.name}</p>
          </div>
        </div>

        {/* Tab toggle */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
          {([`materials`, `actions`] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSection(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeSection === tab ? `bg-card text-foreground shadow-custom` : `text-muted-foreground hover:text-foreground`
              }`}
            >
              {tab === `materials` ? `Materials Checklist` : `Action Items`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Plan overview card */}
        <div className="mx-6 mt-5 p-5 rounded-2xl bg-brand border border-brand/20 text-brand-foreground shadow-custom">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-xs font-semibold opacity-60 uppercase tracking-wider mb-1">Active Plan</div>
              <h2 className="text-xl font-bold">{plan.opportunityTitle}</h2>
              <p className="text-sm opacity-80 mt-0.5">{plan.organization}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-bold">{progressPct}%</div>
              <div className="text-xs opacity-60">Complete</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full bg-white/20 mb-4">
            <div
              className="h-full rounded-full bg-white transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="w-4 h-4 opacity-60" />
              <span className="opacity-80">App Deadline: {plan.applicationDeadline}</span>
            </div>
            {plan.financialAidDeadline && (
              <div className="flex items-center gap-2 text-sm">
                <FileTextIcon className="w-4 h-4 opacity-60" />
                <span className="opacity-80">FA: {plan.financialAidDeadline}</span>
              </div>
            )}
          </div>
        </div>

        {/* Match reasoning */}
        <div className="mx-6 mt-4 p-4 rounded-xl bg-accent border border-accent-foreground/10">
          <div className="flex items-start gap-2">
            <SparklesIcon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-accent-foreground mb-1">Why this fits {profile.name}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{plan.matchReasoning}</p>
            </div>
          </div>
        </div>

        {/* Materials section */}
        <div className={activeSection === `materials` ? `` : `hidden`}>
          <div className="mx-6 mt-5">
            <button
              onClick={() => setMaterialsExpanded((v) => !v)}
              className="flex items-center justify-between w-full mb-3"
            >
              <div className="flex items-center gap-2">
                <FileTextIcon className="w-4 h-4 text-primary" />
                <span className="font-semibold text-foreground text-sm">Required Materials</span>
                <span className="text-xs text-muted-foreground">({completedMaterials}/{plan.materials.length} completed)</span>
              </div>
              {materialsExpanded ? <ChevronUpIcon className="w-4 h-4 text-muted-foreground" /> : <ChevronDownIcon className="w-4 h-4 text-muted-foreground" />}
            </button>

            <div className={`flex flex-col gap-3 ${materialsExpanded ? `` : `hidden`}`}>
              {plan.materials.map((mat) => (
                <MaterialCard key={mat.id} material={mat} onStatusChange={handleMaterialStatus} />
              ))}
            </div>
          </div>
        </div>

        {/* Action items section */}
        <div className={activeSection === `actions` ? `` : `hidden`}>
          <div className="mx-6 mt-5 pb-6">
            <button
              onClick={() => setActionsExpanded((v) => !v)}
              className="flex items-center justify-between w-full mb-3"
            >
              <div className="flex items-center gap-2">
                <AlertCircleIcon className="w-4 h-4 text-rose" />
                <span className="font-semibold text-foreground text-sm">Action Items</span>
                <span className="text-xs text-muted-foreground">({completedActions}/{plan.actionItems.length} done)</span>
              </div>
              {actionsExpanded ? <ChevronUpIcon className="w-4 h-4 text-muted-foreground" /> : <ChevronDownIcon className="w-4 h-4 text-muted-foreground" />}
            </button>

            {/* High priority first */}
            <div className={`flex flex-col gap-3 ${actionsExpanded ? `` : `hidden`}`}>
              <div className="text-xs font-semibold text-rose mb-1 flex items-center gap-1.5">
                <AlertCircleIcon className="w-3 h-3" />
                Do First — High Priority
              </div>
              {plan.actionItems.filter((a) => a.priority === `high`).map((item) => (
                <ActionCard key={item.id} item={item} onToggle={handleActionToggle} />
              ))}

              <div className="text-xs font-semibold text-amber mb-1 mt-2 flex items-center gap-1.5">
                <ClockIcon className="w-3 h-3" />
                Medium Priority
              </div>
              {plan.actionItems.filter((a) => a.priority === `medium`).map((item) => (
                <ActionCard key={item.id} item={item} onToggle={handleActionToggle} />
              ))}
            </div>
          </div>
        </div>

        <div className="h-6" />
      </div>

      {/* Bottom CTA */}
      <div className="px-6 py-4 border-t border-border bg-card shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-foreground">
              {completedActions + completedMaterials} of {plan.materials.length + plan.actionItems.length} tasks complete
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">Keep going, {profile.name}! You're doing great.</div>
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
