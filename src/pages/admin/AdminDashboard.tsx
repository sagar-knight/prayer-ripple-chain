import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, Flag, Church, Users, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    pendingModeration: 0,
    flaggedContent: 0,
    reportedContent: 0,
    pendingChurches: 0,
    totalUsers: 0,
    autoApprovedToday: 0,
    autoDeniedToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const today = new Date().toISOString().split("T")[0];
      const [modQ, reports, churches] = await Promise.all([
        supabase.from("moderation_queue").select("status", { count: "exact", head: false }),
        supabase.from("app_events").select("id", { count: "exact" }).eq("event_type", "content_reported"),
        supabase.from("churches").select("id", { count: "exact" }),
      ]);

      const items = modQ.data || [];
      setStats({
        pendingModeration: items.filter((i) => i.status === "pending").length,
        flaggedContent: items.filter((i) => i.status === "flagged").length,
        reportedContent: reports.count || 0,
        pendingChurches: 0,
        totalUsers: 0,
        autoApprovedToday: items.filter((i) => i.status === "auto-approved" && i.status).length,
        autoDeniedToday: items.filter((i) => i.status === "auto-denied").length,
      });
      setLoading(false);
    };
    load();
  }, []);

  const cards = [
    { label: "Pending Review", value: stats.pendingModeration, icon: Shield, color: "text-yellow-600", link: "/admin/moderation" },
    { label: "Flagged Content", value: stats.flaggedContent, icon: AlertTriangle, color: "text-orange-600", link: "/admin/moderation" },
    { label: "Reports", value: stats.reportedContent, icon: Flag, color: "text-red-600", link: "/admin/reports" },
    { label: "Churches", value: stats.pendingChurches, icon: Church, color: "text-blue-600", link: "/admin/churches" },
    { label: "Auto-Approved Today", value: stats.autoApprovedToday, icon: CheckCircle, color: "text-green-600", link: "/admin/moderation" },
    { label: "Auto-Denied Today", value: stats.autoDeniedToday, icon: XCircle, color: "text-red-500", link: "/admin/moderation" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      {loading ? (
        <p className="text-muted-foreground">Loading stats...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cards.map((c) => (
            <Link to={c.link} key={c.label}>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <c.icon className={`w-4 h-4 ${c.color}`} />
                    {c.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{c.value}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
