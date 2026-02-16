import { useState } from "react";
import NewsletterSubscribe from "@/components/NewsletterSubscribe";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  Plus,
  ArrowRight,
  Heart,
  Globe,
  Church,
  BookOpen,
  Building2,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import CountrySelect from "@/components/CountrySelect";
import { sampleOrganizations, Organization, OrgType } from "@/data/organizations";
import { getCountryByCode } from "@/data/countries";

const orgTypeIcons: Record<OrgType, typeof Church> = {
  Church: Church,
  Ministry: BookOpen,
  Nonprofit: Building2,
  "Community Group": UsersRound,
  Other: Users,
};

const Organizations = () => {
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);

  const filtered = sampleOrganizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.description.toLowerCase().includes(search.toLowerCase());
    const matchesCountry = !countryFilter || org.countryCode === countryFilter;
    return matchesSearch && matchesCountry;
  });

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 animate-gentle-fade">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-3">
            Organizations
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">
            Join a church, ministry, or group to pray together. Create your own
            organization to mobilize prayer within your community.
          </p>
        </div>

        {/* CTAs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Button
            asChild
            variant="peaceful"
            size="lg"
            className="text-lg py-6 gap-2 shadow-peaceful"
          >
            <Link to="/organizations/create">
              <Plus className="h-5 w-5" />
              Create an Organization
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="text-lg py-6 gap-2"
            onClick={() => setShowJoinInput(!showJoinInput)}
          >
            <ArrowRight className="h-5 w-5" />
            Join an Organization
          </Button>
        </div>

        {/* Join by Code */}
        {showJoinInput && (
          <Card className="mb-8 animate-gentle-fade">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Input
                  placeholder="Enter invite code (e.g. GRACE2026)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="flex-1"
                />
                <Button
                  variant="peaceful"
                  disabled={!joinCode.trim()}
                  onClick={() => {
                    const found = sampleOrganizations.find(
                      (o) => o.inviteCode === joinCode.trim()
                    );
                    if (found) {
                      window.location.href = `/organizations/${found.id}`;
                    }
                  }}
                >
                  Join
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Ask your organization leader for the invite code.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search organizations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-full sm:w-[220px]">
            <CountrySelect
              value={countryFilter}
              onChange={setCountryFilter}
              placeholder="All countries"
              allowClear
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {filtered.map((org) => {
            const TypeIcon = orgTypeIcons[org.type] || Users;
            const country = getCountryByCode(org.countryCode);
            return (
              <Card
                key={org.id}
                className="hover:shadow-md transition-shadow animate-gentle-fade"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <TypeIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Link
                          to={`/organizations/${org.id}`}
                          className="font-playfair font-semibold text-lg text-foreground hover:text-primary transition-colors"
                        >
                          {org.name}
                        </Link>
                        <Badge variant="secondary" className="text-xs">
                          {org.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {org.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        {country && (
                          <span className="flex items-center gap-1">
                            {country.flag} {country.name}
                            {org.city && `, ${org.city}`}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {org.memberCount} members
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {org.prayerCount} prayers
                        </span>
                      </div>
                    </div>
                    <Button asChild variant="ghost" size="sm" className="shrink-0">
                      <Link to={`/organizations/${org.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Globe className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-playfair text-lg font-semibold text-foreground mb-2">
                No organizations found
              </h3>
              <p className="text-muted-foreground text-sm">
                Try adjusting your search or country filter.
              </p>
            </div>
          )}
        </div>

        <NewsletterSubscribe />
      </div>
    </div>
  );
};

export default Organizations;
