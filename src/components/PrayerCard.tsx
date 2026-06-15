import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Clock, MapPin, Send, Map as MapIcon, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PassItForwardDialog from "./PassItForwardDialog";
import SharePrayerDialog from "./SharePrayerDialog";
import PrayerImpactDialog from "./PrayerImpactDialog";
import ScriptureEncouragement from "./ScriptureEncouragement";
import ReminderBellButton from "./ReminderBellButton";
import PrayerRequestCard from "./PrayerRequestCard";
import PrayerLocationsSheet from "./PrayerLocationsSheet";
import PrayerLocationPrompt from "./PrayerLocationPrompt";

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
  requesterUserId?: string;
}

interface PrayerCardProps {
  request: PrayerRequest;
  onPrayerOffered?: (id: string) => void;
  /**
   * When true, shows an emotional impact confirmation dialog immediately
   * after the user prays (Thank you + reach + Pray-another / Share CTAs).
   * Use this in browse / featured contexts. Leave off inside PrayerSession
   * to preserve the existing Pass-It-Forward flow.
   */
  showImpactDialog?: boolean;
}

const PrayerCard = ({ request, onPrayerOffered, showImpactDialog = false }: PrayerCardProps) => {
  const [isPraying, setIsPraying] = useState(false);
  const [hasPrayed, setHasPrayed] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showPassForward, setShowPassForward] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showImpact, setShowImpact] = useState(false);
  const [showLocations, setShowLocations] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [livePrayerCount, setLivePrayerCount] = useState(request.prayerCount);
  const [passForwardComplete, setPassForwardComplete] = useState(false);
  const [encouragementMessage, setEncouragementMessage] = useState("");
  const { toast } = useToast();

  const encouragementSuggestions = [
    "You are loved and not forgotten. God sees your heart and hears your prayers.",
    "Praying for strength and peace for you during this time. God is with you.",
    "Trusting God with you for His perfect timing and provision. You're in my prayers.",
  ];

  const handlePrayerOffered = async () => {
    setIsPraying(true);

    setTimeout(() => {
      setIsPraying(false);
      setHasPrayed(true);
      setLivePrayerCount((c) => c + 1);
      onPrayerOffered?.(request.id);
      toast({
        title: "Prayer offered",
        description: "Thank you for praying. Would you like to pass this forward?",
        duration: 3000,
      });
      if (showImpactDialog) {
        setShowImpact(true);
      } else if (!onPrayerOffered) {
        setShowPassForward(true);
      }
      // Optional, non-blocking: invite the user to share an approximate
      // location. Prayer is already counted regardless of outcome.
      setShowLocationPrompt(true);
    }, 2000);
  };

  const handlePassForwardComplete = () => {
    setShowPassForward(false);
    setPassForwardComplete(true);
    setShowMessageDialog(true);
  };

  const handleSendEncouragement = () => {
    if (encouragementMessage.trim()) {
      toast({
        title: "Encouragement Sent",
        description: "Your message of hope has been delivered.",
        duration: 3000,
      });
      setEncouragementMessage("");
      setShowMessageDialog(false);
    }
  };

  const subtitle = (
    <>
      <span className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {request.timeAgo}
      </span>
      {request.location && (
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {request.location}
        </span>
      )}
      <Badge variant="secondary" className="text-[10px] px-2 py-0">
        {request.category}
      </Badge>
    </>
  );

  const prayLabel =
    livePrayerCount === 0 ? "Be First" :
    livePrayerCount === 1 ? "1 Prayer" :
    `${livePrayerCount.toLocaleString()} Prayers`;

  const actions = (
    <>
      <Button
        variant={hasPrayed ? "secondary" : "peaceful"}
        size="lg"
        className="gap-2 flex-1 sm:flex-none sm:min-w-[140px]"
        onClick={handlePrayerOffered}
        disabled={isPraying || hasPrayed}
        aria-label={hasPrayed ? "Prayed" : "Pray for this request"}
      >
        <Heart className={`h-4 w-4 ${isPraying ? "animate-pulse" : ""}`} />
        <span>{isPraying ? "Praying..." : hasPrayed ? `${livePrayerCount.toLocaleString()} 🙏` : prayLabel}</span>
      </Button>

      <Button
        variant="outline"
        size="lg"
        className="gap-2 flex-1 sm:flex-none"
        onClick={() => setShowLocations(true)}
        aria-label="Prayer map"
        title="Prayer map"
      >
        <MapIcon className="h-4 w-4" />
        <span>Map</span>
      </Button>

      <Button
        variant="outline"
        size="lg"
        className="gap-2 flex-1 sm:flex-none"
        onClick={() => setShowShare(true)}
        aria-label="Share prayer"
      >
        <Share2 className="h-4 w-4" />
        <span>Share</span>
      </Button>

      <ReminderBellButton
        prayerId={request.id}
        prayerTitle={request.title}
        size="sm"
      />

      {hasPrayed && passForwardComplete && (
        <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
              <Send className="h-4 w-4" />
              Send Encouragement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-playfair">Send Encouragement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Share a word of encouragement or Bible verse with{" "}
                {request.isAnonymous ? "this person" : "the prayer requester"}.
              </p>
              <Textarea
                placeholder="Write your encouraging message..."
                value={encouragementMessage}
                onChange={(e) => setEncouragementMessage(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Quick suggestions:</p>
                <div className="grid gap-2">
                  {encouragementSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setEncouragementMessage(suggestion)}
                      className="text-xs text-left p-2 rounded border hover:bg-accent transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSendEncouragement} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
                  Skip
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );

  return (
    <>
      <PrayerRequestCard
        header={request.churchName ? `From ${request.churchName}` : "Someone asked for prayer"}
        description={request.description}
        title={request.title}
        subtitle={subtitle}
        prayerCount={livePrayerCount}
        actions={actions}
        reportEntityId={request.id}
        reportEntityType={request.churchName ? "church_prayer" : "global_prayer"}
        requesterUserId={
          !request.isAnonymous && request.requesterUserId ? request.requesterUserId : undefined
        }
        translatable={{
          prayerId: request.id,
          sourceType: request.churchName ? "church" : "global",
        }}
      >
        {/* Scripture for prayer partners */}
        <ScriptureEncouragement category={request.category} mode="collapsible" maxVerses={2} />
      </PrayerRequestCard>

      {/* Pass It Forward Dialog */}
      <PassItForwardDialog
        open={showPassForward}
        onComplete={handlePassForwardComplete}
      />

      <SharePrayerDialog
        open={showShare}
        onOpenChange={setShowShare}
        prayerId={request.id}
        prayerTitle={request.title}
      />

      <PrayerImpactDialog
        open={showImpact}
        onOpenChange={setShowImpact}
        prayerId={request.id}
        prayerCount={livePrayerCount}
        onPrayAnother={() => {
          setShowImpact(false);
          // Scroll to top so the next card in the browse list is visible.
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onShare={() => {
          setShowImpact(false);
          setShowShare(true);
        }}
      />

      <PrayerLocationsSheet
        open={showLocations}
        onOpenChange={setShowLocations}
        prayerRequestId={request.id}
        sourceType={request.churchName ? "church" : "global"}
        prayerCount={livePrayerCount}
      />

      <PrayerLocationPrompt
        open={showLocationPrompt}
        onOpenChange={setShowLocationPrompt}
        prayerRequestId={request.id}
        sourceType={request.churchName ? "church" : "global"}
      />
    </>
  );
};

export default PrayerCard;
