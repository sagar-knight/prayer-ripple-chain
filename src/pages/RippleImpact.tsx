import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Waves, Heart, Users, TrendingUp, Award, Share2, ArrowRight } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 animate-gentle-fade">
          <Waves className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ripple Impact
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover how your prayers create waves of blessing that touch lives around the world
          </p>
        </div>

        {/* Personal Stats */}
        <Card className="mb-8 bg-gradient-warm text-accent-foreground animate-gentle-fade">
          <CardHeader className="text-center">
            <CardTitle className="font-playfair text-2xl">Your Prayer Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-3xl font-bold">{userStats.prayersOffered}</div>
                <div className="text-sm opacity-90">Prayers Offered</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold">{userStats.prayersReceived}</div>
                <div className="text-sm opacity-90">Prayers Received</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold">{userStats.rippleReach}</div>
                <div className="text-sm opacity-90">Lives Touched</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold">{userStats.chainStarted}</div>
                <div className="text-sm opacity-90">Chains Started</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold">{userStats.livesImpacted}</div>
                <div className="text-sm opacity-90">Total Impact</div>
              </div>
            </div>
          </CardContent>
        </Card>

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
      </div>
    </div>
  );
};

export default RippleImpact;