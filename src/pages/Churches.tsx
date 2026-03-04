import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Church, MapPin, Heart, Search, Shield, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useChurches } from "@/hooks/useChurch";

const Churches = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const { data: churches, isLoading } = useChurches();

  const filteredChurches = (churches || []).filter((church) =>
    church.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (church.city || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (church.denomination || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (church.country || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 animate-gentle-fade">
          <Church className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-4">
            Church Communities
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with churches and their prayer communities
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-3 mb-8">
          {user ? (
            <Button asChild>
              <Link to="/churches/register"><Plus className="h-4 w-4 mr-2" />Register Your Church</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/login"><Plus className="h-4 w-4 mr-2" />Sign in to Register</Link>
            </Button>
          )}
        </div>

        {/* Search */}
        <Card className="mb-8 animate-gentle-fade">
          <CardContent className="pt-6">
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

        {/* Loading */}
        {isLoading && (
          <p className="text-center text-muted-foreground py-12">Loading churches...</p>
        )}

        {/* Churches Grid */}
        {!isLoading && filteredChurches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChurches.map((church, index) => {
              const location = [church.city, church.state, church.country].filter(Boolean).join(", ");
              return (
                <Card
                  key={church.id}
                  className="group hover:shadow-peaceful transition-all duration-300 animate-gentle-fade"
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

                    <div className="flex gap-2">
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
      </div>
    </div>
  );
};

export default Churches;
