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
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  if (submitted) {
    return (
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="bg-secondary/30 border-border">
            <CardContent className="py-10 text-center space-y-4">
              <CheckCircle className="h-10 w-10 text-foreground mx-auto" />
              <h3 className="text-xl font-semibold text-foreground">
                Thank you for subscribing
              </h3>
              <p className="text-muted-foreground text-sm">
                Please check your inbox to confirm your subscription.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-10 pb-10 space-y-6">
            <div className="text-center space-y-3">
              <h3 className="text-xl font-semibold text-foreground">
                Stay Connected
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto text-sm">
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
                className="h-11"
              />
              <Input
                type="text"
                placeholder="First name (optional)"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-11"
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reminder-opt"
                  checked={reminderOptIn}
                  onCheckedChange={(c) => setReminderOptIn(c === true)}
                />
                <Label htmlFor="reminder-opt" className="cursor-pointer text-muted-foreground text-sm">
                  I also want to receive prayer reminder emails
                </Label>
              </div>
              <Button
                type="submit"
                className="w-full gap-2 h-11 rounded-full"
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