import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Heart,
  HandHeart,
  Server,
  Code,
  Globe,
  CheckCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const MONTHLY_PRICES = [
  { amount: 3, priceId: "price_1T88IVP0AaPv7hClq3iXPSmN" },
  { amount: 5, priceId: "price_1T88IsP0AaPv7hClSVisj9ad" },
  { amount: 10, priceId: "price_1T88JFP0AaPv7hClYZi3kARk" },
];

const ONETIME_PRICES = [
  { amount: 5, priceId: "price_1T88LCP0AaPv7hCl6RWWgUAn" },
  { amount: 10, priceId: "price_1T88LuP0AaPv7hClzGHxx0d8" },
  { amount: 25, priceId: "price_1T88MQP0AaPv7hClKADrzalb" },
];

const SupportMission = () => {
  const [selectedMonthly, setSelectedMonthly] = useState<number | null>(1);
  const [selectedOneTime, setSelectedOneTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const success = searchParams.get("success") === "true";

  const handleDonate = async () => {
    if (!user) {
      toast.error("Please sign in to support the mission.");
      return;
    }

    let priceId: string | null = null;
    let mode: "payment" | "subscription" = "payment";

    if (selectedMonthly !== null) {
      priceId = MONTHLY_PRICES[selectedMonthly]?.priceId;
      mode = "subscription";
    } else if (selectedOneTime !== null) {
      priceId = ONETIME_PRICES[selectedOneTime]?.priceId;
      mode = "payment";
    }

    if (!priceId) {
      toast.error("Please select a support option.");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-support-checkout", {
        body: { priceId, mode },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-peaceful py-16 pb-24">
        <div className="max-w-lg mx-auto px-4 text-center">
          <Card className="py-12 animate-gentle-fade">
            <CardContent className="space-y-6">
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <h1 className="font-playfair text-3xl font-bold text-foreground">
                Thank you for supporting PrayerForward
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                Your generosity helps keep prayer free for everyone. God bless
                you for your kindness.
              </p>
              <div className="flex flex-col gap-3 pt-4">
                <Button asChild variant="peaceful">
                  <Link to="/">Return Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button asChild variant="ghost" size="sm" className="mb-6 gap-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        {/* Header */}
        <div className="text-center mb-10 animate-gentle-fade">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <HandHeart className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-3">
            Support the Mission
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">
            PrayerForward is free for everyone. If you feel led, your support
            helps keep the platform running — hosting, development, and
            outreach. 100% optional.
          </p>
          <Badge variant="secondary" className="mt-4 text-sm gap-1">
            <Heart className="h-3 w-3" />
            Prayer is always free.
          </Badge>
        </div>

        {/* Monthly Support */}
        <Card className="mb-6 animate-gentle-fade" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <CardTitle className="font-playfair text-lg">
              Monthly Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {MONTHLY_PRICES.map((price, idx) => (
                <Button
                  key={price.priceId}
                  variant={selectedMonthly === idx && selectedOneTime === null ? "peaceful" : "outline"}
                  className="text-lg py-6"
                  onClick={() => {
                    setSelectedMonthly(idx);
                    setSelectedOneTime(null);
                  }}
                >
                  ${price.amount}/mo
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* One-Time */}
        <Card className="mb-6 animate-gentle-fade" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <CardTitle className="font-playfair text-lg">
              One-Time Gift
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {ONETIME_PRICES.map((price, idx) => (
                <Button
                  key={price.priceId}
                  variant={selectedOneTime === idx ? "peaceful" : "outline"}
                  className="text-lg py-6"
                  onClick={() => {
                    setSelectedOneTime(idx);
                    setSelectedMonthly(null);
                  }}
                >
                  ${price.amount}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Donate Button */}
        <Button
          variant="peaceful"
          size="lg"
          className="w-full text-lg py-6 mb-8 shadow-peaceful"
          onClick={handleDonate}
          disabled={isLoading || (selectedMonthly === null && selectedOneTime === null)}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Heart className="mr-2 h-5 w-5" />
              {!user ? "Sign In to Support" : "Support PrayerForward"}
            </>
          )}
        </Button>

        {!user && (
          <p className="text-center text-sm text-muted-foreground mb-8">
            <Link to="/login" className="text-primary hover:underline">Sign in</Link> or{" "}
            <Link to="/signup" className="text-primary hover:underline">create an account</Link> to complete your contribution.
          </p>
        )}

        {/* FAQ */}
        <Card className="animate-gentle-fade" style={{ animationDelay: "300ms" }}>
          <CardHeader>
            <CardTitle className="font-playfair text-lg">
              Where does my support go?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="hosting">
                <AccordionTrigger className="text-sm">
                  <span className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-primary" />
                    Hosting & Infrastructure
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Servers, databases, and security to keep PrayerForward fast,
                  reliable, and safe for every user.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="development">
                <AccordionTrigger className="text-sm">
                  <span className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-primary" />
                    Development & Maintenance
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Bug fixes, new features, and ongoing improvements to make
                  your prayer experience better.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="outreach">
                <AccordionTrigger className="text-sm">
                  <span className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    Outreach & Growth
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Spreading the prayer movement to more people, churches, and
                  communities worldwide.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupportMission;
