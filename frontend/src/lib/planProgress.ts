import type { SavedPlan } from '../types';

export function getCompletedTaskIds(plan: SavedPlan): string[] {
  return plan.progress?.completedTaskIds ?? [];
}

export function getTaskDetail(plan: SavedPlan, taskId: string) {
  return plan.progress?.taskDetails?.[taskId];
}

export function overallPlanProgress(plan: SavedPlan) {
  const total = plan.guide.tasks.length;
  const completed = getCompletedTaskIds(plan).filter((id) =>
    plan.guide.tasks.some((t) => t.task_id === id)
  ).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, percent };
}
