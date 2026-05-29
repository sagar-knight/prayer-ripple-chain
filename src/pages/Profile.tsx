import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Globe,
  X,
} from "lucide-react";
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

      </div>
    </div>
  );
};

export default Profile;
