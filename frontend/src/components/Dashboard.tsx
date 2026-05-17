import { useState } from 'react';
import ProfileSidebar from './ProfileSidebar';
import RecommendationsPanel from './RecommendationsPanel';
import PlansPanel from './PlansPanel';
import ProfilePanel from './ProfilePanel';
import type { StudentProfile, ApplicationPlan, DashboardTab, Recommendation, CollegeFitItem } from '../types';
import { mockApplicationPlan, mockCollegeFit } from '../data/mockData';

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
    goals: `Apply to top universities.`,
    extracurriculars: [`Debate Team`],
  },
  onLogout = () => {},
  onUpdateProfile = () => {},
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>(`recommendations`);
  const [currentPlan, setCurrentPlan] = useState<ApplicationPlan>(mockApplicationPlan);
  const [currentProfile, setCurrentProfile] = useState<StudentProfile>(profile);

  const handleBuildPlan = (rec: Recommendation | CollegeFitItem) => {
    // For demo: any college plan maps to mock JHU plan with overridden title/org
    const collegeFitItem = rec as CollegeFitItem;
    const isCollege = !!collegeFitItem.type;

    const matchingCollege = isCollege
      ? mockCollegeFit.find((c) => c.id === rec.id)
      : null;

    if (matchingCollege) {
      setCurrentPlan({
        ...mockApplicationPlan,
        opportunityTitle: `Undergraduate Admission`,
        organization: matchingCollege.name,
        matchReasoning: matchingCollege.matchReason,
      });
    } else {
      const opportunity = rec as Recommendation;
      setCurrentPlan({
        ...mockApplicationPlan,
        opportunityTitle: opportunity.title,
        organization: opportunity.organization,
        matchReasoning: opportunity.matchReason,
      });
    }
    setActiveTab(`plans`);
  };

  const handleUpdateProfile = (updated: StudentProfile) => {
    setCurrentProfile(updated);
    onUpdateProfile(updated);
  };

  return (
    <div data-cmp="Dashboard" className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <ProfileSidebar
        profile={currentProfile}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as DashboardTab)}
        onLogout={onLogout}
      />

      {/* Main content — each tab always in DOM, visibility controlled by class */}
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
            initialPlan={currentPlan}
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
