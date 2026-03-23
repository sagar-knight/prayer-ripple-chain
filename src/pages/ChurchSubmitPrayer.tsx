import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useChurch, useChurchMembership, useSubmitChurchPrayer } from "@/hooks/useChurch";
import { useContentModeration } from "@/hooks/useContentModeration";
import { churchPrayerSchema } from "@/lib/validation";

const categories = ["General", "Health", "Family", "Guidance", "Gratitude", "Urgent", "Other"];

const ChurchSubmitPrayer = () => {
  const { churchId } = useParams<{ churchId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: church } = useChurch(churchId || "");
  const { data: membership } = useChurchMembership(churchId || "");
  const submitPrayer = useSubmitChurchPrayer();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [anonymous, setAnonymous] = useState(false);

  if (!user || !membership) {
    return (
      <div className="min-h-screen bg-gradient-peaceful py-12">
        <div className="max-w-lg mx-auto px-4 text-center">
          <h2 className="font-playfair text-xl font-bold mb-2">Members Only</h2>
          <p className="text-muted-foreground mb-4">You must be a member to submit prayer requests.</p>
          <Button asChild><Link to={`/churches/${churchId}`}>Back to Church</Link></Button>
        </div>
      </div>
    );
  }

  const { moderate, checking } = useContentModeration();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!churchId) return;

    const parsed = churchPrayerSchema.safeParse({ title, description, category, anonymous });
    if (!parsed.success) return;

    const modResult = await moderate(
      `${parsed.data.title} ${parsed.data.description}`,
      "church prayer request",
      "submit_church_prayer"
    );
    if (!modResult.allowed) return;

    await submitPrayer.mutateAsync({
      church_id: churchId,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category.toLowerCase(),
      anonymous: parsed.data.anonymous,
    });
    navigate(`/churches/${churchId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link to={`/churches/${churchId}`}><ArrowLeft className="h-4 w-4 mr-1" />Back to Church</Link>
          </Button>
        </div>

        <div className="text-center mb-8">
          <Send className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="font-playfair text-2xl font-bold text-foreground mb-1">Submit Prayer Request</h1>
          <p className="text-muted-foreground text-sm">{church?.name || "Church"}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-playfair text-lg">Your Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={100} />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} maxLength={1000} />
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="anonymous" checked={anonymous} onCheckedChange={(c) => setAnonymous(!!c)} />
                <Label htmlFor="anonymous" className="text-sm text-muted-foreground">Submit anonymously within the church</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Your request will be reviewed by a church admin before appearing on the Prayer Wall.
              </p>
              <Button type="submit" className="w-full" disabled={submitPrayer.isPending || checking || !title || !description}>
                {submitPrayer.isPending ? "Submitting..." : "Submit for Review"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChurchSubmitPrayer;
