import { Link } from "react-router-dom";
import { BookOpen, Users, Waves, HandHeart, Facebook, Instagram, Youtube } from "lucide-react";
import { PrayerForwardLogo } from "@/components/PrayerForwardLogo";
import { CommunityIcon } from "@/components/icons/CommunityIcon";

const AppFooter = () => {
  return (
    <footer className="bg-foreground text-background mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <PrayerForwardLogo className="h-7 w-7" />
              <span className="font-playfair font-semibold">PrayerForward</span>
            </div>
            <p className="text-sm text-background/60 leading-relaxed">
              One prayer. Passed forward. Building a global community of compassion and hope.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://facebook.com/prayerforward"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="h-8 w-8 rounded-full border border-background/20 flex items-center justify-center text-background/70 hover:text-background hover:border-background/50 transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com/prayerforward"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="h-8 w-8 rounded-full border border-background/20 flex items-center justify-center text-background/70 hover:text-background hover:border-background/50 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2H21.5l-7.51 8.59L23 22h-6.844l-5.36-7.013L4.66 22H1.4l8.04-9.197L1 2h7.02l4.844 6.43L18.244 2zm-2.4 18h1.9L7.26 4H5.26l10.584 16z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/prayerforward"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="h-8 w-8 rounded-full border border-background/20 flex items-center justify-center text-background/70 hover:text-background hover:border-background/50 transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com/@prayerforward"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="h-8 w-8 rounded-full border border-background/20 flex items-center justify-center text-background/70 hover:text-background hover:border-background/50 transition-colors"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider">Navigate</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><Link to="/pray" className="hover:text-background transition-colors flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />Pray</Link></li>
              <li><Link to="/submit-prayer" className="hover:text-background transition-colors flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" />Request Prayer</Link></li>
              <li><Link to="/communities" className="hover:text-background transition-colors flex items-center gap-1.5"><CommunityIcon className="h-3.5 w-3.5" />Communities</Link></li>
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
              <li><Link to="/guidelines" className="hover:text-background transition-colors">Community Guidelines</Link></li>
              <li><Link to="/disclaimer" className="hover:text-background transition-colors">Disclaimer</Link></li>
              <li><a href="mailto:support@prayerforward.com" className="hover:text-background transition-colors">support@prayerforward.com</a></li>
            </ul>
          </div>
        </div>

        {/* Store links */}
        <div className="border-t border-background/10 mt-8 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-background/50">
            <p>&copy; {new Date().getFullYear()} PrayerForward. All rights reserved.</p>
            <div className="flex gap-4">
              <Link to="/terms" className="hover:text-background/80">Terms</Link>
              <Link to="/privacy" className="hover:text-background/80">Privacy</Link>
              <Link to="/guidelines" className="hover:text-background/80">Guidelines</Link>
              <Link to="/disclaimer" className="hover:text-background/80">Disclaimer</Link>
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
