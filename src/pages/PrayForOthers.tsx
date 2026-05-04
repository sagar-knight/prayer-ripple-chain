import { useState, useEffect, useCallback } from "react";
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
import { Users, Search, Filter, Heart, ArrowLeft, Loader2 } from "lucide-react";
import PrayerCard from "@/components/PrayerCard";
import PrayFocusSelector, {
  PrayerFocusMode,
} from "@/components/PrayFocusSelector";
import PrayerSession from "@/components/PrayerSession";
import { usePrayerService, BackendPrayer } from "@/hooks/usePrayerService";
import { ScoredPrayerRequest } from "@/lib/prayerScoring";

type ViewMode = "selector" | "session" | "browse";

/** Convert a BackendPrayer to the ScoredPrayerRequest shape used by PrayerCard / PrayerSession */
function toScoredRequest(p: BackendPrayer): ScoredPrayerRequest {
  const createdAt = new Date(p.created_at);
  const lastPrayedAt = p.last_prayed_at ? new Date(p.last_prayed_at) : null;
  const ageMs = Date.now() - createdAt.getTime();
  const hours = Math.floor(ageMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const timeAgo =
    days > 0 ? `${days} day${days > 1 ? "s" : ""} ago` : `${Math.max(1, hours)} hour${hours !== 1 ? "s" : ""} ago`;

  return {
    id: p.prayer_id,
    title: p.title,
    description: p.description,
    category: p.category,
    isAnonymous: p.anonymous,
    location: p.show_country && p.country ? p.country : undefined,
    timeAgo,
    prayerCount: p.prayer_count,
    createdAt,
    lastPrayedAt,
    assignedTargetCount: p.target_prayers,
    assignedPrayedCount: p.prayer_count,
    assignmentStatus: p.prayer_count >= p.target_prayers ? "completed" : "pending",
    status: p.status === "open" ? "open" : "closed",
    country: p.country ?? undefined,
    interestCategories: [p.category],
    visibility: "public",
  };
}

const PrayForOthers = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("selector");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Session state
  const [sessionMode, setSessionMode] = useState<PrayerFocusMode>("needs_most");
  const [sessionTarget, setSessionTarget] = useState(1);

  // Browse state
  const [browseRequests, setBrowseRequests] = useState<ScoredPrayerRequest[]>([]);
  const [browseLoading, setBrowseLoading] = useState(false);

  const { fetchNextPrayer, recordPrayed, rescueCount, loading } = usePrayerService();

  // Load browse requests
  const loadBrowseRequests = useCallback(async () => {
    setBrowseLoading(true);
    const results: ScoredPrayerRequest[] = [];
    const excludeIds: string[] = [];

    // Fetch up to 20 requests for browsing
    for (let i = 0; i < 20; i++) {
      const prayer = await fetchNextPrayer("needs_most", excludeIds);
      if (!prayer) break;
      results.push(toScoredRequest(prayer));
      excludeIds.push(prayer.prayer_id);
    }

    setBrowseRequests(results);
    setBrowseLoading(false);
  }, [fetchNextPrayer]);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "health", label: "Health" },
    { value: "family", label: "Family" },
    { value: "work", label: "Work" },
    { value: "peace", label: "Peace" },
    { value: "faith", label: "Faith" },
    { value: "strength", label: "Strength" },
    { value: "general", label: "General" },
    { value: "other", label: "Other" },
  ];

  const filteredRequests = browseRequests.filter((request) => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      request.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePrayerOffered = (requestId: string) => {
    recordPrayed(requestId);
  };

  const handleStartPraying = (mode: PrayerFocusMode, count: number) => {
    setSessionMode(mode);
    setSessionTarget(count);
    setViewMode("session");
  };

  const handleSessionComplete = () => {
    navigate("/");
  };

  // ── SELECTOR VIEW ──
  if (viewMode === "selector") {
    return (
      <div className="min-h-screen bg-aurora py-12 pb-24">
        <div className="page-container">
          <PrayFocusSelector
            rescueCount={rescueCount}
            onStartPraying={handleStartPraying}
            onBrowseAdvanced={() => {
              setViewMode("browse");
              loadBrowseRequests();
            }}
          />
        </div>
      </div>
    );
  }

  // ── SESSION VIEW (one-at-a-time from backend) ──
  if (viewMode === "session") {
    return (
      <div className="min-h-screen bg-aurora py-12 pb-24">
        <div className="page-container">
          <PrayerSession
            mode={sessionMode}
            targetCount={sessionTarget}
            onComplete={handleSessionComplete}
            onBack={() => setViewMode("selector")}
          />
        </div>
      </div>
    );
  }

  // ── BROWSE VIEW (advanced) ──
  return (
    <div className="min-h-screen bg-aurora py-12 pb-24">
      <div className="page-container-wide section-gap">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => setViewMode("selector")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="font-playfair text-2xl font-bold text-foreground">
            Browse Prayer Requests
          </h1>
        </div>

        {/* Filters */}
        <Card className="animate-gentle-fade">
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
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

        {/* Results */}
        {browseLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Finding prayer requests...</span>
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="max-w-xl mx-auto card-gap">
            {filteredRequests.map((request, index) => (
              <div
                key={request.id}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <PrayerCard
                  request={request}
                  onPrayerOffered={handlePrayerOffered}
                  showImpactDialog
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
                {browseRequests.length === 0
                  ? "Be the first to share a prayer request."
                  : "Try adjusting your search or category filter."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PrayForOthers;
