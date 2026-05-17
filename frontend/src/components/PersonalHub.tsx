import { useEffect, useState } from 'react';
import ProfileSidebar from './ProfileSidebar';
import HubHomePanel from './HubHomePanel';
import PastPlansPanel from './PastPlansPanel';
import ProfilePanel from './ProfilePanel';
import PastPlanDashboard from './PastPlanDashboard';
import type { HubTab, SavedPlan, StudentProfile } from '../types';

interface PersonalHubProps {
  profile: StudentProfile;
  pastPlans: SavedPlan[];
  onLogout?: () => void;
  onUpdateProfile?: (profile: StudentProfile) => void;
  onUpdatePlan?: (plan: SavedPlan) => Promise<void>;
  onNewTrack?: () => void;
  initialTab?: HubTab;
}

export default function PersonalHub({
  profile,
  pastPlans,
  onLogout = () => {},
  onUpdateProfile = () => {},
  onUpdatePlan = async () => {},
  onNewTrack = () => {},
  initialTab = `home`,
}: PersonalHubProps) {
  const [activeTab, setActiveTab] = useState<HubTab>(initialTab);
  const [currentProfile, setCurrentProfile] = useState(profile);
  const [selectedPlan, setSelectedPlan] = useState<SavedPlan | null>(null);

  useEffect(() => {
    setCurrentProfile(profile);
  }, [profile]);

  useEffect(() => {
    if (!selectedPlan) return;
    const fresh = pastPlans.find((p) => p.id === selectedPlan.id);
    if (fresh) setSelectedPlan(fresh);
  }, [pastPlans, selectedPlan?.id]);

  const handleUpdateProfile = (updated: StudentProfile) => {
    setCurrentProfile(updated);
    onUpdateProfile(updated);
  };

  const handlePlanUpdate = async (updated: SavedPlan) => {
    setSelectedPlan(updated);
    await onUpdatePlan(updated);
  };

  return (
    <div data-cmp="PersonalHub" className="flex h-screen overflow-hidden bg-background">
      <ProfileSidebar
        variant="hub"
        profile={currentProfile}
        activeTab={activeTab}
        pastPlanCount={pastPlans.length}
        onTabChange={(tab) => {
          setActiveTab(tab as HubTab);
          setSelectedPlan(null);
        }}
        onNewTrack={onNewTrack}
        onLogout={onLogout}
      />

      <main className="flex-1 min-w-0 overflow-hidden relative">
        <div className={`h-full ${activeTab === `home` ? `` : `hidden`}`}>
          <HubHomePanel
            profile={currentProfile}
            pastPlans={pastPlans}
            onNewTrack={onNewTrack}
            onViewPlans={() => setActiveTab(`past-plans`)}
            onOpenPlan={setSelectedPlan}
          />
        </div>

        <div className={`h-full ${activeTab === `past-plans` ? `` : `hidden`}`}>
          <PastPlansPanel
            profile={currentProfile}
            plans={pastPlans}
            onOpenPlan={setSelectedPlan}
            onNewTrack={onNewTrack}
          />
        </div>

        <div className={`h-full ${activeTab === `profile` ? `` : `hidden`}`}>
          <ProfilePanel profile={currentProfile} onUpdateProfile={handleUpdateProfile} />
        </div>
      </main>

      {selectedPlan && (
        <PastPlanDashboard
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onUpdatePlan={handlePlanUpdate}
        />
      )}
    </div>
  );
}
