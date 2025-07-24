import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Clock, User, MapPin } from "lucide-react";
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
  const { toast } = useToast();

  const handlePrayerOffered = async () => {
    setIsPraying(true);
    
    // Simulate prayer offering process
    setTimeout(() => {
      setIsPraying(false);
      setHasPrayed(true);
      onPrayerOffered?.(request.id);
      toast({
        title: "Prayer Offered 🙏",
        description: "Your prayer has been lifted up. May God bless this request.",
        duration: 4000,
      });
    }, 2000);
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
          
          <Button
            variant={hasPrayed ? "secondary" : "peaceful"}
            size="sm"
            onClick={handlePrayerOffered}
            disabled={isPraying || hasPrayed}
            className="min-w-[100px]"
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
        </div>
      </CardContent>
    </Card>
  );
};

export default PrayerCard;