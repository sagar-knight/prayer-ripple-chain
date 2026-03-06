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
    toast({ title: "Prayer request added 🙏" });
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

      {/* Active requests */}
      {active.length > 0 && (
        <div className="space-y-3">
          {active.map((req) => (
            <Card key={req.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-foreground">{req.title}</h3>
                      <Badge variant="secondary" className="text-xs">Active</Badge>
                      {req.reminderEnabled && (
                        <Bell className="h-3 w-3 text-primary" />
                      )}
                    </div>
                    {req.description && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{req.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span>Requested by {req.createdBy}</span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" /> Prayed {req.prayedCount} times
                      </span>
                      {req.lastPrayedAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Last: {new Date(req.lastPrayedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="peaceful"
                      size="sm"
                      className="gap-1 text-xs"
                      onClick={() => onPray(req.id)}
                    >
                      <CheckCircle className="h-3 w-3" /> I Prayed
                    </Button>
                    {req.createdBy === currentUser && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => onMarkAnswered(req.id)}
                      >
                        Answered
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Answered */}
      {answered.length > 0 && (
        <div className="space-y-2 mt-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Answered Prayers
          </p>
          {answered.map((req) => (
            <Card key={req.id} className="opacity-75">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-medium text-foreground text-sm">{req.title}</span>
                  <Badge className="bg-primary/10 text-primary text-xs ml-auto">Answered</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 ml-6">
                  Prayed {req.prayedCount} times · Requested by {req.createdBy}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {requests.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center">
            <Heart className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
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
