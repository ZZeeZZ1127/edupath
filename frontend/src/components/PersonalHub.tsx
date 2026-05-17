import { useState } from 'react';
import ProfileSidebar from './ProfileSidebar';
import HubHomePanel from './HubHomePanel';
import PastPlansPanel from './PastPlansPanel';
import ProfilePanel from './ProfilePanel';
import type { HubTab, SavedPlan, StudentProfile } from '../types';

interface PersonalHubProps {
  profile: StudentProfile;
  pastPlans: SavedPlan[];
  onLogout?: () => void;
  onUpdateProfile?: (profile: StudentProfile) => void;
  onNewTrack?: () => void;
  onOpenPlan?: (plan: SavedPlan) => void;
  initialTab?: HubTab;
}

export default function PersonalHub({
  profile,
  pastPlans,
  onLogout = () => {},
  onUpdateProfile = () => {},
  onNewTrack = () => {},
  onOpenPlan = () => {},
  initialTab = `home`,
}: PersonalHubProps) {
  const [activeTab, setActiveTab] = useState<HubTab>(initialTab);
  const [currentProfile, setCurrentProfile] = useState(profile);

  const handleUpdateProfile = (updated: StudentProfile) => {
    setCurrentProfile(updated);
    onUpdateProfile(updated);
  };

  return (
    <div data-cmp="PersonalHub" className="flex h-screen overflow-hidden bg-background">
      <ProfileSidebar
        variant="hub"
        profile={currentProfile}
        activeTab={activeTab}
        pastPlanCount={pastPlans.length}
        onTabChange={(tab) => setActiveTab(tab as HubTab)}
        onNewTrack={onNewTrack}
        onLogout={onLogout}
      />

      <main className="flex-1 min-w-0 overflow-hidden">
        <div className={`h-full ${activeTab === `home` ? `` : `hidden`}`}>
          <HubHomePanel
            profile={currentProfile}
            pastPlans={pastPlans}
            onNewTrack={onNewTrack}
            onViewPlans={() => setActiveTab(`past-plans`)}
            onOpenPlan={onOpenPlan}
          />
        </div>

        <div className={`h-full ${activeTab === `past-plans` ? `` : `hidden`}`}>
          <PastPlansPanel
            profile={currentProfile}
            plans={pastPlans}
            onOpenPlan={onOpenPlan}
            onNewTrack={onNewTrack}
          />
        </div>

        <div className={`h-full ${activeTab === `profile` ? `` : `hidden`}`}>
          <ProfilePanel profile={currentProfile} onUpdateProfile={handleUpdateProfile} />
        </div>
      </main>
    </div>
  );
}
