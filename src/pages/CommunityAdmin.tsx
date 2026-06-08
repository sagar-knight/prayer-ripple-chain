import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, Shield, CheckCircle, XCircle, Clock, Users, UserPlus,
  Heart, TrendingUp, BarChart3, AlertCircle,
} from "lucide-react";
import ChurchInviteTools from "@/components/CommunityInviteTools";
import { useAuth } from "@/hooks/useAuth";
import {
  useChurch, useChurchMembership, useChurchMembers,
  useChurchPrayerRequests, useModerateRequest, useSubmitChurchPrayer,
  useCommunityJoinRequests, useReviewCommunityJoinRequest,
} from "@/hooks/useCommunity";
import { format, subDays, isAfter } from "date-fns";
import { toast } from "@/hooks/use-toast";

const ChurchAdmin = () => {
  const { churchId } = useParams<{ churchId: string }>();
  const { user } = useAuth();
  const { data: church } = useChurch(churchId || "");
  const { data: membership } = useChurchMembership(churchId || "");
  const { data: members } = useChurchMembers(churchId || "");
  const { data: pendingReqs } = useChurchPrayerRequests(churchId || "", "pending");
  const { data: approvedReqs } = useChurchPrayerRequests(churchId || "", "approved");
  const { data: rejectedReqs } = useChurchPrayerRequests(churchId || "", "rejected");
  const { data: allRequests } = useChurchPrayerRequests(churchId || "");
  const moderateRequest = useModerateRequest();
  const submitPrayer = useSubmitChurchPrayer();
  const { data: pendingJoinRequests } = useCommunityJoinRequests(churchId || "", "pending");
  const { data: reviewedJoinRequests } = useCommunityJoinRequests(churchId || "");
  const reviewJoin = useReviewCommunityJoinRequest();

  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [officialTitle, setOfficialTitle] = useState("");
  const [officialDesc, setOfficialDesc] = useState("");

  const isAdmin = membership?.role === "admin";
  const isMod = membership?.role === "moderator";

  if (!isAdmin && !isMod) {
    return (
      <div className="min-h-screen bg-gradient-peaceful py-12">
        <div className="max-w-lg mx-auto px-4 text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-playfair text-xl font-bold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground mb-4">Only community admins and moderators can access this page.</p>
          <Button asChild variant="outline"><Link to={`/communities/${churchId}`}>Back to Community</Link></Button>
        </div>
      </div>
    );
  }

  // Compute stats from real data
  const now = new Date();
  const weekAgo = subDays(now, 7);
  const allReqs = allRequests || [];
  const thisWeekSubmissions = allReqs.filter((r) => isAfter(new Date(r.created_at), weekAgo));
  const activeRequests = allReqs.filter((r) => r.status === "approved" || r.status === "pending");
  const answeredRequests = allReqs.filter((r) => r.status === "answered");
  const approved = approvedReqs || [];
  const memberCount = members?.length || 0;

  // Estimate "needing prayer" as approved requests.
  const needingPrayer = approved.length;

  const handleApprove = (requestId: string) => {
    moderateRequest.mutate({ requestId, action: "approved", churchId: churchId! });
  };

  const handleReject = (requestId: string) => {
    moderateRequest.mutate({
      requestId,
      action: "rejected",
      reason: rejectReason[requestId] || undefined,
      churchId: churchId!,
    });
  };

  const handlePostOfficial = async () => {
    if (!officialTitle || !officialDesc || !churchId || !user) return;
    await submitPrayer.mutateAsync({
      church_id: churchId,
      title: officialTitle,
      description: officialDesc,
      category: "general",
    });
    toast({ title: "Official request submitted", description: "Please approve it from the Pending tab." });
    setOfficialTitle("");
    setOfficialDesc("");
  };

  const RequestList = ({ requests, showActions }: { requests: any[] | undefined; showActions: boolean }) => (
    <div className="space-y-3">
      {!requests?.length ? (
        <p className="text-center text-muted-foreground py-8">No requests.</p>
      ) : (
        requests.map((req: any) => (
          <Card key={req.id}>
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-foreground">{req.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {req.anonymous ? "Anonymous" : `User: ${req.submitted_by.slice(0, 8)}...`} · {format(new Date(req.created_at), "MMM d, yyyy")}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">{req.category}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{req.description}</p>
              {req.status === "rejected" && req.rejected_reason && (
                <p className="text-xs text-destructive">Reason: {req.rejected_reason}</p>
              )}
              {showActions && (
                <div className="flex items-center gap-2 pt-2 flex-wrap">
                  <Button size="sm" onClick={() => handleApprove(req.id)} disabled={moderateRequest.isPending}>
                    <CheckCircle className="h-3 w-3 mr-1" />Approve
                  </Button>
                  <div className="flex items-center gap-1 flex-1">
                    <Input
                      placeholder="Reason (optional)"
                      className="text-xs h-8"
                      value={rejectReason[req.id] || ""}
                      onChange={(e) => setRejectReason((prev) => ({ ...prev, [req.id]: e.target.value }))}
                    />
                    <Button size="sm" variant="outline" onClick={() => handleReject(req.id)} disabled={moderateRequest.isPending}>
                      <XCircle className="h-3 w-3 mr-1" />Reject
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link to={`/communities/${churchId}`}><ArrowLeft className="h-4 w-4 mr-1" />Back to Community</Link>
          </Button>
        </div>

        <div className="text-center mb-8">
          <Shield className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="font-playfair text-2xl font-bold text-foreground mb-1">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">{church?.name || "Community"}</p>
        </div>

        {/* Prayer Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 animate-gentle-fade">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-4 text-center">
              <div className="w-9 h-9 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{thisWeekSubmissions.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">This Week</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-4 text-center">
              <div className="w-9 h-9 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Heart className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{activeRequests.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Active</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-4 text-center">
              <div className="w-9 h-9 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <CheckCircle className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{answeredRequests.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Answered</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-4 text-center">
              <div className="w-9 h-9 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{memberCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Members</p>
            </CardContent>
          </Card>
        </div>

        {/* Prayer Coverage + Team Activity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 animate-gentle-fade" style={{ animationDelay: "100ms" }}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Prayer Coverage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">On prayer wall</span>
                <span className="text-sm font-semibold text-foreground">{approved.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Awaiting review</span>
                <span className="text-sm font-semibold text-foreground">{pendingReqs?.length || 0}</span>
              </div>
              {(pendingReqs?.length || 0) > 0 && (
                <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 rounded-md p-2">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{pendingReqs?.length} requests need your review</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Prayer Team
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total members</span>
                <span className="text-sm font-semibold text-foreground">{memberCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Admins / Moderators</span>
                <span className="text-sm font-semibold text-foreground">
                  {members?.filter((m) => m.role === "admin" || m.role === "moderator").length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Categories used</span>
                <span className="text-sm font-semibold text-foreground">
                  {new Set(allReqs.map((r) => r.category)).size}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for moderation */}
        <Tabs defaultValue="pending" className="space-y-4 animate-gentle-fade" style={{ animationDelay: "200ms" }}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="pending" className="text-xs sm:text-sm">
              <Clock className="h-3 w-3 mr-1 hidden sm:inline" />Pending ({pendingReqs?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="approved" className="text-xs sm:text-sm">
              <CheckCircle className="h-3 w-3 mr-1 hidden sm:inline" />Approved
            </TabsTrigger>
            <TabsTrigger value="rejected" className="text-xs sm:text-sm">
              <XCircle className="h-3 w-3 mr-1 hidden sm:inline" />Rejected
            </TabsTrigger>
            <TabsTrigger value="members" className="text-xs sm:text-sm">
              <Users className="h-3 w-3 mr-1 hidden sm:inline" />Members
            </TabsTrigger>
            <TabsTrigger value="requests" className="text-xs sm:text-sm">
              <UserPlus className="h-3 w-3 mr-1 hidden sm:inline" />Requests ({pendingJoinRequests?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <RequestList requests={pendingReqs} showActions />
          </TabsContent>

          <TabsContent value="approved">
            <RequestList requests={approvedReqs} showActions={false} />
          </TabsContent>

          <TabsContent value="rejected">
            <RequestList requests={rejectedReqs} showActions={false} />
          </TabsContent>

          <TabsContent value="members">
            <div className="space-y-2">
              {members?.map((m: any) => (
                <Card key={m.id}>
                  <CardContent className="pt-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">User: {m.user_id.slice(0, 8)}...</p>
                      <p className="text-xs text-muted-foreground">Joined {format(new Date(m.joined_at), "MMM d, yyyy")}</p>
                    </div>
                    <Badge variant={m.role === "admin" ? "default" : "secondary"}>{m.role}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="requests">
            <div className="space-y-3">
              {!pendingJoinRequests?.length ? (
                <p className="text-center text-muted-foreground py-8">
                  No pending membership requests.
                </p>
              ) : (
                pendingJoinRequests.map((r) => (
                  <Card key={r.id}>
                    <CardContent className="pt-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-foreground">
                            User: {r.user_id.slice(0, 8)}...
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Requested {format(new Date(r.created_at), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">Pending</Badge>
                      </div>
                      {r.message && (
                        <div className="rounded-md bg-muted/40 p-3 text-sm text-foreground italic">
                          "{r.message}"
                        </div>
                      )}
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            reviewJoin.mutate({
                              requestId: r.id,
                              communityId: r.community_id,
                              decision: "approved",
                            })
                          }
                          disabled={reviewJoin.isPending}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            reviewJoin.mutate({
                              requestId: r.id,
                              communityId: r.community_id,
                              decision: "rejected",
                            })
                          }
                          disabled={reviewJoin.isPending}
                        >
                          <XCircle className="h-3 w-3 mr-1" />Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}

              {reviewedJoinRequests && reviewedJoinRequests.some((r) => r.status !== "pending") && (
                <div className="pt-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent decisions</h3>
                  <div className="space-y-2">
                    {reviewedJoinRequests
                      .filter((r) => r.status !== "pending")
                      .slice(0, 10)
                      .map((r) => (
                        <Card key={r.id}>
                          <CardContent className="pt-3 pb-3 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              {r.user_id.slice(0, 8)}... ·{" "}
                              {r.reviewed_at
                                ? format(new Date(r.reviewed_at), "MMM d")
                                : "—"}
                            </span>
                            <Badge
                              variant={r.status === "approved" ? "default" : "secondary"}
                              className="text-[10px]"
                            >
                              {r.status}
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Community Invite Tools */}
        {isAdmin && (
          <div className="mt-8">
            <ChurchInviteTools
              churchId={churchId!}
              churchSlug={(church as any)?.slug || null}
              churchName={church?.name || "Community"}
              userId={user?.id}
            />
          </div>
        )}

        {/* Post Official Request */}
        {isAdmin && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-playfair text-lg">Post Official Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Title" value={officialTitle} onChange={(e) => setOfficialTitle(e.target.value)} maxLength={100} />
              <Input placeholder="Description" value={officialDesc} onChange={(e) => setOfficialDesc(e.target.value)} maxLength={1000} />
              <Button onClick={handlePostOfficial} disabled={!officialTitle || !officialDesc || submitPrayer.isPending} size="sm">
                {submitPrayer.isPending ? "Posting..." : "Post & Approve from Pending"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ChurchAdmin;
