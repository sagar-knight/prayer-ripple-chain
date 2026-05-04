import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ArrowRight, Loader2, Sparkles, MapPin, Users, Share2, Waves, Globe2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SharePrayerDialog from "@/components/SharePrayerDialog";
import { formatDistanceToNow } from "date-fns";
import WorldRippleMap from "@/components/WorldRippleMap";

interface PrayerData {
  id: string;
  slug: string;
  short_code: string;
  title: string;
  description: string;
  category: string;
  anonymous: boolean;
  prayer_count: number;
  country: string | null;
  origin_country_code?: string | null;
  status: string;
  created_at: string;
}

interface RippleStats {
  total_prayers: number;
  unique_people: number;
  forwards: number;
  depth: number;
}

interface GeoEntry {
  country_code: string;
  country: string;
  prayers: number;
  forwards: number;
  participants: number;
}
interface ActivityEntry { created_at: string; action_type: string; message: string }

interface PublicRipplePayload {
  prayer: PrayerData;
  ripple: RippleStats;
  geography: GeoEntry[];
  activity: ActivityEntry[];
}

const SharedPrayer = () => {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PublicRipplePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const { data: payload, error } = await supabase.rpc("get_public_ripple_by_slug", { _slug: slug });
      if (error || !payload) {
        setNotFound(true);
      } else {
        setData(payload as unknown as PublicRipplePayload);
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading prayer request...</span>
        </div>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-gradient-peaceful py-12">
        <div className="max-w-lg mx-auto px-4 text-center space-y-6">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto" />
          <h1 className="font-playfair text-2xl font-bold text-foreground">
            This prayer request is private or no longer available
          </h1>
          <p className="text-muted-foreground">
            The link may have been removed, set to private, or is restricted to family or church members.
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

  const { prayer, ripple, geography, activity } = data;

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
      <div className="max-w-lg mx-auto px-4 space-y-6">
        {/* Prayer card */}
        <Card className="border-0 shadow-[var(--shadow-peaceful)] animate-gentle-fade">
          <CardContent className="pt-8 pb-8 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-playfair text-2xl font-bold text-foreground">
                Someone asked for prayer
              </h1>
              <p className="text-muted-foreground text-sm">Take a moment to pray with them.</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-playfair text-lg font-semibold text-foreground">{prayer.title}</h2>
                <Badge variant="secondary" className="text-xs flex-shrink-0">{prayer.category}</Badge>
              </div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{prayer.description}</p>
              {prayer.country && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {prayer.country}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="space-y-3 animate-gentle-fade">
          <Button asChild variant="peaceful" size="lg" className="w-full gap-2">
            <Link to="/pray">
              <Sparkles className="h-5 w-5" />
              Pray Now
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="w-full gap-2" onClick={() => setShareOpen(true)}>
            <Share2 className="h-5 w-5" />
            Forward This Prayer
          </Button>
        </div>

        {/* Ripple summary */}
        <Card className="border-0 shadow-card animate-gentle-fade">
          <CardContent className="pt-6 pb-6 space-y-4">
            <div className="flex items-center gap-2">
              <Waves className="h-5 w-5 text-primary" />
              <h3 className="font-playfair text-lg font-semibold text-foreground">Ripple of prayer</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Stat icon={Heart} label="Prayers offered" value={ripple.total_prayers} />
              <Stat icon={Users} label="People joined" value={ripple.unique_people} />
              <Stat icon={Share2} label="Forwards" value={ripple.forwards} />
              <Stat icon={Waves} label="Ripple layers" value={ripple.depth} />
            </div>
          </CardContent>
        </Card>

        {/* Geography reach */}
        {geography && geography.length > 0 && (
          <Card className="border-0 shadow-card animate-gentle-fade">
            <CardContent className="pt-6 pb-6 space-y-3">
              <div className="flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-primary" />
                <h3 className="font-playfair text-lg font-semibold text-foreground">Ripple Map</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Prayers offered from {geography.length} {geography.length === 1 ? "country" : "countries"}.
              </p>
              <WorldRippleMap
                data={geography}
                metric="prayers"
                originCode={prayer.origin_country_code ?? null}
              />
              <div className="flex flex-wrap gap-2 pt-1">
                {geography.slice(0, 12).map((g) => (
                  <Badge key={g.country_code} variant="secondary" className="text-xs">
                    {g.country} · {g.prayers}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Anonymous activity feed */}
        {activity && activity.length > 0 && (
          <Card className="border-0 shadow-card animate-gentle-fade">
            <CardContent className="pt-6 pb-6 space-y-3">
              <h3 className="font-playfair text-lg font-semibold text-foreground">Recent activity</h3>
              <ul className="space-y-2.5">
                {activity.map((a, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-foreground">{a.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-muted-foreground italic pt-1">
                Names and personal details are kept private.
              </p>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-sm text-muted-foreground italic">
          "Again, truly I tell you that if two of you on earth agree about anything they ask for,
          it will be done for them by my Father in heaven." — Matthew 18:19
        </p>
      </div>

      <SharePrayerDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        prayerId={prayer.id}
        prayerTitle={prayer.title}
      />
    </div>
  );
};

const Stat = ({ icon: Icon, label, value }: { icon: typeof Heart; label: string; value: number }) => (
  <div className="rounded-xl bg-muted/50 p-3 text-center">
    <Icon className="h-4 w-4 text-primary mx-auto mb-1" />
    <p className="text-xl font-semibold text-foreground">{value.toLocaleString()}</p>
    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
  </div>
);

export default SharedPrayer;
