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

interface AdminAlert {
  id: string;
  type: "moderation" | "report" | "church" | "auto-denied" | "suspicious";
  message: string;
  link: string;
  created_at: string;
}

const TYPE_COLORS: Record<AdminAlert["type"], string> = {
  moderation: "bg-yellow-500",
  report: "bg-red-500",
  church: "bg-blue-500",
  "auto-denied": "bg-orange-500",
  suspicious: "bg-purple-500",
};

const AdminNotificationBell = () => {
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [open, setOpen] = useState(false);

  const fetchAlerts = useCallback(async () => {
    const [modQ, reports, autoD] = await Promise.all([
      // Pending moderation items
      supabase
        .from("moderation_queue")
        .select("id, title, status, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5),
      // Recent reports
      supabase
        .from("app_events")
        .select("id, metadata_json, created_at")
        .eq("event_type", "content_reported")
        .order("created_at", { ascending: false })
        .limit(5),
      // Auto-denied content
      supabase
        .from("moderation_queue")
        .select("id, title, created_at")
        .eq("status", "auto-denied")
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

    const combined: AdminAlert[] = [];

    (modQ.data || []).forEach((item) => {
      combined.push({
        id: `mod-${item.id}`,
        type: "moderation",
        message: `Pending review: ${item.title || "Untitled content"}`,
        link: "/admin/moderation",
        created_at: item.created_at,
      });
    });

    (reports.data || []).forEach((item) => {
      const meta = item.metadata_json as Record<string, unknown> | null;
      const reason = (meta?.reason as string) || "No reason";
      combined.push({
        id: `report-${item.id}`,
        type: "report",
        message: `New report: ${reason}`,
        link: "/admin/reports",
        created_at: item.created_at,
      });
    });

    (autoD.data || []).forEach((item) => {
      combined.push({
        id: `auto-${item.id}`,
        type: "auto-denied",
        message: `Auto-denied: ${item.title || "Content"}`,
        link: "/admin/moderation",
        created_at: item.created_at,
      });
    });

    // Check for new church registrations (churches created in last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: newChurches } = await supabase
      .from("churches")
      .select("id, name, created_at")
      .gte("created_at", weekAgo)
      .order("created_at", { ascending: false })
      .limit(3);

    (newChurches || []).forEach((c) => {
      combined.push({
        id: `church-${c.id}`,
        type: "church",
        message: `New church registered: ${c.name}`,
        link: "/admin/churches",
        created_at: c.created_at,
      });
    });

    // Check for suspicious activity — users with many reports against them
    const { data: suspiciousReports } = await supabase
      .from("app_events")
      .select("metadata_json, created_at, id")
      .eq("event_type", "content_reported")
      .gte("created_at", weekAgo)
      .order("created_at", { ascending: false })
      .limit(20);

    // Group by reported entity to detect patterns
    const entityReportCounts = new Map<string, number>();
    (suspiciousReports || []).forEach((r) => {
      const meta = r.metadata_json as Record<string, unknown> | null;
      const entityId = meta?.entity_id as string;
      if (entityId) {
        entityReportCounts.set(entityId, (entityReportCounts.get(entityId) || 0) + 1);
      }
    });

    entityReportCounts.forEach((count, entityId) => {
      if (count >= 3) {
        combined.push({
          id: `suspicious-${entityId}`,
          type: "suspicious",
          message: `Suspicious: ${count} reports on same content`,
          link: "/admin/reports",
          created_at: new Date().toISOString(),
        });
      }
    });

    combined.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    setAlerts(combined.slice(0, 15));
  }, []);

  useEffect(() => {
    fetchAlerts();

    // Poll every 30 seconds for new alerts (realtime removed for security)
    const interval = setInterval(fetchAlerts, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchAlerts]);

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
              {totalCount > 99 ? "99+" : totalCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-3 border-b border-border">
          <h4 className="font-semibold text-sm">Admin Notifications</h4>
          <p className="text-xs text-muted-foreground mt-1">
            {totalCount} alert{totalCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="max-h-72 overflow-y-auto">
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
                <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${TYPE_COLORS[alert.type]}`} />
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
