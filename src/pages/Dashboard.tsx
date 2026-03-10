import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Users, 
  Calendar, 
  Clock,
  BookOpen,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [userStats] = useState({
    prayersOffered: 47,
    prayersReceived: 12,
    chainCount: 8,
  });

  const [recentActivity] = useState([
    {
      id: "1",
      type: "prayer_offered",
      description: "Prayed for healing for Maria's mother",
      time: "2 hours ago",
      icon: Heart,
    },
    {
      id: "2", 
      type: "chain_started",
      description: "Shared a prayer request with the community",
      time: "1 day ago",
      icon: Users,
    },
    {
      id: "4",
      type: "prayer_answered",
      description: "Sarah shared that her job interview prayer was answered",
      time: "3 days ago",
      icon: CheckCircle,
    }
  ]);

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 animate-gentle-fade">
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-4">
            Your Prayer Journey
          </h1>
          <p className="text-lg text-muted-foreground">
            You have been praying for others, and God is at work.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-warm text-accent-foreground animate-gentle-fade">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Prayed for others</p>
                  <p className="text-2xl font-bold">{userStats.prayersOffered}</p>
                </div>
                <Heart className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-primary text-primary-foreground animate-gentle-fade" style={{ animationDelay: "100ms" }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">People praying for you</p>
                  <p className="text-2xl font-bold">{userStats.prayersReceived}</p>
                </div>
                <Users className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="animate-gentle-fade" style={{ animationDelay: "200ms" }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Requests passed forward</p>
                  <p className="text-2xl font-bold text-primary">{userStats.chainCount}</p>
                </div>
                <ArrowRight className="h-8 w-8 text-primary opacity-60" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Activity */}
          <Card className="animate-gentle-fade" style={{ animationDelay: "300ms" }}>
            <CardHeader>
              <CardTitle className="font-playfair flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Prayers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Encouragement */}
          <Card className="animate-gentle-fade" style={{ animationDelay: "400ms" }}>
            <CardHeader>
              <CardTitle className="font-playfair flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                A Word of Encouragement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <blockquote className="border-l-4 border-primary/30 pl-4 italic text-foreground/80 text-sm leading-relaxed">
                "Therefore encourage one another and build each other up, just as in fact you are doing."
              </blockquote>
              <p className="text-sm font-medium text-primary">1 Thessalonians 5:11</p>
              <p className="text-sm text-muted-foreground">
                Your faithfulness in prayer makes a difference, even when you cannot see it.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="animate-gentle-fade" style={{ animationDelay: "500ms" }}>
          <CardHeader>
            <CardTitle className="font-playfair">Continue in Prayer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild variant="peaceful" className="h-auto p-4">
                <Link to="/pray" className="flex flex-col items-center gap-2">
                  <Heart className="h-6 w-6" />
                  <span>Pray for Someone</span>
                </Link>
              </Button>
              
              <Button asChild variant="warm" className="h-auto p-4">
                <Link to="/submit-prayer" className="flex flex-col items-center gap-2">
                  <BookOpen className="h-6 w-6" />
                  <span>Share a Request</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto p-4">
                <Link to="/ripple" className="flex flex-col items-center gap-2">
                  <Users className="h-6 w-6" />
                  <span>See Your Prayer Journey</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
