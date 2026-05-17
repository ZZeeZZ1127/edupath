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
import { useState } from 'react';
import type { StudentProfile } from '../types';

interface ProfilePanelProps {
  profile?: StudentProfile;
  onUpdateProfile?: (profile: StudentProfile) => void;
}

const GRADE_LABELS: Record<number, string> = {
  6: `6th Grade`, 7: `7th Grade`, 8: `8th Grade`,
  9: `9th Grade (Freshman)`, 10: `10th Grade (Sophomore)`,
  11: `11th Grade (Junior)`, 12: `12th Grade (Senior)`,
};

export default function ProfilePanel({
  profile = {
    name: `Maria`,
    grade: 11,
    age: 17,
    interests: [`Biology`, `Debate`, `Pre-Medicine`],
    strengths: [`Research`, `Public Speaking`, `Writing`],
    goals: `Apply to top universities with strong pre-med programs.`,
    extracurriculars: [`Debate Team (Captain)`, `Hospital Volunteer`, `Science Club`],
  },
  onUpdateProfile = () => {},
}: ProfilePanelProps) {
  const [editing, setEditing] = useState(false);
  const [editGoals, setEditGoals] = useState(profile.goals);

  const handleSave = () => {
    onUpdateProfile({ ...profile, goals: editGoals });
    setEditing(false);
  };

  const infoSections = [
    {
      label: `Academic Interests`,
      icon: BookOpenIcon,
      content: (
        <div className="flex flex-wrap gap-2">
          {profile.interests.map((interest) => (
            <span key={interest} className="text-sm px-3 py-1 rounded-full bg-accent text-accent-foreground border border-accent-foreground/15 font-medium">
              {interest}
            </span>
          ))}
        </div>
      ),
    },
    {
      label: `Strengths`,
      icon: SparklesIcon,
      content: (
        <div className="flex flex-wrap gap-2">
          {profile.strengths.map((s) => (
            <span key={s} className="text-sm px-3 py-1 rounded-full bg-emerald-muted text-emerald border border-emerald/20 font-medium">
              {s}
            </span>
          ))}
        </div>
      ),
    },
    {
      label: `Extracurricular Activities`,
      icon: TrophyIcon,
      content: (
        <div className="flex flex-col gap-2">
          {profile.extracurriculars.map((activity) => (
            <div key={activity} className="flex items-center gap-3 p-3 rounded-xl bg-muted border border-border">
              <TrophyIcon className="w-4 h-4 text-amber shrink-0" />
              <span className="text-sm text-foreground">{activity}</span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div data-cmp="ProfilePanel" className="flex flex-col h-full">
      {/* Header */}
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
        {/* Hero card */}
        <div className="p-6 rounded-2xl bg-brand text-brand-foreground shadow-custom mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold text-white shrink-0">
              {profile.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              <div className="flex items-center gap-3 mt-1 text-white/70 text-sm">
                <span className="flex items-center gap-1.5">
                  <GraduationCapIcon className="w-4 h-4" />
                  {GRADE_LABELS[profile.grade] ?? `Grade ${profile.grade}`}
                </span>
                <span>·</span>
                <span>Age {profile.age}</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-white/20 mb-4" />

          {/* Profile completeness */}
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="text-white/70">Profile completeness</span>
            <span className="font-bold">80%</span>
          </div>
          <div className="h-2 rounded-full bg-white/20">
            <div className="h-full w-4/5 rounded-full bg-white" />
          </div>
          <p className="text-xs text-white/50 mt-2">Add SAT scores and more activities to reach 100%</p>
        </div>

        {/* AWS storage note */}
        <div className="p-4 rounded-xl bg-accent border border-accent-foreground/10 mb-6">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-primary shrink-0" />
            <p className="text-xs text-accent-foreground">
              <strong>Persistent Memory:</strong> Your profile is stored in Amazon DynamoDB and passed to Amazon Bedrock with every recommendation request — so EduPath always knows who you are.
            </p>
          </div>
        </div>

        {/* Goals section */}
        <div className="bg-card rounded-2xl border border-border shadow-custom p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TargetIcon className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground text-sm">Goals & Milestones</h3>
            </div>
            <button
              onClick={() => editing ? handleSave() : setEditing(true)}
              className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
            >
              {editing ? <CheckIcon className="w-3.5 h-3.5" /> : <EditIcon className="w-3.5 h-3.5" />}
              {editing ? `Save` : `Edit`}
            </button>
          </div>
          <div className={editing ? `` : `hidden`}>
            <textarea
              value={editGoals}
              onChange={(e) => setEditGoals(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
            />
          </div>
          <p className={`text-sm text-muted-foreground leading-relaxed ${editing ? `hidden` : ``}`}>
            {profile.goals}
          </p>
        </div>

        {/* Info sections */}
        {infoSections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.label} className="bg-card rounded-2xl border border-border shadow-custom p-5 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground text-sm">{section.label}</h3>
              </div>
              {section.content}
            </div>
          );
        })}

        {/* AWS architecture note */}
        <div className="bg-card rounded-2xl border border-border p-5 mb-6">
          <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-primary" />
            How EduPath Uses Your Profile
          </h3>
          <div className="flex flex-col gap-3">
            {[
              { step: `1`, label: `Profile saved to DynamoDB`, desc: `All data tied to your Cognito identity` },
              { step: `2`, label: `Passed to Amazon Bedrock`, desc: `Name, grade, interests, and goals included in every AI prompt` },
              { step: `3`, label: `Plans stored in S3`, desc: `Generated application plans persist in cloud storage` },
              { step: `4`, label: `Memory across sessions`, desc: `Last 3–5 conversation exchanges included in each request` },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary mt-0.5">
                  {item.step}
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
