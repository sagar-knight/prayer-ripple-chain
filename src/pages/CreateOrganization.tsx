import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { ArrowLeft, CheckCircle, Copy, Users } from "lucide-react";
import { Link } from "react-router-dom";
import CountrySelect from "@/components/CountrySelect";
import { orgTypes } from "@/data/organizations";
import { useToast } from "@/hooks/use-toast";

const CreateOrganization = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "",
    countryCode: null as string | null,
    city: "",
    website: "",
    contactEmail: "",
    description: "",
    agreed: false,
  });

  const generatedCode = form.name
    ? form.name.replace(/\s+/g, "").slice(0, 6).toUpperCase() + "26"
    : "";

  const isValid =
    form.name.trim() &&
    form.type &&
    form.countryCode &&
    form.contactEmail.trim() &&
    form.description.trim() &&
    form.agreed;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-peaceful py-16 pb-24">
        <div className="max-w-lg mx-auto px-4 text-center">
          <Card className="py-12 animate-gentle-fade">
            <CardContent className="space-y-6">
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <h1 className="font-playfair text-3xl font-bold text-foreground">
                Family Created!
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                Share the invite code below with your community so they can join.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-center gap-3">
                <span className="font-mono text-2xl font-bold text-primary tracking-wider">
                  {generatedCode}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedCode);
                    toast({ title: "Invite code copied!" });
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <Button asChild variant="peaceful">
                  <Link to="/organizations">View Families</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/">Return Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button asChild variant="ghost" size="sm" className="mb-6 gap-2">
          <Link to="/organizations">
            <ArrowLeft className="h-4 w-4" />
            Back to Families
          </Link>
        </Button>

        <div className="text-center mb-8 animate-gentle-fade">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-playfair text-3xl font-bold text-foreground mb-2">
            Create a Family
          </h1>
          <p className="text-muted-foreground">
            Set up a prayer space for your church, ministry, or group.
          </p>
        </div>

        <Card className="animate-gentle-fade" style={{ animationDelay: "100ms" }}>
          <CardContent className="pt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Family Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Grace Community Church"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Type *</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {orgTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Country *</Label>
              <CountrySelect
                value={form.countryCode}
                onChange={(c) => setForm({ ...form, countryCode: c })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City (optional)</Label>
              <Input
                id="city"
                placeholder="e.g. Nashville, TN"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website (optional)</Label>
              <Input
                id="website"
                placeholder="https://..."
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Contact Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="prayer@example.com"
                value={form.contactEmail}
                onChange={(e) =>
                  setForm({ ...form, contactEmail: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Description / Mission *</Label>
              <Textarea
                id="desc"
                placeholder="Describe your organization's mission and prayer focus..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="agree"
                checked={form.agreed}
                onCheckedChange={(c) => setForm({ ...form, agreed: c === true })}
              />
              <Label htmlFor="agree" className="text-sm cursor-pointer leading-relaxed">
                We agree to use PrayerForward respectfully and follow community
                guidelines.
              </Label>
            </div>

            <Button
              variant="peaceful"
              size="lg"
              className="w-full text-lg py-6 shadow-peaceful"
              disabled={!isValid}
              onClick={() => setSubmitted(true)}
            >
              Create Family
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateOrganization;
