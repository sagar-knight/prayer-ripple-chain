import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Church, MessageCircle, Waves, ArrowRight, BookOpen, Calendar, Target, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-prayer.jpg";

const Home = () => {
  const [verseOfDay] = useState({
    verse: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
    reference: "Romans 8:28",
  });

  const [userStats] = useState({
    prayersOffered: 12,
    chainCount: 3,
    rippleReach: 47,
    streak: 5,
  });

  const features = [
    {
      icon: Heart,
      title: "Submit Prayer Requests",
      description: "Share your prayer needs with our caring community",
      href: "/submit-prayer",
      color: "text-red-500"
    },
    {
      icon: Users,
      title: "Pray for Others",
      description: "Join others in lifting up prayer requests",
      href: "/pray",
      color: "text-blue-500"
    },
    {
      icon: Church,
      title: "Connect with Churches",
      description: "Find local church communities and their prayer needs",
      href: "/churches",
      color: "text-purple-500"
    },
    {
      icon: MessageCircle,
      title: "Counseling Support",
      description: "Access private spiritual guidance and support",
      href: "/counsel",
      color: "text-green-500"
    },
    {
      icon: Waves,
      title: "Ripple Impact",
      description: "See how your prayers create waves of blessing",
      href: "/ripple",
      color: "text-amber-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-peaceful">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Peaceful prayer scene" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/80"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center space-y-8 animate-gentle-fade">
            <h1 className="font-playfair text-5xl md:text-7xl font-bold text-foreground leading-tight">
              🙏 Pray It Forward
            </h1>
            
            <p className="text-2xl md:text-3xl font-medium text-primary max-w-4xl mx-auto leading-relaxed">
              One Prayer Can Create a Ripple That Touches the World.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
              <Button asChild variant="peaceful" size="lg" className="text-lg px-10 py-6">
                <Link to="/submit-prayer">
                  📧 Join Waitlist
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button asChild variant="warm" size="lg" className="text-lg px-10 py-6">
                <Link to="/pray">
                  Start Praying Now
                  <Heart className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What Is Pray It Forward Section */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-8">
            ✨ What Is Pray It Forward?
          </h2>
          <p className="text-xl text-muted-foreground max-w-5xl mx-auto leading-relaxed">
            Pray It Forward is a faith-based prayer app where you can receive prayers, pray for others, and become part of a growing chain of compassion. Inspired by the heart of Pay It Forward, every prayer you offer carries the potential to spark another — creating a spiritual ripple of love, healing, and hope across the globe.
          </p>
        </div>
      </section>

      {/* Who Is It For Section */}
      <section className="py-20 bg-card/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground text-center mb-16">
            👤 Who Is It For?
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            Whether you're someone who:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8 bg-gradient-warm">
              <CardContent className="pt-6">
                <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">Needs Prayer</h3>
                <p className="text-muted-foreground">During a difficult time</p>
              </CardContent>
            </Card>
            <Card className="text-center p-8 bg-gradient-primary text-primary-foreground">
              <CardContent className="pt-6">
                <Users className="w-12 h-12 text-primary-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">Desires to Pray</h3>
                <p className="text-primary-foreground/90">And uplift others</p>
              </CardContent>
            </Card>
            <Card className="text-center p-8 bg-gradient-warm">
              <CardContent className="pt-6">
                <Church className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">Wants Community</h3>
                <p className="text-muted-foreground">Join your church in collective prayer</p>
              </CardContent>
            </Card>
          </div>
          <p className="text-2xl font-semibold text-center mt-12 text-primary">
            This app is for you.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground text-center mb-16">
            📲 How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto text-primary-foreground text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold">Create Your Profile</h3>
              <p className="text-muted-foreground">Choose to receive or offer prayers — or both. Stay anonymous or share your journey.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto text-primary-foreground text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold">Submit or Accept</h3>
              <p className="text-muted-foreground">Post your prayer needs or browse the Prayer Wall to lift others in prayer.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto text-primary-foreground text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold">Track Your Ripple</h3>
              <p className="text-muted-foreground">See how your prayers have traveled — through individuals, churches, and across continents.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto text-primary-foreground text-2xl font-bold">
                4
              </div>
              <h3 className="text-xl font-semibold">Pray It Forward</h3>
              <p className="text-muted-foreground">When someone prays for you, continue the chain. Let the ripple begin with you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Verse of the Day & Dashboard */}
      <section className="py-16 bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Verse of the Day */}
            <Card className="bg-gradient-warm text-accent-foreground animate-gentle-fade">
              <CardHeader>
                <CardTitle className="font-playfair text-2xl flex items-center gap-2">
                  <BookOpen className="h-6 w-6" />
                  Verse of the Day
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg italic leading-relaxed mb-4">
                  "{verseOfDay.verse}"
                </p>
                <p className="font-semibold text-accent-foreground/90">
                  - {verseOfDay.reference}
                </p>
              </CardContent>
            </Card>

            {/* Personal Dashboard Preview */}
            <Card className="bg-card animate-gentle-fade" style={{ animationDelay: "200ms" }}>
              <CardHeader>
                <CardTitle className="font-playfair text-2xl flex items-center gap-2">
                  <Target className="h-6 w-6 text-primary" />
                  Your Prayer Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{userStats.prayersOffered}</div>
                    <div className="text-sm text-muted-foreground">Prayers Offered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{userStats.chainCount}</div>
                    <div className="text-sm text-muted-foreground">Chains Started</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{userStats.rippleReach}</div>
                    <div className="text-sm text-muted-foreground">Lives Touched</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{userStats.streak}</div>
                    <div className="text-sm text-muted-foreground">Day Streak</div>
                  </div>
                </div>
                <Button asChild variant="outline" className="w-full mt-4">
                  <Link to="/dashboard">
                    View Full Dashboard
                    <TrendingUp className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-8">
              🔥 Key Features
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-peaceful transition-all duration-300 border-0 bg-gradient-warm">
              <CardHeader>
                <CardTitle className="font-playfair text-xl flex items-center gap-2">
                  🙌 Prayer Wall
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Scroll through real-time prayer requests. Accept a prayer tile and mark it once you've prayed. Share a verse or words of comfort.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-peaceful transition-all duration-300 border-0 bg-gradient-primary text-primary-foreground">
              <CardHeader>
                <CardTitle className="font-playfair text-xl flex items-center gap-2">
                  🌊 Ripple Reach Tracker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-primary-foreground/90 leading-relaxed">
                  Visualize your impact. See how many lives your prayer has touched — directly and through chains you've inspired.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-peaceful transition-all duration-300 border-0 bg-gradient-warm">
              <CardHeader>
                <CardTitle className="font-playfair text-xl flex items-center gap-2">
                  ⛪ Church Collaboration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Connect with churches near you. Submit requests to specific churches, or join your church's prayer group.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-peaceful transition-all duration-300 border-0 bg-card/70">
              <CardHeader>
                <CardTitle className="font-playfair text-xl flex items-center gap-2">
                  📖 Prayer Profiles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Each user has a prayer-focused profile with Prayer Requests Accepted, Ripple Reach, and spiritual connections.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-peaceful transition-all duration-300 border-0 bg-card/70">
              <CardHeader>
                <CardTitle className="font-playfair text-xl flex items-center gap-2">
                  🔔 Smart Reminders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Get gentle daily nudges: "Have you prayed today?", "Someone's waiting for your prayer."
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-peaceful transition-all duration-300 border-0 bg-card/70">
              <CardHeader>
                <CardTitle className="font-playfair text-xl flex items-center gap-2">
                  💬 Counseling & Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Connect with caring counselors via anonymous chat, email, or video — all within the app.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Join the Movement Section */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-8">
            🌍 Join the Movement
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-12">
            Let's build a world where every prayer leads to another, and every person feels seen, heard, and loved — one ripple at a time.
          </p>
          
          <div className="bg-gradient-primary rounded-2xl p-12 text-primary-foreground">
            <h3 className="font-playfair text-3xl md:text-4xl font-bold mb-6">
              📥 Download Pray It Forward
            </h3>
            <p className="text-xl mb-8 text-primary-foreground/90">
              Coming soon to App Store and Google Play
            </p>
            <p className="text-lg mb-8">
              Subscribe below and be the first to know when we launch!
            </p>
            <Button variant="secondary" size="lg" className="text-lg px-12 py-4">
              📧 Join Waitlist
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-8">
            💖 Your One Prayer Can Change Everything.
          </h2>
          <p className="text-xl mb-12 text-primary-foreground/90 max-w-3xl mx-auto leading-relaxed">
            Join thousands who are already creating ripples of hope, one prayer at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="secondary" size="lg" className="text-lg px-10 py-4">
              <Link to="/submit-prayer">
                📧 Join Waitlist
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-10 py-4 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Link to="/pray">
                Start Praying Now
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