import { useState } from "react";
import NewsletterSubscribe from "@/components/NewsletterSubscribe";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const SupportMission = () => {
  const [selectedMonthly, setSelectedMonthly] = useState<number | null>(5);
  const [selectedOneTime, setSelectedOneTime] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [makeMonthly, setMakeMonthly] = useState(false);
  const [donated, setDonated] = useState(false);

  const monthlyOptions = [3, 5, 10];
  const oneTimeOptions = [5, 10, 25];

  const handleDonate = () => {
    // Analytics: support_donation_start
    setDonated(true);
    // Analytics: support_donation_success
  };

  if (donated) {
    return (
      <div className="min-h-screen bg-gradient-peaceful py-16 pb-24">
        <div className="max-w-lg mx-auto px-4 text-center">
          <Card className="py-12 animate-gentle-fade">
            <CardContent className="space-y-6">
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Heart className="h-10 w-10 text-primary" />
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
                <Button asChild variant="outline">
                  <Link to="/profile">Manage Support</Link>
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
          <Link to="/profile">
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
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
            <div className="grid grid-cols-3 gap-3 mb-4">
              {monthlyOptions.map((amount) => (
                <Button
                  key={amount}
                  variant={selectedMonthly === amount && !selectedOneTime ? "peaceful" : "outline"}
                  className="text-lg py-6"
                  onClick={() => {
                    setSelectedMonthly(amount);
                    setSelectedOneTime(null);
                    setCustomAmount("");
                  }}
                >
                  ${amount}/mo
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
              {oneTimeOptions.map((amount) => (
                <Button
                  key={amount}
                  variant={selectedOneTime === amount ? "peaceful" : "outline"}
                  className="text-lg py-6"
                  onClick={() => {
                    setSelectedOneTime(amount);
                    setSelectedMonthly(null);
                    setCustomAmount("");
                  }}
                >
                  ${amount}
                </Button>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom">Custom Amount</Label>
              <Input
                id="custom"
                type="number"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedMonthly(null);
                  setSelectedOneTime(null);
                }}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="monthly"
                checked={makeMonthly}
                onCheckedChange={(checked) => setMakeMonthly(checked === true)}
              />
              <Label htmlFor="monthly" className="text-sm cursor-pointer">
                Make this monthly
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Donate Button */}
        <Button
          variant="peaceful"
          size="lg"
          className="w-full text-lg py-6 mb-8 shadow-peaceful"
          onClick={handleDonate}
        >
          <Heart className="mr-2 h-5 w-5" />
          Support PrayerForward
        </Button>

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

        <NewsletterSubscribe />
      </div>
    </div>
  );
};

export default SupportMission;
