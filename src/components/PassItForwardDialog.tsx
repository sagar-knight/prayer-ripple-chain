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
import { Heart, Users, Share2, MessageCircle, ArrowRight, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PassItForwardDialogProps {
  open: boolean;
  onComplete: () => void;
}

const PassItForwardDialog = ({ open, onComplete }: PassItForwardDialogProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [encouragementMessage, setEncouragementMessage] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const { toast } = useToast();

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
      description: "Share a link and invite a friend to join",
    },
    {
      id: "encourage",
      icon: MessageCircle,
      title: "Write an Encouragement",
      description: "Send a short word of encouragement",
    },
  ];

  const handleComplete = () => {
    if (selectedOption === "encourage" && !encouragementMessage.trim()) {
      toast({
        title: "Please write a message",
        description: "Share a word of encouragement before continuing.",
        variant: "destructive",
      });
      return;
    }

    if (selectedOption === "invite") {
      // Simulate copying share link
      navigator.clipboard?.writeText("https://prayerforward.org/join");
      toast({
        title: "Link Copied",
        description: "Share this link with a friend to invite them.",
      });
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
            You've prayed for someone — now continue the chain! Choose one action
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
                    onClick={() => setSelectedOption(option.id)}
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

            {/* Complete button */}
            <Button
              variant="peaceful"
              className="w-full gap-2"
              disabled={!selectedOption}
              onClick={handleComplete}
            >
              Complete Prayer Forward
              <ArrowRight className="h-4 w-4" />
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
