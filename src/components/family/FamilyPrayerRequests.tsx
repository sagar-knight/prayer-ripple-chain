import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, CheckCircle, Heart, Bell, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PrayerRequestCard from "@/components/PrayerRequestCard";
import ReportButton from "@/components/ReportButton";

export interface FamilyGroupPrayerRequest {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  status: "active" | "answered";
  prayedCount: number;
  whoPrayed: string[];
  reminderEnabled: boolean;
  createdAt: string;
  lastPrayedAt: string | null;
}

interface Props {
  requests: FamilyGroupPrayerRequest[];
  onAddRequest: (req: Omit<FamilyGroupPrayerRequest, "id" | "prayedCount" | "whoPrayed" | "createdAt" | "lastPrayedAt">) => void;
  onPray: (id: string) => void;
  onMarkAnswered: (id: string) => void;
  currentUser: string;
}

const FamilyPrayerRequests = ({ requests, onAddRequest, onPray, onMarkAnswered, currentUser }: Props) => {
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const handleAdd = () => {
    if (!title.trim()) {
      toast({ title: "Please enter a title", variant: "destructive" });
      return;
    }
    onAddRequest({
      title: title.trim(),
      description: description.trim(),
      createdBy: currentUser,
      status: "active",
      reminderEnabled: false,
    });
    setTitle("");
    setDescription("");
    setShowAdd(false);
    toast({ title: "Prayer request added" });
  };

  const active = requests.filter((r) => r.status === "active");
  const answered = requests.filter((r) => r.status === "answered");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Share prayer needs within your family. Only members can see these requests.
        </p>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button variant="peaceful" size="sm" className="gap-1 shrink-0">
              <Plus className="h-4 w-4" /> Add Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-playfair">New Family Prayer Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Prayer request *</Label>
                <Input
                  placeholder="What would you like prayer for?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Details (optional)</Label>
                <Textarea
                  placeholder="Share more details with your family..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Button onClick={handleAdd} className="w-full" variant="peaceful">
                Add Prayer Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active requests as calm cards */}
      {active.length > 0 && (
        <div className="space-y-5">
          {active.map((req) => (
            <PrayerRequestCard
              key={req.id}
              header="A family member asked for prayer"
              description={req.description || req.title}
              prayerCount={req.prayedCount}
              subtitle={
                <>
                  <span>Requested by {req.createdBy}</span>
                  {req.reminderEnabled && (
                    <span className="flex items-center gap-1">
                      <Bell className="h-3 w-3 text-primary" /> Reminder set
                    </span>
                  )}
                  {req.lastPrayedAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Last: {new Date(req.lastPrayedAt).toLocaleDateString()}
                    </span>
                  )}
                </>
              }
              actions={
                <>
                  <Button
                    variant="peaceful"
                    size="lg"
                    className="gap-2 w-full sm:w-auto min-w-[160px]"
                    onClick={() => onPray(req.id)}
                  >
                    I Prayed
                  </Button>
                  {req.createdBy === currentUser && (
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto"
                      onClick={() => onMarkAnswered(req.id)}
                    >
                      Mark as Answered
                    </Button>
                  )}
                </>
              }
            >
              <div className="flex justify-end">
                <ReportButton entityId={req.id} entityType="family_prayer" />
              </div>
            </PrayerRequestCard>
          ))}
        </div>
      )}

      {/* Answered */}
      {answered.length > 0 && (
        <div className="space-y-4 mt-8">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/70 font-medium text-center">
            Answered Prayers
          </p>
          {answered.map((req) => (
            <PrayerRequestCard
              key={req.id}
              header="God answered this prayer"
              description={req.description || req.title}
              prayerCount={req.prayedCount}
              className="opacity-80"
              subtitle={<span>Requested by {req.createdBy}</span>}
            />
          ))}
        </div>
      )}

      {requests.length === 0 && (
        <Card className="rounded-xl border-primary/10">
          <CardContent className="py-10 text-center">
            <Heart className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">
              No prayer requests yet. Share your first need with the family.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FamilyPrayerRequests;
