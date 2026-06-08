import { useEffect, useState, useCallback } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

interface UserNotification {
  id: string;
  type: "prayer" | "praise" | "answered";
  message: string;
  link: string;
  created_at: string;
}

const TYPE_DOT: Record<UserNotification["type"], string> = {
  prayer: "bg-primary",
  praise: "bg-emerald-500",
  answered: "bg-amber-500",
};

const LAST_SEEN_KEY = "user_notifications_last_seen";

const UserNotificationBell = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<UserNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState<string>(() => {
    if (typeof window === "undefined") return new Date(0).toISOString();
    return localStorage.getItem(LAST_SEEN_KEY) || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  });

  const fetchItems = useCallback(async () => {
    if (!user) return;
    const sinceWindow = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // User's own requests (for praise + answered + prayer count)
    const { data: ownRequests } = await supabase
      .from("global_prayer_requests")
      .select("id, title, slug, short_code, prayer_count, answered_at, updated_at")
      .eq("created_by", user.id)
      .order("updated_at", { ascending: false })
      .limit(20);

    const ownIds = (ownRequests || []).map((r) => r.id);

    // Praise reports / updates on user's own requests
    let updates: Array<{
      id: string;
      prayer_request_id: string;
      message: string;
      created_at: string;
    }> = [];
    if (ownIds.length > 0) {
      const { data } = await supabase
        .from("prayer_updates")
        .select("id, prayer_request_id, message, created_at")
        .in("prayer_request_id", ownIds)
        .gte("created_at", sinceWindow)
        .order("created_at", { ascending: false })
        .limit(20);
      updates = data || [];
    }

    const titleById = new Map(
      (ownRequests || []).map((r) => [r.id, r.title as string])
    );
    const linkById = new Map(
      (ownRequests || []).map((r) => [
        r.id,
        `/prayer/${r.slug || r.short_code || r.id}`,
      ])
    );

    const combined: UserNotification[] = [];

    // Prayer count notifications for own requests
    (ownRequests || []).forEach((r) => {
      if ((r.prayer_count || 0) > 0) {
        combined.push({
          id: `count-${r.id}`,
          type: "prayer",
          message: `${r.prayer_count} ${r.prayer_count === 1 ? "person is" : "people are"} praying for "${r.title}"`,
          link: linkById.get(r.id) || "/my-prayers",
          created_at: r.updated_at,
        });
      }
      if (r.answered_at) {
        combined.push({
          id: `answered-${r.id}`,
          type: "answered",
          message: `Your prayer "${r.title}" was marked as answered`,
          link: linkById.get(r.id) || "/answered-prayers",
          created_at: r.answered_at,
        });
      }
    });

    updates.forEach((u) => {
      combined.push({
        id: `update-${u.id}`,
        type: "praise",
        message: `New praise report on "${titleById.get(u.prayer_request_id) || "your prayer"}"`,
        link: linkById.get(u.prayer_request_id) || "/my-prayers",
        created_at: u.created_at,
      });
    });

    combined.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    setItems(combined.slice(0, 15));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchItems();
    const interval = setInterval(fetchItems, 60000);
    return () => clearInterval(interval);
  }, [user, fetchItems]);

  const unreadCount = items.filter(
    (i) => new Date(i.created_at).getTime() > new Date(lastSeen).getTime()
  ).length;

  const markAllRead = () => {
    const now = new Date().toISOString();
    localStorage.setItem(LAST_SEEN_KEY, now);
    setLastSeen(now);
  };

  if (!user) return null;

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) markAllRead();
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-[10px] flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-3 border-b border-border">
          <h4 className="font-semibold text-sm">Notifications</h4>
          <p className="text-xs text-muted-foreground mt-1">
            You'll see prayer clicks, praise reports, and answered prayers here.
          </p>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/60 mb-3" />
              <p className="text-sm font-medium">No notifications</p>
              <p className="text-xs text-muted-foreground mt-1">
                You'll see prayer activity here.
              </p>
            </div>
          ) : (
            items.map((n) => (
              <Link
                key={n.id}
                to={n.link}
                onClick={() => setOpen(false)}
                className="flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0"
              >
                <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${TYPE_DOT[n.type]}`} />
                <div className="min-w-0">
                  <p className="text-sm leading-snug line-clamp-2">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserNotificationBell;