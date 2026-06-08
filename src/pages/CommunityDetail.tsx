import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, Phone, Mail, Shield, Users, Heart, Clock, LogOut, CheckCircle2, X, BellRing } from "lucide-react";
import { CommunityIcon } from "@/components/icons/CommunityIcon";
import { useAuth } from "@/hooks/useAuth";
import {
  useChurch,
  useChurchMembership,
  useChurchMembers,
  useMyCommunityJoinRequest,
  useCancelCommunityJoinRequest,
  useLeaveCommunity,
} from "@/hooks/useCommunity";
import RequestJoinCommunityDialog from "@/components/RequestJoinCommunityDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ChurchDetail = () => {
  const { churchId } = useParams<{ churchId: string }>();
  const { user } = useAuth();
  const { data: church, isLoading } = useChurch(churchId || "");
  const { data: membership } = useChurchMembership(churchId || "");
  const { data: members } = useChurchMembers(churchId || "");
  const { data: joinRequest } = useMyCommunityJoinRequest(churchId || "");
  const [requestOpen, setRequestOpen] = useState(false);
  const cancelRequest = useCancelCommunityJoinRequest();
  const leaveCommunity = useLeaveCommunity();

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
  const isOwner = !!user && church.created_by === user.id;
  const hasPendingRequest = joinRequest?.status === "pending";
  const wasRejected = joinRequest?.status === "rejected";
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

        {/* Pending request banner */}
        {hasPendingRequest && !isMember && (
          <Card className="mb-6 border-primary/30 bg-primary/5 animate-gentle-fade">
            <CardContent className="pt-6 flex items-start gap-3">
              <BellRing className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-foreground">Awaiting approval</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your request to join is with the community leader. You'll see new options here once they approve you.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => joinRequest && cancelRequest.mutate({ requestId: joinRequest.id, communityId: church.id })}
                disabled={cancelRequest.isPending}
              >
                <X className="h-4 w-4 mr-1" />Cancel
              </Button>
            </CardContent>
          </Card>
        )}

        {wasRejected && !isMember && (
          <Card className="mb-6 border-destructive/30 bg-destructive/5 animate-gentle-fade">
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Your previous request wasn't approved. You're welcome to send a new request when you're ready.
            </CardContent>
          </Card>
        )}

        {/* Member welcome panel */}
        {isMember && (
          <Card className="mb-6 border-primary/20 bg-primary/5 animate-gentle-fade">
            <CardHeader>
              <CardTitle className="font-playfair text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                You're a member
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>As a member of <span className="font-semibold text-foreground">{church.name}</span> you can:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>View and pray over the community Prayer Wall</li>
                <li>Submit your own prayer requests for the community</li>
                <li>See who else is praying alongside you</li>
                {(isAdmin || isMod || isOwner) && <li>Review join requests and moderate prayers</li>}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {!isMember && !isOwner && user && (
            hasPendingRequest ? (
              <Button disabled className="w-full" variant="secondary">
                <Clock className="h-4 w-4 mr-2" />Request Pending
              </Button>
            ) : (
              <Button onClick={() => setRequestOpen(true)} className="w-full">
                <Users className="h-4 w-4 mr-2" />Request to Join
              </Button>
            )
          )}
          {!user && (
            <Button asChild>
              <Link to="/login"><Users className="h-4 w-4 mr-2" />Sign in to Request</Link>
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

          {(isAdmin || isMod || isOwner) && (
            <Button asChild variant="outline" className="w-full">
              <Link to={`/communities/${church.id}/admin`}>
                <Shield className="h-4 w-4 mr-2" />Admin Dashboard
              </Link>
            </Button>
          )}
        </div>

        {isMember && !isOwner && (
          <div className="text-center">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />Leave community
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Leave {church.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You'll stop seeing this community's prayer wall and won't be able to submit requests until you rejoin. You can request to join again anytime.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Stay</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => leaveCommunity.mutate(church.id)}
                    disabled={leaveCommunity.isPending}
                  >
                    Yes, leave
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {isOwner && (
          <p className="text-center text-sm text-muted-foreground">
            You are the owner of this community.
          </p>
        )}

        <RequestJoinCommunityDialog
          open={requestOpen}
          onOpenChange={setRequestOpen}
          communityId={church.id}
          communityName={church.name}
        />
      </div>
    </div>
  );
};

export default ChurchDetail;
