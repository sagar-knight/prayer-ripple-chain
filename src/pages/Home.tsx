import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Heart,
  ArrowRight,
  BookOpen,
  Users,
  Waves,
  Church,
  Calendar,
  Bell,
  Sparkles,
  HandHeart,
} from "lucide-react";
import heroImage from "@/assets/hero-prayer.jpg";
import DailyVerseCard from "@/components/DailyVerseCard";
import NewsletterSubscribe from "@/components/NewsletterSubscribe";
import FeaturedPrayerCard from "@/components/FeaturedPrayerCard";
import ActivityPulse from "@/components/ActivityPulse";

const Home = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Cinematic layered backdrop */}
        <div className="absolute inset-0 bg-aurora" aria-hidden />
        <div className="absolute inset-0" aria-hidden>
          <img
            src={heroImage}
            alt=""
            className="w-full h-full object-cover opacity-[0.18] mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background" />
        </div>
        {/* Subtle white halo */}
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[820px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(closest-side, hsl(var(--foreground) / 0.18), transparent 70%)" }}
          aria-hidden
        />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24 pb-14 md:pb-20">
          <div className="text-center space-y-5 animate-gentle-fade mb-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 backdrop-blur px-4 py-1.5 text-xs font-medium tracking-wide uppercase text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-peaceful-glow" />
              Live prayer community
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-[1.05] tracking-tight">
              Someone needs your{" "}
              <span className="text-gradient">prayer</span> today
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Pray for one request. Pass it forward. Watch the ripple reach the world.
            </p>
          </div>

          <FeaturedPrayerCard />

          <div className="mt-6">
            <ActivityPulse />
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Public requests are moderated for safety. Anonymous prayer is supported.
          </p>
        </div>
      </section>

      {/* Secondary: Church + Family */}
      <section className="py-12 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 bg-card/70">
            <CardHeader>
              <CardTitle className="font-playfair text-xl flex items-center gap-2">
                <Church className="h-5 w-5 text-primary" />
                Bring PrayerForward to your church
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Connect a congregation, share prayer needs, and pray together as a community.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/churches">Register / Join Church</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="border-0 bg-card/70">
            <CardHeader>
              <CardTitle className="font-playfair text-xl flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Create a private family prayer circle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                A safe, invite-only space for your family to share requests and pray together.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/family">Start Family Circle</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Daily Reminder Hook */}
      <section className="py-8 bg-card/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-0 bg-background/60">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Want a daily prayer reminder?</p>
                  <p className="text-sm text-muted-foreground">
                    A gentle nudge once a day. No pressure.
                  </p>
                </div>
              </div>
              <Button asChild variant="peaceful" size="sm">
                <Link to="/calendar">Set Prayer Reminder</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-card/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: 1, title: "Create Your Profile", desc: "Choose to receive or offer prayers — or both. Stay anonymous or share your journey." },
              { step: 2, title: "Submit or Accept", desc: "Post your prayer needs or browse the Prayer Wall to lift others in prayer." },
              { step: 3, title: "Track Your Ripple", desc: "See how your prayers have traveled — through individuals, churches, and beyond." },
              { step: 4, title: "Pray It Forward", desc: "After praying, pass the blessing on. The ripple begins with you." },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-4">
                <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center mx-auto text-primary-foreground text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: HandHeart, title: "Prayer Wall", desc: "Browse real-time prayer requests. Accept a prayer tile and mark it once you've prayed.", gradient: "bg-gradient-warm" },
              { icon: Waves, title: "Ripple Reach Tracker", desc: "Visualize your impact — see how many lives your prayer has touched.", gradient: "bg-gradient-primary text-primary-foreground" },
              { icon: Church, title: "Church Collaboration", desc: "Connect with churches, submit requests to them, or join their prayer groups.", gradient: "bg-gradient-warm" },
              { icon: Calendar, title: "Calendar & Reminders", desc: "Track accepted prayers, set daily reminders, and maintain prayer streaks.", gradient: "" },
              { icon: Bell, title: "Smart Notifications", desc: "\"Have you prayed today?\", \"Someone's waiting for your prayer.\"", gradient: "" },
              { icon: BookOpen, title: "Scripture & Encouragement", desc: "Receive curated Bible verses and reflections matched to your prayer needs.", gradient: "" },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className={`group hover:shadow-peaceful transition-all duration-300 border-0 ${feature.gradient || "bg-card/70"}`}>
                  <CardHeader>
                    <CardTitle className="font-playfair text-lg flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`leading-relaxed text-sm ${feature.gradient.includes("primary") ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Daily Scripture */}
      <section className="py-8 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <DailyVerseCard />
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterSubscribe />

      {/* Final CTA */}
      <section className="py-16 bg-gradient-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-6">
            Your One Prayer Can Change Everything.
          </h2>
          <p className="text-lg mb-8 text-primary-foreground/90 max-w-3xl mx-auto">
            Join a movement where every prayer leads to another, and every person
            feels seen, heard, and loved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="secondary" size="lg" className="text-lg px-10 py-4">
              <Link to="/pray">
                <Heart className="mr-2 h-5 w-5" />
                Start Praying
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="text-lg px-10 py-4">
              <Link to="/submit-prayer">
                Request Prayer
                <BookOpen className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
