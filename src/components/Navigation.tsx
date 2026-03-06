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

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  // Items visible to everyone
  const publicItems = [
    { href: "/churches", label: "Churches", icon: Church },
    { href: "/support", label: "Support", icon: HandHeart },
    { href: "/store", label: "Store", icon: Store },
    { href: "/about", label: "About", icon: HelpCircle },
  ];

  // Items visible only to logged-in users
  const authItems = [
    { href: "/pray", label: "Pray", icon: Users },
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
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary" />
            <span className="font-playfair text-xl font-semibold text-primary">
              PrayerForward
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href + item.label}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActiveRoute(item.href)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-primary hover:bg-accent/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            {user ? (
              <Button variant="ghost" size="sm" onClick={() => signOut()} className="gap-1 text-muted-foreground hover:text-primary">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent/50 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <div className="flex flex-col space-y-4 mt-6">
                {allMobileItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href + item.label}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        isActiveRoute(item.href)
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-primary hover:bg-accent/50"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                {user ? (
                  <button
                    onClick={() => { signOut(); setIsOpen(false); }}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-primary bg-primary/10"
                  >
                    <LogIn className="h-5 w-5" />
                    <span>Sign In</span>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
