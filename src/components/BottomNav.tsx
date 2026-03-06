import { Link, useLocation } from "react-router-dom";
import { Home, Heart, BookOpen, Calendar, Users, User, LogIn, Store } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const authItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/pray", label: "Pray", icon: Heart },
    { href: "/submit-prayer", label: "Request", icon: BookOpen },
    { href: "/store", label: "Store", icon: Store },
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const publicItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/churches", label: "Churches", icon: Users },
    { href: "/store", label: "Store", icon: Store },
    { href: "/login", label: "Sign In", icon: LogIn },
  ];

  const navItems = user ? authItems : publicItems;

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-50 md:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-md transition-colors min-w-0 ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} />
              <span className="text-[10px] font-medium truncate">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
