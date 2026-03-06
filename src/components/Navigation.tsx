import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Heart,
  Menu,
  Users,
  Waves,
  Church,
  Calendar,
  BookOpen,
  User,
  Store,
  HandHeart,
  LogIn,
  LogOut,
  ChevronDown,
  Home,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { CartDrawer } from "@/components/CartDrawer";
import logo from "@/assets/logo.png";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const primaryAuth = [
    { href: "/pray", label: "Pray", icon: Heart },
    { href: "/submit-prayer", label: "Request", icon: BookOpen },
    { href: "/churches", label: "Churches", icon: Church },
    { href: "/store", label: "Store", icon: Store },
  ];

  const moreAuth = [
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/family", label: "Family", icon: Users },
    { href: "/ripple", label: "Ripple", icon: Waves },
    { href: "/scripture", label: "Scripture", icon: BookOpen },
    { href: "/support", label: "Support", icon: HandHeart },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const publicItems = [
    { href: "/churches", label: "Churches", icon: Church },
    { href: "/store", label: "Store", icon: Store },
    { href: "/support", label: "Support", icon: HandHeart },
  ];

  const allMobileItems = user
    ? [
        { href: "/", label: "Home", icon: Home },
        ...primaryAuth,
        ...moreAuth,
      ]
    : [
        { href: "/", label: "Home", icon: Home },
        ...publicItems,
      ];

  const isActiveRoute = (href: string) => {
    if (href === "/") return location.pathname === "/";
    if (href === "/store")
      return (
        location.pathname === "/store" ||
        location.pathname.startsWith("/store/") ||
        location.pathname.startsWith("/product/")
      );
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  const isMoreActive = moreAuth.some((item) => isActiveRoute(item.href));

  return (
    <nav className="bg-background/80 backdrop-blur-md border-b border-border/60 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center overflow-hidden h-16">
            <img src={logo} alt="PrayerForward" className="h-[160px] w-auto max-w-none" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {(user ? primaryAuth : publicItems).map((item) => {
              const active = isActiveRoute(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    active
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                      isMoreActive
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    More
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {moreAuth.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link
                          to={item.href}
                          className="flex items-center gap-2.5 cursor-pointer"
                        >
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <div className="w-px h-5 bg-border/60 mx-2" />

            {user ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="text-sm font-semibold text-muted-foreground hover:text-foreground rounded-full px-3"
              >
                Sign Out
              </Button>
            ) : (
              <Link
                to="/login"
                className="px-4 py-1.5 rounded-full text-sm font-semibold bg-foreground text-background hover:opacity-90 transition-opacity"
              >
                Sign In
              </Link>
            )}

            <CartDrawer />
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
              <SheetContent side="right" className="w-[280px]">
                <div className="flex flex-col gap-0.5 mt-6">
                  {allMobileItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActiveRoute(item.href);
                    return (
                      <Link
                        key={item.href + item.label}
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                          active
                            ? "bg-foreground text-background"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                  <div className="border-t border-border/60 mt-3 pt-3">
                    {user ? (
                      <button
                        onClick={() => {
                          signOut();
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-muted-foreground hover:text-destructive w-full"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold bg-foreground text-background"
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
