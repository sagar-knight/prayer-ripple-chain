import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Heart,
  ArrowRight,
  Users,
  Waves,
  Church,
  Calendar,
  BookOpen,
} from "lucide-react";
import heroImage from "@/assets/hero-prayer.jpg";
import DailyVerseCard from "@/components/DailyVerseCard";
import NewsletterSubscribe from "@/components/NewsletterSubscribe";

const featureIcons: Record<string, any> = {
  "Prayer Wall": Heart,
  "Ripple Reach Tracker": Waves,
  "Church Collaboration": Church,
  "Calendar & Reminders": Calendar,
  "Smart Notifications": Heart,
  "Scripture & Encouragement": BookOpen,
};

const Home = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Peaceful prayer scene"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-40">
          <div className="text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-semibold text-foreground leading-[1.1] tracking-tight">
              PrayerForward
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              One prayer. Passed forward.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="text-base px-10 py-6 rounded-full">
                <Link to="/signup">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="text-base px-10 py-6 rounded-full border-foreground/20 text-foreground hover:bg-foreground hover:text-background">
                <Link to="/login">
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What Is PrayerForward */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-8 tracking-tight">
            What Is PrayerForward?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            PrayerForward is a faith-based prayer app where you can receive
            prayers, pray for others, and become part of a growing chain of
            compassion. Every prayer you offer carries the potential to spark
            another — creating a spiritual ripple of love, healing, and hope
            across the globe.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-secondary/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground text-center mb-16 tracking-tight">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              { step: 1, title: "Create Your Profile", desc: "Choose to receive or offer prayers — or both. Stay anonymous or share your journey." },
              { step: 2, title: "Submit or Accept", desc: "Post your prayer needs or browse the Prayer Wall to lift others in prayer." },
              { step: 3, title: "Track Your Ripple", desc: "See how your prayers have traveled — through individuals, churches, and beyond." },
              { step: 4, title: "Pray It Forward", desc: "After praying, pass the blessing on. The ripple begins with you." },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-5">
                <div className="w-14 h-14 bg-foreground rounded-full flex items-center justify-center mx-auto text-background text-lg font-semibold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground text-center mb-16 tracking-tight">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Prayer Wall", desc: "Browse real-time prayer requests. Accept a prayer tile and mark it once you've prayed." },
              { title: "Ripple Reach Tracker", desc: "Visualize your impact — see how many lives your prayer has touched." },
              { title: "Church Collaboration", desc: "Connect with churches, submit requests to them, or join their prayer groups." },
              { title: "Calendar & Reminders", desc: "Track accepted prayers, set daily reminders, and maintain prayer streaks." },
              { title: "Smart Notifications", desc: '"Have you prayed today?", "Someone\'s waiting for your prayer."' },
              { title: "Scripture & Encouragement", desc: "Receive curated Bible verses and reflections matched to your prayer needs." },
            ].map((feature) => {
              const Icon = featureIcons[feature.title] || Heart;
              return (
                <Card key={feature.title} className="border border-border hover:border-foreground/20 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="leading-relaxed text-muted-foreground text-sm">
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
      <section className="py-12 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <DailyVerseCard />
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterSubscribe />

      {/* Final CTA */}
      <section className="py-20 bg-foreground text-background">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-semibold mb-8 tracking-tight">
            Your One Prayer Can Change Everything.
          </h2>
          <p className="text-lg mb-10 text-background/70 max-w-3xl mx-auto leading-relaxed">
            Join a movement where every prayer leads to another, and every person
            feels seen, heard, and loved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="secondary" size="lg" className="text-base px-10 py-6 rounded-full">
              <Link to="/signup">Join Now</Link>
            </Button>
            <Button asChild size="lg" className="text-base px-10 py-6 rounded-full bg-transparent border border-background/40 text-background hover:bg-background hover:text-foreground">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
