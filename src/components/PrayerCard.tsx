import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Clock, User, MapPin, Send, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [encouragementMessage, setEncouragementMessage] = useState("");
  const { toast } = useToast();

  const encouragementSuggestions = [
    "You are loved and not forgotten. God sees your heart and hears your prayers. 🙏",
    "Praying for strength and peace for you during this time. God is with you. ✨", 
    "Trusting God with you for His perfect timing and provision. You're in my prayers. 💙",
    "May you feel God's presence and comfort today. Lifting you up in prayer. 🕊️",
    "Believing with you for breakthrough and blessing. God's got this! 💪"
  ];

  const handlePrayerOffered = async () => {
    setIsPraying(true);
    
    // Simulate prayer offering process
    setTimeout(() => {
      setIsPraying(false);
      setHasPrayed(true);
      onPrayerOffered?.(request.id);
      toast({
        title: "Prayer Offered 🙏",
        description: "Your prayer has been lifted up. Would you like to send encouragement?",
        duration: 4000,
      });
      setShowMessageDialog(true);
    }, 2000);
  };

  const handleSendEncouragement = () => {
    if (encouragementMessage.trim()) {
      toast({
        title: "Encouragement Sent 💙",
        description: "Your message of hope has been delivered.",
        duration: 3000,
      });
      setEncouragementMessage("");
      setShowMessageDialog(false);
    }
  };

  return (
    <Card className="group hover:shadow-peaceful transition-all duration-300 animate-gentle-fade">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-playfair text-foreground group-hover:text-primary transition-colors">
            {request.title}
          </CardTitle>
          <Badge variant="secondary" className="ml-2">
            {request.category}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-muted-foreground leading-relaxed">
          {request.description}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{request.isAnonymous ? "Anonymous" : "Community Member"}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{request.timeAgo}</span>
          </div>
          
          {request.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{request.location}</span>
            </div>
          )}
        </div>
        
        {request.churchName && (
          <div className="text-sm text-primary font-medium">
            From: {request.churchName}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Heart className="h-4 w-4 text-primary" />
            <span>{request.prayerCount} prayers offered</span>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={hasPrayed ? "secondary" : "peaceful"}
              size="sm"
              onClick={handlePrayerOffered}
              disabled={isPraying || hasPrayed}
              className="flex-1"
            >
              {isPraying ? (
                <span className="flex items-center gap-2">
                  <div className="animate-peaceful-glow">🙏</div>
                  Praying...
                </span>
              ) : hasPrayed ? (
                "Prayed 💙"
              ) : (
                "Offer Prayer"
              )}
            </Button>
            
            {hasPrayed && (
              <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-playfair">Send Encouragement</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Share a word of encouragement or Bible verse with {request.isAnonymous ? "this person" : "the prayer requester"}.
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
                        {encouragementSuggestions.slice(0, 3).map((suggestion, index) => (
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrayerCard;