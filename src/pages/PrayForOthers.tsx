import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Search, Filter, Heart, ArrowLeft } from "lucide-react";
import PrayerCard from "@/components/PrayerCard";
import PrayFocusSelector, {
  PrayerFocusMode,
} from "@/components/PrayFocusSelector";
import PrayerSession from "@/components/PrayerSession";
import { ScoredPrayerRequest, isRescueCandidate } from "@/lib/prayerScoring";

type ViewMode = "selector" | "session" | "browse";

const PrayForOthers = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("selector");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [prayerStats, setPrayerStats] = useState({ offered: 12, streak: 5 });

  const [sessionMode, setSessionMode] = useState<PrayerFocusMode>("needs_most");
  const [sessionTarget, setSessionTarget] = useState(1);
  const [browsePage, setBrowsePage] = useState(1);
  const BROWSE_PAGE_SIZE = 10;

  const prayerRequests: ScoredPrayerRequest[] = [
    {
      id: "1", title: "Healing for my grandmother",
      description: "My grandmother was recently diagnosed with cancer. Please pray for her healing, strength during treatment, and peace for our family during this difficult time.",
      category: "Health & Healing", isAnonymous: false, location: "Texas, USA", timeAgo: "2 hours ago", churchName: "Grace Community Church",
      prayerCount: 3, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), lastPrayedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      assignedTargetCount: 3, assignedPrayedCount: 2, assignmentStatus: "pending", status: "open", country: "USA",
      interestCategories: ["Health & Healing"], visibility: "public",
    },
    {
      id: "2", title: "Guidance in job search",
      description: "I've been unemployed for 3 months and struggling to find work. Please pray for God's guidance in my job search and provision for my family's needs.",
      category: "Financial Needs", isAnonymous: true, timeAgo: "5 hours ago",
      prayerCount: 1, createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), lastPrayedAt: null,
      assignedTargetCount: 3, assignedPrayedCount: 0, assignmentStatus: "pending", status: "open", country: "USA",
      interestCategories: ["Financial Needs"], visibility: "public",
    },
    {
      id: "3", title: "Marriage restoration",
      description: "My spouse and I are going through a very difficult time. Please pray for healing in our relationship and wisdom as we work through our challenges.",
      category: "Family & Relationships", isAnonymous: true, location: "California, USA", timeAgo: "1 day ago",
      prayerCount: 7, createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), lastPrayedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      assignedTargetCount: 3, assignedPrayedCount: 3, assignmentStatus: "completed", status: "open", country: "USA",
      interestCategories: ["Family & Relationships"], visibility: "public",
    },
    {
      id: "4", title: "Thanksgiving for answered prayers",
      description: "I want to thank everyone who prayed for my surgery recovery. The doctors say everything went perfectly and I'm healing faster than expected. God is good!",
      category: "Thanksgiving & Praise", isAnonymous: false, timeAgo: "2 days ago", churchName: "Living Hope Fellowship",
      prayerCount: 47, createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), lastPrayedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      assignedTargetCount: 3, assignedPrayedCount: 3, assignmentStatus: "completed", status: "open", country: "USA",
      interestCategories: ["Thanksgiving & Praise"], visibility: "public",
    },
    {
      id: "5", title: "Peace during anxiety",
      description: "I have been dealing with severe anxiety attacks. Please pray for God's peace to fill my heart and mind during these difficult moments.",
      category: "Comfort & Peace", isAnonymous: true, timeAgo: "3 hours ago",
      prayerCount: 0, createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), lastPrayedAt: null,
      assignedTargetCount: 3, assignedPrayedCount: 0, assignmentStatus: "pending", status: "open",
      interestCategories: ["Comfort & Peace"], visibility: "public",
    },
    {
      id: "6", title: "Wisdom for parenting",
      description: "My teenage daughter is struggling with peer pressure. I need wisdom and patience to guide her through this season.",
      category: "Family & Relationships", isAnonymous: false, location: "Georgia, USA", timeAgo: "4 days ago",
      prayerCount: 1, createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000), lastPrayedAt: new Date(Date.now() - 80 * 60 * 60 * 1000),
      assignedTargetCount: 3, assignedPrayedCount: 1, assignmentStatus: "pending", status: "open", country: "USA",
      interestCategories: ["Family & Relationships"], visibility: "public",
    },
  ];

  const rescueCount = prayerRequests.filter(isRescueCandidate).length;

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "health-healing", label: "Health & Healing" },
    { value: "family-relationships", label: "Family & Relationships" },
    { value: "financial-needs", label: "Financial Needs" },
    { value: "guidance-wisdom", label: "Guidance & Wisdom" },
    { value: "comfort-peace", label: "Comfort & Peace" },
    { value: "thanksgiving-praise", label: "Thanksgiving & Praise" },
    { value: "other", label: "Other" },
  ];

  const filteredRequests = prayerRequests.filter((request) => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      request.category.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "") === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const paginatedRequests = useMemo(() => {
    const start = (browsePage - 1) * BROWSE_PAGE_SIZE;
    return filteredRequests.slice(start, start + BROWSE_PAGE_SIZE);
  }, [filteredRequests, browsePage]);

  const totalBrowsePages = Math.ceil(filteredRequests.length / BROWSE_PAGE_SIZE);

  const handlePrayerOffered = (requestId: string) => {
    setPrayerStats((prev) => ({ offered: prev.offered + 1, streak: prev.streak + 1 }));
  };

  const handleStartPraying = (mode: PrayerFocusMode, count: number) => {
    setSessionMode(mode);
    setSessionTarget(count);
    setViewMode("session");
  };

  const handleSessionComplete = () => {
    navigate("/");
  };

  if (viewMode === "selector") {
    return (
      <div className="min-h-screen bg-background py-12 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="mb-8 bg-foreground text-background border-none max-w-lg mx-auto">
            <CardContent className="pt-4 pb-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-semibold">{prayerStats.offered}</div>
                  <div className="text-xs opacity-80">Prayers Offered</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold">{prayerStats.streak}</div>
                  <div className="text-xs opacity-80">Day Streak</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <PrayFocusSelector
            rescueCount={rescueCount}
            onStartPraying={handleStartPraying}
            onBrowseAdvanced={() => setViewMode("browse")}
          />
        </div>
      </div>
    );
  }

  if (viewMode === "session") {
    return (
      <div className="min-h-screen bg-background py-12 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PrayerSession
            mode={sessionMode}
            targetCount={sessionTarget}
            requests={prayerRequests}
            onComplete={handleSessionComplete}
            onBack={() => setViewMode("selector")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => setViewMode("selector")}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold text-foreground">Browse Prayer Requests</h1>
        </div>

        <Card className="mb-8 border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search prayer requests..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setBrowsePage(1); }}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={(val) => { setSelectedCategory(val); setBrowsePage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {paginatedRequests.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedRequests.map((request) => (
                <div key={request.id}>
                  <PrayerCard request={request} onPrayerOffered={handlePrayerOffered} />
                </div>
              ))}
            </div>

            {totalBrowsePages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button variant="outline" size="sm" disabled={browsePage <= 1} onClick={() => setBrowsePage((p) => p - 1)}>Previous</Button>
                <span className="text-sm text-muted-foreground px-3">Page {browsePage} of {totalBrowsePages}</span>
                <Button variant="outline" size="sm" disabled={browsePage >= totalBrowsePages} onClick={() => setBrowsePage((p) => p + 1)}>Next</Button>
              </div>
            )}
          </>
        ) : (
          <Card className="text-center py-12 border border-border">
            <CardContent>
              <Heart className="h-14 w-14 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No prayer requests found</h3>
              <p className="text-muted-foreground text-sm">Try adjusting your search or category filter.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PrayForOthers;
