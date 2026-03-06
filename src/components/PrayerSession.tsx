import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Home, Plus, ArrowLeft, LifeBuoy } from "lucide-react";
import PrayerCard from "./PrayerCard";
import PassItForwardDialog from "./PassItForwardDialog";
import { PrayerFocusMode } from "./PrayFocusSelector";
import {
  ScoredPrayerRequest,
  UserPrayerHistoryEntry,
  selectNextPrayers,
  isRescueCandidate,
} from "@/lib/prayerScoring";

interface PrayerSessionProps {
  mode: PrayerFocusMode;
  targetCount: number;
  requests: ScoredPrayerRequest[];
  userHistory?: UserPrayerHistoryEntry[];
  userCountry?: string;
  userInterests?: string[];
  onComplete: () => void;
  onBack: () => void;
}

const PrayerSession = ({
  mode,
  targetCount,
  requests,
  userHistory = [],
  userCountry,
  userInterests,
  onComplete,
  onBack,
}: PrayerSessionProps) => {
  const [completedCount, setCompletedCount] = useState(0);
  const [effectiveTarget, setEffectiveTarget] = useState(targetCount);
  const [prayedIds, setPrayedIds] = useState<Set<string>>(new Set());
  const [showPassForward, setShowPassForward] = useState(false);
  const [pendingPrayedId, setPendingPrayedId] = useState<string | null>(null);

  const isRescue = mode === "rescue";

  // Build live history combining persisted + session-local
  const liveHistory = useMemo(() => {
    const sessionEntries: UserPrayerHistoryEntry[] = Array.from(prayedIds).map((id) => ({
      prayerId: id,
      prayedAt: new Date(),
      modeUsed: mode,
    }));
    return [...userHistory, ...sessionEntries];
  }, [userHistory, prayedIds, mode]);

  // Use scoring system to get ordered eligible prayers
  const orderedRequests = useMemo(() => {
    return selectNextPrayers(requests, liveHistory, mode, requests.length, {
      userCountry,
      userInterests,
    });
  }, [requests, liveHistory, mode, userCountry, userInterests]);

  const isSessionComplete = completedCount >= effectiveTarget || orderedRequests.length === 0;
  const currentRequest = orderedRequests[0];
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
      setPendingPrayedId(null);
    }
  }, [pendingPrayedId]);

  const handlePrayOneMore = () => {
    setEffectiveTarget((prev) => prev + 1);
  };

  // Completion screen
  if (isSessionComplete) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 animate-gentle-fade py-8">
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
          isRescue ? "bg-accent/20" : "bg-primary/10"
        }`}>
          {isRescue ? (
            <LifeBuoy className="h-10 w-10 text-accent-foreground" />
          ) : (
            <Heart className="h-10 w-10 text-primary" />
          )}
        </div>
        <h2 className="font-playfair text-2xl md:text-3xl font-bold text-foreground">
          Thank you 🙏
        </h2>
        <p className="text-lg text-muted-foreground">
          {isRescue ? (
            <>
              You rescued{" "}
              <span className="font-bold text-accent-foreground">{completedCount}</span>{" "}
              {completedCount === 1 ? "prayer" : "prayers"} today.
            </>
          ) : (
            <>
              You prayed for{" "}
              <span className="font-bold text-primary">{completedCount}</span>{" "}
              {completedCount === 1 ? "person" : "people"} today.
            </>
          )}
        </p>
        <p className="text-sm text-muted-foreground italic">
          "The prayer of a righteous person is powerful and effective." — James 5:16
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          {orderedRequests.length > 0 && (
            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={handlePrayOneMore}
            >
              <Plus className="h-4 w-4" />
              {isRescue ? "Rescue 1 more" : "Pray 1 more"}
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

  const currentIsRescueCandidate = currentRequest ? isRescueCandidate(currentRequest) : false;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-gentle-fade">
      {/* Session header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="gap-1" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          {isRescue && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <LifeBuoy className="h-3 w-3" />
              Rescue
            </Badge>
          )}
          <span className="text-sm text-muted-foreground">
            {completedCount} of {effectiveTarget} prayers
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <Progress value={progressPercent} className="h-2" />

      {/* Rescue note */}
      {isRescue && currentIsRescueCandidate && (
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 text-center">
          <p className="text-xs text-accent-foreground font-medium">
            🙏 This request has been prayed for very few times or not recently.
          </p>
        </div>
      )}

      {/* Needs-prayer badge for rescue candidates in any mode */}
      {!isRescue && currentIsRescueCandidate && currentRequest && (
        <div className="flex justify-center">
          <Badge variant="secondary" className="gap-1 text-xs">
            <Heart className="h-3 w-3" />
            Needs prayer
          </Badge>
        </div>
      )}

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
