import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  Plus,
  Heart,
  BookOpen,
  StickyNote,
  Bell,
  UserPlus,
  Home,
  Copy,
  Check,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import FamilyPrayerRequests, { type FamilyGroupPrayerRequest } from "@/components/family/FamilyPrayerRequests";
import FamilyScriptures, { type SharedScripture } from "@/components/family/FamilyScriptures";
import FamilyReminders from "@/components/family/FamilyReminders";
import FamilyNotes, { type FamilyTestimony } from "@/components/family/FamilyNotes";

interface FamilyGroup {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
  members: FamilyMember[];
}

interface FamilyMember {
  id: string;
  name: string;
  role: "admin" | "member";
  status: "active" | "pending";
}

const generateCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

const Organizations = () => {
  const [groups, setGroups] = useLocalStorage<FamilyGroup[]>("pf-family-groups", []);
  const [activeGroupId, setActiveGroupId] = useLocalStorage<string | null>("pf-active-family-group", null);
  const [requests, setRequests] = useLocalStorage<FamilyGroupPrayerRequest[]>("pf-fg-requests", []);
  const [scriptures, setScriptures] = useLocalStorage<SharedScripture[]>("pf-fg-scriptures", []);
  const [notes, setNotes] = useLocalStorage<FamilyTestimony[]>("pf-fg-notes", []);
  const [prayedDays, setPrayedDays] = useLocalStorage<Record<string, string[]>>("pf-fg-prayed-days", {});

  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [newName, setNewName] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const currentUser = "You";
  const activeGroup = groups.find((g) => g.id === activeGroupId) || null;
  const groupRequests = requests.filter((r) => (r as any).groupId === activeGroupId);
  const groupScriptures = scriptures.filter((s) => (s as any).groupId === activeGroupId);
  const groupNotes = notes.filter((n) => (n as any).groupId === activeGroupId);

  const handleCreateGroup = () => {
    if (!newName.trim()) {
      toast({ title: "Please enter a family name", variant: "destructive" });
      return;
    }
    const group: FamilyGroup = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      inviteCode: generateCode(),
      createdAt: new Date().toISOString(),
      members: [{ id: crypto.randomUUID(), name: currentUser, role: "admin", status: "active" }],
    };
    setGroups((prev) => [...prev, group]);
    setActiveGroupId(group.id);
    setNewName("");
    setShowCreate(false);
    toast({ title: `"${group.name}" created! 🏡` });
  };

  const handleInvite = () => {
    if (!inviteName.trim() || !activeGroup) return;
    const member: FamilyMember = {
      id: crypto.randomUUID(),
      name: inviteName.trim(),
      role: "member",
      status: "pending",
    };
    setGroups((prev) =>
      prev.map((g) =>
        g.id === activeGroupId ? { ...g, members: [...g.members, member] } : g
      )
    );
    setInviteName("");
    setShowInvite(false);
    toast({ title: `Invited ${member.name} to the family` });
  };

  const handleJoin = () => {
    const found = groups.find((g) => g.inviteCode === joinCode.trim());
    if (found) {
      setActiveGroupId(found.id);
      setJoinCode("");
      setShowJoin(false);
      toast({ title: `Joined "${found.name}"!` });
    } else {
      toast({ title: "Code not found", variant: "destructive" });
    }
  };

  const copyCode = () => {
    if (activeGroup) {
      navigator.clipboard.writeText(activeGroup.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  // If inside a group, show the dashboard
  if (activeGroup) {
    return (
      <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Group header */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="sm" onClick={() => setActiveGroupId(null)}>
              ← All Groups
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={copyCode}>
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied!" : activeGroup.inviteCode}
              </Button>
            </div>
          </div>

          <div className="text-center mb-8 animate-gentle-fade">
            <div className="w-14 h-14 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <Home className="h-7 w-7 text-primary" />
            </div>
            <h1 className="font-playfair text-2xl md:text-3xl font-bold text-foreground mb-1">
              {activeGroup.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {activeGroup.members.length} member{activeGroup.members.length !== 1 && "s"}
            </p>
          </div>

          {/* Members */}
          <Card className="mb-6">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Members</p>
                <Dialog open={showInvite} onOpenChange={setShowInvite}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-1 text-xs">
                      <UserPlus className="h-3 w-3" /> Invite
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle className="font-playfair">Invite Family Member</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <Label>Name</Label>
                        <Input placeholder="e.g. Mom, Dad, Sarah" value={inviteName} onChange={(e) => setInviteName(e.target.value)} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Share your invite code <strong>{activeGroup.inviteCode}</strong> with them.
                      </p>
                      <Button onClick={handleInvite} className="w-full" variant="peaceful" disabled={!inviteName.trim()}>
                        Add to Family
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeGroup.members.map((m) => (
                  <Badge key={m.id} variant={m.status === "active" ? "default" : "secondary"} className="gap-1 text-xs">
                    {m.name}
                    {m.role === "admin" && <span className="opacity-60">· Admin</span>}
                    {m.status === "pending" && <span className="opacity-60">· Pending</span>}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="prayers" className="animate-gentle-fade">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="prayers" className="gap-1 text-xs">
                <Heart className="h-3 w-3" /> Prayers
              </TabsTrigger>
              <TabsTrigger value="scriptures" className="gap-1 text-xs">
                <BookOpen className="h-3 w-3" /> Scriptures
              </TabsTrigger>
              <TabsTrigger value="reminders" className="gap-1 text-xs">
                <Bell className="h-3 w-3" /> Reminders
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-1 text-xs">
                <StickyNote className="h-3 w-3" /> Notes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="prayers" className="mt-4">
              <FamilyPrayerRequests
                requests={groupRequests}
                currentUser={currentUser}
                onAddRequest={(req) => {
                  const newReq: FamilyGroupPrayerRequest & { groupId: string } = {
                    ...req,
                    id: crypto.randomUUID(),
                    prayedCount: 0,
                    whoPrayed: [],
                    createdAt: new Date().toISOString(),
                    lastPrayedAt: null,
                    groupId: activeGroupId!,
                  };
                  setRequests((prev) => [newReq as any, ...prev]);
                }}
                onPray={(id) => {
                  setRequests((prev) =>
                    prev.map((r) =>
                      r.id === id
                        ? { ...r, prayedCount: r.prayedCount + 1, lastPrayedAt: new Date().toISOString() }
                        : r
                    )
                  );
                  setPrayedDays((prev) => ({
                    ...prev,
                    [id]: [...(prev[id] || []).filter((d) => d !== today), today],
                  }));
                  toast({ title: "Prayer recorded", duration: 2000 });
                }}
                onMarkAnswered={(id) => {
                  setRequests((prev) =>
                    prev.map((r) => (r.id === id ? { ...r, status: "answered" as const } : r))
                  );
                  toast({ title: "Praise God! Prayer answered" });
                }}
              />
            </TabsContent>

            <TabsContent value="scriptures" className="mt-4">
              <FamilyScriptures
                scriptures={groupScriptures}
                currentUser={currentUser}
                onAdd={(s) => {
                  const newS = {
                    ...s,
                    id: crypto.randomUUID(),
                    createdAt: new Date().toISOString(),
                    groupId: activeGroupId!,
                  };
                  setScriptures((prev) => [newS as any, ...prev]);
                }}
              />
            </TabsContent>

            <TabsContent value="reminders" className="mt-4">
              <FamilyReminders
                requests={groupRequests}
                prayedDays={prayedDays}
                onToggleReminder={(id) => {
                  setRequests((prev) =>
                    prev.map((r) =>
                      r.id === id ? { ...r, reminderEnabled: !r.reminderEnabled } : r
                    )
                  );
                }}
                onMarkPrayed={(id) => {
                  setRequests((prev) =>
                    prev.map((r) =>
                      r.id === id
                        ? { ...r, prayedCount: r.prayedCount + 1, lastPrayedAt: new Date().toISOString() }
                        : r
                    )
                  );
                  setPrayedDays((prev) => ({
                    ...prev,
                    [id]: [...(prev[id] || []).filter((d) => d !== today), today],
                  }));
                  toast({ title: "Prayed today ✓", duration: 2000 });
                }}
              />
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <FamilyNotes
                notes={groupNotes}
                currentUser={currentUser}
                onAdd={(text, by) => {
                  const n = {
                    id: crypto.randomUUID(),
                    noteText: text,
                    createdBy: by,
                    createdAt: new Date().toISOString(),
                    groupId: activeGroupId!,
                  };
                  setNotes((prev) => [n as any, ...prev]);
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Landing: no group selected
  return (
    <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 animate-gentle-fade">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Home className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-3">
            Family Prayer Hub
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">
            Pray together, encourage one another, and grow in faith as a family.
          </p>
        </div>

        {/* CTAs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button variant="peaceful" size="lg" className="text-lg py-6 gap-2 shadow-peaceful">
                <Plus className="h-5 w-5" /> Create Family Group
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="font-playfair">Create Family Group</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label>Family name *</Label>
                  <Input placeholder="e.g. Johnson Family" value={newName} onChange={(e) => setNewName(e.target.value)} />
                </div>
                <Button onClick={handleCreateGroup} className="w-full" variant="peaceful" disabled={!newName.trim()}>
                  Create Family Group
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showJoin} onOpenChange={setShowJoin}>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg" className="text-lg py-6 gap-2">
                <UserPlus className="h-5 w-5" /> Join with Code
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="font-playfair">Join a Family Group</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label>Invite code</Label>
                  <Input
                    placeholder="e.g. A3B7K2"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  />
                </div>
                <Button onClick={handleJoin} className="w-full" variant="peaceful" disabled={!joinCode.trim()}>
                  Join Family
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Separator className="my-8 bg-primary/10" />

        {/* Existing groups */}
        {groups.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
              Your Family Groups
            </p>
            {groups.map((g) => (
              <Card
                key={g.id}
                className="cursor-pointer hover:shadow-peaceful transition-all animate-gentle-fade"
                onClick={() => setActiveGroupId(g.id)}
              >
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-playfair font-semibold text-foreground text-lg">{g.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {g.members.length} member{g.members.length !== 1 && "s"} · Created {new Date(g.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{g.inviteCode}</Badge>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <h3 className="font-playfair text-lg font-semibold text-foreground mb-2">
                No family groups yet
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Create a private prayer space for your family, or join an existing group with an invite code.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Encouragement */}
        <div className="text-center mt-10 animate-gentle-fade">
          <Separator className="max-w-24 mx-auto mb-6 bg-primary/20" />
          <p className="text-sm italic text-muted-foreground max-w-md mx-auto leading-relaxed">
            "For where two or three gather in my name, there am I with them." — Matthew 18:20
          </p>
        </div>
      </div>
    </div>
  );
};

export default Organizations;
