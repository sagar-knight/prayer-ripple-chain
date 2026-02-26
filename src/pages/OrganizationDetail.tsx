import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Heart,
  Users,
  Globe,
  BookOpen,
  CheckCircle,
  Shield,
  Copy,
  UserPlus,
} from "lucide-react";
import {
  sampleOrganizations,
  sampleOrgRequests,
  OrgPrayerRequest,
} from "@/data/organizations";
import { getCountryByCode } from "@/data/countries";
import { useToast } from "@/hooks/use-toast";

const OrganizationDetail = () => {
  const { orgId } = useParams();
  const { toast } = useToast();
  const org = sampleOrganizations.find((o) => o.id === orgId);
  const [activeTab, setActiveTab] = useState("requests");
  const [prayedIds, setPrayedIds] = useState<Set<string>>(new Set());
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [newReq, setNewReq] = useState({
    title: "",
    description: "",
    category: "Faith",
    visibility: "public" as "public" | "anonymous",
    shareToGlobal: false,
  });

  if (!org) {
    return (
      <div className="min-h-screen bg-gradient-peaceful py-16 pb-24">
        <div className="max-w-lg mx-auto px-4 text-center">
          <h1 className="font-playfair text-2xl font-bold text-foreground mb-4">
            Family not found
          </h1>
          <Button asChild variant="peaceful">
            <Link to="/organizations">Browse Families</Link>
          </Button>
        </div>
      </div>
    );
  }

  const country = getCountryByCode(org.countryCode);
  const requests = sampleOrgRequests.filter((r) => r.orgId === org.id);

  const handlePray = (reqId: string) => {
    setPrayedIds((prev) => new Set(prev).add(reqId));
    toast({ title: "Prayer recorded 🙏", description: "Thank you for praying." });
  };

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button asChild variant="ghost" size="sm" className="mb-6 gap-2">
          <Link to="/organizations">
            <ArrowLeft className="h-4 w-4" />
            Back to Families
          </Link>
        </Button>

        {/* Org Header */}
        <Card className="mb-6 animate-gentle-fade">
          <CardContent className="pt-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <h1 className="font-playfair text-2xl md:text-3xl font-bold text-foreground mb-1">
                {org.name}
              </h1>
              <div className="flex items-center justify-center gap-2 flex-wrap mb-3">
                <Badge variant="secondary">{org.type}</Badge>
                {country && (
                  <Badge variant="outline" className="gap-1">
                    {country.flag} {country.name}
                    {org.city && `, ${org.city}`}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground max-w-lg mx-auto mb-4">
                {org.description}
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" /> {org.memberCount} members
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4" /> {org.prayerCount} prayers
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" /> {org.requestCount} requests
                </span>
              </div>

              {/* Invite Code */}
              <div className="mt-4 inline-flex items-center gap-2 bg-muted/50 rounded-lg px-4 py-2">
                <span className="text-xs text-muted-foreground">Invite Code:</span>
                <span className="font-mono font-bold text-primary">
                  {org.inviteCode}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => {
                    navigator.clipboard.writeText(org.inviteCode);
                    toast({ title: "Invite code copied!" });
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4 mb-6">
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="pray">Pray</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-playfair text-lg font-semibold">
                Prayer Requests
              </h2>
              <Button
                variant="peaceful"
                size="sm"
                className="gap-1"
                onClick={() => setShowNewRequest(!showNewRequest)}
              >
                + New Request
              </Button>
            </div>

            {showNewRequest && (
              <Card className="animate-gentle-fade">
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      placeholder="Prayer request title"
                      value={newReq.title}
                      onChange={(e) =>
                        setNewReq({ ...newReq, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe the prayer need..."
                      value={newReq.description}
                      onChange={(e) =>
                        setNewReq({ ...newReq, description: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={newReq.category}
                        onValueChange={(v) =>
                          setNewReq({ ...newReq, category: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["Health", "Family", "Work", "Peace", "Faith", "Other"].map(
                            (c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Visibility</Label>
                      <Select
                        value={newReq.visibility}
                        onValueChange={(v: "public" | "anonymous") =>
                          setNewReq({ ...newReq, visibility: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="anonymous">Anonymous</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="share-global"
                      checked={newReq.shareToGlobal}
                      onCheckedChange={(c) =>
                        setNewReq({ ...newReq, shareToGlobal: c === true })
                      }
                    />
                    <Label htmlFor="share-global" className="text-sm cursor-pointer">
                      Also share to global PrayerForward community
                    </Label>
                  </div>
                  <Button
                    variant="peaceful"
                    className="w-full"
                    disabled={!newReq.title.trim() || !newReq.description.trim()}
                    onClick={() => {
                      toast({ title: "Prayer request submitted 🙏" });
                      setShowNewRequest(false);
                      setNewReq({
                        title: "",
                        description: "",
                        category: "Faith",
                        visibility: "public",
                        shareToGlobal: false,
                      });
                    }}
                  >
                    Submit Request
                  </Button>
                </CardContent>
              </Card>
            )}

            {requests.map((req) => (
              <OrgRequestCard
                key={req.id}
                request={req}
                prayed={prayedIds.has(req.id)}
                onPray={() => handlePray(req.id)}
              />
            ))}

            {requests.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No prayer requests yet. Be the first to submit one!</p>
              </div>
            )}
          </TabsContent>

          {/* Pray Tab */}
          <TabsContent value="pray" className="space-y-4">
            <h2 className="font-playfair text-lg font-semibold mb-2">
              Pray for {org.name}
            </h2>
            {requests
              .filter((r) => r.status === "open" && !prayedIds.has(r.id))
              .map((req) => (
                <OrgRequestCard
                  key={req.id}
                  request={req}
                  prayed={false}
                  onPray={() => handlePray(req.id)}
                />
              ))}
            {requests.filter((r) => r.status === "open" && !prayedIds.has(r.id))
              .length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p>You've prayed for all current requests. Thank you! 🙏</p>
              </div>
            )}
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle className="font-playfair flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Members (Admin View)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "Pastor James W.", role: "Admin", active: true },
                  { name: "Sarah M.", role: "Moderator", active: true },
                  { name: "David K.", role: "Member", active: true },
                  { name: "Maria L.", role: "Member", active: true },
                  { name: "John P.", role: "Member", active: false },
                ].map((member, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {member.role}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={member.active ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {member.active ? "Active" : "Pending"}
                    </Badge>
                  </div>
                ))}

                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3">
                    Org metrics
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-xl font-bold text-primary">
                        {org.requestCount}
                      </div>
                      <div className="text-xs text-muted-foreground">Requests</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-primary">
                        {org.prayerCount}
                      </div>
                      <div className="text-xs text-muted-foreground">Prayers</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-primary">
                        {org.memberCount}
                      </div>
                      <div className="text-xs text-muted-foreground">Members</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Description</Label>
                  <p className="text-sm mt-1">{org.description}</p>
                </div>
                {org.website && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Website</Label>
                    <p className="text-sm mt-1">
                      <a
                        href={org.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {org.website}
                      </a>
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground text-xs">Contact</Label>
                  <p className="text-sm mt-1">{org.contactEmail}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Location</Label>
                  <p className="text-sm mt-1">
                    {getCountryByCode(org.countryCode)?.flag}{" "}
                    {org.countryName}
                    {org.city && `, ${org.city}`}
                  </p>
                </div>

                <div className="pt-4">
                  <Button variant="peaceful" className="w-full gap-2">
                    <UserPlus className="h-4 w-4" />
                    Join This Family
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const OrgRequestCard = ({
  request,
  prayed,
  onPray,
}: {
  request: OrgPrayerRequest;
  prayed: boolean;
  onPray: () => void;
}) => (
  <Card className="animate-gentle-fade">
    <CardContent className="pt-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-foreground">{request.title}</h3>
            <Badge variant="outline" className="text-xs">
              {request.category}
            </Badge>
            {request.shareToGlobal && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Globe className="h-3 w-3" />
                Global
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            {request.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              By {request.visibility === "anonymous" ? "Anonymous" : request.createdByName}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {request.prayerCountOrg + request.prayerCountGlobal} prayers
              {request.shareToGlobal &&
                ` (Org: ${request.prayerCountOrg}, Global: ${request.prayerCountGlobal})`}
            </span>
          </div>
        </div>
        <Button
          variant={prayed ? "outline" : "peaceful"}
          size="sm"
          disabled={prayed}
          onClick={onPray}
          className="shrink-0"
        >
          {prayed ? (
            <>
              <CheckCircle className="h-4 w-4 mr-1" /> Prayed
            </>
          ) : (
            <>
              <Heart className="h-4 w-4 mr-1" /> Pray
            </>
          )}
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default OrganizationDetail;
