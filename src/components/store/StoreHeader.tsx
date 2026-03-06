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
      {/* Top utility bar */}
      <div className="bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-10 text-sm">
          <nav className="hidden md:flex items-center gap-5">
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
          <Link to="/" className="md:hidden text-background/70 hover:text-background transition-colors flex items-center gap-1.5">
            <Home className="h-4 w-4" /> PrayerForward App
          </Link>
          <span className="text-background/60 tracking-wide hidden sm:block">
            Every purchase supports the mission · Free shipping $75+
          </span>
          <span className="text-background/60 tracking-wide sm:hidden text-xs">
            Free shipping $75+
          </span>
        </div>
      </div>

      <header className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0">
                <div className="p-6 border-b border-border">
                  <Link to="/store" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5">
                    <Heart className="h-7 w-7 text-primary" />
                    <span className="font-serif text-xl font-semibold text-primary">PrayerForward</span>
                  </Link>
                </div>

                <nav className="p-4 space-y-1">
                  <p className="px-3 text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">Shop</p>
                  {storeNavLinks.map((link) => (
                    <Link
                      key={link.label}
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-3 text-base font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="px-3 py-3">
                    <p className="text-base font-medium text-foreground mb-2">Apparel</p>
                    <div className="pl-4 space-y-1">
                      <Link to="/store?category=Apparel&sub=Men" onClick={() => setMobileOpen(false)} className="block py-2 text-muted-foreground hover:text-foreground">Men</Link>
                      <Link to="/store?category=Apparel&sub=Women" onClick={() => setMobileOpen(false)} className="block py-2 text-muted-foreground hover:text-foreground">Women</Link>
                    </div>
                  </div>
                  <Link to="/store/about" onClick={() => setMobileOpen(false)} className="block px-3 py-3 text-base font-medium text-foreground hover:bg-muted rounded-lg transition-colors">
                    About
                  </Link>

                  <div className="border-t border-border mt-4 pt-4">
                    <p className="px-3 text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">PrayerForward</p>
                    {visibleAppLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          to={link.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                          <Icon className="h-5 w-5" />
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>

                  <div className="border-t border-border mt-4 pt-4">
                    {user ? (
                      <button
                        onClick={() => { signOut(); setMobileOpen(false); }}
                        className="flex items-center gap-3 px-3 py-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors w-full"
                      >
                        <LogOut className="h-5 w-5" /> Sign Out
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 font-medium text-primary bg-primary/10 rounded-lg"
                      >
                        <User className="h-5 w-5" /> Sign In
                      </Link>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link to="/store" className="flex items-center gap-2.5 shrink-0">
              <Heart className="h-7 w-7 text-primary" />
              <div className="hidden sm:block">
                <span className="font-serif text-xl font-semibold text-primary">PrayerForward</span>
                <span className="text-xs text-muted-foreground ml-2 uppercase tracking-widest">Store</span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {storeNavLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`px-4 py-2.5 text-[15px] font-medium transition-colors rounded-lg ${
                    isActive(link.href) ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 px-4 py-2.5 text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg">
                    Apparel <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-44">
                  <DropdownMenuItem onClick={() => navigate("/store?category=Apparel")}>All Apparel</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/store?category=Apparel&sub=Men")}>Men</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/store?category=Apparel&sub=Women")}>Women</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link to="/store/about" className="px-4 py-2.5 text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg">
                About
              </Link>
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setSearchOpen(!searchOpen)}>
                {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {user ? (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/profile")}>My Account</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/store/orders")}>My Orders</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => signOut()}>
                        <LogOut className="h-4 w-4 mr-2" /> Sign Out
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
          <div className="border-t border-border bg-background px-4 py-4">
            <form onSubmit={handleSearch} className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-24 h-12 text-base"
              />
              <Button type="submit" size="sm" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 rounded-full">
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
