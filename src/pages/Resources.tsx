import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  Heart,
  ShoppingBag,
  ExternalLink,
  Star,
  Gift,
  Notebook,
  Music,
  Cross,
  Layers,
} from "lucide-react";
import { useState } from "react";

const Resources = () => {
  const [showRecommendations, setShowRecommendations] = useState(true);

  const resources = [
    {
      id: "1",
      title: "Prayer Journal — Daily Guided Devotional",
      category: "Prayer Journals",
      description:
        "A beautifully designed 90-day prayer journal with scripture prompts, gratitude sections, and space for personal reflections.",
      price: "$14.99",
      rating: 4.8,
      icon: Notebook,
      affiliate: true,
    },
    {
      id: "2",
      title: "NIV Study Bible — Large Print",
      category: "Bibles",
      description:
        "Comprehensive study Bible with detailed notes, maps, and cross-references. Perfect for deeper understanding of Scripture.",
      price: "$29.99",
      rating: 4.9,
      icon: BookOpen,
      affiliate: true,
    },
    {
      id: "3",
      title: "30-Day Prayer Challenge Devotional",
      category: "Devotionals",
      description:
        "Transform your prayer life with this 30-day guided devotional. Each day includes a Bible verse, reflection, and prayer prompt.",
      price: "$9.99",
      rating: 4.7,
      icon: Heart,
      affiliate: true,
    },
    {
      id: "4",
      title: "Faith & Healing — A Biblical Guide",
      category: "Faith Resources",
      description:
        "An encouraging resource exploring God's promises of healing through Scripture, testimonies, and practical faith steps.",
      price: "$12.99",
      rating: 4.6,
      icon: Cross,
      affiliate: true,
    },
    {
      id: "5",
      title: "Scripture Memory Card Set",
      category: "Faith Resources",
      description:
        "50 beautifully designed cards featuring key Bible verses for memorization, prayer, and daily encouragement.",
      price: "$7.99",
      rating: 4.8,
      icon: Layers,
      affiliate: false,
    },
    {
      id: "6",
      title: "Worship & Prayer Playlist Guide",
      category: "Faith Resources",
      description:
        "A curated guide of worship songs organized by prayer themes — healing, gratitude, surrender, and more.",
      price: "Free",
      rating: 4.5,
      icon: Music,
      affiliate: false,
    },
  ];

  const categories = ["All", "Prayer Journals", "Bibles", "Devotionals", "Faith Resources"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredResources =
    selectedCategory === "All"
      ? resources
      : resources.filter((r) => r.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 animate-gentle-fade">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-4">
            Prayer Resources
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Strengthen your faith journey with trusted resources
          </p>
        </div>

        {/* Recommendation Toggle */}
        <Card className="mb-8 animate-gentle-fade">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gift className="h-5 w-5 text-primary" />
                <div>
                  <Label className="text-base font-medium cursor-pointer">
                    Show Recommendations
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Display personalized resource suggestions
                  </p>
                </div>
              </div>
              <Switch
                checked={showRecommendations}
                onCheckedChange={setShowRecommendations}
              />
            </div>
          </CardContent>
        </Card>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 animate-gentle-fade">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "peaceful" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Resources Grid */}
        {showRecommendations && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredResources.map((resource, index) => (
              <Card
                key={resource.id}
                className="group hover:shadow-peaceful transition-all duration-300 animate-gentle-fade"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <resource.icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                    </div>
                    {resource.affiliate && (
                      <Badge variant="outline" className="text-xs">
                        Affiliate
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="font-playfair text-lg group-hover:text-primary transition-colors">
                    {resource.title}
                  </CardTitle>
                  <Badge variant="secondary">{resource.category}</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {resource.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-accent fill-current" />
                      <span className="text-sm font-medium">
                        {resource.rating}
                      </span>
                    </div>
                    <span className="font-semibold text-primary">
                      {resource.price}
                    </span>
                  </div>

                  <Button variant="peaceful" className="w-full gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    {resource.price === "Free" ? "Download Free" : "View Resource"}
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <Card className="bg-primary/5 border-primary/20 animate-gentle-fade">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Heart className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong className="text-foreground">About Our Resources:</strong>{" "}
                  All resources are carefully curated to support your faith
                  journey. Some links are affiliate links, which means we may
                  earn a small commission at no extra cost to you. This helps
                  support the PrayerForward mission.
                </p>
                <p>
                  Your prayer experience is always 100% free. Resources are
                  entirely optional and never required.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Resources;
