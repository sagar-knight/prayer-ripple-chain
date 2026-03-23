import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Lock, Globe, Send, BookOpen, ArrowRight, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PrayerStatusTracker from "@/components/PrayerStatusTracker";
import ScriptureEncouragement from "@/components/ScriptureEncouragement";
import { usePrayerService } from "@/hooks/usePrayerService";
import { useContentModeration } from "@/hooks/useContentModeration";
import { prayerRequestSchema } from "@/lib/validation";

const SubmitPrayer = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submittedCategory, setSubmittedCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const { submitGlobalPrayer } = usePrayerService();
  const { moderate, checking } = useContentModeration();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    const parsed = prayerRequestSchema.safeParse({
      title,
      description,
      category: selectedCategory,
      anonymous: isAnonymous,
    });
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message || "Please check your input";
      toast({ title: firstError, variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Content moderation
      const modResult = await moderate(
        `${parsed.data.title} ${parsed.data.description}`,
        "prayer request",
        "submit_prayer"
      );
      if (!modResult.allowed) {
        setIsSubmitting(false);
        return;
      }

      await submitGlobalPrayer({
        title: parsed.data.title,
        description: parsed.data.description,
        category: parsed.data.category,
        anonymous: parsed.data.anonymous,
      });

      setSubmittedCategory(selectedCategory);
      setShowConfirmation(true);
      toast({
        title: "Your prayer has been shared",
        description: "Prayer partners have received your request.",
        duration: 5000,
      });

      setTitle("");
      setDescription("");
      setSelectedCategory("");
      setIsAnonymous(false);
    } catch (err) {
      toast({
        title: "Something went wrong",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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

  // Post-submission reassurance + participation prompt
  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
        <div className="page-container card-gap">
          {/* Reassurance Card */}
          <Card className="border-0 animate-gentle-fade">
            <CardContent className="pt-8 pb-8 text-center space-y-5">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="font-playfair text-2xl font-bold text-foreground">
                  Your prayer request has been shared
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Prayer partners have received your request and will begin praying for you.
                  You are not alone in this.
                </p>
              </div>
              <p className="text-sm text-muted-foreground italic">
                "Cast all your anxiety on him because he cares for you." — 1 Peter 5:7
              </p>
            </CardContent>
          </Card>

          {/* Scripture Encouragement */}
          {submittedCategory && (
            <div className="animate-gentle-fade" style={{ animationDelay: "100ms" }}>
              <ScriptureEncouragement category={submittedCategory} mode="confirmation" />
            </div>
          )}

          {/* Participation Prompt */}
          <Card className="border-0 animate-gentle-fade" style={{ animationDelay: "200ms" }}>
            <CardContent className="pt-7 pb-7 text-center space-y-5">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="section-title">
                  Would you also like to pray for someone else today?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Someone is waiting for encouragement through prayer.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button
                  variant="peaceful"
                  size="lg"
                  className="gap-2"
                  onClick={() => navigate("/pray")}
                >
                  <Heart className="h-4 w-4" />
                  Pray for someone
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/")}
                >
                  Maybe later
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Submit another */}
          <div className="text-center animate-gentle-fade" style={{ animationDelay: "300ms" }}>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-1"
              onClick={() => {
                setShowConfirmation(false);
                setSubmittedCategory("");
              }}
            >
              Submit another prayer request
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
      <div className="page-container">
        <div className="page-header">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="page-title">Prayer Requests</h1>
          <p className="page-subtitle">
            Share your needs or track your existing prayers
          </p>
        </div>

        <Tabs defaultValue="submit" className="animate-gentle-fade">
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
            <Card>
              <CardHeader>
                <CardTitle className="font-playfair text-2xl text-center">
                  Your Prayer Request
                </CardTitle>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-base font-medium">
                      Prayer Title *
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Brief title for your prayer request"
                      required
                      maxLength={120}
                      className="text-base"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-base font-medium">
                      Category *
                    </Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category}
                            value={category.toLowerCase()}
                          >
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-base font-medium"
                    >
                      Prayer Description (Issue/Problem) *
                    </Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what you need prayer for..."
                      className="min-h-[120px] text-base"
                      required
                    />
                  </div>

                  {/* Visibility Toggle */}
                  <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      {isAnonymous ? (
                        <Lock className="h-5 w-5 text-primary" />
                      ) : (
                        <Globe className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <Label
                          htmlFor="anonymous"
                          className="text-base font-medium cursor-pointer"
                        >
                          {isAnonymous ? "Anonymous" : "Public"}
                        </Label>
                        <p className="text-sm text-muted-foreground">
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

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || checking}
                    variant="peaceful"
                    size="lg"
                    className="w-full text-base"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-peaceful-glow">
                          <Heart className="h-5 w-5" />
                        </div>
                        Submitting Prayer...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="h-5 w-5" />
                        Submit Prayer Request
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Privacy Notice */}
            <Card className="mt-6 bg-primary/5 border-primary/20">
              <CardContent className="pt-7">
                <h3 className="font-semibold text-primary mb-3">
                  Privacy & Community Guidelines
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2 leading-relaxed">
                  <li>
                    Prayer actions are always free, no ads inside prayer flows
                  </li>
                  <li>
                    Your personal information is kept secure and never shared
                  </li>
                  <li>
                    Our community commits to praying with respect and love
                  </li>
                  <li>
                    For urgent situations, please contact local emergency services
                  </li>
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
