import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Home from "./Home";
import HomeDashboard from "./HomeDashboard";
import OnboardingGuide from "@/components/OnboardingGuide";
import { useOnboardingStatus } from "@/components/OnboardingGuide";

const HomeRouter = () => {
  const { user, loading } = useAuth();
  const { completed, setCompleted } = useOnboardingStatus();
  const [showOnboarding, setShowOnboarding] = useState(!completed);
  const navigate = useNavigate();

  // Handle OAuth returnTo redirect
  useEffect(() => {
    if (user && !loading) {
      const returnTo = sessionStorage.getItem("returnTo");
      if (returnTo && returnTo !== "/") {
        sessionStorage.removeItem("returnTo");
        navigate(returnTo, { replace: true });
      }
    }
  }, [user, loading, navigate]);

  if (loading) return null;

  if (!user) return <Home />;

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
