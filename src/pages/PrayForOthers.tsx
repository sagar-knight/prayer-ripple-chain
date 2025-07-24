import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, Filter, Heart } from "lucide-react";
import PrayerCard from "@/components/PrayerCard";

const PrayForOthers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [prayerStats, setPrayerStats] = useState({ offered: 12, streak: 5 });

  // Mock prayer requests data
  const prayerRequests = [
    {
      id: "1",
      title: "Healing for my grandmother",
      description: "My grandmother was recently diagnosed with cancer. Please pray for her healing, strength during treatment, and peace for our family during this difficult time.",
      category: "Health & Healing",
      isAnonymous: false,
      location: "Texas, USA",
      timeAgo: "2 hours ago",
      churchName: "Grace Community Church",
      prayerCount: 23
    },
    {
      id: "2", 
      title: "Guidance in job search",
      description: "I've been unemployed for 3 months and struggling to find work. Please pray for God's guidance in my job search and provision for my family's needs.",
      category: "Financial Needs",
      isAnonymous: true,
      timeAgo: "5 hours ago",
      prayerCount: 15
    },
    {
      id: "3",
      title: "Marriage restoration",
      description: "My spouse and I are going through a very difficult time. Please pray for healing in our relationship and wisdom as we work through our challenges.",
      category: "Family & Relationships", 
      isAnonymous: true,
      location: "California, USA",
      timeAgo: "1 day ago",
      prayerCount: 31
    },
    {
      id: "4",
      title: "Thanksgiving for answered prayers",
      description: "I want to thank everyone who prayed for my surgery recovery. The doctors say everything went perfectly and I'm healing faster than expected. God is good!",
      category: "Thanksgiving & Praise",
      isAnonymous: false,
      timeAgo: "2 days ago",
      churchName: "Living Hope Fellowship",
      prayerCount: 47
    }
  ];

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "health-healing", label: "Health & Healing" },
    { value: "family-relationships", label: "Family & Relationships" },
    { value: "financial-needs", label: "Financial Needs" },
    { value: "guidance-wisdom", label: "Guidance & Wisdom" },
    { value: "comfort-peace", label: "Comfort & Peace" },
    { value: "thanksgiving-praise", label: "Thanksgiving & Praise" },
    { value: "other", label: "Other" }
  ];

  const filteredRequests = prayerRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
                           request.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePrayerOffered = (requestId: string) => {
    setPrayerStats(prev => ({
      offered: prev.offered + 1,
      streak: prev.streak + 1
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 animate-gentle-fade">
          <Users className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-4">
            Pray for Others
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join our community in lifting up prayer requests from around the world
          </p>
        </div>

        {/* Prayer Stats */}
        <Card className="mb-8 bg-gradient-warm text-accent-foreground animate-gentle-fade">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{prayerStats.offered}</div>
                <div className="text-sm opacity-90">Prayers Offered</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{prayerStats.streak}</div>
                <div className="text-sm opacity-90">Day Streak</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{filteredRequests.length}</div>
                <div className="text-sm opacity-90">Active Requests</div>
              </div>
              <div>
                <div className="text-2xl font-bold">∞</div>
                <div className="text-sm opacity-90">Impact</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-8 animate-gentle-fade">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Prayer Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search prayer requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Prayer Request Grid */}
        {filteredRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request, index) => (
              <div 
                key={request.id}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <PrayerCard 
                  request={request} 
                  onPrayerOffered={handlePrayerOffered}
                />
              </div>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12 animate-gentle-fade">
            <CardContent>
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No prayer requests found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search or category filter to find prayer requests to pray for.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Encouragement Section */}
        <Card className="mt-12 bg-primary/5 border-primary/20 animate-gentle-fade">
          <CardContent className="pt-6 text-center">
            <h3 className="font-playfair text-xl font-semibold text-primary mb-3">
              The Power of Prayer
            </h3>
            <p className="text-muted-foreground italic mb-4">
              "Therefore I tell you, whatever you ask for in prayer, believe that you have received it, and it will be yours." - Mark 11:24
            </p>
            <p className="text-sm text-muted-foreground">
              Every prayer you offer creates ripples of hope and healing in someone's life. Thank you for being part of this ministry.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrayForOthers;