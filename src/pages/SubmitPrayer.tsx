import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Globe, Send, BookOpen, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PrayerStatusTracker from "@/components/PrayerStatusTracker";
import ScriptureEncouragement from "@/components/ScriptureEncouragement";

const SubmitPrayer = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setShowConfirmation(true);
      toast({
        title: "Your prayer has been shared",
        description: "Our community is here for you. People will begin praying soon.",
        duration: 5000,
      });

      (e.target as HTMLFormElement).reset();
      setIsAnonymous(false);

      setTimeout(() => setShowConfirmation(false), 5000);
    }, 2000);
  };

  const categories = [
    "Health",
    "Family",
    "Work",
    "Peace",
    "Faith",
    "Strength",
    "Other",
  ];

  return (
    <div className="min-h-screen bg-background py-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-3 tracking-tight">
            Prayer Requests
          </h1>
          <p className="text-muted-foreground text-sm">
            Share your needs or track your existing prayers
          </p>
        </div>

        <Tabs defaultValue="submit">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="submit" className="gap-2">
              <Send className="h-4 w-4" />
              Submit Request
            </TabsTrigger>
            <TabsTrigger value="status" className="gap-2">
              <BookOpen className="h-4 w-4" />
              My Prayer Status
            </TabsTrigger>
          </TabsList>

          <TabsContent value="submit">
            {showConfirmation && (
              <div className="mb-6 space-y-4">
                <Card className="bg-secondary border-border">
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm font-medium text-foreground">
                      Your prayer has been shared.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      People are already being notified to pray for you.
                    </p>
                  </CardContent>
                </Card>
                {selectedCategory && (
                  <ScriptureEncouragement category={selectedCategory} mode="confirmation" />
                )}
              </div>
            )}

            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-lg text-center">
                  Your Prayer Request
                </CardTitle>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Prayer Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Brief title for your prayer request"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select name="category" required onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category.toLowerCase()}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Prayer Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe what you need prayer for..."
                      className="min-h-[120px]"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {isAnonymous ? (
                        <Lock className="h-4 w-4 text-foreground" />
                      ) : (
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div>
                        <Label htmlFor="anonymous" className="cursor-pointer text-sm">
                          {isAnonymous ? "Anonymous" : "Public"}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {isAnonymous
                            ? "Your identity will be hidden"
                            : "Your name will be visible to those who pray"}
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="anonymous"
                      checked={isAnonymous}
                      onCheckedChange={setIsAnonymous}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    size="lg"
                    className="w-full rounded-full"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Submit Prayer Request
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="mt-6 bg-secondary/30 border-border">
              <CardContent className="pt-6">
                <h3 className="font-medium text-foreground mb-2 text-sm">
                  Privacy & Community Guidelines
                </h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Prayer actions are always free — no ads inside prayer flows</li>
                  <li>• Your personal information is kept secure and never shared</li>
                  <li>• Our community commits to praying with respect and love</li>
                  <li>• For urgent situations, please contact local emergency services</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="status">
            <PrayerStatusTracker />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SubmitPrayer;