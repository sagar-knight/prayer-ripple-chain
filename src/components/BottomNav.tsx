import { Link, useLocation } from "react-router-dom";
import { Home, Heart, BookOpen, Store, User, LogIn, Waves, Church } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const authItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/pray", label: "Pray", icon: Heart },
    { href: "/submit-prayer", label: "Request", icon: BookOpen },
    { href: "/churches", label: "Churches", icon: Church },
    { href: "/ripple", label: "Ripple", icon: Waves },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const publicItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/store", label: "Store", icon: Store },
    { href: "/login", label: "Sign In", icon: LogIn },
  ];

  const navItems = user ? authItems : publicItems;

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    if (href === "/store")
      return (
        location.pathname === "/store" ||
        location.pathname.startsWith("/store/") ||
        location.pathname.startsWith("/product/")
      );
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border/60 z-50 md:hidden safe-area-bottom">
      <div className="flex justify-around items-center h-14 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-colors min-w-0 ${
                active ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-medium tracking-wide">
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
