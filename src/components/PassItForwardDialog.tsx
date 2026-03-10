import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Heart, Users, Share2, MessageCircle, ArrowRight, CheckCircle, Copy, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PassItForwardDialogProps {
  open: boolean;
  onComplete: () => void;
  prayerId?: string;
  prayerTitle?: string;
}

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const PassItForwardDialog = ({ open, onComplete, prayerId, prayerTitle }: PassItForwardDialogProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [encouragementMessage, setEncouragementMessage] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const options = [
    {
      id: "pray-another",
      icon: Heart,
      title: "Pray for Another Request",
      description: "Continue the chain by praying for someone else",
    },
    {
      id: "invite",
      icon: Share2,
      title: "Invite Someone to Pray",
      description: "Share a personal invitation link with a friend",
    },
    {
      id: "encourage",
      icon: MessageCircle,
      title: "Write an Encouragement",
      description: "Send a short word of encouragement",
    },
  ];

  const generateInviteLink = async () => {
    if (!prayerId) return;
    setIsGenerating(true);

    try {
      const code = generateInviteCode();
      const { error } = await supabase.from("prayer_invites" as any).insert({
        prayer_id: prayerId,
        inviter_user_id: user?.id ?? "anonymous",
        invite_code: code,
        message: inviteMessage.trim() || null,
      });

      if (error) {
        console.error("Failed to create invite:", error);
        // Fallback to simple link
        const baseUrl = window.location.origin;
        setInviteLink(`${baseUrl}/invite/${code}`);
      } else {
        const baseUrl = window.location.origin;
        setInviteLink(`${baseUrl}/invite/${code}`);
      }
    } catch (e) {
      console.error("Invite generation error:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyInviteText = () => {
    const shareText = `I just prayed for someone through PrayerForward. Would you join me in praying for this person?\n\n${inviteLink}`;
    navigator.clipboard?.writeText(shareText);
    toast({
      title: "Invitation copied",
      description: "Share this link with a friend to invite them to pray.",
    });
  };

  const copyLinkOnly = () => {
    if (inviteLink) {
      navigator.clipboard?.writeText(inviteLink);
      toast({
        title: "Link copied",
        description: "The invite link has been copied to your clipboard.",
      });
    }
  };

  const handleComplete = () => {
    if (selectedOption === "encourage" && !encouragementMessage.trim()) {
      toast({
        title: "Please write a message",
        description: "Share a word of encouragement before continuing.",
        variant: "destructive",
      });
      return;
    }

    if (selectedOption === "invite" && !inviteLink) {
      // Generate link first
      generateInviteLink();
      return;
    }

    if (selectedOption === "invite" && inviteLink) {
      copyInviteText();
    }

    setIsCompleted(true);

    setTimeout(() => {
      toast({
        title: "Prayer Forwarded",
        description: "You've continued the chain of blessings. Thank you!",
      });
      onComplete();
      // Reset state
      setSelectedOption(null);
      setEncouragementMessage("");
      setInviteMessage("");
      setInviteLink(null);
      setIsCompleted(false);
    }, 1500);
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-playfair text-xl flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Pass the Prayer Forward
          </DialogTitle>
          <DialogDescription>
            You've prayed for someone. Now continue the chain! Choose one action
            to complete your Prayer Forward.
          </DialogDescription>
        </DialogHeader>

        {isCompleted ? (
          <div className="text-center py-8 space-y-4 animate-gentle-fade">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-playfair text-xl font-semibold">
              Blessing Forwarded
            </h3>
            <p className="text-muted-foreground">
              The ripple continues. Thank you for making a difference.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Options */}
            <div className="space-y-3">
              {options.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedOption === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSelectedOption(option.id);
                      setInviteLink(null); // Reset invite link when switching
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-peaceful"
                        : "border-border hover:border-primary/40 hover:bg-muted/50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isSelected ? "bg-primary/20" : "bg-muted"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          isSelected ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{option.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle className="h-5 w-5 text-primary ml-auto flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Encouragement textarea */}
            {selectedOption === "encourage" && (
              <div className="animate-gentle-fade">
                <Textarea
                  placeholder="Write a short word of encouragement, a Bible verse, or a blessing..."
                  value={encouragementMessage}
                  onChange={(e) => setEncouragementMessage(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            )}

            {/* Invite flow */}
            {selectedOption === "invite" && (
              <div className="animate-gentle-fade space-y-3">
                {!inviteLink ? (
                  <>
                    <Textarea
                      placeholder="Add a personal message (optional)..."
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      className="min-h-[60px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      A personal invite link will be generated for you to share.
                    </p>
                  </>
                ) : (
                  <div className="space-y-3">
                    {/* Generated invite preview */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <p className="text-sm text-foreground leading-relaxed">
                        I just prayed for someone through PrayerForward. Would you join me in praying for this person?
                      </p>
                      <div className="flex items-center gap-2 bg-background rounded-md border p-2">
                        <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-muted-foreground truncate flex-1">
                          {inviteLink}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 flex-shrink-0"
                          onClick={copyLinkOnly}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={copyInviteText}
                    >
                      <Copy className="h-4 w-4" />
                      Copy full invitation message
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Complete button */}
            <Button
              variant="peaceful"
              className="w-full gap-2"
              disabled={!selectedOption || isGenerating}
              onClick={handleComplete}
            >
              {isGenerating ? (
                "Generating invite..."
              ) : selectedOption === "invite" && !inviteLink ? (
                <>
                  Generate Invite Link
                  <LinkIcon className="h-4 w-4" />
                </>
              ) : selectedOption === "invite" && inviteLink ? (
                <>
                  Complete Prayer Forward
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Complete Prayer Forward
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground italic">
              "Each of you should use whatever gift you have received to serve
              others" — 1 Peter 4:10
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PassItForwardDialog;
