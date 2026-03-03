import { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Waves, Heart, Users, Share2, ChevronRight, ArrowLeft, Calendar } from "lucide-react";

interface PrayerChain {
  id: string;
  title: string;
  description?: string;
  status: "Active" | "Answered";
  startDate: string;
  prayedCount: number;
  uniquePeople: number;
  forwardCount: number;
  recentActivity: { type: "prayed" | "shared"; date: string; count?: number }[];
}

const mockChains: PrayerChain[] = [
  {
    id: "1",
    title: "Healing Prayer",
    description:
      "Praying for complete healing and recovery. God is faithful and His timing is perfect.",
    status: "Active",
    startDate: "2025-01-15",
    prayedCount: 42,
    uniquePeople: 15,
    forwardCount: 7,
    recentActivity: [
      { type: "prayed", date: "2025-03-01", count: 3 },
      { type: "shared", date: "2025-02-28", count: 1 },
      { type: "prayed", date: "2025-02-25", count: 5 },
      { type: "shared", date: "2025-02-20", count: 2 },
    ],
  },
  {
    id: "2",
    title: "Family Restoration",
    description:
      "Lifting up a family going through a difficult season. Praying for reconciliation and peace.",
    status: "Active",
    startDate: "2025-02-01",
    prayedCount: 68,
    uniquePeople: 32,
    forwardCount: 12,
    recentActivity: [
      { type: "prayed", date: "2025-03-02", count: 7 },
      { type: "shared", date: "2025-03-01", count: 3 },
      { type: "prayed", date: "2025-02-27", count: 4 },
    ],
  },
  {
    id: "3",
    title: "Community Outreach",
    description:
      "Praying for the upcoming community event and that hearts would be open to receive God's love.",
    status: "Answered",
    startDate: "2024-12-10",
    prayedCount: 25,
    uniquePeople: 18,
    forwardCount: 4,
    recentActivity: [
      { type: "prayed", date: "2025-02-10", count: 2 },
      { type: "shared", date: "2025-01-28", count: 1 },
    ],
  },
];

const PrayerChainsDetail = () => {
  const [selectedChain, setSelectedChain] = useState<PrayerChain | null>(null);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <Dialog onOpenChange={() => setSelectedChain(null)}>
      <DialogTrigger asChild>
        <Button
          variant="link"
          className="text-xs text-primary/70 hover:text-primary p-0 h-auto mt-1"
        >
          View chains
          <ChevronRight className="h-3 w-3 ml-0.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        {!selectedChain ? (
          /* Chain List View */
          <>
            <DialogHeader>
              <DialogTitle className="font-playfair text-xl flex items-center gap-2">
                <Waves className="h-5 w-5 text-primary opacity-80" />
                Your Prayer Chains
              </DialogTitle>
            </DialogHeader>

            <p className="text-sm text-muted-foreground leading-relaxed">
              This shows how many people prayed for each request you shared and how often it was
              passed forward.
            </p>

            <Separator className="my-2" />

            <div className="space-y-3">
              {mockChains.map((chain) => (
                <Card key={chain.id} className="border-primary/10 shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium text-foreground">{chain.title}</h4>
                      <Badge
                        variant={chain.status === "Active" ? "secondary" : "outline"}
                        className="text-[10px] shrink-0"
                      >
                        {chain.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-primary/5 rounded-md p-2 text-center">
                        <p className="text-sm font-semibold text-foreground">{chain.prayedCount}</p>
                        <p className="text-[10px] text-muted-foreground">times prayed</p>
                      </div>
                      <div className="bg-primary/5 rounded-md p-2 text-center">
                        <p className="text-sm font-semibold text-foreground">
                          {chain.uniquePeople}
                        </p>
                        <p className="text-[10px] text-muted-foreground">people prayed</p>
                      </div>
                      <div className="bg-primary/5 rounded-md p-2 text-center">
                        <p className="text-sm font-semibold text-foreground">
                          {chain.forwardCount}
                        </p>
                        <p className="text-[10px] text-muted-foreground">passed forward</p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => setSelectedChain(chain)}
                    >
                      View details
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          /* Chain Detail View */
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => setSelectedChain(null)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <DialogTitle className="font-playfair text-lg">{selectedChain.title}</DialogTitle>
              </div>
            </DialogHeader>

            <Badge
              variant={selectedChain.status === "Active" ? "secondary" : "outline"}
              className="text-xs w-fit"
            >
              {selectedChain.status}
            </Badge>

            {selectedChain.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {selectedChain.description}
              </p>
            )}

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Started {formatDate(selectedChain.startDate)}
            </div>

            <Separator />

            {/* Ripple Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-primary/5 rounded-lg p-3 text-center space-y-1">
                <Heart className="h-4 w-4 text-primary/60 mx-auto" />
                <p className="text-lg font-semibold text-foreground">
                  {selectedChain.prayedCount}
                </p>
                <p className="text-[10px] text-muted-foreground">times prayed</p>
              </div>
              <div className="bg-primary/5 rounded-lg p-3 text-center space-y-1">
                <Users className="h-4 w-4 text-primary/60 mx-auto" />
                <p className="text-lg font-semibold text-foreground">
                  {selectedChain.uniquePeople}
                </p>
                <p className="text-[10px] text-muted-foreground">people prayed</p>
              </div>
              <div className="bg-primary/5 rounded-lg p-3 text-center space-y-1">
                <Share2 className="h-4 w-4 text-primary/60 mx-auto" />
                <p className="text-lg font-semibold text-foreground">
                  {selectedChain.forwardCount}
                </p>
                <p className="text-[10px] text-muted-foreground">passed forward</p>
              </div>
            </div>

            <Separator />

            {/* Activity Timeline */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Recent Activity</h4>
              <div className="space-y-2">
                {selectedChain.recentActivity.map((activity, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-xs text-muted-foreground py-1.5 border-l-2 border-primary/10 pl-3"
                  >
                    {activity.type === "prayed" ? (
                      <Heart className="h-3 w-3 text-primary/50 shrink-0" />
                    ) : (
                      <Share2 className="h-3 w-3 text-primary/50 shrink-0" />
                    )}
                    <span>
                      {activity.type === "prayed"
                        ? `${activity.count} ${activity.count === 1 ? "person" : "people"} prayed`
                        : `Passed forward ${activity.count} ${activity.count === 1 ? "time" : "times"}`}
                    </span>
                    <span className="ml-auto text-muted-foreground/60">
                      {formatDate(activity.date)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PrayerChainsDetail;
