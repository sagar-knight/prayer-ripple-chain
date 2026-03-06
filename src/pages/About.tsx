import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Heart, Users, Shield, Globe, Mail, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  const faqItems = [
    {
      question: "What is PrayerForward?",
      answer: "PrayerForward is a faith-based prayer app where you can receive prayers, pray for others, and become part of a growing chain of compassion. Every prayer you offer carries the potential to spark another, creating a spiritual ripple of love, healing, and hope. Prayer actions are always free with no ads or product links inside prayer flows."
    },
    {
      question: "Is my privacy protected?",
      answer: "Absolutely. We take privacy seriously. You can choose to submit prayer requests anonymously, and all personal information is encrypted and protected. We never share your data without explicit permission."
    },
    {
      question: "Can I remain anonymous when praying for others?",
      answer: "Yes, you can choose to pray anonymously. When you offer prayers for others, you can decide whether to share your name or remain anonymous while still providing spiritual support."
    },
    {
      question: "How do church communities participate?",
      answer: "Churches can join our network to share prayer requests with their congregation and connect with other faith communities. Church leaders can create profiles, share prayer needs, and participate in inter-church prayer support."
    },
    {
      question: "What is the Ripple Impact feature?",
      answer: "Ripple Impact tracks how your prayers create chains of blessing. When someone receives prayer and experiences God's goodness, they're encouraged to pray for others, creating ripples of hope that spread throughout our community and beyond."
    },
    {
      question: "How does counseling support work?",
      answer: "We connect you with licensed Christian counselors and pastoral care providers. You can choose from chat, email, phone, or video sessions. All counselors are credentialed professionals who integrate faith with clinical expertise."
    },
    {
      question: "Is there a cost to use PrayerForward?",
      answer: "Prayer actions are always 100% free with no ads or product links inside prayer flows. Optional resources (journals, devotionals) are available in the Resources tab. Counseling services may have fees."
    },
    {
      question: "How do I get started?",
      answer: "Simply create an account and choose how you'd like to participate - submit a prayer request, pray for others, or explore church communities. No special requirements - just an open heart and willingness to connect in faith."
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "Compassion",
      description: "We approach every prayer request with love, empathy, and genuine care for each person's journey."
    },
    {
      icon: Shield,
      title: "Privacy & Safety",
      description: "Your personal information and prayer requests are protected with the highest security standards."
    },
    {
      icon: Users,
      title: "Community",
      description: "We believe in the power of united prayer and the strength found in spiritual community."
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connecting believers across denominations, cultures, and geographic boundaries through prayer."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-gentle-fade">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-4">
            About PrayerForward
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn more about our mission to connect hearts through prayer and create ripples of hope around the world
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="mb-12 bg-gradient-warm text-accent-foreground animate-gentle-fade">
          <CardContent className="pt-8 text-center">
            <h2 className="font-playfair text-2xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg leading-relaxed max-w-3xl mx-auto">
              To create a global community where faith transcends boundaries, where every prayer request finds caring hearts, 
              and where the simple act of praying for others creates ripples of hope, healing, and transformation that reach 
              far beyond what we can imagine.
            </p>
          </CardContent>
        </Card>

        {/* Core Values */}
        <div className="mb-12">
          <h2 className="font-playfair text-2xl font-bold text-foreground mb-8 text-center">
            Our Core Values
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card 
                  key={value.title}
                  className="group hover:shadow-peaceful transition-all duration-300 animate-gentle-fade"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <CardTitle className="font-playfair text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* How It Works */}
        <Card className="mb-12 animate-gentle-fade">
          <CardHeader>
            <CardTitle className="font-playfair text-2xl text-center">How PrayerForward Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">1</span>
                </div>
                <h3 className="font-semibold">Share or Discover</h3>
                <p className="text-sm text-muted-foreground">
                  Submit your prayer requests or browse requests from others in need of prayer support
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">2</span>
                </div>
                <h3 className="font-semibold">Connect & Pray</h3>
                <p className="text-sm text-muted-foreground">
                  Join others in prayer, offer support, and connect with church communities for deeper fellowship
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">3</span>
                </div>
                <h3 className="font-semibold">Create Ripples</h3>
                <p className="text-sm text-muted-foreground">
                  Experience answered prayers and pay it forward, creating chains of blessing that impact lives globally
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="font-playfair text-2xl font-bold text-foreground mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          <Card className="animate-gentle-fade">
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Contact & Support */}
        <Card className="bg-primary/5 border-primary/20 animate-gentle-fade">
          <CardHeader className="text-center">
            <HelpCircle className="h-8 w-8 text-primary mx-auto mb-2" />
            <CardTitle className="font-playfair text-xl">Need More Help?</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              If you have questions not covered here or need additional support, we're here to help.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="peaceful">
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
              
              <Button asChild variant="outline">
                <Link to="/counsel">
                  Get Counseling Help
                </Link>
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground pt-4 border-t border-border">
              <p className="mb-2">
                <strong>Crisis Support:</strong> If you're experiencing a mental health emergency, 
                please contact your local emergency services or call 988 for the Suicide & Crisis Lifeline.
              </p>
              <p>
                <strong>Technical Issues:</strong> For website problems or technical support, 
                please email us with details about the issue you're experiencing.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;