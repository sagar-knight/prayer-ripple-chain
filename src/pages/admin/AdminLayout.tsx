import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Shield, Users, Church, Flag, Cog, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/moderation", icon: Shield, label: "Moderation" },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/churches", icon: Church, label: "Churches" },
  { to: "/admin/reports", icon: Flag, label: "Reports" },
  { to: "/admin/automation", icon: Cog, label: "Automation" },
  { to: "/admin/audit", icon: ScrollText, label: "Audit Log" },
];

const AdminLayout = () => (
  <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
    <aside className="md:w-56 shrink-0">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5 text-primary" /> Admin
      </h2>
      <nav className="flex md:flex-col gap-1 overflow-x-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
    <main className="flex-1 min-w-0">
      <Outlet />
    </main>
  </div>
);

export default AdminLayout;
