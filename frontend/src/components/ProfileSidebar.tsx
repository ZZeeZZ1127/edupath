import {
  GraduationCapIcon,
  SparklesIcon,
  TargetIcon,
  BookOpenIcon,
  TrophyIcon,
  LogOutIcon,
  ChevronRightIcon,
  HomeIcon,
  HistoryIcon,
  PlusCircleIcon,
} from 'lucide-react';
import type { StudentProfile } from '../types';
import { getGradeShortLabel } from '../lib/grades';

interface ProfileSidebarProps {
  profile?: StudentProfile;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onLogout?: () => void;
  variant?: 'dashboard' | 'hub';
  pastPlanCount?: number;
  onNewTrack?: () => void;
}

const dashboardNav = [
  { key: `recommendations`, label: `Recommendations`, icon: SparklesIcon },
  { key: `plans`, label: `My Plans`, icon: TargetIcon },
  { key: `profile`, label: `My Profile`, icon: BookOpenIcon },
];

const hubNav = [
  { key: `home`, label: `Home`, icon: HomeIcon },
  { key: `past-plans`, label: `Past Plans`, icon: HistoryIcon },
  { key: `profile`, label: `My Profile`, icon: BookOpenIcon },
];

export default function ProfileSidebar({
  profile = {
    name: `Student`,
    grade: 11,
    age: 17,
    interests: [`Biology`, `Debate`],
    strengths: [`Research`, `Writing`],
    goals: [`Apply to college`],
    extracurriculars: [`Science Club`],
  },
  activeTab = `recommendations`,
  onTabChange = () => {},
  onLogout = () => {},
  variant = `dashboard`,
  pastPlanCount = 0,
  onNewTrack = () => {},
}: ProfileSidebarProps) {
  const navItems = variant === `hub` ? hubNav : dashboardNav;
  const gradeLabel = getGradeShortLabel(profile.grade);

  return (
    <div data-cmp="ProfileSidebar" className="flex flex-col h-full bg-sidebar w-72 shrink-0">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <GraduationCapIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-base font-bold text-sidebar-primary">EduPath</div>
          <div className="text-xs text-sidebar-foreground/50">
            {variant === `hub` ? `Personal hub` : `AI Planning Assistant`}
          </div>
        </div>
      </div>

      <div className="mx-4 mt-5 p-4 rounded-2xl bg-white/10 border border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-base shrink-0">
            {profile.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="text-sidebar-primary font-semibold text-sm truncate">{profile.name}</div>
            <div className="text-sidebar-foreground/60 text-xs">
              {gradeLabel}
            </div>
          </div>
        </div>
        <div className="h-px bg-sidebar-border mb-3" />
        {variant === `hub` ? (
          <div className="flex items-center justify-between text-xs">
            <span className="text-sidebar-foreground/60">Plans in memory</span>
            <span className="text-emerald font-semibold">{pastPlanCount}</span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between text-xs">
              <span className="text-sidebar-foreground/60">Profile strength</span>
              <span className="text-emerald font-semibold">Strong</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-white/10">
              <div className="h-full w-4/5 rounded-full bg-emerald" />
            </div>
          </>
        )}
      </div>

      <nav className="flex-1 px-4 mt-6 flex flex-col gap-1 overflow-y-auto scrollbar-thin">
        <div className="text-xs font-semibold text-sidebar-foreground/40 px-3 mb-2 uppercase tracking-wider">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left ${
                isActive
                  ? `bg-white/15 text-sidebar-primary`
                  : `text-sidebar-foreground/70 hover:bg-white/8 hover:text-sidebar-foreground`
              }`}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.key === `past-plans` && pastPlanCount > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/20 text-sidebar-primary">
                  {pastPlanCount}
                </span>
              )}
              {isActive && <ChevronRightIcon className="w-3.5 h-3.5 opacity-50" />}
            </button>
          );
        })}

        <div className="mt-6">
          <div className="text-xs font-semibold text-sidebar-foreground/40 px-3 mb-3 uppercase tracking-wider">
            Your Interests
          </div>
          <div className="px-3 flex flex-wrap gap-1.5">
            {profile.interests.length === 0 ? (
              <p className="text-xs text-sidebar-foreground/50">Add interests in My Profile</p>
            ) : (
              profile.interests.slice(0, 6).map((interest) => (
                <span
                  key={interest}
                  className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-sidebar-foreground/80 border border-sidebar-border"
                >
                  {interest}
                </span>
              ))
            )}
          </div>
        </div>

        <div className="mt-5">
          <div className="text-xs font-semibold text-sidebar-foreground/40 px-3 mb-3 uppercase tracking-wider">
            Activities
          </div>
          <div className="px-3 flex flex-col gap-1.5">
            {profile.extracurriculars.length === 0 ? (
              <p className="text-xs text-sidebar-foreground/50">Add activities in My Profile</p>
            ) : (
              profile.extracurriculars.slice(0, 4).map((activity) => (
                <div key={activity} className="flex items-center gap-2 text-xs text-sidebar-foreground/70">
                  <TrophyIcon className="w-3 h-3 shrink-0 text-amber" />
                  <span className="truncate">{activity}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </nav>

      <div className="px-4 py-4 border-t border-sidebar-border flex flex-col gap-2">
        {variant === `hub` && (
          <button
            onClick={onNewTrack}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all"
          >
            <PlusCircleIcon className="w-4 h-4" />
            New AI tracks
          </button>
        )}
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground/60 hover:text-rose hover:bg-rose-muted/10 transition-all"
        >
          <LogOutIcon className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
