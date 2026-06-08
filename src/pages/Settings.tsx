import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Globe, Languages, Shield, Settings as SettingsIcon } from "lucide-react";
import { Link } from "react-router-dom";
import CountrySelect from "@/components/CountrySelect";
import { getCountryByCode } from "@/data/countries";
import { useUserCountry } from "@/hooks/useUserCountry";
import LanguageSelect from "@/components/LanguageSelect";
import { useUserLanguage } from "@/hooks/useUserLanguage";

const Settings = () => {
  const { profileCountryCode, saveProfileCountry } = useUserCountry();
  const { profileLanguageCode, browserLanguageCode, savePreferredLanguage } = useUserLanguage();
  const [countryCode, setCountryCode] = useState<string | null>(null);

  useEffect(() => {
    setCountryCode(profileCountryCode);
  }, [profileCountryCode]);

  const handleCountryChange = (code: string | null) => {
    setCountryCode(code);
    void saveProfileCountry(code);
  };

  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    prayerAccepted: true,
    prayerAnswered: true,
    streakReminder: true,
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <SettingsIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-playfair text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">Tune notifications, language, location, and how you pray.</p>
          </div>
        </div>

        {/* Notifications */}
        <Card className="animate-gentle-fade">
          <CardHeader>
            <CardTitle className="font-playfair flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
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
              <div key={item.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <Label className="text-base font-medium cursor-pointer">{item.label}</Label>
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

        {/* Location & Timezone */}
        <Card className="animate-gentle-fade">
          <CardHeader>
            <CardTitle className="font-playfair flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Location & Timezone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Country (optional)</Label>
              <CountrySelect value={countryCode} onChange={handleCountryChange} allowClear />
              <p className="text-xs text-muted-foreground">
                Used only for country-level prayer impact, not exact location.
              </p>
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

        {/* Language */}
        <Card className="animate-gentle-fade">
          <CardHeader>
            <CardTitle className="font-playfair flex items-center gap-2">
              <Languages className="h-5 w-5 text-primary" />
              Preferred Language
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label className="text-sm">Language (optional)</Label>
            <LanguageSelect
              value={profileLanguageCode}
              onChange={(code) => void savePreferredLanguage(code)}
              allowClear
            />
            <p className="text-xs text-muted-foreground">
              Used to translate prayer requests into your language.
            </p>
            {!profileLanguageCode && browserLanguageCode && (
              <p className="text-xs text-muted-foreground">
                Defaulting to browser language: {browserLanguageCode.toUpperCase()}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Prayer Reminders */}
        <Card className="animate-gentle-fade">
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

        {/* Privacy */}
        <Card className="bg-primary/5 border-primary/20 animate-gentle-fade">
          <CardHeader>
            <CardTitle className="font-playfair flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>• Your personal information is encrypted and never shared without permission.</p>
            <p>• Prayer requests can always be submitted anonymously.</p>
            <p>• You control who sees your prayer activity and profile.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;