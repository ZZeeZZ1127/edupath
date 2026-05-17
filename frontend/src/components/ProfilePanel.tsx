import {
  UserIcon,
  BookOpenIcon,
  TrophyIcon,
  TargetIcon,
  EditIcon,
  CheckIcon,
  SparklesIcon,
  GraduationCapIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { StudentProfile } from '../types';
import { getGradeLabel } from '../lib/grades';
import InterestPicker from './InterestPicker';

interface ProfilePanelProps {
  profile: StudentProfile;
  onUpdateProfile?: (profile: StudentProfile) => void;
}

type EditSection = 'goals' | 'interests' | 'strengths' | 'extracurriculars' | null;

function parseLines(value: string): string[] {
  return value
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function profileCompleteness(profile: StudentProfile): number {
  let score = 0;
  if (profile.name.trim()) score += 15;
  if (profile.goals.length) score += 20;
  if (profile.interests.length) score += 25;
  if (profile.strengths.length) score += 20;
  if (profile.extracurriculars.length) score += 20;
  return Math.min(100, score);
}

function EmptyHint({ onEdit }: { onEdit: () => void }) {
  return (
    <p className="text-sm text-muted-foreground">
      Nothing added yet.{" "}
      <button type="button" onClick={onEdit} className="text-primary font-medium hover:underline">
        Add now
      </button>
    </p>
  );
}

export default function ProfilePanel({ profile, onUpdateProfile = () => {} }: ProfilePanelProps) {
  const [editing, setEditing] = useState<EditSection>(null);
  const [editGoals, setEditGoals] = useState(profile.goals.join('\n'));
  const [editInterests, setEditInterests] = useState(profile.interests);
  const [editStrengths, setEditStrengths] = useState(profile.strengths.join(', '));
  const [editActivities, setEditActivities] = useState(profile.extracurriculars.join('\n'));

  useEffect(() => {
    setEditGoals(profile.goals.join('\n'));
    setEditInterests(profile.interests);
    setEditStrengths(profile.strengths.join(', '));
    setEditActivities(profile.extracurriculars.join('\n'));
    setEditing(null);
  }, [profile]);

  const completeness = profileCompleteness(profile);

  const saveSection = (section: EditSection) => {
    if (!section) return;
    const updated: StudentProfile = { ...profile };
    if (section === 'goals') updated.goals = parseLines(editGoals);
    if (section === 'interests') updated.interests = editInterests;
    if (section === 'strengths') updated.strengths = parseLines(editStrengths);
    if (section === 'extracurriculars') updated.extracurriculars = parseLines(editActivities);
    onUpdateProfile(updated);
    setEditing(null);
  };

  const sectionHeader = (label: string, section: EditSection, icon: typeof BookOpenIcon) => {
    const Icon = icon;
    const isEditing = editing === section;
    return (
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground text-sm">{label}</h3>
        </div>
        <button
          type="button"
          onClick={() => (isEditing ? saveSection(section) : setEditing(section))}
          className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
        >
          {isEditing ? <CheckIcon className="w-3.5 h-3.5" /> : <EditIcon className="w-3.5 h-3.5" />}
          {isEditing ? `Save` : `Edit`}
        </button>
      </div>
    );
  };

  return (
    <div data-cmp="ProfilePanel" className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">My Profile</h1>
            <p className="text-xs text-muted-foreground">Saved to DynamoDB · Powers your recommendations</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin">
        <div className="p-6 rounded-2xl bg-brand text-brand-foreground shadow-custom mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold text-white shrink-0">
              {profile.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              <div className="flex items-center gap-3 mt-1 text-white/70 text-sm">
                <GraduationCapIcon className="w-4 h-4" />
                {getGradeLabel(profile.grade)}
                <span>·</span>
                <span>Age {profile.age}</span>
              </div>
            </div>
          </div>
          <div className="h-px bg-white/20 mb-4" />
          <div className="flex items-center justify-between mb-2 text-sm"><span className="text-white/70">Profile completeness</span><span className="font-bold">{completeness}%</span></div><div className="h-2 rounded-full bg-white/20"><div className="h-full rounded-full bg-white" style={{ width: `${completeness}%` }} />
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-border shadow-custom p-5 mb-5">
          {sectionHeader('Goals & Milestones', 'goals', TargetIcon)}
          {editing === 'goals' ? (
            <textarea value={editGoals} onChange={(e) => setEditGoals(e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          ) : profile.goals.length ? (
            <ul className="text-sm text-muted-foreground leading-relaxed space-y-1 list-disc list-inside">
              {profile.goals.map((goal, i) => <li key={i}>{goal}</li>)}
            </ul>
          ) : (
            <EmptyHint onEdit={() => setEditing('goals')} />
          )}
        </div>
        <div className="bg-card rounded-2xl border border-border shadow-custom p-5 mb-4">
          {sectionHeader('Academic Interests', 'interests', BookOpenIcon)}
          {editing === 'interests' ? (
            <InterestPicker selected={editInterests} onChange={setEditInterests} />
          ) : profile.interests.length ? (
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <span key={interest} className="text-sm px-3 py-1 rounded-full bg-accent text-accent-foreground border border-accent-foreground/15 font-medium">{interest}</span>
              ))}
            </div>
          ) : (
            <EmptyHint onEdit={() => setEditing('interests')} />
          )}
        </div>
        <div className="bg-card rounded-2xl border border-border shadow-custom p-5 mb-4">
          {sectionHeader('Strengths', 'strengths', SparklesIcon)}
          {editing === 'strengths' ? (
            <textarea value={editStrengths} onChange={(e) => setEditStrengths(e.target.value)} rows={3} placeholder="Comma-separated" className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          ) : profile.strengths.length ? (
            <div className="flex flex-wrap gap-2">
              {profile.strengths.map((s) => (
                <span key={s} className="text-sm px-3 py-1 rounded-full bg-emerald-muted text-emerald border border-emerald/20 font-medium">{s}</span>
              ))}
            </div>
          ) : (
            <EmptyHint onEdit={() => setEditing('strengths')} />
          )}
        </div>
        <div className="bg-card rounded-2xl border border-border shadow-custom p-5 mb-4">
          {sectionHeader('Extracurricular Activities', 'extracurriculars', TrophyIcon)}
          {editing === 'extracurriculars' ? (
            <textarea value={editActivities} onChange={(e) => setEditActivities(e.target.value)} rows={4} placeholder="One per line" className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          ) : profile.extracurriculars.length ? (
            <div className="flex flex-col gap-2">
              {profile.extracurriculars.map((activity) => (
                <div key={activity} className="flex items-center gap-3 p-3 rounded-xl bg-muted border border-border">
                  <TrophyIcon className="w-4 h-4 text-amber shrink-0" />
                  <span className="text-sm text-foreground">{activity}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyHint onEdit={() => setEditing('extracurriculars')} />
          )}
        </div>
      </div>
    </div>
  );
}