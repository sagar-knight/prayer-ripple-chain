import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ArrowRight, Loader2, Sparkles, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  status: string;
}

const SharedPrayer = () => {
  const { slug } = useParams<{ slug: string }>();
  const [prayer, setPrayer] = useState<PrayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.rpc("get_prayer_by_slug", { _slug: slug });
      if (error || !data) {
        setNotFound(true);
      } else {
        setPrayer(data as unknown as PrayerData);
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

  if (notFound || !prayer) {
    return (
      <div className="min-h-screen bg-gradient-peaceful py-12">
        <div className="max-w-lg mx-auto px-4 text-center space-y-6">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto" />
          <h1 className="font-playfair text-2xl font-bold text-foreground">
            Prayer Request Not Found
          </h1>
          <p className="text-muted-foreground">
            This prayer request may have been removed or the link is no longer valid.
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
        <Card className="border-0 shadow-[var(--shadow-peaceful)] animate-gentle-fade">
          <CardContent className="pt-8 pb-8 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-playfair text-2xl font-bold text-foreground">
                Someone asked for prayer
              </h1>
              <p className="text-muted-foreground text-sm">
                Take a moment to pray with them.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-playfair text-lg font-semibold text-foreground">
                  {prayer.title}
                </h2>
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  {prayer.category}
                </Badge>
              </div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {prayer.description}
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {prayer.country && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {prayer.country}
                  </span>
                )}
                {prayer.prayer_count > 0 && (
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3 text-primary" />
                    {prayer.prayer_count} {prayer.prayer_count === 1 ? "prayer offered" : "prayers offered"}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3 animate-gentle-fade">
          <Button asChild variant="peaceful" size="lg" className="w-full gap-2">
            <Link to="/pray">
              <Sparkles className="h-5 w-5" />
              Pray Now
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link to="/about">Learn About PrayerForward</Link>
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground italic">
          "Again, truly I tell you that if two of you on earth agree about anything they ask for,
          it will be done for them by my Father in heaven." — Matthew 18:19
        </p>
      </div>
    </div>
  );
};

export default SharedPrayer;