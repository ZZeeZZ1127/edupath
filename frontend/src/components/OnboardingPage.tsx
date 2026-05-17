import { useState } from 'react';
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  CheckIcon,
  SparklesIcon,
  Loader2Icon,
  LogOutIcon,
  DatabaseIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import type { StudentProfile, UserSession } from '../types';
import { saveProfile } from '../services/api';
import { AGE_INPUT_MAX, AGE_INPUT_MIN, GRADE_OPTIONS, getDefaultAgeForGrade } from '../lib/grades';
import WorkflowStepper from './WorkflowStepper';
import InterestPicker from './InterestPicker';
import EduPathBrand from './EduPathBrand';

interface OnboardingPageProps {
  session: UserSession;
  onComplete?: (profile: StudentProfile) => void;
  onHome?: () => void;
  onLogout?: () => void;
}

export default function OnboardingPage({
  session,
  onComplete = () => {},
  onHome = () => {},
  onLogout = () => {},
}: OnboardingPageProps) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(``);
  const [age, setAge] = useState(`17`);
  const [grade, setGrade] = useState(11);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [strengths, setStrengths] = useState(``);
  const [goals, setGoals] = useState(``);
  const [extracurriculars, setExtracurriculars] = useState(``);

  const totalSteps = 4;

  const handleGradeChange = (nextGrade: number) => {
    setGrade(nextGrade);
    if (!age.trim()) {
      setAge(String(getDefaultAgeForGrade(nextGrade)));
    }
  };

  const parseAge = () => {
    const n = parseInt(age, 10);
    if (Number.isNaN(n)) return null;
    if (n < AGE_INPUT_MIN || n > AGE_INPUT_MAX) return null;
    return n;
  };

  const handleComplete = async () => {
    const parsedAge = parseAge();
    if (parsedAge === null) {
      toast.error(`Please enter a valid age (${AGE_INPUT_MIN}–${AGE_INPUT_MAX})`);
      return;
    }
    const profile: StudentProfile = {
      name: name || `Student`,
      grade,
      age: parsedAge,
      interests: selectedInterests,
      strengths: strengths.split(`,`).map((s) => s.trim()).filter(Boolean),
      goals,
      extracurriculars: extracurriculars.split(`,`).map((s) => s.trim()).filter(Boolean),
    };
    setSaving(true);
    try {
      await saveProfile(session, profile);
      toast.success(`Profile saved to database`);
      onComplete(profile);
    } catch {
      toast.error(`Could not save profile. Please try again.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-cmp="OnboardingPage" className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center gap-3 px-8 py-5 border-b border-border bg-card">
        <EduPathBrand onHome={onHome} iconSize="sm" />
        <div className="ml-auto text-sm text-muted-foreground">Step {step} of {totalSteps}</div>
        <button
          onClick={onLogout}
          className="ml-4 p-2 text-muted-foreground hover:text-rose transition-colors"
          aria-label="Sign out"
        >
          <LogOutIcon className="w-4 h-4" />
        </button>
      </header>

      <WorkflowStepper current="profile" />

      {/* Progress bar */}
      <div className="h-1 bg-border">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-xl">

          {/* Step 1 — Basic Info */}
          <div className={step === 1 ? `fade-in` : `hidden`}>
            <div className="mb-8">
              <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center mb-4">
                <SparklesIcon className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Let's get to know you</h2>
              <p className="text-muted-foreground">EduPath remembers everything you share — so every recommendation is tailored just for you.</p>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Your first name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maria"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Education level
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => handleGradeChange(parseInt(e.target.value, 10))}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  >
                    <optgroup label="Middle & high school">
                      {GRADE_OPTIONS.filter((g) => g.group === `k12`).map((g) => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Undergraduate">
                      {GRADE_OPTIONS.filter((g) => g.group === `undergrad`).map((g) => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Graduate">
                      {GRADE_OPTIONS.filter((g) => g.group === `graduate`).map((g) => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div className="w-32">
                  <label className="block text-sm font-semibold text-foreground mb-2">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min={AGE_INPUT_MIN}
                    max={AGE_INPUT_MAX}
                    placeholder="Age"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 — Interests */}
          <div className={step === 2 ? `fade-in` : `hidden`}>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">What are you passionate about?</h2>
              <p className="text-muted-foreground">
                Search our database or add your own — selections power your personalized recommendations.
              </p>
            </div>
            <InterestPicker selected={selectedInterests} onChange={setSelectedInterests} />
          </div>

          {/* Step 3 — Strengths & Extracurriculars */}
          <div className={step === 3 ? `fade-in` : `hidden`}>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Tell us about your strengths</h2>
              <p className="text-muted-foreground">The more you share, the more specific and accurate your recommendations will be.</p>
            </div>
            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Academic strengths</label>
                <input
                  type="text"
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="e.g. Research, Public Speaking, Writing, Critical Thinking"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
                <p className="text-xs text-muted-foreground mt-1.5">Separate with commas</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Extracurricular activities</label>
                <input
                  type="text"
                  value={extracurriculars}
                  onChange={(e) => setExtracurriculars(e.target.value)}
                  placeholder="e.g. Debate Team (Captain), Hospital Volunteer, Science Club"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
                <p className="text-xs text-muted-foreground mt-1.5">Separate with commas</p>
              </div>
            </div>
          </div>

          {/* Step 4 — Goals */}
          <div className={step === 4 ? `fade-in` : `hidden`}>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">What are your goals?</h2>
              <p className="text-muted-foreground">Share your college and career aspirations. Don't hold back — there's no wrong answer.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Your goals and milestones</label>
              <textarea
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                rows={5}
                placeholder="e.g. I want to apply to top universities with strong pre-med programs. I'm hoping to do research before senior year and eventually become a physician. I'm a first-generation college student and want to make my family proud."
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
              />
            </div>
            <div className="mt-4 p-4 rounded-xl bg-emerald-muted border border-emerald/20">
              <div className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-emerald mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <DatabaseIcon className="w-4 h-4 text-emerald" />
                    Upload to database on finish
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    When you click below, your profile is saved to DynamoDB. The recommendation AI will read it to suggest your next tracks.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all ${step === 1 ? `opacity-0 pointer-events-none` : ``}`}
            >
              <ChevronLeftIcon className="w-4 h-4" />
              Back
            </button>

            <div className="flex gap-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i + 1 === step ? `w-6 bg-primary` : i + 1 < step ? `w-2 bg-primary` : `w-2 bg-border`
                  }`}
                />
              ))}
            </div>

            {step < totalSteps ? (
              <button
                onClick={() => {
                  if (step === 1) {
                    if (!name.trim()) {
                      toast.error(`Please enter your first name`);
                      return;
                    }
                    if (parseAge() === null) {
                      toast.error(`Please enter a valid age (${AGE_INPUT_MIN}–${AGE_INPUT_MAX})`);
                      return;
                    }
                  }
                  setStep((s) => Math.min(totalSteps, s + 1));
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all shadow-custom"
              >
                Continue
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand text-brand-foreground text-sm font-semibold hover:opacity-90 transition-all shadow-custom disabled:opacity-50"
              >
                {saving ? (
                  <Loader2Icon className="w-4 h-4 animate-spin" />
                ) : (
                  <DatabaseIcon className="w-4 h-4" />
                )}
                {saving ? `Saving…` : `Save & get recommendations`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
