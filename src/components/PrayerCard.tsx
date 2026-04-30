import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Clock, MapPin, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PassItForwardDialog from "./PassItForwardDialog";
import ScriptureEncouragement from "./ScriptureEncouragement";
import PrayerReminderToggle from "./PrayerReminderToggle";
import PrayerRequestCard from "./PrayerRequestCard";
import { usePrayerReminders } from "@/hooks/usePrayerReminders";

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

interface PrayerCardProps {
  request: PrayerRequest;
  onPrayerOffered?: (id: string) => void;
}

const PrayerCard = ({ request, onPrayerOffered }: PrayerCardProps) => {
  const [isPraying, setIsPraying] = useState(false);
  const [hasPrayed, setHasPrayed] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showPassForward, setShowPassForward] = useState(false);
  const [passForwardComplete, setPassForwardComplete] = useState(false);
  const [encouragementMessage, setEncouragementMessage] = useState("");
  const { toast } = useToast();
  const { getReminderForPrayer, toggleReminder, updateReminderTime } = usePrayerReminders();

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
      onPrayerOffered?.(request.id);
      toast({
        title: "Prayer offered",
        description: "Thank you for praying. Would you like to pass this forward?",
        duration: 3000,
      });
      if (!onPrayerOffered) {
        setShowPassForward(true);
      }
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

  const reminder = getReminderForPrayer(request.id);

  const actions = (
    <>
      <Button
        variant={hasPrayed ? "secondary" : "peaceful"}
        size="lg"
        className="gap-2 w-full sm:w-auto min-w-[160px]"
        onClick={handlePrayerOffered}
        disabled={isPraying || hasPrayed}
      >
        {isPraying ? (
          <span className="flex items-center gap-2">
            <Heart className="h-4 w-4 animate-pulse" />
            Praying...
          </span>
        ) : hasPrayed ? (
          "🙏 Prayed"
        ) : (
          "🙏 I Prayed"
        )}
      </Button>

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
        prayerCount={request.prayerCount}
        actions={actions}
        reportEntityId={request.id}
        reportEntityType={request.churchName ? "church_prayer" : "global_prayer"}
        translatable={{
          prayerId: request.id,
          sourceType: request.churchName ? "church" : "global",
        }}
      >
        {/* Scripture for prayer partners */}
        <ScriptureEncouragement category={request.category} mode="collapsible" maxVerses={2} />

        {/* Optional Daily Reminder */}
        <PrayerReminderToggle
          prayerId={request.id}
          prayerTitle={request.title}
          enabled={reminder?.enabled ?? false}
          reminderTime={reminder?.reminder_time_local ?? "08:00"}
          onToggle={toggleReminder}
          onTimeChange={reminder ? (time) => updateReminderTime(reminder.id, time) : undefined}
        />
      </PrayerRequestCard>

      {/* Pass It Forward Dialog */}
      <PassItForwardDialog
        open={showPassForward}
        onComplete={handlePassForwardComplete}
      />
    </>
  );
};

export default PrayerCard;
