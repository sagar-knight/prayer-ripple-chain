import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, Phone, Mail, Shield, Users, Heart } from "lucide-react";
import { CommunityIcon } from "@/components/icons/CommunityIcon";
import { useAuth } from "@/hooks/useAuth";
import { useChurch, useChurchMembership, useChurchMembers, useJoinChurch } from "@/hooks/useCommunity";

const ChurchDetail = () => {
  const { churchId } = useParams<{ churchId: string }>();
  const { user } = useAuth();
  const { data: church, isLoading } = useChurch(churchId || "");
  const { data: membership } = useChurchMembership(churchId || "");
  const { data: members } = useChurchMembers(churchId || "");
  const joinChurch = useJoinChurch();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-peaceful py-12 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!church) {
    return (
      <div className="min-h-screen bg-gradient-peaceful py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <CommunityIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-playfair text-2xl font-bold text-foreground mb-2">Community not found</h1>
          <Button asChild variant="outline"><Link to="/communities">Back to Communities</Link></Button>
        </div>
      </div>
    );
  }

  const isAdmin = membership?.role === "admin";
  const isMod = membership?.role === "moderator";
  const isMember = !!membership;
  const location = [church.city, church.state, church.country].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <CommunityIcon className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="font-playfair text-3xl font-bold text-foreground mb-2">{church.name}</h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-3">
            <MapPin className="h-4 w-4" />
            <span>{location || "Location not specified"}</span>
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {church.denomination && <Badge variant="secondary">{church.denomination}</Badge>}
            {church.verified && <Badge className="bg-primary/10 text-primary border-primary/20"><Shield className="h-3 w-3 mr-1" />Verified</Badge>}
            <Badge variant="outline">Prayer Wall: {church.privacy === "public" ? "Public" : "Members Only"}</Badge>
          </div>
        </div>

        {/* Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="font-playfair text-lg">About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {church.address && (
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" />{church.address}</div>
            )}
            {church.website && (
              <div className="flex items-center gap-2"><Globe className="h-4 w-4 shrink-0" />{church.website}</div>
            )}
            {church.phone && (
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" />{church.phone}</div>
            )}
            {church.contact_email && (
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" />{church.contact_email}</div>
            )}
            {members && (
              <div className="flex items-center gap-2"><Users className="h-4 w-4 shrink-0" />{members.length} app member{members.length !== 1 ? "s" : ""}</div>
            )}
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {!isMember && user && (
            <Button onClick={() => joinChurch.mutate(church.id)} disabled={joinChurch.isPending} className="w-full">
              <Users className="h-4 w-4 mr-2" />
              {joinChurch.isPending ? "Joining..." : "Join Community"}
            </Button>
          )}
          {!user && (
            <Button asChild>
              <Link to="/login"><Users className="h-4 w-4 mr-2" />Sign in to Join</Link>
            </Button>
          )}

          <Button asChild variant="outline" className="w-full">
              <Link to={`/communities/${church.id}/wall`}>
              <Heart className="h-4 w-4 mr-2" />Prayer Wall
            </Link>
          </Button>

          {isMember && (
            <Button asChild variant="outline" className="w-full">
              <Link to={`/communities/${church.id}/submit`}>
                Submit Prayer Request
              </Link>
            </Button>
          )}

          {(isAdmin || isMod) && (
            <Button asChild variant="outline" className="w-full">
              <Link to={`/communities/${church.id}/admin`}>
                <Shield className="h-4 w-4 mr-2" />Admin Dashboard
              </Link>
            </Button>
          )}
        </div>

        {isMember && (
          <p className="text-center text-sm text-muted-foreground">
            You are a {membership?.role} of this community.
          </p>
        )}
      </div>
    </div>
  );
};

export default ChurchDetail;
