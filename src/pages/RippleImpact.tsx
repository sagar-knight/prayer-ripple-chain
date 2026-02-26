import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Waves, Heart, Users, TrendingUp, Award, Share2, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const RippleImpact = () => {
  const [userStats] = useState({
    prayersOffered: 47,
    prayersReceived: 12,
    rippleReach: 127,
    chainStarted: 3,
    livesImpacted: 89
  });

  const rippleChains = [
    {
      id: "1",
      startedBy: "You",
      date: "2 weeks ago",
      currentReach: 15,
      category: "Healing Prayer",
      status: "Active",
      lastUpdate: "Sarah prayed for healing and is now cancer-free! She started praying for others.",
      participants: [
        { name: "You", action: "Started prayer for healing" },
        { name: "Michael", action: "Prayed and was healed" },
        { name: "Sarah", action: "Prayed and received healing" },
        { name: "David", action: "Now praying for financial breakthrough" },
        { name: "Maria", action: "Praying for family restoration" }
      ]
    },
    {
      id: "2", 
      startedBy: "Grace Community",
      date: "1 month ago",
      currentReach: 32,
      category: "Family Restoration",
      status: "Growing",
      lastUpdate: "The prayer chain has reached 3 different churches across 2 states!",
      participants: [
        { name: "Grace Community", action: "Started prayer for marriage healing" },
        { name: "You", action: "Prayed for restoration" },
        { name: "Living Hope Church", action: "Entire congregation joined" },
        { name: "St. Mary's Parish", action: "Added to prayer list" },
        { name: "New Life Assembly", action: "Youth group participating" }
      ]
    }
  ];

  const globalStats = {
    totalPrayers: 15247,
    activeChains: 89,
    churchesConnected: 156,
    countriesReached: 23,
    answeredPrayers: 3842
  };

  const achievements = [
    { 
      icon: Heart, 
      title: "Prayer Warrior", 
      description: "Offered 25+ prayers",
      unlocked: true,
      color: "text-red-500"
    },
    { 
      icon: Users, 
      title: "Community Builder", 
      description: "Connected 10+ people through prayer",
      unlocked: true,
      color: "text-blue-500"
    },
    { 
      icon: Waves, 
      title: "Chain Starter", 
      description: "Started 3 prayer chains",
      unlocked: true,
      color: "text-purple-500"
    },
    { 
      icon: TrendingUp, 
      title: "Impact Multiplier", 
      description: "Reached 100+ people",
      unlocked: true,
      color: "text-green-500"
    },
    { 
      icon: Award, 
      title: "Faithful Servant", 
      description: "30-day prayer streak",
      unlocked: false,
      color: "text-amber-500"
    }
  ];

  const metricCards = [
    {
      label: "Prayers Offered",
      value: userStats.prayersOffered,
      description: "You have faithfully prayed for others.",
      icon: Heart,
    },
    {
      label: "Prayers Received",
      value: userStats.prayersReceived,
      description: "People are standing with you in prayer.",
      icon: Users,
    },
    {
      label: "Chains Started",
      value: userStats.chainStarted,
      description: "Your faith inspired others to pray.",
      icon: Waves,
    },
    {
      label: "Lives Reached",
      value: userStats.livesImpacted,
      description: "Your prayers continue to spread.",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header — calm, reflective */}
        <div className="text-center mb-10 animate-gentle-fade">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-5">
            <Waves className="h-8 w-8 text-primary opacity-80" />
          </div>
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-3">
            Ripple Impact
          </h1>
          <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Discover how your prayers create waves of blessing that touch lives around the world.
          </p>
          <Separator className="max-w-24 mx-auto mt-6 bg-primary/20" />
        </div>

        {/* Personal Stats — soft card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 animate-gentle-fade">
          {metricCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.label}
                className="border-primary/10 shadow-sm hover:shadow-md transition-shadow animate-gentle-fade"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <CardContent className="pt-6 text-center space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-1">
                    <Icon className="h-5 w-5 text-primary opacity-80" />
                  </div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    {card.label}
                  </p>
                  <p className="text-2xl font-semibold text-foreground">{card.value}</p>
                  <p className="text-sm text-muted-foreground leading-snug">{card.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Prayer Chains */}
        <div className="mb-12">
          <h2 className="font-playfair text-2xl font-bold text-foreground mb-6">
            Your Prayer Chains
          </h2>
          
          <div className="space-y-6">
            {rippleChains.map((chain, index) => (
              <Card 
                key={chain.id}
                className="hover:shadow-peaceful transition-all duration-300 animate-gentle-fade"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="font-playfair text-xl flex items-center gap-2">
                        <Waves className="h-5 w-5 text-primary" />
                        {chain.category} Chain
                      </CardTitle>
                      <p className="text-muted-foreground">
                        Started by {chain.startedBy} • {chain.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{chain.currentReach}</div>
                      <div className="text-sm text-muted-foreground">people reached</div>
                      <Badge variant="secondary" className="mt-1">
                        {chain.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <h4 className="font-semibold text-primary mb-2">Latest Update:</h4>
                    <p className="text-sm text-muted-foreground">{chain.lastUpdate}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Prayer Chain Journey:</h4>
                    <div className="space-y-2">
                      {chain.participants.map((participant, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                          <div className="text-sm">
                            <span className="font-medium">{participant.name}</span>
                            <span className="text-muted-foreground"> - {participant.action}</span>
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <div className="w-2 h-2 border border-muted-foreground rounded-full mt-2"></div>
                        <span className="text-sm italic">Chain continues...</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share This Chain
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-12">
          <h2 className="font-playfair text-2xl font-bold text-foreground mb-6">
            Prayer Achievements
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <Card 
                  key={achievement.title}
                  className={`group transition-all duration-300 animate-gentle-fade ${
                    achievement.unlocked 
                      ? 'hover:shadow-peaceful bg-primary/5 border-primary/20' 
                      : 'opacity-60 bg-muted/20'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="pt-6 text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${
                      achievement.unlocked ? 'bg-primary/10' : 'bg-muted/30'
                    } flex items-center justify-center`}>
                      <Icon className={`h-8 w-8 ${
                        achievement.unlocked ? achievement.color : 'text-muted-foreground'
                      } ${achievement.unlocked ? 'group-hover:scale-110' : ''} transition-transform`} />
                    </div>
                    <h3 className="font-semibold mb-2">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{achievement.description}</p>
                    {achievement.unlocked ? (
                      <Badge variant="secondary" className="bg-primary/20 text-primary">
                        Unlocked ✓
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        Locked
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Global Impact */}
        <Card className="bg-gradient-primary text-primary-foreground animate-gentle-fade">
          <CardHeader className="text-center">
            <CardTitle className="font-playfair text-2xl">Global Prayer Network</CardTitle>
            <p className="text-primary-foreground/90">
              See the worldwide impact of our prayer community
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold">{globalStats.totalPrayers.toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Prayers</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{globalStats.activeChains}</div>
                <div className="text-sm opacity-90">Active Chains</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{globalStats.churchesConnected}</div>
                <div className="text-sm opacity-90">Churches Connected</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{globalStats.countriesReached}</div>
                <div className="text-sm opacity-90">Countries Reached</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{globalStats.answeredPrayers.toLocaleString()}</div>
                <div className="text-sm opacity-90">Answered Prayers</div>
              </div>
            </div>
            
            <div className="text-center mt-6">
              <Button variant="secondary" size="lg">
                Start a New Prayer Chain
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Encouragement Footer */}
        <div className="text-center mt-12 animate-gentle-fade space-y-2">
          <Separator className="max-w-24 mx-auto mb-6 bg-primary/20" />
          <p className="text-sm italic text-muted-foreground max-w-md mx-auto leading-relaxed">
            "The prayer of a righteous person is powerful and effective." — James 5:16
          </p>
          <p className="text-xs text-muted-foreground/70">
            Your faithfulness creates impact beyond what you can see.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RippleImpact;