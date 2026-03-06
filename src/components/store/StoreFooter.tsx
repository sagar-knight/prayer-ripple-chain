import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
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
    <footer className="bg-foreground text-background mt-16">
      {/* Newsletter strip */}
      <div className="border-b border-background/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-5">
          <div>
            <h3 className="font-serif text-xl font-bold">Sign Up & Save</h3>
            <p className="text-background/60 mt-1">Store updates & encouragement. No spam.</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background/10 border-background/20 text-background placeholder:text-background/40 w-full md:w-72 h-12"
            />
            <Button type="submit" variant="secondary" className="shrink-0 rounded-full h-12 px-6">Subscribe</Button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <Heart className="h-5 w-5" />
              <span className="font-serif font-bold text-base">PrayerForward</span>
            </div>
            <ul className="space-y-3 text-background/60">
              <li><Link to="/store/about" className="hover:text-background transition-colors">Our Mission</Link></li>
              <li><Link to="/about" className="hover:text-background transition-colors">Impact</Link></li>
              <li><Link to="/store/contact" className="hover:text-background transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-5 uppercase tracking-widest text-background/80">Customer Care</h4>
            <ul className="space-y-3 text-background/60">
              <li><Link to="/store/shipping" className="hover:text-background transition-colors">Shipping</Link></li>
              <li><Link to="/store/returns" className="hover:text-background transition-colors">Returns</Link></li>
              <li><Link to="/store/refund-policy" className="hover:text-background transition-colors">Refunds</Link></li>
              <li><Link to="/store/order-tracking" className="hover:text-background transition-colors">Order Tracking</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-5 uppercase tracking-widest text-background/80">Help</h4>
            <ul className="space-y-3 text-background/60">
              <li><Link to="/store/faq" className="hover:text-background transition-colors">FAQ</Link></li>
              <li><Link to="/store/contact" className="hover:text-background transition-colors">Support</Link></li>
              <li><Link to="/store/privacy" className="hover:text-background transition-colors">Privacy</Link></li>
              <li><Link to="/store/terms" className="hover:text-background transition-colors">Terms</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-5 uppercase tracking-widest text-background/80">Explore</h4>
            <ul className="space-y-3 text-background/60">
              <li><Link to="/" className="hover:text-background transition-colors">PrayerForward App</Link></li>
              <li><Link to="/churches" className="hover:text-background transition-colors">Find a Church</Link></li>
              <li><Link to="/support" className="hover:text-background transition-colors">Support the Mission</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-background/40">
          <p>© {new Date().getFullYear()} PrayerForward. All rights reserved.</p>
          <div className="flex gap-5">
            <Link to="/store/terms" className="hover:text-background/70">Terms</Link>
            <Link to="/store/privacy" className="hover:text-background/70">Privacy</Link>
            <Link to="/store/refund-policy" className="hover:text-background/70">Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default StoreFooter;
