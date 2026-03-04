import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Home from "./Home";
import HomeDashboard from "./HomeDashboard";
import OnboardingGuide from "@/components/OnboardingGuide";
import { useOnboardingStatus } from "@/components/OnboardingGuide";

const HomeRouter = () => {
  const { user, loading } = useAuth();
  const { completed, setCompleted } = useOnboardingStatus();
  const [showOnboarding, setShowOnboarding] = useState(!completed);

  if (loading) return null;

  // Not logged in → landing page
  if (!user) return <Home />;

  // Logged in → dashboard + optional onboarding
  return (
    <>
      {showOnboarding && !completed && (
        <OnboardingGuide
          onComplete={() => {
            setCompleted(true);
            setShowOnboarding(false);
          }}
        />
      )}
      <HomeDashboard />
    </>
  );
};

export default HomeRouter;
