import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, ArrowRight, BookOpen, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface InviteData {
  id: string;
  prayer_id: string;
  inviter_user_id: string;
  invite_code: string;
  message: string | null;
}

interface PrayerData {
  id: string;
  title: string;
  description: string;
  category: string;
  anonymous: boolean;
  prayer_count: number;
}

const InviteLanding = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [prayer, setPrayer] = useState<PrayerData | null>(null);
  const [inviterName, setInviterName] = useState<string>("Someone");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadInvite = async () => {
      if (!inviteCode) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Fetch invite
      const { data: inviteData, error: inviteError } = await supabase
        .from("prayer_invites" as any)
        .select("*")
        .eq("invite_code", inviteCode)
        .maybeSingle();

      if (inviteError || !inviteData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const inv = inviteData as any as InviteData;
      setInvite(inv);

      // Track click
      await supabase
        .from("prayer_invites" as any)
        .update({ click_count: (inviteData as any).click_count + 1 })
        .eq("id", inv.id);

      // Log event
      await supabase.from("app_events").insert({
        event_type: "invite_clicked",
        actor_user_id: user?.id ?? null,
        entity_type: "prayer_invite",
        entity_id: inv.id,
      });

      // Fetch prayer
      const { data: prayerData } = await supabase
        .from("global_prayer_requests")
        .select("*")
        .eq("id", inv.prayer_id)
        .maybeSingle();

      if (prayerData) {
        setPrayer(prayerData as PrayerData);
      }

      // Fetch inviter name
      if (inv.inviter_user_id && inv.inviter_user_id !== "anonymous") {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", inv.inviter_user_id)
          .maybeSingle();

        if (profile?.display_name) {
          setInviterName(profile.display_name);
        }
      }

      setLoading(false);
    };

    loadInvite();
  }, [inviteCode, user?.id]);

  const handlePrayForThis = () => {
    if (prayer) {
      // Navigate to pray page - the prayer will be served by the selection service
      navigate("/pray");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading invitation...</span>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-peaceful py-12">
        <div className="max-w-lg mx-auto px-4 text-center space-y-6">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto" />
          <h1 className="font-playfair text-2xl font-bold text-foreground">
            Invitation Not Found
          </h1>
          <p className="text-muted-foreground">
            This invitation link may have expired or is no longer available.
          </p>
          <Button asChild variant="peaceful" size="lg">
            <Link to="/pray">
              Pray for Someone
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
      <div className="max-w-lg mx-auto px-4 space-y-6">
        {/* Invitation header */}
        <Card className="border-0 shadow-[var(--shadow-peaceful)] animate-gentle-fade">
          <CardContent className="pt-8 pb-8 text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="font-playfair text-2xl font-bold text-foreground">
                You were invited to pray
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                {inviterName} invites you to join in prayer for someone who needs encouragement.
              </p>
            </div>

            {/* Personal message from inviter */}
            {invite?.message && (
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-foreground italic leading-relaxed">
                  "{invite.message}"
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  — {inviterName}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prayer request preview */}
        {prayer && (
          <Card className="border-0 shadow-[var(--shadow-peaceful)] animate-gentle-fade" style={{ animationDelay: "100ms" }}>
            <CardContent className="pt-6 pb-6 space-y-4">
              <div className="flex items-start justify-between">
                <h2 className="font-playfair text-lg font-semibold text-foreground">
                  {prayer.title}
                </h2>
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  {prayer.category}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {prayer.description}
              </p>
              {prayer.prayer_count > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Heart className="h-4 w-4 text-primary" />
                  <span>
                    {prayer.prayer_count} {prayer.prayer_count === 1 ? "person has" : "people have"} prayed for this request
                  </span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {prayer.anonymous ? "Shared anonymously" : "Shared by a community member"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Action buttons */}
        <div className="space-y-3 animate-gentle-fade" style={{ animationDelay: "200ms" }}>
          <Button
            variant="peaceful"
            size="lg"
            className="w-full gap-2"
            onClick={handlePrayForThis}
          >
            <Heart className="h-5 w-5" />
            Pray for This Request
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full gap-2"
          >
            <Link to="/about">
              <BookOpen className="h-5 w-5" />
              Learn About PrayerForward
            </Link>
          </Button>
        </div>

        {/* Scripture encouragement */}
        <div className="text-center animate-gentle-fade" style={{ animationDelay: "300ms" }}>
          <p className="text-sm text-muted-foreground italic leading-relaxed">
            "Again, truly I tell you that if two of you on earth agree about anything they ask for,
            it will be done for them by my Father in heaven." — Matthew 18:19
          </p>
        </div>

        {/* Sign up prompt for visitors */}
        {!user && (
          <Card className="border-primary/20 bg-primary/5 animate-gentle-fade" style={{ animationDelay: "400ms" }}>
            <CardContent className="pt-5 pb-5 text-center space-y-3">
              <p className="text-sm text-foreground font-medium">
                Join the PrayerForward community
              </p>
              <p className="text-xs text-muted-foreground">
                Create an account to track your prayers, set reminders, and connect with others.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to={`/signup?returnTo=/invite/${inviteCode}`}>
                  Create Account
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InviteLanding;
