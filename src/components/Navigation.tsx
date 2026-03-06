import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Heart,
  Menu,
  Users,
  Waves,
  HelpCircle,
  Church,
  Calendar,
  BookOpen,
  User,
  Store,
  HandHeart,
  LogIn,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { CartDrawer } from "@/components/CartDrawer";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const publicItems = [
    { href: "/churches", label: "Churches", icon: Church },
    { href: "/support", label: "Support", icon: HandHeart },
    { href: "/store", label: "Store", icon: Store },
    { href: "/about", label: "About", icon: HelpCircle },
  ];

  const authItems = [
    { href: "/pray", label: "Pray", icon: Heart },
    { href: "/submit-prayer", label: "Request", icon: BookOpen },
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/churches", label: "Churches", icon: Church },
    { href: "/family", label: "Family", icon: Users },
    { href: "/ripple", label: "Ripple", icon: Waves },
    { href: "/scripture", label: "Scripture", icon: BookOpen },
    { href: "/support", label: "Support", icon: HandHeart },
    { href: "/store", label: "Store", icon: Store },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const navItems = user ? authItems : publicItems;

  const allMobileItems = user
    ? [{ href: "/", label: "Home", icon: Heart }, ...authItems]
    : [{ href: "/", label: "Home", icon: Heart }, ...publicItems];

  const isActiveRoute = (href: string) => {
    if (href === "/") return location.pathname === "/";
    if (href === "/store") return location.pathname === "/store" || location.pathname.startsWith("/store/") || location.pathname.startsWith("/product/");
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="h-7 w-7 text-primary" />
            <span className="font-playfair text-xl font-bold text-foreground tracking-tight">
              PrayerForward
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActiveRoute(item.href);
              return (
                <Link
                  key={item.href + item.label}
                  to={item.href}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            {user ? (
              <Button variant="ghost" size="sm" onClick={() => signOut()} className="gap-1.5 text-muted-foreground hover:text-foreground rounded-full ml-1">
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </Button>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors ml-1"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Link>
            )}
            <div className="ml-2 pl-2 border-l border-border">
              <CartDrawer />
            </div>
          </div>

          {/* Mobile Right */}
          <div className="flex items-center gap-1 lg:hidden">
            <CartDrawer />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <div className="flex flex-col space-y-1 mt-6">
                  {allMobileItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActiveRoute(item.href);
                    return (
                      <Link
                        key={item.href + item.label}
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                  <div className="border-t border-border mt-3 pt-3">
                    {user ? (
                      <button
                        onClick={() => { signOut(); setIsOpen(false); }}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium bg-primary text-primary-foreground"
                      >
                        <LogIn className="h-4 w-4" />
                        <span>Sign In</span>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
