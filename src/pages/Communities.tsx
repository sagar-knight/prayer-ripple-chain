import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Heart, Search, Shield, Users, Clock, Check, Plus, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useChurches } from "@/hooks/useCommunity";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import RequestJoinCommunityDialog from "@/components/RequestJoinCommunityDialog";

const Churches = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showBrowse, setShowBrowse] = useState(false);
  const [requestTarget, setRequestTarget] = useState<{ id: string; name: string } | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
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

  // Build a map of communityId -> membership role for status buttons
  const { data: myMembershipsMap } = useQuery({
    queryKey: ["my-memberships-map", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("church_memberships")
        .select("church_id, role")
        .eq("user_id", user!.id)
        .eq("status", "active");
      if (error) throw error;
      const map: Record<string, string> = {};
      (data || []).forEach((m: any) => { map[m.church_id] = m.role; });
      return map;
    },
  });

  // Build a map of communityId -> pending request id for status buttons
  const { data: myPendingRequests } = useQuery({
    queryKey: ["my-pending-community-requests", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("community_join_requests")
        .select("community_id, status")
        .eq("user_id", user!.id)
        .eq("status", "pending");
      if (error) throw error;
      const set = new Set<string>();
      (data || []).forEach((r: any) => set.add(r.community_id));
      return set;
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
          <Users className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="page-title">Communities</h1>
          <p className="page-subtitle">
            Connect with communities to pray together
          </p>
        </div>

        {/* Primary Actions (mirrors Communities layout) */}
        <div className="max-w-md mx-auto w-full space-y-3">
          <Button
            size="lg"
            className="w-full h-14 text-base tracking-wide font-semibold"
            onClick={() => setShowBrowse((v) => !v)}
          >
            {showBrowse ? "HIDE COMMUNITY LIST" : "JOIN A COMMUNITY"}
          </Button>
          {user ? (
            <Button asChild size="lg" variant="secondary" className="w-full h-14 text-base tracking-wide font-semibold">
              <Link to="/communities/register">CREATE A NEW COMMUNITY</Link>
            </Button>
          ) : (
            <Button asChild size="lg" variant="secondary" className="w-full h-14 text-base tracking-wide font-semibold">
              <Link to="/login">SIGN IN TO CREATE</Link>
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
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <Button asChild variant="default" size="sm" className="w-full min-w-0 px-2 truncate">
                        <Link to={`/communities/${church.id}`} className="truncate">Community</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="w-full min-w-0 px-2 truncate">
                        <Link to={`/communities/${church.id}/wall`} className="truncate">
                          <Heart className="h-3 w-3 mr-1 shrink-0" />Prayer Wall
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty state (no joined communities) */}
        {!showBrowse && (!user || (!loadingMine && (myChurches?.length ?? 0) === 0)) && (
          <div className="text-center py-12 animate-gentle-fade">
            <Users className="h-14 w-14 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No communities yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Join a community to pray together or create one to get started.
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
                    placeholder="Search by name or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {isLoading && (
              <p className="text-center text-muted-foreground py-12">Loading communities...</p>
            )}

            {!isLoading && filteredChurches.length > 0 ? (
          <Card className="overflow-hidden divide-y divide-border animate-gentle-fade">
            {filteredChurches.map((church) => {
              const location = [church.city, church.state, church.country].filter(Boolean).join(", ");
              const role = myMembershipsMap?.[church.id];
              const isMember = !!role;
              const isAdmin = role === "admin" || role === "moderator";
              const isOwner = !!user && (church as any).created_by === user.id;
              const isPending = myPendingRequests?.has(church.id) ?? false;
              const logo = (church as any).logo_url as string | null | undefined;
              const description = (church as any).description as string | null | undefined;

              const handleAction = () => {
                if (isOwner || isAdmin) {
                  navigate(`/communities/${church.id}/admin`);
                } else if (!user) {
                  navigate("/login");
                } else if (!isMember && !isPending) {
                  setRequestTarget({ id: church.id, name: church.name });
                }
              };

              const actionDisabled = isMember || isPending;
              const ActionIcon = isOwner || isAdmin
                ? Settings
                : isMember
                ? Check
                : isPending
                ? Clock
                : Plus;
              const actionLabel = isOwner || isAdmin
                ? "Manage community"
                : isMember
                ? "You are a member"
                : isPending
                ? "Request pending"
                : "Request to join";

              return (
                <div key={church.id} className="flex items-stretch gap-3 p-3 sm:p-4 hover:bg-muted/30 transition-colors">
                  {/* Thumbnail */}
                  <Link
                    to={`/communities/${church.id}`}
                    className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-muted flex items-center justify-center"
                  >
                    {logo ? (
                      <img src={logo} alt={church.name} className="w-full h-full object-cover" />
                    ) : (
                      <Users className="h-8 w-8 text-muted-foreground" />
                    )}
                  </Link>

                  {/* Body */}
                  <Link
                    to={`/communities/${church.id}`}
                    className="flex-1 min-w-0 flex flex-col justify-center"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-playfair text-base sm:text-lg font-semibold text-foreground truncate">
                        {church.name}
                      </h3>
                      {church.verified && (
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] py-0 px-1.5">
                          <Shield className="h-2.5 w-2.5 mr-0.5" />Verified
                        </Badge>
                      )}
                    </div>
                    {location && (
                      <p className="text-xs sm:text-sm text-foreground/80 mt-0.5 flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 shrink-0" />{location}
                      </p>
                    )}
                    {description && (
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1">
                        {description}
                      </p>
                    )}
                  </Link>

                  {/* Action */}
                  <button
                    type="button"
                    aria-label={actionLabel}
                    title={actionLabel}
                    onClick={handleAction}
                    disabled={actionDisabled}
                    className="shrink-0 self-stretch w-12 sm:w-14 rounded-lg bg-muted hover:bg-muted-foreground/20 text-foreground flex items-center justify-center transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <ActionIcon className="h-5 w-5" strokeWidth={2.5} />
                  </button>
                </div>
              );
            })}
          </Card>
        ) : !isLoading ? (
          <Card className="text-center py-12 animate-gentle-fade">
            <CardContent>
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No communities found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search." : "Be the first to create a community!"}
              </p>
            </CardContent>
          </Card>
        ) : null}
          </>
        )}

        {requestTarget && (
          <RequestJoinCommunityDialog
            open={!!requestTarget}
            onOpenChange={(o) => !o && setRequestTarget(null)}
            communityId={requestTarget.id}
            communityName={requestTarget.name}
          />
        )}
      </div>
    </div>
  );
};

export default Churches;
