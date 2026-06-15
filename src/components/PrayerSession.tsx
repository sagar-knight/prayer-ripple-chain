import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Home, Plus, ArrowLeft, LifeBuoy, Loader2 } from "lucide-react";
import PrayerCard from "./PrayerCard";
import PassItForwardDialog from "./PassItForwardDialog";
import { PrayerFocusMode } from "./PrayFocusSelector";
import { usePrayerService, BackendPrayer } from "@/hooks/usePrayerService";
import { usePrayerPresence } from "@/hooks/usePrayerPresence";
import { isRescueCandidate, ScoredPrayerRequest } from "@/lib/prayerScoring";

interface PrayerSessionProps {
  mode: PrayerFocusMode;
  targetCount: number;
  onComplete: () => void;
  onBack: () => void;
}

function toCardRequest(p: BackendPrayer): ScoredPrayerRequest {
  const createdAt = new Date(p.created_at);
  const lastPrayedAt = p.last_prayed_at ? new Date(p.last_prayed_at) : null;
  const ageMs = Date.now() - createdAt.getTime();
  const hours = Math.floor(ageMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const timeAgo =
    days > 0 ? `${days} day${days > 1 ? "s" : ""} ago` : `${Math.max(1, hours)} hour${hours !== 1 ? "s" : ""} ago`;

  return {
    id: p.prayer_id,
    title: p.title,
    description: p.description,
    category: p.category,
    isAnonymous: p.anonymous,
    location: p.show_country && p.country ? p.country : undefined,
    timeAgo,
    prayerCount: p.prayer_count,
    createdAt,
    lastPrayedAt,
    assignedTargetCount: p.target_prayers,
    assignedPrayedCount: p.prayer_count,
    assignmentStatus: p.prayer_count >= p.target_prayers ? "completed" : "pending",
    status: p.status === "open" ? "open" : "closed",
    country: p.country ?? undefined,
    interestCategories: [p.category],
    visibility: "public",
    requesterUserId: p.anonymous ? undefined : p.created_by || undefined,
  };
}

const PrayerSession = ({
  mode,
  targetCount,
  onComplete,
  onBack,
}: PrayerSessionProps) => {
  const [completedCount, setCompletedCount] = useState(0);
  const [effectiveTarget, setEffectiveTarget] = useState(targetCount);
  const [prayedIds, setPrayedIds] = useState<string[]>([]);
  const [showPassForward, setShowPassForward] = useState(false);
  const [pendingPrayedId, setPendingPrayedId] = useState<string | null>(null);
  const [currentRequest, setCurrentRequest] = useState<ScoredPrayerRequest | null>(null);
  const [currentBackendPrayer, setCurrentBackendPrayer] = useState<BackendPrayer | null>(null);
  const [fetchingNext, setFetchingNext] = useState(false);
  const [noMorePrayers, setNoMorePrayers] = useState(false);

  const { fetchNextPrayer, recordPrayed } = usePrayerService();
  const isRescue = mode === "rescue";

  // Register this viewer in the currently-displayed prayer's live presence
  // channel so the requester sees a real "praying with you" pulse while
  // someone is actively praying through this session.
  usePrayerPresence(currentBackendPrayer?.prayer_id);

  const loadNext = useCallback(async (excludeIds: string[]) => {
    setFetchingNext(true);
    const prayer = await fetchNextPrayer(mode, excludeIds);
    if (prayer) {
      setCurrentBackendPrayer(prayer);
      setCurrentRequest(toCardRequest(prayer));
    } else {
      setCurrentRequest(null);
      setNoMorePrayers(true);
    }
    setFetchingNext(false);
  }, [fetchNextPrayer, mode]);

  // Load first prayer on mount
  useEffect(() => {
    loadNext([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isSessionComplete = completedCount >= effectiveTarget || (noMorePrayers && !currentRequest);

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
      // Record to backend
      if (currentBackendPrayer) {
        recordPrayed(currentBackendPrayer.prayer_id, currentBackendPrayer.source_type);
      }

      const newPrayedIds = [...prayedIds, pendingPrayedId];
      setPrayedIds(newPrayedIds);
      setCompletedCount((prev) => prev + 1);
      setPendingPrayedId(null);

      // Load next prayer
      const nextCompleted = completedCount + 1;
      if (nextCompleted < effectiveTarget) {
        loadNext(newPrayedIds);
      } else {
        setCurrentRequest(null);
      }
    }
  }, [pendingPrayedId, prayedIds, completedCount, effectiveTarget, loadNext, recordPrayed, currentBackendPrayer]);

  const handlePrayOneMore = () => {
    setEffectiveTarget((prev) => prev + 1);
    setNoMorePrayers(false);
    loadNext(prayedIds);
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
          Thank you for praying
        </h2>
        <p className="text-lg text-muted-foreground">
          {isRescue ? (
            <>
              You lifted up{" "}
              <span className="font-bold text-accent-foreground">{completedCount}</span>{" "}
              {completedCount === 1 ? "person" : "people"} who needed prayer.
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
          "The prayer of a righteous person is powerful and effective." - James 5:16
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          {!noMorePrayers && (
            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={handlePrayOneMore}
            >
              <Plus className="h-4 w-4" />
              Pray for one more
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
    <div className="max-w-xl mx-auto space-y-8 animate-gentle-fade">
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
            Prayer {completedCount + 1} of {effectiveTarget}
          </span>
        </div>
      </div>

      {/* Loading state */}
      {fetchingNext && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Finding someone who needs prayer...</span>
        </div>
      )}

      {/* Rescue note */}
      {!fetchingNext && isRescue && currentIsRescueCandidate && (
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 text-center">
          <p className="text-xs text-accent-foreground font-medium">
            This person may not have had anyone pray for them yet.
          </p>
        </div>
      )}

      {/* Needs-prayer badge for rescue candidates in any mode */}
      {!fetchingNext && !isRescue && currentIsRescueCandidate && currentRequest && (
        <div className="flex justify-center">
          <Badge variant="secondary" className="gap-1 text-xs">
            <Heart className="h-3 w-3" />
            Needs prayer
          </Badge>
        </div>
      )}

      {/* Current prayer card */}
      {!fetchingNext && currentRequest && (
        <div key={currentRequest.id} className="animate-gentle-fade">
          <PrayerCard
            request={currentRequest}
            onPrayerOffered={handlePrayerOffered}
          />
        </div>
      )}

      {/* Quiet encouragement */}
      {!fetchingNext && currentRequest && (
        <p className="text-center text-xs text-muted-foreground italic">
          Take your time. There is no rush.
        </p>
      )}

      {/* Pass It Forward Dialog (lifted to session level) */}
      <PassItForwardDialog
        open={showPassForward}
        onComplete={handlePassForwardComplete}
        prayerId={currentBackendPrayer?.prayer_id}
        prayerTitle={currentBackendPrayer?.title}
      />
    </div>
  );
};

export default PrayerSession;
