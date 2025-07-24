import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Video, Mail, Phone, Heart, Shield, Clock, Star } from "lucide-react";

const Counsel = () => {
  const counselors = [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      title: "Licensed Christian Counselor",
      specialties: ["Marriage & Family", "Grief & Loss", "Depression"],
      experience: "15 years",
      rating: 4.9,
      availability: "Available today",
      image: "photo-1472396961693-142e6e269027",
      description: "Compassionate counseling with a focus on faith-based healing and restoration."
    },
    {
      id: "2",
      name: "Pastor Michael Rodriguez", 
      title: "Pastoral Counselor",
      specialties: ["Spiritual Guidance", "Life Transitions", "Addiction Recovery"],
      experience: "20 years",
      rating: 4.8,
      availability: "Available tomorrow",
      image: "photo-1465146344425-f00d5f5c8f07",
      description: "Biblical counseling with practical wisdom for life's challenges."
    },
    {
      id: "3",
      name: "Dr. Emily Chen",
      title: "Clinical Psychologist & Believer",
      specialties: ["Anxiety & Stress", "Trauma Healing", "Youth Counseling"],
      experience: "12 years", 
      rating: 5.0,
      availability: "Available this week",
      image: "photo-1500673922987-e212871fec22",
      description: "Integrating psychological expertise with Christian faith for holistic healing."
    }
  ];

  const supportOptions = [
    {
      icon: MessageCircle,
      title: "Chat Support",
      description: "Secure text-based counseling sessions",
      features: ["Private messaging", "Real-time support", "Session recordings"],
      price: "Free - $50/session"
    },
    {
      icon: Mail,
      title: "Email Counseling",
      description: "Thoughtful written guidance and support",
      features: ["Detailed responses", "Flexible timing", "Written resources"],
      price: "$25 - $40/session"
    },
    {
      icon: Video,
      title: "Video Calls",
      description: "Face-to-face virtual counseling sessions",
      features: ["Personal connection", "Screen sharing", "Group sessions available"],
      price: "$60 - $120/session"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Voice-only counseling for privacy and comfort",
      features: ["Crisis support", "Scheduled sessions", "Conference calls"],
      price: "$40 - $80/session"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 animate-gentle-fade">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-4">
            Counseling & Support
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with licensed Christian counselors and pastoral care providers for private, faith-based guidance
          </p>
        </div>

        {/* Support Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {supportOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <Card 
                key={option.title}
                className="group hover:shadow-peaceful transition-all duration-300 animate-gentle-fade text-center"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <CardTitle className="font-playfair text-lg">{option.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm">{option.description}</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {option.features.map((feature, idx) => (
                      <li key={idx}>• {feature}</li>
                    ))}
                  </ul>
                  <div className="text-sm font-semibold text-primary">{option.price}</div>
                  <Button variant="peaceful" size="sm" className="w-full">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Available Counselors */}
        <div className="mb-12">
          <h2 className="font-playfair text-2xl font-bold text-foreground mb-6 text-center">
            Available Counselors
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {counselors.map((counselor, index) => (
              <Card 
                key={counselor.id}
                className="group hover:shadow-peaceful transition-all duration-300 animate-gentle-fade"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardHeader className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-warm overflow-hidden">
                    <img 
                      src={`https://images.unsplash.com/${counselor.image}?w=160&h=160&fit=crop&crop=face`}
                      alt={counselor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardTitle className="font-playfair text-xl">{counselor.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{counselor.title}</p>
                  
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium ml-1">{counselor.rating}</span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{counselor.experience}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">
                    {counselor.description}
                  </p>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2">Specialties:</h4>
                    <div className="flex flex-wrap gap-1">
                      {counselor.specialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    {counselor.availability}
                  </div>
                  
                  <Button variant="peaceful" className="w-full">
                    Schedule Session
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Privacy & Security */}
        <Card className="bg-primary/5 border-primary/20 animate-gentle-fade">
          <CardHeader className="text-center">
            <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
            <CardTitle className="font-playfair text-xl">Privacy & Confidentiality</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Secure Platform</h4>
                <ul className="space-y-1">
                  <li>• End-to-end encrypted communications</li>
                  <li>• HIPAA-compliant data protection</li>
                  <li>• Secure video and messaging platforms</li>
                  <li>• Anonymous options available</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Professional Standards</h4>
                <ul className="space-y-1">
                  <li>• Licensed and credentialed counselors</li>
                  <li>• Professional ethics and boundaries</li>
                  <li>• Crisis intervention protocols</li>
                  <li>• Referral resources when needed</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-accent/20 p-4 rounded-lg">
              <p className="text-sm text-center">
                <strong>Crisis Support:</strong> If you're experiencing a mental health emergency, 
                please contact your local emergency services or the National Suicide Prevention Lifeline at 988.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Counsel;