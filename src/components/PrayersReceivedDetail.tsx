import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Clock, ChevronRight, Heart, Share2, ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface PrayerReceived {
  id: string;
  title: string;
  category?: string;
  status: "Active" | "Answered";
  prayedForCount: number;
  peoplePrayed: number;
  passedForward: number;
  lastPrayedDate: string;
}

const mockPrayersReceived: PrayerReceived[] = [
  {
    id: "1",
    title: "Healing for my mother",
    category: "Health",
    status: "Active",
    prayedForCount: 4,
    peoplePrayed: 3,
    passedForward: 2,
    lastPrayedDate: "2026-03-02",
  },
  {
    id: "2",
    title: "Guidance in career change",
    category: "Work",
    status: "Active",
    prayedForCount: 3,
    peoplePrayed: 3,
    passedForward: 1,
    lastPrayedDate: "2026-02-28",
  },
  {
    id: "3",
    title: "Restoration of a friendship",
    category: "Relationships",
    status: "Answered",
    prayedForCount: 5,
    peoplePrayed: 4,
    passedForward: 3,
    lastPrayedDate: "2026-02-20",
  },
];

type SortOption = "most-prayed" | "most-recent" | "active-first";

const PrayersReceivedDetail = () => {
  const [sort, setSort] = useState<SortOption>("most-prayed");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerReceived | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(mockPrayersReceived.map((p) => p.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, []);

  const filtered = useMemo(() => {
    let list = [...mockPrayersReceived];
    if (statusFilter !== "all") {
      list = list.filter((p) => p.status === statusFilter);
    }
    switch (sort) {
      case "most-prayed":
        list.sort((a, b) => b.prayedForCount - a.prayedForCount);
        break;
      case "most-recent":
        list.sort((a, b) => new Date(b.lastPrayedDate).getTime() - new Date(a.lastPrayedDate).getTime());
        break;
      case "active-first":
        list.sort((a, b) => (a.status === "Active" ? -1 : 1) - (b.status === "Active" ? -1 : 1));
        break;
    }
    return list;
  }, [sort, statusFilter]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <Dialog onOpenChange={() => setSelectedPrayer(null)}>
      <DialogTrigger asChild>
        <Button variant="link" className="text-xs text-primary/70 hover:text-primary p-0 h-auto mt-1">
          View details
          <ChevronRight className="h-3 w-3 ml-0.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        {selectedPrayer ? (
          /* Per-request detail view */
          <>
            <DialogHeader>
              <DialogTitle className="font-playfair text-xl flex items-center gap-2">
                <Users className="h-5 w-5 text-primary opacity-80" />
                Request Ripple
              </DialogTitle>
            </DialogHeader>

            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground -mt-2 mb-1 p-0 h-auto"
              onClick={() => setSelectedPrayer(null)}
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              Back to list
            </Button>

            <Card className="border-primary/10">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-medium text-foreground">{selectedPrayer.title}</h4>
                  <Badge variant={selectedPrayer.status === "Active" ? "default" : "secondary"} className="text-[10px] shrink-0">
                    {selectedPrayer.status}
                  </Badge>
                </div>

                {selectedPrayer.category && (
                  <Badge variant="secondary" className="text-[10px]">{selectedPrayer.category}</Badge>
                )}

                <Separator />

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-primary/5 rounded-lg p-3 text-center">
                    <p className="text-lg font-semibold text-foreground">{selectedPrayer.prayedForCount}</p>
                    <p className="text-[10px] text-muted-foreground">times prayed</p>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-3 text-center">
                    <p className="text-lg font-semibold text-foreground">{selectedPrayer.peoplePrayed}</p>
                    <p className="text-[10px] text-muted-foreground">people prayed</p>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-3 text-center">
                    <p className="text-lg font-semibold text-foreground">{selectedPrayer.passedForward}</p>
                    <p className="text-[10px] text-muted-foreground">passed forward</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground/70 italic">
                  Last prayed: {formatDate(selectedPrayer.lastPrayedDate)}
                </p>

                {/* Calm activity timeline */}
                <div className="space-y-2 mt-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent Activity</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Heart className="h-3 w-3 text-primary/50 shrink-0" />
                      <span>Someone prayed for this request — {formatDate(selectedPrayer.lastPrayedDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Share2 className="h-3 w-3 text-primary/50 shrink-0" />
                      <span>Passed forward {selectedPrayer.passedForward} times</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <p className="text-[10px] text-muted-foreground/60 text-center italic mt-1">
              Identities are kept private. Only counts are shown.
            </p>
          </>
        ) : (
          /* Main list view */
          <>
            <DialogHeader>
              <DialogTitle className="font-playfair text-xl flex items-center gap-2">
                <Users className="h-5 w-5 text-primary opacity-80" />
                Prayers You Received
              </DialogTitle>
            </DialogHeader>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Prayers Received counts how many times people tapped "I prayed" for your prayer requests.
            </p>

            <Separator className="my-2" />

            {/* Sort & Filter */}
            <div className="flex gap-2 flex-wrap">
              <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
                <SelectTrigger className="w-[150px] h-8 text-xs">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="most-prayed">Most prayed</SelectItem>
                  <SelectItem value="most-recent">Most recent</SelectItem>
                  <SelectItem value="active-first">Active first</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Answered">Answered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* List */}
            <div className="space-y-3 mt-2">
              {filtered.map((prayer) => (
                <Card key={prayer.id} className="border-primary/10 shadow-sm">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium text-foreground leading-snug">
                        {prayer.title}
                      </h4>
                      <Badge
                        variant={prayer.status === "Active" ? "default" : "secondary"}
                        className="text-[10px] shrink-0"
                      >
                        {prayer.status}
                      </Badge>
                    </div>

                    {prayer.category && (
                      <Badge variant="secondary" className="text-[10px]">{prayer.category}</Badge>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-primary/60" />
                        Prayed for: {prayer.prayedForCount} times
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        People prayed: {prayer.peoplePrayed}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last: {formatDate(prayer.lastPrayedDate)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[10px] text-primary/70 hover:text-primary p-0 h-auto"
                        onClick={() => setSelectedPrayer(prayer)}
                      >
                        View request ripple
                        <ChevronRight className="h-3 w-3 ml-0.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No prayers found for this filter.
                </p>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PrayersReceivedDetail;
