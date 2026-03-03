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
import { Heart, Clock, Bell, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface PrayerOffered {
  id: string;
  title: string;
  category?: string;
  country?: string;
  prayedCount: number;
  lastPrayed: string;
  reminderEnabled?: boolean;
}

const mockPrayersOffered: PrayerOffered[] = [
  {
    id: "1",
    title: "Healing for Sarah's mother",
    category: "Health",
    country: "United States",
    prayedCount: 12,
    lastPrayed: "2025-03-01",
    reminderEnabled: true,
  },
  {
    id: "2",
    title: "Anonymous request",
    category: "Family",
    prayedCount: 9,
    lastPrayed: "2025-02-28",
  },
  {
    id: "3",
    title: "Job provision for Mark",
    category: "Work",
    country: "Canada",
    prayedCount: 8,
    lastPrayed: "2025-02-25",
    reminderEnabled: true,
  },
  {
    id: "4",
    title: "Peace in community",
    category: "Community",
    country: "United Kingdom",
    prayedCount: 7,
    lastPrayed: "2025-02-20",
  },
  {
    id: "5",
    title: "Strength during grief",
    category: "Personal",
    prayedCount: 6,
    lastPrayed: "2025-02-15",
  },
  {
    id: "6",
    title: "Anonymous request",
    category: "Health",
    country: "Nigeria",
    prayedCount: 5,
    lastPrayed: "2025-02-10",
  },
];

type SortOption = "most-prayed" | "most-recent" | "oldest";

const PrayersOfferedDetail = () => {
  const [sort, setSort] = useState<SortOption>("most-prayed");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const categories = useMemo(() => {
    const cats = new Set(mockPrayersOffered.map((p) => p.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, []);

  const filtered = useMemo(() => {
    let list = [...mockPrayersOffered];
    if (categoryFilter !== "all") {
      list = list.filter((p) => p.category === categoryFilter);
    }
    switch (sort) {
      case "most-prayed":
        list.sort((a, b) => b.prayedCount - a.prayedCount);
        break;
      case "most-recent":
        list.sort((a, b) => new Date(b.lastPrayed).getTime() - new Date(a.lastPrayed).getTime());
        break;
      case "oldest":
        list.sort((a, b) => new Date(a.lastPrayed).getTime() - new Date(b.lastPrayed).getTime());
        break;
    }
    return list;
  }, [sort, categoryFilter]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="link"
          className="text-xs text-primary/70 hover:text-primary p-0 h-auto mt-1"
        >
          View details
          <ChevronRight className="h-3 w-3 ml-0.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-playfair text-xl flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary opacity-80" />
            Prayers You Offered
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground leading-relaxed">
          Prayers Offered counts how many times you tapped "I prayed" for someone else's request.
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
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
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
                  {prayer.reminderEnabled && (
                    <Badge variant="outline" className="text-[10px] shrink-0 gap-1">
                      <Bell className="h-2.5 w-2.5" />
                      Reminder
                    </Badge>
                  )}
                </div>

                {prayer.category && (
                  <Badge variant="secondary" className="text-[10px]">
                    {prayer.category}
                  </Badge>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3 text-primary/60" />
                    You prayed: {prayer.prayedCount} times
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(prayer.lastPrayed)}
                  </span>
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
      </DialogContent>
    </Dialog>
  );
};

export default PrayersOfferedDetail;
