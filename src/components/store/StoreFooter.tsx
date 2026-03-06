import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heart, Instagram, Facebook, Youtube } from "lucide-react";
import { toast } from "sonner";

const StoreFooter = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const subs = JSON.parse(localStorage.getItem("pf-store-subscribers") || "[]");
    if (subs.find((s: any) => s.email === email.trim())) {
      toast.info("You're already subscribed!");
    } else {
      subs.push({ email: email.trim(), created_at: new Date().toISOString() });
      localStorage.setItem("pf-store-subscribers", JSON.stringify(subs));
      toast.success("Thanks for subscribing!");
    }
    setEmail("");
  };

  return (
    <footer className="bg-foreground text-background">
      {/* Newsletter strip */}
      <div className="border-b border-background/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-playfair text-lg font-semibold">Sign Up & Save</h3>
            <p className="text-sm text-background/70 mt-0.5">Get store updates & encouragement. No spam.</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background/10 border-background/20 text-background placeholder:text-background/50 w-full md:w-64"
            />
            <Button type="submit" variant="secondary" size="sm" className="shrink-0">Subscribe</Button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5" />
              <span className="font-playfair font-semibold">PrayerForward</span>
            </div>
            <ul className="space-y-2 text-sm text-background/70">
              <li><Link to="/store/about" className="hover:text-background transition-colors">Our Mission</Link></li>
              <li><Link to="/about" className="hover:text-background transition-colors">Impact</Link></li>
              <li><Link to="/store/contact" className="hover:text-background transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider">Customer Care</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><Link to="/store/shipping" className="hover:text-background transition-colors">Shipping</Link></li>
              <li><Link to="/store/returns" className="hover:text-background transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/store/refund-policy" className="hover:text-background transition-colors">Refund Policy</Link></li>
              <li><Link to="/store/order-tracking" className="hover:text-background transition-colors">Order Tracking</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider">Help</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><Link to="/store/faq" className="hover:text-background transition-colors">FAQ</Link></li>
              <li><Link to="/store/contact" className="hover:text-background transition-colors">Support</Link></li>
              <li><Link to="/store/privacy" className="hover:text-background transition-colors">Privacy Policy</Link></li>
              <li><Link to="/store/terms" className="hover:text-background transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider">Connect</h4>
            <div className="flex gap-3 mb-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-background/70 hover:text-background transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-background/70 hover:text-background transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-background/70 hover:text-background transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
            <div className="space-y-2 text-sm text-background/70">
              <Link to="/" className="block hover:text-background transition-colors">
                ← Back to PrayerForward
              </Link>
              <Link to="/churches" className="block hover:text-background transition-colors">
                Find a Church
              </Link>
              <Link to="/support" className="block hover:text-background transition-colors">
                Support the Mission
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-background/50">
          <p>© {new Date().getFullYear()} PrayerForward. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/store/terms" className="hover:text-background/80">Terms</Link>
            <Link to="/store/privacy" className="hover:text-background/80">Privacy</Link>
            <Link to="/store/refund-policy" className="hover:text-background/80">Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default StoreFooter;
