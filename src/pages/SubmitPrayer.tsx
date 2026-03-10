import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Lock, Globe, Send, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PrayerStatusTracker from "@/components/PrayerStatusTracker";
import ScriptureEncouragement from "@/components/ScriptureEncouragement";
import { usePrayerService } from "@/hooks/usePrayerService";

const SubmitPrayer = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const { submitGlobalPrayer } = usePrayerService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !selectedCategory) return;

    setIsSubmitting(true);

    try {
      await submitGlobalPrayer({
        title: title.trim(),
        description: description.trim(),
        category: selectedCategory,
        anonymous: isAnonymous,
      });

      setShowConfirmation(true);
      toast({
        title: "Your prayer has been shared 🙏",
        description: "Our community is here for you. People will begin praying soon.",
        duration: 5000,
      });

      setTitle("");
      setDescription("");
      setSelectedCategory("");
      setIsAnonymous(false);

      setTimeout(() => setShowConfirmation(false), 5000);
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

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 animate-gentle-fade">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-4">
            Prayer Requests
          </h1>
          <p className="text-lg text-muted-foreground">
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
            {/* Confirmation Banner */}
            {showConfirmation && (
              <div className="mb-6 space-y-4 animate-gentle-fade">
                <Card className="bg-primary/10 border-primary/20">
                  <CardContent className="pt-6 text-center">
                    <p className="text-lg font-semibold text-primary">
                      ✅ Your prayer has been shared.
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      People are already being notified to pray for you.
                    </p>
                  </CardContent>
                </Card>
                {selectedCategory && (
                  <ScriptureEncouragement category={selectedCategory} mode="confirmation" />
                )}
              </div>
            )}

            <Card className="shadow-peaceful">
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
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
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
                    disabled={isSubmitting}
                    variant="peaceful"
                    size="lg"
                    className="w-full text-lg"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-peaceful-glow">🙏</div>
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
              <CardContent className="pt-6">
                <h3 className="font-semibold text-primary mb-2">
                  Privacy & Community Guidelines
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    • Prayer actions are always free — no ads inside prayer
                    flows
                  </li>
                  <li>
                    • Your personal information is kept secure and never shared
                  </li>
                  <li>
                    • Our community commits to praying with respect and love
                  </li>
                  <li>
                    • For urgent situations, please contact local emergency
                    services
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
