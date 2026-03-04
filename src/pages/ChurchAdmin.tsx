import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Shield, CheckCircle, XCircle, Clock, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useChurch, useChurchMembership, useChurchMembers, useChurchPrayerRequests, useModerateRequest, useSubmitChurchPrayer } from "@/hooks/useChurch";
import { format } from "date-fns";
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
  const moderateRequest = useModerateRequest();
  const submitPrayer = useSubmitChurchPrayer();

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
          <p className="text-muted-foreground mb-4">Only church admins and moderators can access this page.</p>
          <Button asChild variant="outline"><Link to={`/churches/${churchId}`}>Back to Church</Link></Button>
        </div>
      </div>
    );
  }

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
    // Submit as admin — auto-approve by submitting then immediately approving
    await submitPrayer.mutateAsync({
      church_id: churchId,
      title: officialTitle,
      description: officialDesc,
      category: "general",
    });
    // The request was just created as pending, now approve the latest one
    // For simplicity, we notify admin to approve from the pending queue
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
            <Link to={`/churches/${churchId}`}><ArrowLeft className="h-4 w-4 mr-1" />Back to Church</Link>
          </Button>
        </div>

        <div className="text-center mb-8">
          <Shield className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="font-playfair text-2xl font-bold text-foreground mb-1">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">{church?.name || "Church"}</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
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
        </Tabs>

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
