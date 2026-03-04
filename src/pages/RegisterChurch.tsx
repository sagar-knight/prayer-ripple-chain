import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Church } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCreateChurch } from "@/hooks/useChurch";
import { Link } from "react-router-dom";

const RegisterChurch = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createChurch = useCreateChurch();

  const [form, setForm] = useState({
    name: "",
    denomination: "",
    city: "",
    state: "",
    country: "",
    address: "",
    website: "",
    phone: "",
    contact_email: "",
    privacy: "public",
  });
  const [agreed, setAgreed] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed || !form.name || !form.contact_email || !form.country) return;
    const result = await createChurch.mutateAsync({
      name: form.name,
      denomination: form.denomination || undefined,
      city: form.city || undefined,
      state: form.state || undefined,
      country: form.country,
      address: form.address || undefined,
      website: form.website || undefined,
      phone: form.phone || undefined,
      contact_email: form.contact_email,
      privacy: form.privacy,
    });
    navigate(`/churches/${result.id}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-peaceful py-12">
        <div className="max-w-lg mx-auto px-4 text-center">
          <Church className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="font-playfair text-2xl font-bold text-foreground mb-4">Sign in to register your church</h1>
          <Button asChild variant="default">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <Church className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="font-playfair text-3xl font-bold text-foreground mb-2">Register Your Church</h1>
          <p className="text-muted-foreground">Create a church profile and prayer community on PrayerForward.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-playfair text-xl">Church Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Church Name *</Label>
                <Input id="name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="denomination">Denomination</Label>
                <Input id="denomination" value={form.denomination} onChange={(e) => handleChange("denomination", e.target.value)} placeholder="e.g. Baptist, Catholic, Non-denominational" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={form.city} onChange={(e) => handleChange("city", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="state">State / Province</Label>
                  <Input id="state" value={form.state} onChange={(e) => handleChange("state", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="country">Country *</Label>
                <Input id="country" value={form.country} onChange={(e) => handleChange("country", e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={form.address} onChange={(e) => handleChange("address", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" value={form.website} onChange={(e) => handleChange("website", e.target.value)} placeholder="https://" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="contact_email">Church Contact Email *</Label>
                <Input id="contact_email" type="email" value={form.contact_email} onChange={(e) => handleChange("contact_email", e.target.value)} required />
              </div>
              <div>
                <Label>Prayer Wall Privacy</Label>
                <Select value={form.privacy} onValueChange={(v) => handleChange("privacy", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public – Anyone can view</SelectItem>
                    <SelectItem value="members_only">Members Only – Only joined members can view</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-start space-x-2 pt-2">
                <Checkbox id="agree" checked={agreed} onCheckedChange={(c) => setAgreed(!!c)} />
                <Label htmlFor="agree" className="text-sm text-muted-foreground leading-snug">
                  I agree to maintain a respectful and welcoming community in accordance with PrayerForward guidelines.
                </Label>
              </div>
              <Button type="submit" className="w-full" disabled={!agreed || createChurch.isPending || !form.name || !form.contact_email || !form.country}>
                {createChurch.isPending ? "Registering..." : "Register Church"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterChurch;
