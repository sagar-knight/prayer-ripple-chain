import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Heart, Search, User, Menu, X, ChevronDown, LogOut, Home, BookOpen, Users, Calendar, Waves, Church, HandHeart } from "lucide-react";
import { CartDrawer } from "@/components/CartDrawer";
import { useAuth } from "@/hooks/useAuth";
import { PrayerForwardLogo } from "@/components/PrayerForwardLogo";

const storeNavLinks = [
  { label: "New", href: "/store?collection=new" },
  { label: "Best Sellers", href: "/store?collection=best-sellers" },
  { label: "Shop All", href: "/store" },
];

const appNavLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "Pray", href: "/pray", icon: Heart, protected: true },
  { label: "Churches", href: "/churches", icon: Church },
  { label: "Calendar", href: "/calendar", icon: Calendar, protected: true },
  { label: "Family", href: "/family", icon: Users, protected: true },
  { label: "Scripture", href: "/scripture", icon: BookOpen, protected: true },
  { label: "Support", href: "/support", icon: HandHeart },
  { label: "About", href: "/about", icon: Waves },
];

const StoreHeader = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/store?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const isActive = (href: string) => {
    if (href === "/store") return location.pathname === "/store" && !location.search;
    return location.pathname + location.search === href;
  };

  const visibleAppLinks = user
    ? appNavLinks
    : appNavLinks.filter((l) => !l.protected);

  return (
    <>
      {/* Top utility bar — main site links */}
      <div className="bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-9 text-xs">
          <nav className="hidden md:flex items-center gap-4">
            {visibleAppLinks.slice(0, 6).map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-background/70 hover:text-background transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Link to="/" className="md:hidden text-background/70 hover:text-background transition-colors flex items-center gap-1">
            <Home className="h-3 w-3" /> PrayerForward App
          </Link>
          <span className="text-background/60 tracking-wide hidden sm:block">
            Every purchase supports the mission · Free shipping $75+
          </span>
          <span className="text-background/60 tracking-wide sm:hidden text-[10px]">
            Free shipping $75+
          </span>
        </div>
      </div>

      <header className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 lg:h-16">
            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0">
                 <div className="p-6 border-b border-border">
                   <Link to="/store" onClick={() => setMobileOpen(false)} className="flex items-center gap-2" aria-label="PrayerForward Store">
                     <PrayerForwardLogo className="h-8 w-8" />
                     <span className="font-playfair text-lg font-semibold text-foreground">PrayerForward</span>
                   </Link>
                 </div>

                {/* Store nav */}
                <nav className="p-4 space-y-1">
                  <p className="px-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">Shop</p>
                  {storeNavLinks.map((link) => (
                    <Link
                      key={link.label}
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="px-3 py-2.5">
                    <p className="text-sm font-medium text-foreground mb-2">Apparel</p>
                    <div className="pl-3 space-y-1">
                      <Link to="/store?category=Apparel&sub=Men" onClick={() => setMobileOpen(false)} className="block py-1.5 text-sm text-muted-foreground hover:text-foreground">Men</Link>
                      <Link to="/store?category=Apparel&sub=Women" onClick={() => setMobileOpen(false)} className="block py-1.5 text-sm text-muted-foreground hover:text-foreground">Women</Link>
                    </div>
                  </div>
                  <Link to="/store/about" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors">
                    About
                  </Link>

                  {/* App navigation section */}
                  <div className="border-t border-border mt-4 pt-4">
                    <p className="px-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">PrayerForward</p>
                    {visibleAppLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          to={link.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                        >
                          <Icon className="h-4 w-4" />
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Auth */}
                  <div className="border-t border-border mt-4 pt-4">
                    {user ? (
                      <button
                        onClick={() => { signOut(); setMobileOpen(false); }}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors w-full"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-primary bg-primary/10 rounded-md"
                      >
                        <User className="h-4 w-4" /> Sign In
                      </Link>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link to="/store" className="flex items-center gap-2 shrink-0" aria-label="PrayerForward Store">
              <PrayerForwardLogo className="h-8 w-8" />
              <div className="hidden sm:block">
                <span className="font-playfair text-lg font-semibold text-foreground">PrayerForward</span>
                <span className="text-[10px] text-muted-foreground ml-1.5 uppercase tracking-widest">Store</span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {storeNavLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                    isActive(link.href) ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Apparel dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md">
                    Apparel <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-40">
                  <DropdownMenuItem onClick={() => navigate("/store?category=Apparel")}>All Apparel</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/store?category=Apparel&sub=Men")}>Men</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/store?category=Apparel&sub=Women")}>Women</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link to="/store/about" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md">
                About
              </Link>
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setSearchOpen(!searchOpen)}>
                {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {user ? (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/profile")}>My Account</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/store/orders")}>My Orders</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => signOut()}>
                        <LogOut className="h-3.5 w-3.5 mr-2" /> Sign Out
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/login")}>Sign In</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/signup")}>Create Account</DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <CartDrawer />
            </div>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-border bg-background px-4 py-3">
            <form onSubmit={handleSearch} className="max-w-xl mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-20"
              />
              <Button type="submit" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-7">
                Search
              </Button>
            </form>
          </div>
        )}
      </header>
    </>
  );
};

export default StoreHeader;
