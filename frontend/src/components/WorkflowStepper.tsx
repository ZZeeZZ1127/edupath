import { CheckIcon } from 'lucide-react';
import type { AppPage } from '../types';

const STEPS: { key: AppPage; label: string }[] = [
  { key: `profile`, label: `Your profile` },
  { key: `recommendations`, label: `AI tracks` },
  { key: `action-guide`, label: `Action plan` },
];

interface WorkflowStepperProps {
  current: AppPage;
  onGoToHub?: () => void;
  showHubLink?: boolean;
}

export default function WorkflowStepper({
  current,
  onGoToHub = () => {},
  showHubLink = false,
}: WorkflowStepperProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <div className="border-b border-border bg-card px-6 py-4 shrink-0">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center justify-between gap-2 flex-1 min-w-0">
        {STEPS.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <div key={step.key} className="flex items-center flex-1 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                    done
                      ? `bg-emerald text-white`
                      : active
                        ? `bg-primary text-primary-foreground`
                        : `bg-muted text-muted-foreground`
                  }`}
                >
                  {done ? <CheckIcon className="w-4 h-4" /> : i + 1}
                </div>
                <span
                  className={`text-sm font-medium truncate hidden sm:block ${
                    active ? `text-foreground` : done ? `text-emerald` : `text-muted-foreground`
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 rounded-full ${
                    done ? `bg-emerald` : `bg-border`
                  }`}
                />
              )}
            </div>
          );
        })}
        </div>
        {showHubLink && (
          <button
            type="button"
            onClick={onGoToHub}
            className="text-sm font-medium text-primary hover:underline shrink-0 whitespace-nowrap"
          >
            My EduPath →
          </button>
        )}
      </div>
    </div>
  );
}
