import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Church, MapPin, Users, Heart, Shield, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useChurchBySlug } from "@/hooks/useChurchBySlug";
import { useChurchMembership, useJoinChurch } from "@/hooks/useChurch";
import { supabase } from "@/integrations/supabase/client";

const PENDING_JOIN_KEY = "pf_pending_church_join";

/** Save pending join info so we can auto-join after auth */
export function setPendingChurchJoin(churchId: string, slug: string) {
  localStorage.setItem(PENDING_JOIN_KEY, JSON.stringify({ churchId, slug }));
}

export function getPendingChurchJoin(): { churchId: string; slug: string } | null {
  try {
    const raw = localStorage.getItem(PENDING_JOIN_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearPendingChurchJoin() {
  localStorage.removeItem(PENDING_JOIN_KEY);
}

const ChurchJoin = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: church, isLoading, error } = useChurchBySlug(slug || "");
  const { data: membership, isLoading: membershipLoading } = useChurchMembership(church?.id || "");
  const joinChurch = useJoinChurch();

  // Log join link opened event
  useEffect(() => {
    if (church) {
      supabase.from("app_events").insert({
        event_type: "church_join_link_opened",
        entity_type: "church",
        entity_id: church.id,
        actor_user_id: user?.id || null,
      }).then(() => {});
    }
  }, [church?.id]);

  const handleJoin = async () => {
    if (!church) return;

    if (!user) {
      // Save pending join and redirect to signup
      setPendingChurchJoin(church.id, slug || "");
      navigate(`/signup?returnTo=/join/${slug}`);
      return;
    }

    // Already a member
    if (membership) {
      navigate(`/churches/${church.id}/wall`);
      return;
    }

    // Join directly
    await joinChurch.mutateAsync(church.id);

    // Log event
    await supabase.from("app_events").insert({
      event_type: "church_join_completed",
      entity_type: "church",
      entity_id: church.id,
      actor_user_id: user.id,
    });

    navigate(`/churches/${church.id}/wall`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading church...</p>
        </div>
      </div>
    );
  }

  if (!church || error) {
    return (
      <div className="min-h-screen bg-gradient-peaceful py-12">
        <div className="max-w-lg mx-auto px-4 text-center">
          <Church className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-playfair text-2xl font-bold text-foreground mb-2">Church not found</h1>
          <p className="text-muted-foreground mb-6">This join link may be invalid or the church is no longer active.</p>
          <Button asChild variant="outline">
            <Link to="/churches">Browse Churches</Link>
          </Button>
        </div>
      </div>
    );
  }

  const location = [church.city, church.state, church.country].filter(Boolean).join(", ");
  const isMember = !!membership;

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
      <div className="max-w-lg mx-auto px-4">
        {/* Church intro */}
        <div className="text-center mb-8">
          {church.logo_url ? (
            <img src={church.logo_url} alt={church.name} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-primary/20" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Church className="h-10 w-10 text-primary" />
            </div>
          )}
          <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {church.name}
          </h1>
          <p className="text-lg text-muted-foreground mb-3">Prayer Community</p>
          {location && (
            <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mb-3">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
          )}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {church.denomination && <Badge variant="secondary">{church.denomination}</Badge>}
            {church.verified && (
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <Shield className="h-3 w-3 mr-1" />Verified
              </Badge>
            )}
          </div>
        </div>

        {/* Welcome card */}
        <Card className="mb-6">
          <CardContent className="pt-6 text-center space-y-4">
            <Heart className="h-8 w-8 text-primary mx-auto" />
            <h2 className="font-playfair text-xl font-semibold text-foreground">
              Join your church in prayer
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Pray together, support one another, and grow in faith as a community. 
              Submit prayer requests, pray for others, and see God move.
            </p>
          </CardContent>
        </Card>

        {/* Action */}
        <div className="space-y-3">
          {isMember ? (
            <>
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-4 pb-4 flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">You are already a member of this church.</p>
                    <p className="text-xs text-muted-foreground">Role: {membership?.role}</p>
                  </div>
                </CardContent>
              </Card>
              <Button onClick={() => navigate(`/churches/${church.id}/wall`)} className="w-full" size="lg">
                <Heart className="h-4 w-4 mr-2" />Go to Prayer Wall
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleJoin}
                disabled={joinChurch.isPending || membershipLoading}
                className="w-full"
                size="lg"
              >
                <Users className="h-4 w-4 mr-2" />
                {joinChurch.isPending ? "Joining..." : "Join Church Prayer"}
              </Button>
              {!user && (
                <p className="text-center text-xs text-muted-foreground">
                  You'll be asked to sign up or log in first.
                </p>
              )}
            </>
          )}

          <Button
            asChild
            variant="ghost"
            className="w-full"
            size="sm"
          >
            <Link to={`/churches/${church.id}`}>View church details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChurchJoin;
