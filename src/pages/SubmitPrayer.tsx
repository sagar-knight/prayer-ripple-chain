import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Heart, Lock, Globe, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SubmitPrayer = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Prayer Request Submitted 🙏",
        description: "Your request has been shared with our caring community.",
        duration: 5000,
      });
      
      // Reset form
      (e.target as HTMLFormElement).reset();
      setIsAnonymous(false);
    }, 2000);
  };

  const categories = [
    "Health & Healing",
    "Family & Relationships",
    "Financial Needs",
    "Guidance & Wisdom",
    "Comfort & Peace",
    "Thanksgiving & Praise",
    "Other"
  ];

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 animate-gentle-fade">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-4">
            Submit a Prayer Request
          </h1>
          <p className="text-lg text-muted-foreground">
            Share your needs with our community of prayer warriors
          </p>
        </div>

        <Card className="shadow-peaceful animate-gentle-fade">
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
                  name="title"
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
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category.toLowerCase().replace(/\s+/g, '-')}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-medium">
                  Prayer Description *
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Please share your prayer request with as much or as little detail as you're comfortable with..."
                  className="min-h-[120px] text-base"
                  required
                />
              </div>

              {/* Location (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-base font-medium">
                  Location (Optional)
                </Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="City, State or general area"
                  className="text-base"
                />
              </div>

              {/* Church Affiliation (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="church" className="text-base font-medium">
                  Church Affiliation (Optional)
                </Label>
                <Input
                  id="church"
                  name="church"
                  placeholder="Name of your church or faith community"
                  className="text-base"
                />
              </div>

              {/* Anonymous Toggle */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {isAnonymous ? (
                    <Lock className="h-5 w-5 text-primary" />
                  ) : (
                    <Globe className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <Label htmlFor="anonymous" className="text-base font-medium cursor-pointer">
                      Submit Anonymously
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Your request will be shared without identifying information
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
            <h3 className="font-semibold text-primary mb-2">Privacy & Community Guidelines</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• All prayer requests are reviewed before being shared with the community</li>
              <li>• Your personal information is kept secure and never shared without permission</li>
              <li>• Our community commits to praying with respect and love</li>
              <li>• For urgent situations, please contact local emergency services</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubmitPrayer;