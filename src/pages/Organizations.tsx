import { useMemo, useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import FamilyPrayerRequests, { type FamilyGroupPrayerRequest } from "@/components/family/FamilyPrayerRequests";
import FamilyScriptures, { type SharedScripture } from "@/components/family/FamilyScriptures";
import FamilyReminders from "@/components/family/FamilyReminders";
import FamilyNotes, { type FamilyTestimony } from "@/components/family/FamilyNotes";
import { useAuth } from "@/hooks/useAuth";
import {
  useAddFamilyNote,
  useAddFamilyScripture,
  useAddFamilyRequest,
  useCreateFamilyGroup,
  useFamilyGroups,
  useFamilyMembers,
  useFamilyNotes,
  useFamilyPrayerLogs,
  useFamilyRequests,
  useFamilyScriptures,
  useJoinFamilyByCode,
  useLogFamilyPrayer,
  useUpdateFamilyRequest,
} from "@/hooks/useFamily";

const Organizations = () => {
  const { user } = useAuth();
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [newName, setNewName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const { data: groups = [], isLoading: groupsLoading } = useFamilyGroups();
  const activeGroup = groups.find((g) => g.id === activeGroupId) || null;

  const { data: members = [] } = useFamilyMembers(activeGroupId);
  const { data: dbRequests = [] } = useFamilyRequests(activeGroupId);
  const { data: dbScriptures = [] } = useFamilyScriptures(activeGroupId);
  const { data: dbNotes = [] } = useFamilyNotes(activeGroupId);
  const requestIds = useMemo(() => dbRequests.map((r) => r.id), [dbRequests]);
  const { data: prayerLogs = [] } = useFamilyPrayerLogs(activeGroupId, requestIds);

  const createGroup = useCreateFamilyGroup();
  const joinByCode = useJoinFamilyByCode();
  const addRequest = useAddFamilyRequest(activeGroupId);
  const logPrayer = useLogFamilyPrayer(activeGroupId);
  const updateRequest = useUpdateFamilyRequest(activeGroupId);
  const addScripture = useAddFamilyScripture(activeGroupId);
  const addNote = useAddFamilyNote(activeGroupId);

  const currentUserId = user?.id || "";
  const currentUserName =
    (user?.user_metadata as any)?.display_name ||
    members.find((m) => m.user_id === currentUserId)?.display_name ||
    "You";

  const nameFor = (userId: string) => {
    if (userId === currentUserId) return currentUserName;
    const m = members.find((mm) => mm.user_id === userId);
    return m?.display_name || "Family member";
  };

  // Map DB rows -> existing component types so the UI is unchanged
  const groupRequests: FamilyGroupPrayerRequest[] = useMemo(() => {
    return dbRequests.map((r) => {
      const logs = prayerLogs.filter((l) => l.request_id === r.id);
      const lastLog = logs.length > 0 ? logs.reduce((a, b) => (a.prayed_at > b.prayed_at ? a : b)) : null;
      return {
        id: r.id,
        title: r.title,
        description: r.description || "",
        createdBy: nameFor(r.created_by),
        status: r.status === "answered" ? "answered" : "active",
        prayedCount: logs.length,
        whoPrayed: Array.from(new Set(logs.map((l) => nameFor(l.user_id)))),
        reminderEnabled: r.reminder_enabled,
        createdAt: r.created_at,
        lastPrayedAt: lastLog?.prayed_at || null,
      };
    });
  }, [dbRequests, prayerLogs, members, currentUserId, currentUserName]);

  const groupScriptures: SharedScripture[] = useMemo(
    () =>
      dbScriptures.map((s) => ({
        id: s.id,
        verseReference: s.verse_reference,
        translation: s.translation,
        verseText: s.verse_text,
        note: s.note || "",
        sharedBy: nameFor(s.shared_by),
        createdAt: s.created_at,
      })),
    [dbScriptures, members, currentUserId, currentUserName]
  );

  const groupNotes: FamilyTestimony[] = useMemo(
    () =>
      dbNotes.map((n) => ({
        id: n.id,
        noteText: n.note_text,
        createdBy: nameFor(n.created_by),
        createdAt: n.created_at,
      })),
    [dbNotes, members, currentUserId, currentUserName]
  );

  // prayedDays for the Reminders tab: requestId -> [YYYY-MM-DD]
  const prayedDays: Record<string, string[]> = useMemo(() => {
    const map: Record<string, string[]> = {};
    prayerLogs
      .filter((l) => l.user_id === currentUserId)
      .forEach((l) => {
        const d = l.prayed_at.slice(0, 10);
        if (!map[l.request_id]) map[l.request_id] = [];
        if (!map[l.request_id].includes(d)) map[l.request_id].push(d);
      });
    return map;
  }, [prayerLogs, currentUserId]);

  const handleCreateGroup = async () => {
    if (!newName.trim()) {
      toast({ title: "Please enter a family name", variant: "destructive" });
      return;
    }
    try {
      const group = await createGroup.mutateAsync(newName.trim());
      setActiveGroupId(group.id);
      setNewName("");
      setShowCreate(false);
      toast({ title: `"${group.name}" created` });
    } catch {}
  };

  const handleJoin = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    try {
      const groupId = await joinByCode.mutateAsync(code);
      setJoinCode("");
      setShowJoin(false);
      setActiveGroupId(groupId);
      toast({ title: "Joined family" });
    } catch {}
  };

  const copyCode = () => {
    if (activeGroup) {
      navigator.clipboard.writeText(activeGroup.invite_code);
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
                {copied ? "Copied!" : activeGroup.invite_code}
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
              {members.length} member{members.length !== 1 && "s"}
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
                      <p className="text-sm text-muted-foreground">
                        Share this invite code with your family. They can enter it on the Family Prayer Hub to join.
                      </p>
                      <div className="flex items-center gap-2">
                        <Input readOnly value={activeGroup.invite_code} className="font-mono text-center tracking-widest" />
                        <Button variant="outline" size="sm" onClick={copyCode} className="gap-1">
                          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {copied ? "Copied" : "Copy"}
                        </Button>
                      </div>
                      <Button onClick={() => setShowInvite(false)} className="w-full" variant="peaceful">
                        Done
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex flex-wrap gap-2">
                {members.map((m) => (
                  <Badge key={m.id} variant={m.status === "active" ? "default" : "secondary"} className="gap-1 text-xs">
                    {m.user_id === currentUserId ? currentUserName : (m.display_name || "Family member")}
                    {m.role === "admin" && <span className="opacity-60">· Admin</span>}
                    {m.status !== "active" && <span className="opacity-60">· {m.status}</span>}
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
                currentUser={currentUserName}
                onAddRequest={async (req) => {
                  await addRequest.mutateAsync({ title: req.title, description: req.description });
                }}
                onPray={async (id) => {
                  await logPrayer.mutateAsync(id);
                  toast({ title: "Prayer recorded", duration: 2000 });
                }}
                onMarkAnswered={async (id) => {
                  await updateRequest.mutateAsync({ id, updates: { status: "answered" } });
                  toast({ title: "Praise God! Prayer answered ✨" });
                }}
              />
            </TabsContent>

            <TabsContent value="scriptures" className="mt-4">
              <FamilyScriptures
                scriptures={groupScriptures}
                currentUser={currentUserName}
                onAdd={async (s) => {
                  await addScripture.mutateAsync({
                    verse_reference: s.verseReference,
                    translation: s.translation,
                    verse_text: s.verseText,
                    note: s.note,
                  });
                }}
              />
            </TabsContent>

            <TabsContent value="reminders" className="mt-4">
              <FamilyReminders
                requests={groupRequests}
                prayedDays={prayedDays}
                onToggleReminder={async (id) => {
                  const req = dbRequests.find((r) => r.id === id);
                  if (!req) return;
                  if (req.created_by !== currentUserId) {
                    toast({ title: "Only the creator can change this reminder", variant: "destructive" });
                    return;
                  }
                  await updateRequest.mutateAsync({
                    id,
                    updates: { reminder_enabled: !req.reminder_enabled },
                  });
                }}
                onMarkPrayed={async (id) => {
                  await logPrayer.mutateAsync(id);
                  toast({ title: "Prayed today ✓", duration: 2000 });
                }}
              />
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <FamilyNotes
                notes={groupNotes}
                currentUser={currentUserName}
                onAdd={async (text) => {
                  await addNote.mutateAsync(text);
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
                <Button onClick={handleCreateGroup} className="w-full" variant="peaceful" disabled={!newName.trim() || createGroup.isPending}>
                  {createGroup.isPending ? "Creating…" : "Create Family Group"}
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
                <Button onClick={handleJoin} className="w-full" variant="peaceful" disabled={!joinCode.trim() || joinByCode.isPending}>
                  {joinByCode.isPending ? "Joining…" : "Join Family"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Separator className="my-8 bg-primary/10" />

        {/* Existing groups */}
        {groupsLoading ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Loading your family groups…
            </CardContent>
          </Card>
        ) : groups.length > 0 ? (
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
                        Created {new Date(g.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs font-mono">{g.invite_code}</Badge>
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
