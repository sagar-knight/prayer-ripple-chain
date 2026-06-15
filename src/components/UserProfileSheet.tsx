import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  UserPlus,
  UserCheck,
  UserMinus,
  ShieldOff,
  ShieldCheck,
  Hourglass,
  UserRound,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { resolveAvatarUrl } from "@/lib/avatar";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}

type FriendStatus = "none" | "outgoing" | "incoming" | "accepted" | "declined";

const UserProfileSheet = ({ open, onOpenChange, userId }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isSelf = !!user && user.id === userId;

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState<string>("");
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [friendStatus, setFriendStatus] = useState<FriendStatus>("none");
  const [friendRequestId, setFriendRequestId] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open || !userId) return;
    let active = true;
    (async () => {
      setLoading(true);
      const [{ data: profile }, friendRes, blockRes] = await Promise.all([
        (supabase as any)
          .from("profiles_public" as any)
          .select("display_name, avatar_url")
          .eq("id", userId)
          .maybeSingle(),
        user
          ? supabase
              .from("friend_requests")
              .select("id, requester_id, recipient_id, status")
              .or(
                `and(requester_id.eq.${user.id},recipient_id.eq.${userId}),and(requester_id.eq.${userId},recipient_id.eq.${user.id})`
              )
              .maybeSingle()
          : Promise.resolve({ data: null } as any),
        user
          ? supabase
              .from("user_blocks")
              .select("id")
              .eq("blocker_id", user.id)
              .eq("blocked_id", userId)
              .maybeSingle()
          : Promise.resolve({ data: null } as any),
      ]);
      if (!active) return;
      setName(profile?.display_name || "Prayer Warrior");
      setAvatarSrc(await resolveAvatarUrl(profile?.avatar_url));
      const fr = friendRes?.data as
        | { id: string; requester_id: string; recipient_id: string; status: string }
        | null;
      if (!fr) {
        setFriendStatus("none");
        setFriendRequestId(null);
      } else {
        setFriendRequestId(fr.id);
        if (fr.status === "accepted") setFriendStatus("accepted");
        else if (fr.status === "declined") setFriendStatus("declined");
        else if (fr.requester_id === user?.id) setFriendStatus("outgoing");
        else setFriendStatus("incoming");
      }
      setBlocked(!!blockRes?.data);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [open, userId, user]);

  const initials =
    name
      .split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  const requireAuth = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to connect with other prayer warriors.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const sendRequest = async () => {
    if (!requireAuth() || !userId) return;
    setBusy(true);
    const { data, error } = await supabase
      .from("friend_requests")
      .insert({
        requester_id: user!.id,
        recipient_id: userId,
        message: message.trim() || null,
      })
      .select("id")
      .maybeSingle();
    setBusy(false);
    if (error) {
      toast({ title: "Could not send request", description: error.message, variant: "destructive" });
      return;
    }
    setFriendRequestId(data?.id ?? null);
    setFriendStatus("outgoing");
    setMessage("");
    toast({ title: "Request sent" });
  };

  const cancelRequest = async () => {
    if (!friendRequestId) return;
    setBusy(true);
    const { error } = await supabase.from("friend_requests").delete().eq("id", friendRequestId);
    setBusy(false);
    if (error) {
      toast({ title: "Could not cancel", description: error.message, variant: "destructive" });
      return;
    }
    setFriendStatus("none");
    setFriendRequestId(null);
    toast({ title: "Request cancelled" });
  };

  const respondRequest = async (decision: "accepted" | "declined") => {
    if (!friendRequestId) return;
    setBusy(true);
    const { error } = await supabase
      .from("friend_requests")
      .update({ status: decision, responded_at: new Date().toISOString() })
      .eq("id", friendRequestId);
    setBusy(false);
    if (error) {
      toast({ title: "Could not respond", description: error.message, variant: "destructive" });
      return;
    }
    setFriendStatus(decision === "accepted" ? "accepted" : "declined");
    toast({ title: decision === "accepted" ? "Request accepted" : "Request declined" });
  };

  const toggleBlock = async () => {
    if (!requireAuth() || !userId) return;
    setBusy(true);
    if (blocked) {
      const { error } = await supabase
        .from("user_blocks")
        .delete()
        .eq("blocker_id", user!.id)
        .eq("blocked_id", userId);
      setBusy(false);
      if (error) {
        toast({ title: "Could not unblock", description: error.message, variant: "destructive" });
        return;
      }
      setBlocked(false);
      toast({ title: "User unblocked" });
    } else {
      const { error } = await supabase
        .from("user_blocks")
        .insert({ blocker_id: user!.id, blocked_id: userId });
      setBusy(false);
      if (error) {
        toast({ title: "Could not block", description: error.message, variant: "destructive" });
        return;
      }
      setBlocked(true);
      // If there's a friend request, cancel it.
      if (friendRequestId) {
        await supabase.from("friend_requests").delete().eq("id", friendRequestId);
        setFriendRequestId(null);
        setFriendStatus("none");
      }
      toast({ title: "User blocked" });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="sr-only">Profile</SheetTitle>
          <SheetDescription className="sr-only">
            View this prayer warrior and connect with them.
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="pt-2 pb-6 space-y-6">
            <div className="flex flex-col items-center text-center gap-3">
              <Avatar className="h-20 w-20">
                {avatarSrc && <AvatarImage src={avatarSrc} alt={name} />}
                <AvatarFallback className="bg-muted text-base">
                  {initials || <UserRound className="h-6 w-6" />}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="font-playfair text-xl text-foreground">{name}</p>
                {blocked && (
                  <Badge variant="destructive" className="text-[10px]">Blocked</Badge>
                )}
                {friendStatus === "accepted" && (
                  <Badge className="text-[10px] gap-1">
                    <UserCheck className="h-3 w-3" /> Connected
                  </Badge>
                )}
              </div>
            </div>

            {!isSelf && (
              <div className="space-y-4">
                {/* Friend request actions */}
                {!blocked && friendStatus === "none" && (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Optional message…"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="min-h-[72px]"
                      maxLength={280}
                    />
                    <Button
                      onClick={sendRequest}
                      disabled={busy}
                      className="w-full gap-2"
                    >
                      {busy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserPlus className="h-4 w-4" />
                      )}
                      Send connection request
                    </Button>
                  </div>
                )}

                {friendStatus === "outgoing" && (
                  <Button
                    variant="outline"
                    onClick={cancelRequest}
                    disabled={busy}
                    className="w-full gap-2"
                  >
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Hourglass className="h-4 w-4" />
                    )}
                    Cancel request
                  </Button>
                )}

                {friendStatus === "incoming" && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => respondRequest("accepted")}
                      disabled={busy}
                      className="gap-2"
                    >
                      <UserCheck className="h-4 w-4" /> Accept
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => respondRequest("declined")}
                      disabled={busy}
                      className="gap-2"
                    >
                      <UserMinus className="h-4 w-4" /> Decline
                    </Button>
                  </div>
                )}

                {friendStatus === "declined" && (
                  <p className="text-xs text-center text-muted-foreground">
                    Request was declined.
                  </p>
                )}

                {/* Block toggle */}
                <Button
                  variant={blocked ? "outline" : "ghost"}
                  onClick={toggleBlock}
                  disabled={busy}
                  className="w-full gap-2 text-muted-foreground"
                >
                  {blocked ? (
                    <>
                      <ShieldCheck className="h-4 w-4" /> Unblock user
                    </>
                  ) : (
                    <>
                      <ShieldOff className="h-4 w-4" /> Block user
                    </>
                  )}
                </Button>
              </div>
            )}

            {isSelf && (
              <p className="text-xs text-center text-muted-foreground">
                This is your profile.
              </p>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default UserProfileSheet;
