import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Share2, Globe2, ShieldCheck, Heart, Loader2 } from "lucide-react";
import { UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserProfileSheet from "@/components/UserProfileSheet";
import { resolveAvatarUrl } from "@/lib/avatar";
import { useAuth } from "@/hooks/useAuth";
import { usePrayerService } from "@/hooks/usePrayerService";
import SharePrayerDialog from "@/components/SharePrayerDialog";
import PrayerImpactDialog from "@/components/PrayerImpactDialog";
import ReminderBellButton from "@/components/ReminderBellButton";
import PrayerLocationsSheet from "@/components/PrayerLocationsSheet";
import PrayerLocationPrompt from "@/components/PrayerLocationPrompt";

interface PublicPrayer {
  id: string;
  title: string;
  description: string;
  category: string;
  prayer_count: number;
  anonymous: boolean;
  show_country: boolean;
  country: string | null;
  created_by?: string | null;
}

const SAMPLE: PublicPrayer = {
  id: "sample-1",
  title: "Pray for peace and strength",
  description:
    "Someone is going through a difficult season and would love your prayer for peace and strength today.",
  category: "Encouragement",
  prayer_count: 0,
  anonymous: true,
  show_country: false,
  country: null,
  created_by: null,
};

const FeaturedPrayerCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { recordPrayed } = usePrayerService();
  const [prayer, setPrayer] = useState<PublicPrayer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSample, setIsSample] = useState(false);
  const [praying, setPraying] = useState(false);
  const [prayed, setPrayed] = useState(false);
  const [countryCount, setCountryCount] = useState<number | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [showImpact, setShowImpact] = useState(false);
  const [showLocations, setShowLocations] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [requesterName, setRequesterName] = useState<string | null>(null);
  const [requesterAvatar, setRequesterAvatar] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("global_prayers_public" as any)
        .select("id,title,description,category,prayer_count,anonymous,show_country,country,created_by")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(10);

      if (cancelled) return;
      const rows = (data || []) as any as PublicPrayer[];
      if (rows.length === 0) {
        setPrayer(SAMPLE);
        setIsSample(true);
      } else {
        const pick = rows[Math.floor(Math.random() * rows.length)];
        setPrayer(pick);
        // Resolve requester profile for non-anonymous prayers
        if (!pick.anonymous && pick.created_by) {
          try {
            const { data: prof } = await supabase
              .from("profiles")
              .select("display_name, avatar_url")
              .eq("id", pick.created_by)
              .maybeSingle();
            if (!cancelled) {
              setRequesterName(prof?.display_name || "Prayer Warrior");
              const url = await resolveAvatarUrl(prof?.avatar_url);
              if (!cancelled) setRequesterAvatar(url);
            }
          } catch {
            /* non-blocking */
          }
        }
        // Optional: country reach
        try {
          const { data: actions } = await supabase
            .from("prayer_actions" as any)
            .select("prayer_country_code")
            .eq("prayer_id", pick.id)
            .not("prayer_country_code", "is", null);
          const set = new Set(((actions || []) as any[]).map((a) => a.prayer_country_code));
          setCountryCount(set.size);
        } catch {
          /* non-blocking */
        }
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePray = async () => {
    if (!prayer) return;
    if (isSample) {
      // Guide users into the real flow
      navigate(user ? "/pray" : "/login");
      return;
    }
    if (!user) {
      sessionStorage.setItem("returnTo", "/");
      navigate("/login");
      return;
    }
    setPraying(true);
    try {
      await recordPrayed(prayer.id, "global");
      setPrayer((p) => (p ? { ...p, prayer_count: p.prayer_count + 1 } : p));
      setPrayed(true);
      setShowImpact(true);
      // Auto-prompt for an approximate location so the ripple map fills in.
      // Skipping or denying triggers a silent country-only IP fallback inside the prompt.
      setShowLocationPrompt(true);
    } finally {
      setPraying(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-peaceful bg-card/80 backdrop-blur">
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!prayer) return null;

  const requesterId = !prayer.anonymous && prayer.created_by ? prayer.created_by : null;
  const initials = (requesterName || "PW")
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <Card className="border-0 shadow-peaceful bg-card/90 backdrop-blur overflow-hidden">
        <CardContent className="p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {prayer.category}
            </Badge>
            {isSample ? (
              <Badge variant="outline" className="text-xs">Sample prayer</Badge>
            ) : (
              <Badge variant="outline" className="text-xs gap-1">
                <ShieldCheck className="h-3 w-3" /> Reviewed
              </Badge>
            )}
            {prayer.anonymous && (
              <Badge variant="outline" className="text-xs">Anonymous</Badge>
            )}
          </div>

          <div className="flex items-start gap-3">
            {requesterId ? (
              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                className="shrink-0"
                aria-label={`Open profile for ${requesterName || "requester"}`}
              >
                <Avatar className="h-12 w-12 ring-1 ring-border hover:ring-foreground/40 transition">
                  {requesterAvatar && <AvatarImage src={requesterAvatar} alt={requesterName || "Profile"} />}
                  <AvatarFallback className="bg-muted text-foreground text-sm">{initials}</AvatarFallback>
                </Avatar>
              </button>
            ) : (
              <Avatar className="h-12 w-12 ring-1 ring-border shrink-0">
                <AvatarFallback className="bg-muted text-muted-foreground">
                  <UserRound className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            )}
            <div className="space-y-2 min-w-0">
              <h2 className="font-playfair text-2xl md:text-3xl font-semibold text-foreground">
                {prayer.title}
              </h2>
              {requesterId && requesterName && (
                <p className="text-xs uppercase tracking-widest text-muted-foreground/70 font-medium">
                  {requesterName}
                </p>
              )}
              <p className="text-muted-foreground leading-relaxed line-clamp-4">
                {prayer.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Heart className="h-4 w-4 text-primary" />
              {prayer.prayer_count > 0
                ? `${prayer.prayer_count} ${
                    prayer.prayer_count === 1 ? "person is" : "people are"
                  } praying with you`
                : "Be the first to pray"}
            </span>
            {countryCount !== null && countryCount > 0 && (
              <button
                type="button"
                onClick={() => !isSample && setShowLocations(true)}
                disabled={isSample}
                className="flex items-center gap-1.5 hover:text-foreground transition-colors disabled:cursor-default"
              >
                <Globe2 className="h-4 w-4 text-primary" />
                {countryCount} {countryCount === 1 ? "country" : "countries"} · See map
              </button>
            )}
            {!isSample && countryCount === 0 && (
              <button
                type="button"
                onClick={() => setShowLocations(true)}
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <Globe2 className="h-4 w-4 text-primary" />
                See who's praying
              </button>
            )}
            {!isSample && (
              <span className="ml-auto">
                <ReminderBellButton
                  prayerId={prayer.id}
                  prayerTitle={prayer.title}
                  size="sm"
                />
              </span>
            )}
          </div>

          {!prayed ? (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="peaceful"
                size="lg"
                className="flex-1 text-base py-6"
                onClick={handlePray}
                disabled={praying}
              >
                {praying ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Star className="h-5 w-5 mr-2" />
                )}
                Pray Now
              </Button>
              <Button asChild variant="outline" size="lg" className="sm:w-auto">
                <Link to="/submit-prayer">Share a Prayer Request</Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border bg-accent/30 p-5 space-y-4 animate-gentle-fade">
              <div className="space-y-1">
                <p className="font-medium text-foreground">
                  Thank you. You joined {prayer.prayer_count}{" "}
                  {prayer.prayer_count === 1 ? "person" : "people"} praying for this request.
                </p>
                {countryCount !== null && countryCount > 0 && (
                  <p className="text-sm text-muted-foreground">
                    This prayer has reached {countryCount}{" "}
                    {countryCount === 1 ? "country" : "countries"}.
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="peaceful"
                  className="flex-1"
                  onClick={() => setShowShare(true)}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Forward this prayer
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/pray">
                    <Star className="h-4 w-4 mr-2" />
                    Pray for another
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <SharePrayerDialog
        open={showShare}
        onOpenChange={setShowShare}
        prayerId={prayer.id}
        prayerTitle={prayer.title}
      />

      {requesterId && (
        <UserProfileSheet
          open={profileOpen}
          onOpenChange={setProfileOpen}
          userId={requesterId}
        />
      )}

      <PrayerImpactDialog
        open={showImpact}
        onOpenChange={setShowImpact}
        prayerId={prayer.id}
        prayerCount={prayer.prayer_count}
        onPrayAnother={() => {
          setShowImpact(false);
          navigate("/pray");
        }}
        onShare={() => {
          setShowImpact(false);
          setShowShare(true);
        }}
      />

      {!isSample && (
        <PrayerLocationsSheet
          open={showLocations}
          onOpenChange={setShowLocations}
          prayerId={prayer.id}
          sourceType="global"
          prayerCount={prayer.prayer_count}
        />
      )}

      {!isSample && (
        <PrayerLocationPrompt
          open={showLocationPrompt}
          onOpenChange={setShowLocationPrompt}
          prayerRequestId={prayer.id}
          sourceType="global"
          onShared={() => setCountryCount((c) => (c ?? 0) + 1)}
        />
      )}
    </>
  );
};

export default FeaturedPrayerCard;