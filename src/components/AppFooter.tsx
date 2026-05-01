import { Link } from "react-router-dom";
import { BookOpen, Users, Waves, HandHeart, Church } from "lucide-react";
import logoImage from "@/assets/prayer-forward-logo.png";

const AppFooter = () => {
  return (
    <footer className="bg-foreground text-background mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="mb-4 inline-flex items-center bg-background/10 rounded-md p-2">
              <img src={logoImage} alt="PrayerForward" className="h-8 w-auto object-contain" />
            </div>
            <p className="text-sm text-background/60 leading-relaxed">
              One prayer. Passed forward. Building a global community of compassion and hope.
            </p>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider">Navigate</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><Link to="/pray" className="hover:text-background transition-colors flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />Pray</Link></li>
              <li><Link to="/submit-prayer" className="hover:text-background transition-colors flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" />Request Prayer</Link></li>
              <li><Link to="/churches" className="hover:text-background transition-colors flex items-center gap-1.5"><Church className="h-3.5 w-3.5" />Churches</Link></li>
              <li><Link to="/ripple" className="hover:text-background transition-colors flex items-center gap-1.5"><Waves className="h-3.5 w-3.5" />Ripple Impact</Link></li>
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><Link to="/scripture" className="hover:text-background transition-colors">Scripture</Link></li>
              <li><Link to="/calendar" className="hover:text-background transition-colors">Prayer Calendar</Link></li>
              <li><Link to="/family" className="hover:text-background transition-colors">Family Groups</Link></li>
              <li><Link to="/store" className="hover:text-background transition-colors">Store</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider">Support</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><Link to="/support" className="hover:text-background transition-colors flex items-center gap-1.5"><HandHeart className="h-3.5 w-3.5" />Support the Mission</Link></li>
              <li><Link to="/about" className="hover:text-background transition-colors">About</Link></li>
              <li><Link to="/store/faq" className="hover:text-background transition-colors">FAQ</Link></li>
              <li><Link to="/store/contact" className="hover:text-background transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        {/* Store links */}
        <div className="border-t border-background/10 mt-8 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-background/50">
            <p>&copy; {new Date().getFullYear()} PrayerForward. All rights reserved.</p>
            <div className="flex gap-4">
              <Link to="/store/terms" className="hover:text-background/80">Terms</Link>
              <Link to="/store/privacy" className="hover:text-background/80">Privacy</Link>
              <Link to="/store/shipping" className="hover:text-background/80">Shipping</Link>
              <Link to="/store/returns" className="hover:text-background/80">Returns</Link>
              <Link to="/store/refund-policy" className="hover:text-background/80">Refunds</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
