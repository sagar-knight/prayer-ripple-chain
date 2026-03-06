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
    { title: "First Prayer", description: "Offered your first prayer", unlocked: true, icon: Heart },
    { title: "Chain Starter", description: "Started 5 prayer chains", unlocked: true, icon: TrendingUp },
    { title: "Prayer Warrior", description: "Prayed for 25+ people", unlocked: true, icon: Award },
    { title: "Faithful 7", description: "Maintain 7-day streak", unlocked: false, icon: Flame },
    { title: "100 Lives", description: "Ripple reach of 100+", unlocked: true, icon: Target },
    { title: "Testimony", description: "Share an answered prayer", unlocked: true, icon: BookOpen },
  ];

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-background py-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <Card className="mb-8 border border-border">
          <CardContent className="pt-8">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto bg-foreground rounded-full flex items-center justify-center mb-4">
                <User className="h-12 w-12 text-background" />
              </div>
              <h1 className="text-2xl font-semibold text-foreground mb-1">
                {userProfile.name}
              </h1>
              <p className="text-muted-foreground text-sm">
                Member since {userProfile.joinedDate}
              </p>
              <div className="flex justify-center gap-2 mt-3">
                <Badge variant="secondary" className="gap-1">
                  <Flame className="h-3 w-3" />
                  {userProfile.currentStreak} day streak
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Heart className="h-3 w-3" />
                  {userProfile.prayersOffered} prayers
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Country Banner */}
        {!countryCode && showCountryBanner && (
          <Card className="mb-8 border border-border">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-foreground mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground mb-1">Add your country</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Improve prayer matching and reminder times. Optional.
                  </p>
                  <CountrySelect value={countryCode} onChange={setCountryCode} />
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0" onClick={() => setShowCountryBanner(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { value: userProfile.prayersRequested, label: "Prayers Requested" },
            { value: userProfile.prayersOffered, label: "Prayers Offered" },
            { value: userProfile.rippleReach, label: "Ripple Reach" },
            { value: userProfile.longestStreak, label: "Longest Streak" },
          ].map((stat) => (
            <Card key={stat.label} className="border border-border">
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-semibold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Weekly Goal */}
        <Card className="mb-8 border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5 text-muted-foreground" />
              Weekly Prayer Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {userProfile.weeklyProgress} of {userProfile.weeklyGoal} prayers this week
              </span>
              <span className="text-sm font-medium text-foreground">
                {Math.round((userProfile.weeklyProgress / userProfile.weeklyGoal) * 100)}%
              </span>
            </div>
            <Progress value={(userProfile.weeklyProgress / userProfile.weeklyGoal) * 100} className="h-3" />
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="mb-8 border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="h-5 w-5 text-muted-foreground" />
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
                        ? "bg-secondary/50 border-border"
                        : "bg-muted/20 border-muted/40 opacity-60"
                    }`}
                  >
                    <Icon className={`h-6 w-6 mx-auto mb-2 ${achievement.unlocked ? "text-foreground" : "text-muted-foreground"}`} />
                    <h4 className="font-semibold text-sm mb-1">{achievement.title}</h4>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
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
        <Card className="mb-8 border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-5 w-5 text-muted-foreground" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "dailyReminder" as const, label: "Daily Prayer Reminder", desc: '"Did you pray today?" notification' },
              { key: "prayerAccepted" as const, label: "Prayer Accepted", desc: "When someone starts praying for your request" },
              { key: "prayerAnswered" as const, label: "Prayer Answered", desc: "When a prayer request is marked as answered" },
              { key: "streakReminder" as const, label: "Streak Reminder", desc: '"You missed yesterday\'s prayer" alert' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                <div>
                  <Label className="text-base font-medium cursor-pointer">{item.label}</Label>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                <Switch checked={notifications[item.key]} onCheckedChange={() => handleNotificationChange(item.key)} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Country & Timezone */}
        <Card className="mb-8 border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-5 w-5 text-muted-foreground" />
              Location & Timezone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Country (optional)</Label>
              <CountrySelect value={countryCode} onChange={setCountryCode} allowClear />
              {countryCode && (
                <p className="text-xs text-muted-foreground">
                  {getCountryByCode(countryCode)?.name} selected
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

        {/* Prayer Reminders */}
        <Card className="mb-8 border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-5 w-5 text-muted-foreground" />
              Prayer Reminders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Manage your daily prayer reminders and track consistency.</p>
            <Button asChild className="gap-2 rounded-full">
              <Link to="/prayer-reminders">
                <Bell className="h-4 w-4" />
                My Prayer Reminders
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Family */}
        <Card className="mb-8 border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5 text-muted-foreground" />
              Family
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Join a church, ministry, or group to pray together.</p>
            <Button asChild className="gap-2 rounded-full">
              <Link to="/organizations">
                <Users className="h-4 w-4" />
                Browse Families
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="mb-8 border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HandHeart className="h-5 w-5 text-muted-foreground" />
              Support the Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              PrayerForward is free for everyone. Your optional support helps keep us running.
            </p>
            <div className="flex gap-2">
              <Button asChild className="gap-2 rounded-full">
                <Link to="/support">
                  <Heart className="h-4 w-4" />
                  Support PrayerForward
                </Link>
              </Button>
              <Button variant="outline" className="gap-2 rounded-full">
                <CreditCard className="h-4 w-4" />
                Manage Support
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card className="bg-secondary/30 border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-5 w-5 text-muted-foreground" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Your personal information is encrypted and never shared without permission.</p>
            <p>Prayer requests can always be submitted anonymously.</p>
            <p>You control who sees your prayer activity and profile.</p>
            <Button variant="outline" className="mt-4 gap-2 rounded-full">
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
