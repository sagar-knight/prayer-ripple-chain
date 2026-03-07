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

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-peaceful pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Peaceful prayer scene"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/80" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center space-y-6 animate-gentle-fade">
            <h1 className="font-playfair text-4xl md:text-6xl font-bold text-foreground leading-tight">
              PrayerForward
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              One prayer. Passed forward.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button asChild variant="peaceful" size="lg" className="text-lg px-8 py-6">
                <Link to="/pray">
                  <Heart className="mr-2 h-5 w-5" />
                  Get Started
                </Link>
              </Button>

              <Button asChild variant="warm" size="lg" className="text-lg px-8 py-6">
                <Link to="/login">
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Feature CTAs */}
            <div className="flex flex-wrap gap-3 justify-center mt-4">
              <Button asChild variant="secondary" size="sm" className="gap-1.5">
                <Link to="/submit-prayer">
                  <BookOpen className="h-3.5 w-3.5" />
                  Request Prayer
                </Link>
              </Button>
              <Button asChild variant="secondary" size="sm" className="gap-1.5">
                <Link to="/ripple">
                  <Waves className="h-3.5 w-3.5" />
                  Explore Ripple
                </Link>
              </Button>
              <Button asChild variant="secondary" size="sm" className="gap-1.5">
                <Link to="/scripture">
                  <BookOpen className="h-3.5 w-3.5" />
                  Scripture
                </Link>
              </Button>
              <Button asChild variant="secondary" size="sm" className="gap-1.5">
                <Link to="/churches">
                  <Church className="h-3.5 w-3.5" />
                  Churches
                </Link>
              </Button>
              <Button asChild variant="secondary" size="sm" className="gap-1.5">
                <Link to="/family">
                  <Users className="h-3.5 w-3.5" />
                  Family
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What Is PrayerForward */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-8">
            What Is PrayerForward?
          </h2>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            PrayerForward is a faith-based prayer app where you can receive
            prayers, pray for others, and become part of a growing chain of
            compassion. Every prayer you offer carries the potential to spark
            another — creating a spiritual ripple of love, healing, and hope
            across the globe.
          </p>
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
            <Button asChild variant="outline" size="lg" className="text-lg px-10 py-4 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
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
