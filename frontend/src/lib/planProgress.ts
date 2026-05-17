import type { SavedPlan } from '../types';

export function getCompletedStepIds(plan: SavedPlan): string[] {
  return plan.progress?.completedStepIds ?? [];
}

export function getCompletedMilestoneIndexes(plan: SavedPlan): number[] {
  return plan.progress?.completedMilestoneIndexes ?? [];
}

export function planStepProgress(plan: SavedPlan) {
  const total = plan.guide.steps.length;
  const completed = getCompletedStepIds(plan).filter((id) =>
    plan.guide.steps.some((s) => s.id === id)
  ).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, percent };
}

export function planMilestoneProgress(plan: SavedPlan) {
  const total = plan.guide.weeklyMilestones.length;
  const completed = getCompletedMilestoneIndexes(plan).filter(
    (i) => i >= 0 && i < total
  ).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, percent };
}

export function overallPlanProgress(plan: SavedPlan) {
  const steps = planStepProgress(plan);
  const milestones = planMilestoneProgress(plan);
  const totalUnits = steps.total + milestones.total;
  const completedUnits = steps.completed + milestones.completed;
  const percent =
    totalUnits === 0 ? 0 : Math.round((completedUnits / totalUnits) * 100);
  return { percent, steps, milestones };
}
