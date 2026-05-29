import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Globe,
  X,
  Heart,
  Users,
  Clock,
  BookOpen,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import CountrySelect from "@/components/CountrySelect";
import { useUserCountry } from "@/hooks/useUserCountry";

const Profile = () => {
  const { profileCountryCode, saveProfileCountry } = useUserCountry();
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [showCountryBanner, setShowCountryBanner] = useState(true);

  useEffect(() => {
    setCountryCode(profileCountryCode);
  }, [profileCountryCode]);

  const handleCountryChange = (code: string | null) => {
    setCountryCode(code);
    void saveProfileCountry(code);
  };

  const [userProfile] = useState({
    name: "Faithful Believer",
    joinedDate: "January 2026",
  });

  const recentActivity = [
    {
      id: "1",
      description: "Prayed for healing for Maria's mother",
      time: "2 hours ago",
      icon: Heart,
    },
    {
      id: "2",
      description: "Shared a prayer request with the community",
      time: "1 day ago",
      icon: Users,
    },
    {
      id: "3",
      description: "Sarah shared that her job interview prayer was answered",
      time: "3 days ago",
      icon: CheckCircle,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* ===== Profile Header ===== */}
        <Card className="animate-gentle-fade border-primary/10 shadow-[var(--shadow-card-hover)] overflow-hidden">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto bg-gradient-primary rounded-full flex items-center justify-center mb-4 ring-4 ring-card shadow-[var(--shadow-peaceful)]">
                <User className="h-12 w-12 text-primary-foreground" />
              </div>
              <h1 className="font-playfair text-2xl font-bold text-foreground mb-1">
                {userProfile.name}
              </h1>
              <p className="text-muted-foreground">
                Member since {userProfile.joinedDate}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Country Banner */}
        {!countryCode && showCountryBanner && (
          <Card className="border-primary/20 bg-primary/5 animate-gentle-fade">
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
                  <CountrySelect value={countryCode} onChange={handleCountryChange} />
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

        {/* ===== Recent Prayers & Encouragement ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="animate-gentle-fade">
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

          <Card className="animate-gentle-fade" style={{ animationDelay: "100ms" }}>
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

        {/* ===== Continue in Prayer ===== */}
        <Card className="animate-gentle-fade" style={{ animationDelay: "200ms" }}>
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

export default Profile;
