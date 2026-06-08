import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Church, MapPin, Heart, Search, Shield, Plus, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useChurches } from "@/hooks/useChurch";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Churches = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showBrowse, setShowBrowse] = useState(false);
  const { user } = useAuth();
  const { data: churches, isLoading } = useChurches();

  const { data: myChurches, isLoading: loadingMine } = useQuery({
    queryKey: ["my-churches", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("church_memberships")
        .select("church_id, role, status")
        .eq("user_id", user!.id)
        .eq("status", "active");
      if (error) throw error;
      const ids = (data || []).map((m: any) => m.church_id);
      if (!ids.length) return [];
      const { data: cs, error: e2 } = await supabase
        .from("churches_public")
        .select("*")
        .in("id", ids);
      if (e2) throw e2;
      return cs || [];
    },
  });

  const filteredChurches = (churches || []).filter((church) =>
    church.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (church.city || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (church.denomination || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (church.country || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
      <div className="page-container-wide section-gap">
        {/* Header */}
        <div className="page-header">
          <Church className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="page-title">Church Communities</h1>
          <p className="page-subtitle">
            Connect with churches and their prayer communities
          </p>
        </div>

        {/* Primary Actions (mirrors Communities layout) */}
        <div className="max-w-md mx-auto w-full space-y-3">
          <Button
            size="lg"
            className="w-full h-14 text-base tracking-wide font-semibold"
            onClick={() => setShowBrowse((v) => !v)}
          >
            {showBrowse ? "HIDE CHURCH LIST" : "JOIN A CHURCH"}
          </Button>
          {user ? (
            <Button asChild size="lg" variant="secondary" className="w-full h-14 text-base tracking-wide font-semibold">
              <Link to="/churches/register">REGISTER A NEW CHURCH</Link>
            </Button>
          ) : (
            <Button asChild size="lg" variant="secondary" className="w-full h-14 text-base tracking-wide font-semibold">
              <Link to="/login">SIGN IN TO REGISTER</Link>
            </Button>
          )}
        </div>

        {/* My Churches (default view) */}
        {!showBrowse && user && !loadingMine && (myChurches?.length ?? 0) > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(myChurches as any[]).map((church, index) => {
              const location = [church.city, church.state, church.country].filter(Boolean).join(", ");
              return (
                <Card key={church.id} className="group animate-gentle-fade" style={{ animationDelay: `${index * 80}ms` }}>
                  <CardHeader>
                    <CardTitle className="font-playfair text-lg group-hover:text-primary transition-colors">
                      {church.name}
                    </CardTitle>
                    {location && (
                      <div className="flex items-center text-muted-foreground text-sm">
                        <MapPin className="h-4 w-4 mr-1 shrink-0" />{location}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-3">
                      <Button asChild variant="default" size="sm" className="flex-1">
                        <Link to={`/churches/${church.id}`}>Church Page</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="flex-1">
                        <Link to={`/churches/${church.id}/wall`}>
                          <Heart className="h-3 w-3 mr-1" />Prayer Wall
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty state (no joined churches) */}
        {!showBrowse && (!user || (!loadingMine && (myChurches?.length ?? 0) === 0)) && (
          <div className="text-center py-12 animate-gentle-fade">
            <Users className="h-14 w-14 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No churches yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Join a church to pray together or register one to get started.
            </p>
          </div>
        )}

        {/* Browse / Join view */}
        {showBrowse && (
          <>
            <Card className="animate-gentle-fade">
              <CardContent className="pt-7">
                <div className="relative max-w-md mx-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, location, or denomination..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {isLoading && (
              <p className="text-center text-muted-foreground py-12">Loading churches...</p>
            )}

            {!isLoading && filteredChurches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChurches.map((church, index) => {
              const location = [church.city, church.state, church.country].filter(Boolean).join(", ");
              return (
                <Card
                  key={church.id}
                  className="group animate-gentle-fade"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="font-playfair text-lg group-hover:text-primary transition-colors">
                        {church.name}
                      </CardTitle>
                      <div className="flex gap-1 shrink-0">
                        {church.verified && (
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                            <Shield className="h-3 w-3 mr-0.5" />Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                    {location && (
                      <div className="flex items-center text-muted-foreground text-sm">
                        <MapPin className="h-4 w-4 mr-1 shrink-0" />
                        {location}
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {church.denomination && <Badge variant="secondary" className="text-xs">{church.denomination}</Badge>}
                      <Badge variant="outline" className="text-xs">
                        Prayer Wall: {church.privacy === "public" ? "Public" : "Members Only"}
                      </Badge>
                    </div>

                    <div className="flex gap-3">
                      <Button asChild variant="default" size="sm" className="flex-1">
                        <Link to={`/churches/${church.id}`}>Church Page</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="flex-1">
                        <Link to={`/churches/${church.id}/wall`}>
                          <Heart className="h-3 w-3 mr-1" />Prayer Wall
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : !isLoading ? (
          <Card className="text-center py-12 animate-gentle-fade">
            <CardContent>
              <Church className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No churches found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search." : "Be the first to register your church!"}
              </p>
            </CardContent>
          </Card>
        ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default Churches;
