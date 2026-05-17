import {
  ArrowRightIcon,
  FlagIcon,
  MapPinIcon,
  SparklesIcon,
} from 'lucide-react';
import type { SavedPlan, StudentProfile, TrackRecommendation } from '../types';
import { getGradeShortLabel } from '../lib/grades';
import { overallPlanProgress } from '../lib/planProgress';

interface GrowthTimelineProps {
  profile: StudentProfile;
  plans: SavedPlan[];
  onOpenPlan: (plan: SavedPlan) => void;
}

const CATEGORY_DOT: Record<TrackRecommendation['category'], string> = {
  research: `bg-emerald`,
  internship: `bg-primary`,
  college: `bg-amber`,
  competition: `bg-rose`,
  extracurricular: `bg-violet-500`,
  'skill-building': `bg-sky-500`,
};

function formatTimelineDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: `short`,
    day: `numeric`,
    year: `numeric`,
  });
}

export default function GrowthTimeline({ profile, plans, onOpenPlan }: GrowthTimelineProps) {
  const chronological = [...plans].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const levelLabel = getGradeShortLabel(profile.grade);

  return (
    <section
      data-cmp="GrowthTimeline"
      className="h-full flex flex-col rounded-2xl border border-border bg-card shadow-custom overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-accent/60 to-card shrink-0">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-1">
          <MapPinIcon className="w-3.5 h-3.5" />
          Growth journey
        </div>
        <h2 className="text-base font-bold text-foreground">How your path is unfolding</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Each saved plan becomes a milestone EduPath uses for smarter guidance.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 scrollbar-thin min-h-[280px]">
        {chronological.length === 0 ? (
          <div className="relative pl-10">
            <div
              className="absolute left-[15px] top-2 bottom-2 w-0.5 rounded-full bg-gradient-to-b from-primary/30 via-border to-emerald/40"
              aria-hidden
            />
            <ol className="space-y-8">
              <li className="relative">
                <span className="absolute -left-10 top-0.5 w-8 h-8 rounded-full border-2 border-dashed border-primary/40 bg-background flex items-center justify-center text-xs font-bold text-primary">
                  1
                </span>
                <p className="text-sm font-medium text-foreground">Profile ready</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  You&apos;re at {levelLabel} — start your first AI track to begin the timeline.
                </p>
              </li>
              <li className="relative opacity-50">
                <span className="absolute -left-10 top-0.5 w-8 h-8 rounded-full border-2 border-border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  2
                </span>
                <p className="text-sm font-medium text-muted-foreground">First action plan</p>
                <p className="text-xs text-muted-foreground mt-0.5">Saved here after you complete the workflow</p>
              </li>
              <li className="relative opacity-35">
                <span className="absolute -left-10 top-0.5 w-8 h-8 rounded-full border-2 border-border bg-muted flex items-center justify-center">
                  <SparklesIcon className="w-3.5 h-3.5 text-muted-foreground" />
                </span>
                <p className="text-sm font-medium text-muted-foreground">Deeper AI memory</p>
                <p className="text-xs text-muted-foreground mt-0.5">Recommendations connect to your history</p>
              </li>
            </ol>
          </div>
        ) : (
          <ol className="relative pl-10">
            <div
              className="absolute left-[15px] top-3 bottom-16 w-0.5 rounded-full bg-gradient-to-b from-primary/25 via-primary/60 to-emerald"
              aria-hidden
            />

            {chronological.map((plan, index) => {
              const { percent } = overallPlanProgress(plan);
              const dot = CATEGORY_DOT[plan.track.category] ?? `bg-primary`;
              const isLatest = index === chronological.length - 1;

              return (
                <li key={plan.id} className={`relative ${isLatest ? `pb-6` : `pb-8`}`}>
                  <span
                    className={`absolute -left-10 top-1 w-8 h-8 rounded-full border-[3px] border-card shadow-md flex items-center justify-center ${dot}`}
                    aria-hidden
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-white/90" />
                  </span>

                  <button
                    type="button"
                    onClick={() => onOpenPlan(plan)}
                    className="w-full text-left group rounded-xl border border-border/80 bg-background/80 p-4 hover:border-primary/40 hover:bg-accent/30 transition-all"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground mb-1.5">
                      <time dateTime={plan.createdAt}>{formatTimelineDate(plan.createdAt)}</time>
                      <span className="text-border">·</span>
                      <span className="capitalize">{plan.track.category.replace(`-`, ` `)}</span>
                      {isLatest && (
                        <>
                          <span className="text-border">·</span>
                          <span className="text-primary font-semibold">Latest</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary leading-snug pr-2">
                      {plan.track.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{plan.guide.overview}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-foreground tabular-nums">{percent}%</span>
                      <ArrowRightIcon className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                  </button>
                </li>
              );
            })}

            <li className="relative">
              <span
                className="absolute -left-10 top-0 w-8 h-8 rounded-full border-[3px] border-emerald bg-emerald-muted flex items-center justify-center ring-4 ring-emerald/15"
                aria-hidden
              >
                <FlagIcon className="w-3.5 h-3.5 text-emerald" />
              </span>
              <div className="rounded-xl border border-emerald/30 bg-emerald-muted/25 p-4">
                <p className="text-xs font-semibold text-emerald uppercase tracking-wide mb-1">You are here</p>
                <p className="text-sm font-semibold text-foreground">{levelLabel}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {profile.interests.length > 0
                    ? `Exploring ${profile.interests.slice(0, 3).join(`, `)}${profile.interests.length > 3 ? ` +${profile.interests.length - 3} more` : ``}`
                    : `Add interests in your profile to sharpen AI recommendations`}
                </p>
              </div>
            </li>
          </ol>
        )}
      </div>
    </section>
  );
}
