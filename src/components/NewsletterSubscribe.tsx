import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Mail, CheckCircle } from "lucide-react";

const NewsletterSubscribe = () => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [reminderOptIn, setReminderOptIn] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    // Analytics: subscribe_submit
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      // Analytics: subscribe_success
    }, 1200);
  };

  if (submitted) {
    return (
      <section className="py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-8 text-center space-y-3">
              <CheckCircle className="h-10 w-10 text-primary mx-auto" />
              <h3 className="font-playfair text-xl font-bold text-foreground">
                Thank you for subscribing to PrayerForward 🙏
              </h3>
              <p className="text-sm text-muted-foreground">
                Please check your inbox to confirm your subscription.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-8 pb-8 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-2">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-playfair text-xl font-bold text-foreground">
                Stay Connected
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Receive weekly encouragement, prayer updates, and mission news. No spam. Unsubscribe anytime.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
              <Input
                type="email"
                placeholder="Email address *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-base"
              />
              <Input
                type="text"
                placeholder="First name (optional)"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="text-base"
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reminder-opt"
                  checked={reminderOptIn}
                  onCheckedChange={(c) => setReminderOptIn(c === true)}
                />
                <Label htmlFor="reminder-opt" className="text-sm cursor-pointer text-muted-foreground">
                  I also want to receive prayer reminder emails
                </Label>
              </div>
              <Button
                type="submit"
                variant="peaceful"
                className="w-full gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Subscribing..." : (
                  <>
                    <Mail className="h-4 w-4" />
                    Subscribe
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default NewsletterSubscribe;
