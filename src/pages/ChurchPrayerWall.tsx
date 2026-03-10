import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Church, ArrowLeft } from "lucide-react";
import { useChurch, useChurchPrayerRequests, useChurchMembership } from "@/hooks/useChurch";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import PrayerRequestCard from "@/components/PrayerRequestCard";

const ChurchPrayerWall = () => {
  const { churchId } = useParams<{ churchId: string }>();
  const { user } = useAuth();
  const { data: church } = useChurch(churchId || "");
  const { data: membership } = useChurchMembership(churchId || "");
  const { data: requests, isLoading } = useChurchPrayerRequests(churchId || "", "approved");

  const isMember = !!membership;

  if (!church) {
    return (
      <div className="min-h-screen bg-gradient-peaceful py-12 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Check access for members-only walls
  if (church.privacy === "members_only" && !isMember) {
    return (
      <div className="min-h-screen bg-gradient-peaceful py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Church className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-playfair text-xl font-bold mb-2">Members Only</h2>
          <p className="text-muted-foreground mb-4">This prayer wall is only visible to church members.</p>
          <Button asChild><Link to={`/churches/${churchId}`}>View Church Page</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link to={`/churches/${churchId}`}><ArrowLeft className="h-4 w-4 mr-1" />Back to Church</Link>
          </Button>
        </div>

        <div className="text-center mb-10">
          <Heart className="h-10 w-10 text-primary mx-auto mb-3 opacity-70" />
          <h1 className="font-playfair text-2xl font-bold text-foreground mb-1">{church.name} – Prayer Wall</h1>
          <p className="text-muted-foreground text-sm">A quiet place to lift one another in prayer</p>
        </div>

        {isMember && (
          <div className="text-center mb-8">
            <Button asChild size="sm" variant="peaceful">
              <Link to={`/churches/${churchId}/submit`}>Share a Prayer Request</Link>
            </Button>
          </div>
        )}

        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading prayer requests...</p>
        ) : !requests?.length ? (
          <Card className="text-center py-12 rounded-xl border-primary/10">
            <CardContent>
              <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No prayer requests yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {requests.map((req) => (
              <PrayerRequestCard
                key={req.id}
                header="Someone asked for prayer"
                description={req.description}
                subtitle={
                  <span className="text-xs text-muted-foreground">
                    {req.anonymous ? "Anonymous" : "A church member"} · {format(new Date(req.created_at), "MMM d, yyyy")}
                  </span>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChurchPrayerWall;
