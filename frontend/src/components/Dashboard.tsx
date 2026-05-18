import { useState } from 'react';
import ProfileSidebar from './ProfileSidebar';
import RecommendationsPanel from './RecommendationsPanel';
import PlansPanel from './PlansPanel';
import ProfilePanel from './ProfilePanel';
import { generateActionGuide } from '../services/mockAi';
import type { StudentProfile, DashboardTab, TrackRecommendation, ActionGuide } from '../types';

interface DashboardProps {
  profile?: StudentProfile;
  onLogout?: () => void;
  onUpdateProfile?: (profile: StudentProfile) => void;
}

export default function Dashboard({
  profile = {
    name: `Maria`,
    grade: 11,
    age: 17,
    interests: [`Biology`, `Debate`],
    strengths: [`Research`, `Writing`],
    goals: [`Apply to top universities`],
    extracurriculars: [`Debate Team`],
  },
  onLogout = () => {},
  onUpdateProfile = () => {},
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>(`recommendations`);
  const [currentGuide, setCurrentGuide] = useState<ActionGuide | null>(null);
  const [currentProfile, setCurrentProfile] = useState<StudentProfile>(profile);

  const handleBuildPlan = async (track: TrackRecommendation) => {
    const guide = await generateActionGuide(currentProfile, track);
    setCurrentGuide(guide);
    setActiveTab(`plans`);
  };

  const handleUpdateProfile = (updated: StudentProfile) => {
    setCurrentProfile(updated);
    onUpdateProfile(updated);
  };

  return (
    <div data-cmp="Dashboard" className="flex h-screen overflow-hidden bg-background">
      <ProfileSidebar
        profile={currentProfile}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as DashboardTab)}
        onLogout={onLogout}
      />

      <main className="flex-1 min-w-0 overflow-hidden">
        <div className={`h-full ${activeTab === `recommendations` ? `` : `hidden`}`}>
          <RecommendationsPanel
            profile={currentProfile}
            onBuildPlan={handleBuildPlan}
          />
        </div>

        <div className={`h-full ${activeTab === `plans` ? `` : `hidden`}`}>
          <PlansPanel
            profile={currentProfile}
            guide={currentGuide}
          />
        </div>

        <div className={`h-full ${activeTab === `profile` ? `` : `hidden`}`}>
          <ProfilePanel
            profile={currentProfile}
            onUpdateProfile={handleUpdateProfile}
          />
        </div>
      </main>
    </div>
  );
}
