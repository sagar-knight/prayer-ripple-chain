import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Church, MessageCircle, Waves, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-prayer.jpg";

const Home = () => {
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
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-peaceful opacity-80"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center space-y-8 animate-gentle-fade">
            <h1 className="font-playfair text-4xl md:text-6xl font-bold text-foreground leading-tight">
              Connecting Hearts
              <span className="block text-primary">Through Prayer</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Join a community where faith meets compassion. Submit prayer requests, 
              pray for others, and experience the ripple effect of spiritual connection.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="peaceful" size="lg" className="text-lg px-8">
                <Link to="/submit-prayer">
                  Submit Prayer Request
                  <Heart className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button asChild variant="warm" size="lg" className="text-lg px-8">
                <Link to="/pray">
                  Pray for Others
                  <Users className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-4">
              How We Connect
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover the different ways you can participate in our prayer community
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={feature.title} 
                  className="group hover:shadow-peaceful transition-all duration-300 cursor-pointer border-0 bg-card/50"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Link to={feature.href}>
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className={`h-8 w-8 ${feature.color} group-hover:scale-110 transition-transform`} />
                      </div>
                      <CardTitle className="font-playfair text-xl group-hover:text-primary transition-colors">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="text-center">
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        {feature.description}
                      </p>
                      <div className="flex items-center justify-center text-primary group-hover:text-primary-glow transition-colors">
                        <span className="text-sm font-medium">Learn more</span>
                        <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-6">
            Begin Your Prayer Journey Today
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Whether you need prayer or want to pray for others, every step creates ripples of hope
          </p>
          <Button asChild variant="secondary" size="lg" className="text-lg px-8">
            <Link to="/submit-prayer">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;