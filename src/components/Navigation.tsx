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
  Shield,
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
  ChevronDown,
  Settings as SettingsIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useTestAccount } from "@/hooks/useTestAccount";
import { useUserPrayerCount } from "@/hooks/useUserPrayerCount";
import { PrayerForwardLogo } from "@/components/PrayerForwardLogo";
import { CartDrawer } from "@/components/CartDrawer";
import AdminNotificationBell from "@/components/AdminNotificationBell";
import UserNotificationBell from "@/components/UserNotificationBell";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const isStorePage =
    location.pathname.startsWith("/store") ||
    location.pathname.startsWith("/product") ||
    location.pathname.startsWith("/cart") ||
    location.pathname.startsWith("/checkout");
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminRole();
  const { isTestAccount } = useTestAccount();
  const { count: userPrayerCount } = useUserPrayerCount();
  // Trust protection: hide Store from authenticated users who haven't engaged
  // with the core prayer experience yet. Signed-out visitors still see it.
  const showStore = !user || userPrayerCount >= 3;
  // Main nav items - always visible to everyone
  const mainItems = [
    { href: "/pray", label: "Pray", icon: Users },
    { href: "/submit-prayer", label: "Request", icon: BookOpen },
    { href: "/ripple", label: "Ripple", icon: Waves },
    { href: "/churches", label: "Communities", icon: CommunityIcon },
  ];

  // "More" dropdown items
  const allMoreItems = [
    { href: "/family", label: "Family", icon: Users },
    { href: "/scripture", label: "Scripture", icon: BookOpen },
    { href: "/store", label: "Store", icon: Store },
    { href: "/support", label: "Support Mission", icon: HandHeart },
    { href: "/calendar", label: "Calendar", icon: Calendar },
  ];
  const moreItems = allMoreItems.filter(
    (i) => i.href !== "/store" || showStore
  );

  const isActiveRoute = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  const isMoreActive = moreItems.some((item) => isActiveRoute(item.href));

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" aria-label="PrayerForward home">
            <PrayerForwardLogo className="h-9 w-9" />
            <span className="font-playfair text-xl font-semibold text-foreground">
              PrayerForward
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {mainItems.map((item) => {
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

            {/* More Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isMoreActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-primary hover:bg-accent/50"
                  }`}
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>More</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {moreItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link
                        to={item.href}
                        className={`flex items-center space-x-2 w-full ${
                          isActiveRoute(item.href) ? "text-primary" : ""
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cart */}
            {isStorePage && <CartDrawer />}

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Auth button */}
            {user ? (
              <div className="flex items-center space-x-1">
                {isAdmin && <AdminNotificationBell />}
                {!isAdmin && <UserNotificationBell />}
                {isTestAccount && (
                  <Badge variant="outline" className="text-xs border-amber-400 text-amber-600 gap-1 mr-1">
                    Internal Test Account
                  </Badge>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActiveRoute("/profile")
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-primary hover:bg-accent/50"
                      }`}
                    >
                      <User className="h-4 w-4" />
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center space-x-2 w-full">
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center space-x-2 w-full">
                        <SettingsIcon className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center space-x-2 w-full">
                          <Shield className="h-4 w-4" />
                          <span>Admin</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="flex items-center space-x-2 w-full text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
          <div className="flex items-center gap-1 lg:hidden">
            <ThemeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <div className="flex flex-col space-y-1 mt-6">
                <Link
                  to="/"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActiveRoute("/")
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-primary hover:bg-accent/50"
                  }`}
                >
                  <Heart className="h-5 w-5" />
                  <span>Home</span>
                </Link>

                {mainItems.map((item) => {
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

                {/* More section divider */}
                <div className="px-4 pt-3 pb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">More</span>
                </div>
                {moreItems.map((item) => {
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

                <div className="border-t border-border my-2" />

                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        isActiveRoute("/profile")
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-primary hover:bg-accent/50"
                      }`}
                    >
                      <User className="h-5 w-5" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        isActiveRoute("/settings")
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-primary hover:bg-accent/50"
                      }`}
                    >
                      <SettingsIcon className="h-5 w-5" />
                      <span>Settings</span>
                    </Link>
                    {isTestAccount && (
                      <div className="px-4 py-2">
                        <Badge variant="outline" className="text-xs border-amber-400 text-amber-600 gap-1">
                          Internal Test Account
                        </Badge>
                      </div>
                    )}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                          isActiveRoute("/admin")
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-primary hover:bg-accent/50"
                        }`}
                      >
                        <Shield className="h-5 w-5" />
                        <span>Admin</span>
                      </Link>
                    )}
                    <button
                      onClick={() => { signOut(); setIsOpen(false); }}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                  </>
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
      </div>
    </nav>
  );
};

export default Navigation;
