import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Heart,
  Users,
  CheckCircle,
  TrendingUp,
  MessageCircle,
  PartyPopper,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MyPrayerRequest {
  id: string;
  title: string;
  category: string;
  prayerCount: number;
  chainProgress: number;
  status: "active" | "answered";
  submittedDate: string;
}

const PrayerStatusTracker = () => {
  const { toast } = useToast();

  const [myRequests, setMyRequests] = useState<MyPrayerRequest[]>([
    {
      id: "1",
      title: "Healing for my grandmother",
      category: "Health",
      prayerCount: 23,
      chainProgress: 12,
      status: "active",
      submittedDate: "Feb 3, 2026",
    },
    {
      id: "2",
      title: "Guidance for career change",
      category: "Work",
      prayerCount: 15,
      chainProgress: 8,
      status: "active",
      submittedDate: "Feb 5, 2026",
    },
  ]);

  // Simulate live count updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMyRequests((prev) =>
        prev.map((r) =>
          r.status === "active" && Math.random() > 0.7
            ? { ...r, prayerCount: r.prayerCount + 1, chainProgress: r.chainProgress + 1 }
            : r
        )
      );
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAnswered = (requestId: string) => {
    setMyRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, status: "answered" as const } : r
      )
    );
    toast({
      title: "Prayer Answered! 🎉",
      description:
        "Praise God! Your testimony encourages others. Consider sharing it.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-playfair text-2xl font-bold text-foreground mb-2">
          Your Prayer Status
        </h2>
        <p className="text-muted-foreground">
          See how many people are praying for you
        </p>
      </div>

      {myRequests.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              No prayer requests submitted yet. Share your needs above.
            </p>
          </CardContent>
        </Card>
      ) : (
        myRequests.map((request, index) => (
          <Card
            key={request.id}
            className={`animate-gentle-fade hover:shadow-peaceful transition-all ${
              request.status === "answered"
                ? "bg-primary/5 border-primary/20"
                : ""
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="font-playfair text-lg">
                    {request.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{request.category}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {request.submittedDate}
                    </span>
                  </div>
                </div>
                {request.status === "answered" && (
                  <Badge className="bg-primary text-primary-foreground gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Answered
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Live Prayer Count */}
              <div className="bg-gradient-warm rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-accent-foreground" />
                  <span className="text-3xl font-bold text-accent-foreground">
                    {request.prayerCount}
                  </span>
                </div>
                <p className="text-sm text-accent-foreground/80">
                  people praying for you
                </p>
              </div>

              {/* Prayer Chain Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    Prayer chain progress
                  </span>
                  <span className="font-medium text-primary">
                    {request.chainProgress} people in chain
                  </span>
                </div>
                <Progress
                  value={Math.min(request.chainProgress * 5, 100)}
                  className="h-2"
                />
              </div>

              {/* Encouraging Message */}
              <div className="bg-primary/5 rounded-lg p-3 text-center">
                <p className="text-sm text-primary font-medium italic">
                  {request.status === "answered"
                     ? "God answered your prayer! Share your testimony to encourage others."
                     : "You are not alone. People are praying for you."}
                </p>
              </div>

              {/* Action Buttons */}
              {request.status === "active" && (
                <div className="flex gap-2">
                  <Button
                    variant="peaceful"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => handleMarkAnswered(request.id)}
                  >
                    <PartyPopper className="h-4 w-4" />
                    Mark as Answered
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Share Update
                  </Button>
                </div>
              )}

              {request.status === "answered" && (
                <div className="space-y-2">
                  <Button variant="warm" size="sm" className="w-full gap-2">
                    <Heart className="h-4 w-4" />
                    Share Testimony & Thank Prayer Partners
                  </Button>
                  <Button asChild variant="outline" size="sm" className="w-full gap-2">
                    <a href="/support">
                      Support the Mission
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default PrayerStatusTracker;
