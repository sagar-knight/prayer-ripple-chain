import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Heart,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import heroImage from "@/assets/hero-prayer.jpg";
import DailyVerseCard from "@/components/DailyVerseCard";
import NewsletterSubscribe from "@/components/NewsletterSubscribe";

const Home = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Peaceful prayer scene"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-40">
          <div className="text-center space-y-8 animate-gentle-fade">
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-foreground leading-[1.1]">
              PrayerForward
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              One prayer. Passed forward.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="text-lg px-10 py-7 rounded-full">
                <Link to="/signup">
                  🙏 Get Started
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="text-lg px-10 py-7 rounded-full">
                <Link to="/login">
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What Is PrayerForward */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-8">
            What Is PrayerForward?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
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
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground text-center mb-16">
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
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto text-primary-foreground text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold font-serif">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground text-center mb-16">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { emoji: "🙌", title: "Prayer Wall", desc: "Browse real-time prayer requests. Accept a prayer tile and mark it once you've prayed." },
              { emoji: "🌊", title: "Ripple Reach Tracker", desc: "Visualize your impact — see how many lives your prayer has touched." },
              { emoji: "⛪", title: "Church Collaboration", desc: "Connect with churches, submit requests to them, or join their prayer groups." },
              { emoji: "📅", title: "Calendar & Reminders", desc: "Track accepted prayers, set daily reminders, and maintain prayer streaks." },
              { emoji: "🔔", title: "Smart Notifications", desc: '"Have you prayed today?", "Someone\'s waiting for your prayer."' },
              { emoji: "📖", title: "Scripture & Encouragement", desc: "Receive curated Bible verses and reflections matched to your prayer needs." },
            ].map((feature) => (
              <Card key={feature.title} className="group hover:shadow-warm transition-all duration-300 border border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="font-serif text-xl flex items-center gap-3">
                    <span className="text-2xl">{feature.emoji}</span> {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed text-muted-foreground">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
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
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-8">
            Your One Prayer Can Change Everything.
          </h2>
          <p className="text-lg md:text-xl mb-10 text-background/80 max-w-3xl mx-auto leading-relaxed">
            Join a movement where every prayer leads to another, and every person
            feels seen, heard, and loved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="secondary" size="lg" className="text-lg px-10 py-7 rounded-full">
              <Link to="/signup">🙏 Join Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-10 py-7 rounded-full border-background/30 text-background hover:bg-background hover:text-foreground">
              <Link to="/login">
                Sign In
                <Heart className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
