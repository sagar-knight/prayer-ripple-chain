import { useEffect, useState } from "react";
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

interface AdminAlert {
  id: string;
  type: string;
  message: string;
  link: string;
  created_at: string;
}

const AdminNotificationBell = () => {
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [open, setOpen] = useState(false);

  const fetchAlerts = async () => {
    // Fetch pending moderation items
    const { data: modItems } = await supabase
      .from("moderation_queue")
      .select("id, title, status, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5);

    // Fetch recent reports
    const { data: reports } = await supabase
      .from("app_events")
      .select("id, metadata_json, created_at")
      .eq("event_type", "content_reported")
      .order("created_at", { ascending: false })
      .limit(5);

    const combined: AdminAlert[] = [];

    (modItems || []).forEach((item) => {
      combined.push({
        id: `mod-${item.id}`,
        type: "moderation",
        message: `Pending review: ${item.title || "Untitled content"}`,
        link: "/admin/moderation",
        created_at: item.created_at,
      });
    });

    (reports || []).forEach((item) => {
      const meta = item.metadata_json as Record<string, unknown> | null;
      const reason = meta?.reason as string || "No reason";
      combined.push({
        id: `report-${item.id}`,
        type: "report",
        message: `New report: ${reason}`,
        link: "/admin/reports",
        created_at: item.created_at,
      });
    });

    combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setAlerts(combined.slice(0, 10));
  };

  useEffect(() => {
    fetchAlerts();

    // Subscribe to realtime changes on moderation_queue
    const channel = supabase
      .channel("admin-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "moderation_queue" },
        () => fetchAlerts()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "app_events" },
        () => fetchAlerts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const pendingCount = alerts.filter((a) => a.type === "moderation").length;
  const totalCount = alerts.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {totalCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-[10px] flex items-center justify-center"
            >
              {totalCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-3 border-b border-border">
          <h4 className="font-semibold text-sm">Admin Notifications</h4>
          {pendingCount > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {pendingCount} item{pendingCount !== 1 ? "s" : ""} pending review
            </p>
          )}
        </div>
        <div className="max-h-64 overflow-y-auto">
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4 text-center">
              No new notifications
            </p>
          ) : (
            alerts.map((alert) => (
              <Link
                key={alert.id}
                to={alert.link}
                onClick={() => setOpen(false)}
                className="flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0"
              >
                <div
                  className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                    alert.type === "moderation" ? "bg-yellow-500" : "bg-red-500"
                  }`}
                />
                <div className="min-w-0">
                  <p className="text-sm leading-snug line-clamp-2">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
        <div className="p-2 border-t border-border">
          <Link to="/admin" onClick={() => setOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full text-xs">
              View Admin Dashboard
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AdminNotificationBell;
