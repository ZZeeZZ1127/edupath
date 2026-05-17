import { useCallback, useRef, useState } from 'react';
import { Toaster, toast } from 'sonner';
import LandingPage from '../components/LandingPage';
import LoginPage from '../components/LoginPage';
import SignupPage from '../components/SignupPage';
import OnboardingPage from '../components/OnboardingPage';
import TrackSelectionPage from '../components/TrackSelectionPage';
import ActionGuidePage from '../components/ActionGuidePage';
import PersonalHub from '../components/PersonalHub';
import type {
  ActionGuide,
  AppPage,
  HubTab,
  SavedPlan,
  StudentProfile,
  TrackRecommendation,
  UserSession,
} from '../types';
import {
  buildSavedPlan,
  loadPastPlans,
  loadProfile,
  persistSelectedTrack,
  savePastPlan,
  saveProfile,
} from '../services/api';
import { mariaProfile } from '../data/mockData';

function userIdFromEmail(email: string) {
  return email.toLowerCase().replace(/[^a-z0-9]/g, `-`);
}

export default function Index() {
  const [page, setPage] = useState<AppPage>(`landing`);
  const [session, setSession] = useState<UserSession | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [pastPlans, setPastPlans] = useState<SavedPlan[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<TrackRecommendation | null>(null);
  const [cachedGuide, setCachedGuide] = useState<ActionGuide | null>(null);
  const [viewingSaved, setViewingSaved] = useState(false);
  const [hubInitialTab, setHubInitialTab] = useState<HubTab>(`home`);
  const savedPlanKeyRef = useRef<string | null>(null);

  const refreshPastPlans = useCallback(async (userId: string) => {
    const plans = await loadPastPlans(userId);
    setPastPlans(plans);
    return plans;
  }, []);

  const handleLogout = useCallback(() => {
    setSession(null);
    setProfile(null);
    setPastPlans([]);
    setSelectedTrack(null);
    setCachedGuide(null);
    setViewingSaved(false);
    setPage(`landing`);
  }, []);

  const goToHub = useCallback((tab: HubTab = `home`) => {
    setHubInitialTab(tab);
    setPage(`hub`);
  }, []);

  const handleLogin = async (email: string) => {
    const userSession: UserSession = {
      userId: userIdFromEmail(email),
      email,
      isNewUser: false,
    };
    setSession(userSession);

    const [existing, plans] = await Promise.all([
      loadProfile(userSession),
      refreshPastPlans(userSession.userId),
    ]);

    if (existing) {
      setProfile(existing);
      toast.success(`Welcome back, ${existing.name}!`);
      setPage(plans.length > 0 ? `hub` : `recommendations`);
    } else if (email.includes(`maria`)) {
      setProfile(mariaProfile);
      setPage(plans.length > 0 ? `hub` : `recommendations`);
    } else {
      toast.info(`Complete your profile to get started`);
      setPage(`profile`);
    }
  };

  const handleSignup = (email: string) => {
    setSession({
      userId: userIdFromEmail(email),
      email,
      isNewUser: true,
    });
    setProfile(null);
    setPastPlans([]);
    setPage(`profile`);
  };

  const handleProfileComplete = (completed: StudentProfile) => {
    setProfile(completed);
    setPage(`recommendations`);
  };

  const handleSelectTrack = (track: TrackRecommendation) => {
    if (session) persistSelectedTrack(session.userId, track);
    savedPlanKeyRef.current = null;
    setSelectedTrack(track);
    setCachedGuide(null);
    setViewingSaved(false);
    setPage(`action-guide`);
  };

  const handleGuideReady = useCallback(
    async (guide: ActionGuide) => {
      if (!session || !profile || !selectedTrack || viewingSaved) return;
      const saveKey = `${selectedTrack.id}:${guide.trackId}`;
      if (savedPlanKeyRef.current === saveKey) return;
      savedPlanKeyRef.current = saveKey;

      const plan = buildSavedPlan(session.userId, profile, selectedTrack, guide);
      await savePastPlan(plan);
      await refreshPastPlans(session.userId);
      toast.success(`Plan saved — AI will remember this for your next recommendations`);
    },
    [session, profile, selectedTrack, viewingSaved, refreshPastPlans]
  );

  const handleOpenPastPlan = (plan: SavedPlan) => {
    setSelectedTrack(plan.track);
    setCachedGuide(plan.guide);
    setViewingSaved(true);
    setPage(`action-guide`);
  };

  const handleUpdateProfile = async (updated: StudentProfile) => {
    setProfile(updated);
    if (session) {
      await saveProfile(session, updated);
    }
  };

  const handleBackFromSavedPlan = () => {
    setViewingSaved(false);
    setCachedGuide(null);
    goToHub(`past-plans`);
  };

  return (
    <div data-cmp="Index" className="min-h-screen bg-background">
      <Toaster position="top-right" richColors />

      {page === `landing` && (
        <LandingPage onLogin={() => setPage(`login`)} onSignup={() => setPage(`signup`)} />
      )}

      {page === `login` && (
        <LoginPage
          onLogin={handleLogin}
          onSignup={() => setPage(`signup`)}
          onBack={() => setPage(`landing`)}
        />
      )}

      {page === `signup` && (
        <SignupPage onSignup={handleSignup} onBack={() => setPage(`landing`)} />
      )}

      {session && profile && page === `hub` && (
        <PersonalHub
          key={hubInitialTab}
          profile={profile}
          pastPlans={pastPlans}
          initialTab={hubInitialTab}
          onLogout={handleLogout}
          onUpdateProfile={handleUpdateProfile}
          onNewTrack={() => {
            setViewingSaved(false);
            setCachedGuide(null);
            setPage(`recommendations`);
          }}
          onOpenPlan={handleOpenPastPlan}
        />
      )}

      {session && profile && page === `recommendations` && (
        <TrackSelectionPage
          profile={profile}
          pastPlans={pastPlans}
          onSelectTrack={handleSelectTrack}
          onBack={() => setPage(`profile`)}
          onGoToHub={() => goToHub()}
          onLogout={handleLogout}
        />
      )}

      {session && profile && selectedTrack && page === `action-guide` && (
        <ActionGuidePage
          profile={profile}
          track={selectedTrack}
          pastPlans={pastPlans}
          initialGuide={cachedGuide}
          viewingSaved={viewingSaved}
          onGuideReady={handleGuideReady}
          onGoToHub={() => goToHub(viewingSaved ? `past-plans` : `home`)}
          onBack={viewingSaved ? handleBackFromSavedPlan : () => setPage(`recommendations`)}
          onLogout={handleLogout}
          onStartOver={() => setPage(`profile`)}
        />
      )}

      {session && page === `profile` && (
        <OnboardingPage
          session={session}
          onComplete={handleProfileComplete}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
