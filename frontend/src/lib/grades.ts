export interface GradeOption {
  value: number;
  label: string;
  group: 'k12' | 'undergrad' | 'graduate';
}

export const GRADE_OPTIONS: GradeOption[] = [
  { value: 6, label: `6th Grade`, group: `k12` },
  { value: 7, label: `7th Grade`, group: `k12` },
  { value: 8, label: `8th Grade`, group: `k12` },
  { value: 9, label: `9th Grade (Freshman)`, group: `k12` },
  { value: 10, label: `10th Grade (Sophomore)`, group: `k12` },
  { value: 11, label: `11th Grade (Junior)`, group: `k12` },
  { value: 12, label: `12th Grade (Senior)`, group: `k12` },
  { value: 13, label: `College — Freshman`, group: `undergrad` },
  { value: 14, label: `College — Sophomore`, group: `undergrad` },
  { value: 15, label: `College — Junior`, group: `undergrad` },
  { value: 16, label: `College — Senior`, group: `undergrad` },
  { value: 17, label: `Graduate — Master's`, group: `graduate` },
  { value: 18, label: `Graduate — PhD / Doctoral`, group: `graduate` },
];

export function getGradeLabel(grade: number): string {
  return GRADE_OPTIONS.find((g) => g.value === grade)?.label ?? `Level ${grade}`;
}

export function getAgeBoundsForGrade(grade: number): { min: number; max: number; default: number } {
  if (grade >= 17) return { min: 21, max: 45, default: 26 };
  if (grade >= 13) return { min: 17, max: 28, default: 20 };
  return { min: 10, max: 19, default: 17 };
}

export function getGradeShortLabel(grade: number): string {
  const opt = GRADE_OPTIONS.find((g) => g.value === grade);
  if (!opt) return `Level ${grade}`;
  if (opt.group === `graduate`) return opt.label.replace(`Graduate — `, ``);
  if (opt.group === `undergrad`) return opt.label.replace(`College — `, `College `);
  return opt.label;
}
