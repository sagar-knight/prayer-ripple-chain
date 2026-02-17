import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Heart, Home, Plus, ArrowLeft } from "lucide-react";
import PrayerCard from "./PrayerCard";
import PassItForwardDialog from "./PassItForwardDialog";
import { PrayerFocusMode } from "./PrayFocusSelector";

interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  isAnonymous: boolean;
  location?: string;
  timeAgo: string;
  churchName?: string;
  prayerCount: number;
}

interface PrayerSessionProps {
  mode: PrayerFocusMode;
  targetCount: number;
  requests: PrayerRequest[];
  onComplete: () => void;
  onBack: () => void;
}

const PrayerSession = ({
  mode,
  targetCount,
  requests,
  onComplete,
  onBack,
}: PrayerSessionProps) => {
  const [completedCount, setCompletedCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [effectiveTarget, setEffectiveTarget] = useState(targetCount);
  const [prayedIds, setPrayedIds] = useState<Set<string>>(new Set());
  const [showPassForward, setShowPassForward] = useState(false);
  const [pendingPrayedId, setPendingPrayedId] = useState<string | null>(null);

  // Smart distribution: sort by priority based on mode
  const sortedRequests = useMemo(() => {
    const copy = [...requests];
    switch (mode) {
      case "needs_most":
        return copy.sort((a, b) => a.prayerCount - b.prayerCount);
      case "recent":
        return copy; // already sorted by recency in mock data
      case "surprise":
        return copy.sort(() => Math.random() - 0.5);
      case "my_country":
        // In a real app, filter by user's country; for now show all with location first
        return copy.sort((a, b) => (b.location ? 1 : 0) - (a.location ? 1 : 0));
      case "interests":
        return copy; // would match categories to user interests
      default:
        return copy;
    }
  }, [requests, mode]);

  // Filter out already prayed
  const availableRequests = sortedRequests.filter(
    (r) => !prayedIds.has(r.id)
  );

  const isSessionComplete = completedCount >= effectiveTarget || availableRequests.length === 0;
  const currentRequest = availableRequests[0];
  const progressPercent = effectiveTarget > 0 ? (completedCount / effectiveTarget) * 100 : 0;

  const handlePrayerOffered = useCallback(
    (requestId: string) => {
      setPendingPrayedId(requestId);
      setShowPassForward(true);
    },
    []
  );

  const handlePassForwardComplete = useCallback(() => {
    setShowPassForward(false);
    if (pendingPrayedId) {
      setPrayedIds((prev) => new Set(prev).add(pendingPrayedId));
      setCompletedCount((prev) => prev + 1);
      setCurrentIndex((prev) => prev + 1);
      setPendingPrayedId(null);
    }
  }, [pendingPrayedId]);

  const handlePrayOneMore = () => {
    setEffectiveTarget((prev) => prev + 1);
  };

  if (isSessionComplete) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 animate-gentle-fade py-8">
        <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          <Heart className="h-10 w-10 text-primary" />
        </div>
        <h2 className="font-playfair text-2xl md:text-3xl font-bold text-foreground">
          Thank you 🙏
        </h2>
        <p className="text-lg text-muted-foreground">
          You prayed for{" "}
          <span className="font-bold text-primary">{completedCount}</span>{" "}
          {completedCount === 1 ? "person" : "people"} today.
        </p>
        <p className="text-sm text-muted-foreground italic">
          "The prayer of a righteous person is powerful and effective." — James 5:16
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          {availableRequests.length > 0 && (
            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={handlePrayOneMore}
            >
              <Plus className="h-4 w-4" />
              Pray 1 more
            </Button>
          )}
          <Button
            variant="peaceful"
            size="lg"
            className="gap-2"
            onClick={onComplete}
          >
            <Home className="h-4 w-4" />
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-gentle-fade">
      {/* Session header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="gap-1" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="text-sm text-muted-foreground">
          {completedCount} of {effectiveTarget} prayers
        </div>
      </div>

      {/* Progress bar */}
      <Progress value={progressPercent} className="h-2" />

      {/* Current prayer card */}
      {currentRequest && (
        <div key={currentRequest.id} className="animate-gentle-fade">
          <PrayerCard
            request={currentRequest}
            onPrayerOffered={handlePrayerOffered}
          />
        </div>
      )}

      {/* Quiet encouragement */}
      <p className="text-center text-xs text-muted-foreground italic">
        Take your time. There is no rush.
      </p>
      {/* Pass It Forward Dialog (lifted to session level) */}
      <PassItForwardDialog
        open={showPassForward}
        onComplete={handlePassForwardComplete}
      />
    </div>
  );
};

export default PrayerSession;
