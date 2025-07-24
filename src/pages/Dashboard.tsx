import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  Target, 
  TrendingUp, 
  Calendar, 
  Flame, 
  Users, 
  Award, 
  Clock,
  BookOpen,
  ArrowRight,
  CheckCircle,
  Circle
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [userStats] = useState({
    prayersOffered: 47,
    prayersReceived: 12,
    chainCount: 8,
    rippleReach: 127,
    currentStreak: 5,
    longestStreak: 12,
    weeklyGoal: 10,
    weeklyProgress: 7,
    totalImpact: 189
  });

  const [recentActivity] = useState([
    {
      id: "1",
      type: "prayer_offered",
      description: "Prayed for healing for Maria's mother",
      time: "2 hours ago",
      icon: Heart,
      color: "text-red-500"
    },
    {
      id: "2", 
      type: "chain_started",
      description: "Started a new prayer chain for financial breakthrough",
      time: "1 day ago",
      icon: TrendingUp,
      color: "text-green-500"
    },
    {
      id: "3",
      type: "streak_milestone",
      description: "Reached 5-day prayer streak!",
      time: "1 day ago", 
      icon: Flame,
      color: "text-orange-500"
    },
    {
      id: "4",
      type: "prayer_answered",
      description: "Sarah shared that her job interview prayer was answered!",
      time: "3 days ago",
      icon: CheckCircle,
      color: "text-primary"
    }
  ]);

  const [weeklyGoals] = useState([
    { day: "Mon", completed: true },
    { day: "Tue", completed: true },
    { day: "Wed", completed: true },
    { day: "Thu", completed: true },
    { day: "Fri", completed: true },
    { day: "Sat", completed: false },
    { day: "Sun", completed: false }
  ]);

  const [achievements] = useState([
    {
      title: "First Prayer",
      description: "Offered your first prayer",
      unlocked: true,
      icon: Heart
    },
    {
      title: "Chain Starter", 
      description: "Started 5 prayer chains",
      unlocked: true,
      icon: TrendingUp
    },
    {
      title: "Prayer Warrior",
      description: "Prayed for 25+ people",
      unlocked: true,
      icon: Award
    },
    {
      title: "Faithful Friend",
      description: "Maintain 7-day streak",
      unlocked: false,
      icon: Flame
    }
  ]);

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 animate-gentle-fade">
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-4">
            Your Prayer Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your prayer journey and see the ripple effect you're creating
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-warm text-accent-foreground animate-gentle-fade">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Prayers Offered</p>
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
                  <p className="text-sm opacity-90">Lives Touched</p>
                  <p className="text-2xl font-bold">{userStats.rippleReach}</p>
                </div>
                <Users className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="animate-gentle-fade" style={{ animationDelay: "200ms" }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <p className="text-2xl font-bold text-primary">{userStats.currentStreak}</p>
                  <p className="text-xs text-muted-foreground">days</p>
                </div>
                <Flame className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="animate-gentle-fade" style={{ animationDelay: "300ms" }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Prayer Chains</p>
                  <p className="text-2xl font-bold text-primary">{userStats.chainCount}</p>
                  <p className="text-xs text-muted-foreground">started</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Weekly Progress */}
          <Card className="animate-gentle-fade" style={{ animationDelay: "400ms" }}>
            <CardHeader>
              <CardTitle className="font-playfair flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Weekly Prayer Goal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {userStats.weeklyProgress} of {userStats.weeklyGoal} prayers
                </span>
                <span className="text-sm font-medium text-primary">
                  {Math.round((userStats.weeklyProgress / userStats.weeklyGoal) * 100)}%
                </span>
              </div>
              <Progress 
                value={(userStats.weeklyProgress / userStats.weeklyGoal) * 100} 
                className="h-2"
              />
              
              {/* Weekly Calendar */}
              <div className="grid grid-cols-7 gap-2 mt-4">
                {weeklyGoals.map((day, index) => (
                  <div key={day.day} className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">{day.day}</div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${
                      day.completed 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {day.completed ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="animate-gentle-fade" style={{ animationDelay: "500ms" }}>
            <CardHeader>
              <CardTitle className="font-playfair flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`h-4 w-4 ${activity.color}`} />
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
        </div>

        {/* Achievements */}
        <Card className="mb-8 animate-gentle-fade" style={{ animationDelay: "600ms" }}>
          <CardHeader>
            <CardTitle className="font-playfair flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Prayer Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <div 
                    key={achievement.title}
                    className={`p-4 rounded-lg border text-center transition-all ${
                      achievement.unlocked 
                        ? 'bg-primary/5 border-primary/20' 
                        : 'bg-muted/20 border-muted/40 opacity-60'
                    }`}
                  >
                    <Icon className={`h-8 w-8 mx-auto mb-2 ${
                      achievement.unlocked ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <h4 className="font-semibold text-sm mb-1">{achievement.title}</h4>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    {achievement.unlocked && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        Unlocked ✓
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="animate-gentle-fade" style={{ animationDelay: "700ms" }}>
          <CardHeader>
            <CardTitle className="font-playfair">Quick Actions</CardTitle>
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
                  <span>Submit Request</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto p-4">
                <Link to="/ripple" className="flex flex-col items-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  <span>View Ripple Impact</span>
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