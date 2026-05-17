import { GraduationCapIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface EduPathBrandProps {
  onHome?: () => void;
  variant?: `light` | `dark`;
  className?: string;
  iconSize?: `sm` | `md`;
}

export default function EduPathBrand({
  onHome,
  variant = `light`,
  className,
  iconSize = `md`,
}: EduPathBrandProps) {
  const iconBox =
    iconSize === `sm` ? `w-8 h-8 rounded-lg` : `w-10 h-10 rounded-xl`;
  const iconClass = iconSize === `sm` ? `w-4.5 h-4.5` : `w-6 h-6`;
  const labelClass =
    variant === `dark`
      ? `text-2xl font-bold text-white tracking-tight`
      : iconSize === `sm`
        ? `text-lg font-bold text-brand`
        : `text-xl font-bold text-brand`;

  const content = (
    <>
      <div
        className={cn(
          iconBox,
          `bg-brand flex items-center justify-center shadow-custom shrink-0`,
          variant === `dark` && `bg-primary`
        )}
      >
        <GraduationCapIcon className={cn(iconClass, `text-white`)} />
      </div>
      <span className={labelClass}>EduPath</span>
    </>
  );

  const wrapperClass = cn(
    `flex items-center gap-3 select-none`,
    onHome &&
      `cursor-pointer rounded-xl hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`,
    className
  );

  if (onHome) {
    return (
      <button type="button" onClick={onHome} className={wrapperClass} aria-label="Back to home">
        {content}
      </button>
    );
  }

  return <div className={wrapperClass}>{content}</div>;
}
