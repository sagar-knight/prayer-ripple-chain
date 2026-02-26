import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  User,
  Heart,
  Flame,
  TrendingUp,
  Bell,
  BookOpen,
  Settings,
  Award,
  Shield,
  CheckCircle,
  Target,
  HandHeart,
  CreditCard,
  Globe,
  Users,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import CountrySelect from "@/components/CountrySelect";
import { getCountryByCode } from "@/data/countries";

const Profile = () => {
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [showCountryBanner, setShowCountryBanner] = useState(true);
  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    prayerAccepted: true,
    prayerAnswered: true,
    streakReminder: true,
    
  });

  const [userProfile] = useState({
    name: "Faithful Believer",
    joinedDate: "January 2026",
    prayersRequested: 5,
    prayersOffered: 47,
    prayersAnswered: 3,
    currentStreak: 5,
    longestStreak: 12,
    rippleReach: 127,
    chainsStarted: 8,
    weeklyGoal: 10,
    weeklyProgress: 7,
  });

  const achievements = [
    {
      title: "First Prayer",
      description: "Offered your first prayer",
      unlocked: true,
      icon: Heart,
    },
    {
      title: "Chain Starter",
      description: "Started 5 prayer chains",
      unlocked: true,
      icon: TrendingUp,
    },
    {
      title: "Prayer Warrior",
      description: "Prayed for 25+ people",
      unlocked: true,
      icon: Award,
    },
    {
      title: "Faithful 7",
      description: "Maintain 7-day streak",
      unlocked: false,
      icon: Flame,
    },
    {
      title: "100 Lives",
      description: "Ripple reach of 100+",
      unlocked: true,
      icon: Target,
    },
    {
      title: "Testimony",
      description: "Share an answered prayer",
      unlocked: true,
      icon: BookOpen,
    },
  ];

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <Card className="mb-8 animate-gentle-fade">
          <CardContent className="pt-8">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                <User className="h-12 w-12 text-primary-foreground" />
              </div>
              <h1 className="font-playfair text-2xl font-bold text-foreground mb-1">
                {userProfile.name}
              </h1>
              <p className="text-muted-foreground">
                Member since {userProfile.joinedDate}
              </p>
              <div className="flex justify-center gap-2 mt-3">
                <Badge variant="secondary" className="gap-1">
                  <Flame className="h-3 w-3" />
                  {userProfile.currentStreak} day streak
                </Badge>
                <Badge className="bg-primary/10 text-primary gap-1">
                  <Heart className="h-3 w-3" />
                  {userProfile.prayersOffered} prayers
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Country Banner */}
        {!countryCode && showCountryBanner && (
          <Card className="mb-8 border-primary/20 animate-gentle-fade">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground mb-1">
                    Add your country
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Improve prayer matching and reminder times. Optional.
                  </p>
                  <CountrySelect value={countryCode} onChange={setCountryCode} />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 shrink-0"
                  onClick={() => setShowCountryBanner(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="animate-gentle-fade">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-primary">
                {userProfile.prayersRequested}
              </div>
              <div className="text-sm text-muted-foreground">
                Prayers Requested
              </div>
            </CardContent>
          </Card>
          <Card className="animate-gentle-fade" style={{ animationDelay: "100ms" }}>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-primary">
                {userProfile.prayersOffered}
              </div>
              <div className="text-sm text-muted-foreground">
                Prayers Offered
              </div>
            </CardContent>
          </Card>
          <Card className="animate-gentle-fade" style={{ animationDelay: "200ms" }}>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-primary">
                {userProfile.rippleReach}
              </div>
              <div className="text-sm text-muted-foreground">Ripple Reach</div>
            </CardContent>
          </Card>
          <Card className="animate-gentle-fade" style={{ animationDelay: "300ms" }}>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-primary">
                {userProfile.longestStreak}
              </div>
              <div className="text-sm text-muted-foreground">
                Longest Streak
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Goal */}
        <Card className="mb-8 animate-gentle-fade" style={{ animationDelay: "400ms" }}>
          <CardHeader>
            <CardTitle className="font-playfair flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Weekly Prayer Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {userProfile.weeklyProgress} of {userProfile.weeklyGoal} prayers
                this week
              </span>
              <span className="text-sm font-medium text-primary">
                {Math.round(
                  (userProfile.weeklyProgress / userProfile.weeklyGoal) * 100
                )}
                %
              </span>
            </div>
            <Progress
              value={
                (userProfile.weeklyProgress / userProfile.weeklyGoal) * 100
              }
              className="h-3"
            />
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="mb-8 animate-gentle-fade" style={{ animationDelay: "500ms" }}>
          <CardHeader>
            <CardTitle className="font-playfair flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={achievement.title}
                    className={`p-4 rounded-lg border text-center transition-all ${
                      achievement.unlocked
                        ? "bg-primary/5 border-primary/20"
                        : "bg-muted/20 border-muted/40 opacity-60"
                    }`}
                  >
                    <Icon
                      className={`h-6 w-6 mx-auto mb-2 ${
                        achievement.unlocked
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                    <h4 className="font-semibold text-sm mb-1">
                      {achievement.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {achievement.description}
                    </p>
                    {achievement.unlocked && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Unlocked
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className="mb-8 animate-gentle-fade" style={{ animationDelay: "600ms" }}>
          <CardHeader>
            <CardTitle className="font-playfair flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                key: "dailyReminder" as const,
                label: "Daily Prayer Reminder",
                desc: '"Did you pray today?" notification',
              },
              {
                key: "prayerAccepted" as const,
                label: "Prayer Accepted",
                desc: "When someone starts praying for your request",
              },
              {
                key: "prayerAnswered" as const,
                label: "Prayer Answered",
                desc: "When a prayer request is marked as answered",
              },
              {
                key: "streakReminder" as const,
                label: "Streak Reminder",
                desc: '"You missed yesterday\'s prayer" alert',
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div>
                  <Label className="text-base font-medium cursor-pointer">
                    {item.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  checked={notifications[item.key]}
                  onCheckedChange={() => handleNotificationChange(item.key)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Country & Timezone Settings */}
        <Card className="mb-8 animate-gentle-fade" style={{ animationDelay: "620ms" }}>
          <CardHeader>
            <CardTitle className="font-playfair flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Location & Timezone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Country (optional)</Label>
              <CountrySelect value={countryCode} onChange={setCountryCode} allowClear />
              {countryCode && (
                <p className="text-xs text-muted-foreground">
                  {getCountryByCode(countryCode)?.flag} {getCountryByCode(countryCode)?.name} selected
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Timezone</Label>
              <p className="text-sm text-muted-foreground">
                Detected: {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* My Prayer Reminders */}
        <Card className="mb-8 animate-gentle-fade" style={{ animationDelay: "630ms" }}>
          <CardHeader>
            <CardTitle className="font-playfair flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Prayer Reminders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Manage your daily prayer reminders and track consistency.
            </p>
            <Button asChild variant="peaceful" className="gap-2">
              <Link to="/prayer-reminders">
                <Bell className="h-4 w-4" />
                My Prayer Reminders
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Join Organization */}
        <Card className="mb-8 animate-gentle-fade" style={{ animationDelay: "640ms" }}>
          <CardHeader>
            <CardTitle className="font-playfair flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Organizations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Join a church, ministry, or group to pray together.
            </p>
            <div className="flex gap-2">
              <Button asChild variant="peaceful" className="gap-2">
                <Link to="/organizations">
                  <Users className="h-4 w-4" />
                  Browse Organizations
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Support the Mission */}
        <Card className="mb-8 animate-gentle-fade border-primary/20" style={{ animationDelay: "650ms" }}>
          <CardHeader>
            <CardTitle className="font-playfair flex items-center gap-2">
              <HandHeart className="h-5 w-5 text-primary" />
              Support the Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              PrayerForward is free for everyone. Your optional support helps keep
              us running.
            </p>
            <div className="flex gap-2">
              <Button asChild variant="peaceful" className="gap-2">
                <Link to="/support">
                  <Heart className="h-4 w-4" />
                  Support PrayerForward
                </Link>
              </Button>
              <Button variant="outline" className="gap-2">
                <CreditCard className="h-4 w-4" />
                Manage Support
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card className="bg-primary/5 border-primary/20 animate-gentle-fade">
          <CardHeader>
            <CardTitle className="font-playfair flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              • Your personal information is encrypted and never shared without
              permission.
            </p>
            <p>
              • Prayer requests can always be submitted anonymously.
            </p>
            <p>
              • You control who sees your prayer activity and profile.
            </p>
            <Button variant="outline" className="mt-4 gap-2">
              <Settings className="h-4 w-4" />
              Manage Privacy Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
