import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Users,
  CheckCircle,
  MessageCircle,
  PartyPopper,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const PrayerStatusTracker = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's global prayer requests with coverage data
  const { data: myRequests, isLoading } = useQuery({
    queryKey: ["my_prayer_requests", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: requests, error } = await supabase
        .from("global_prayer_requests")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (error || !requests) return [];

      // Fetch coverage for each request
      const prayerIds = requests.map((r) => r.id);
      const { data: coverageData } = await supabase
        .from("prayer_coverage")
        .select("*")
        .in("prayer_id", prayerIds);

      const coverageMap = new Map(
        (coverageData || []).map((c) => [c.prayer_id, c])
      );

      return requests.map((r) => {
        const coverage = coverageMap.get(r.id);
        return {
          id: r.id,
          title: r.title,
          category: r.category,
          prayerCount: coverage?.current_prayers ?? r.prayer_count,
          uniquePeople: coverage?.unique_people_prayed ?? 0,
          passedForward: coverage?.passed_forward_count ?? 0,
          targetPrayers: coverage?.target_prayers ?? 3,
          status: r.status as "open" | "answered",
          createdAt: r.created_at,
        };
      });
    },
    enabled: !!user,
  });

  const markAnswered = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from("global_prayer_requests")
        .update({ status: "answered", answered_at: new Date().toISOString() })
        .eq("id", requestId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my_prayer_requests"] });
      toast({
        title: "Prayer Answered",
        description: "Praise God! Your testimony encourages others.",
      });
    },
  });

  // Reassurance helper: format prayer activity message
  const getPrayerMessage = (count: number, uniquePeople: number) => {
    if (count === 0) {
      return "Your request has been shared. People are being invited to pray.";
    }
    if (count === 1) {
      return "Someone has prayed for you.";
    }
    if (uniquePeople > 1) {
      return `${uniquePeople} people have been praying for your request.`;
    }
    return "People have been praying for your request.";
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">
          Sign in to see your prayer requests.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading your requests...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-playfair text-2xl font-bold text-foreground mb-2">
          Your Prayer Requests
        </h2>
        <p className="text-muted-foreground">
          See how your prayers are being carried by the community.
        </p>
      </div>

      {!myRequests?.length ? (
        <Card className="text-center py-8">
          <CardContent>
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              No prayer requests shared yet. You can share one above.
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
                      {new Date(request.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
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
              {/* Reassurance-first display */}
              <div className="bg-gradient-warm rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-accent-foreground" />
                </div>
                <p className="text-sm text-accent-foreground/80">
                  {getPrayerMessage(request.prayerCount, request.uniquePeople)}
                </p>
              </div>

              {/* Prayer activity summary (no progress bars) */}
              {request.prayerCount > 0 && (
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-primary/60" />
                    {request.uniquePeople} {request.uniquePeople === 1 ? "person" : "people"} prayed
                  </span>
                  {request.passedForward > 0 && (
                    <span className="flex items-center gap-1">
                      Passed forward {request.passedForward} {request.passedForward === 1 ? "time" : "times"}
                    </span>
                  )}
                </div>
              )}

              {/* Encouraging Message */}
              <div className="bg-primary/5 rounded-lg p-3 text-center">
                <p className="text-sm text-primary font-medium italic">
                  {request.status === "answered"
                    ? "God answered your prayer. Share your testimony to encourage others."
                    : "You are not alone. People are praying for you."}
                </p>
              </div>

              {/* Action Buttons */}
              {request.status === "open" && (
                <div className="flex gap-2">
                  <Button
                    variant="peaceful"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => markAnswered.mutate(request.id)}
                    disabled={markAnswered.isPending}
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
                <Button variant="warm" size="sm" className="w-full gap-2">
                  <Heart className="h-4 w-4" />
                  Share Testimony
                </Button>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default PrayerStatusTracker;
