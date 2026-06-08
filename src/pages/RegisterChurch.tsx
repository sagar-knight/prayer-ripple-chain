import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Church, Upload, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCreateChurch } from "@/hooks/useChurch";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const DESCRIPTION_LIMIT = 500;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 2 * 1024 * 1024;

const RegisterChurch = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createChurch = useCreateChurch();

  const [form, setForm] = useState({
    name: "",
    description: "",
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
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload a PNG, JPG, WebP, or GIF image.", variant: "destructive" });
      e.target.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast({ title: "File too large", description: "Image must be under 2MB.", variant: "destructive" });
      e.target.value = "";
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const clearLogo = () => {
    setLogoFile(null);
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed || !form.name || !form.contact_email || !form.country) return;
    let logo_url: string | undefined;
    if (logoFile && user) {
      setUploading(true);
      const ext = logoFile.name.split(".").pop() || "png";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("community-logos").upload(path, logoFile, { upsert: false });
      setUploading(false);
      if (upErr) {
        toast({ title: "Logo upload failed", description: upErr.message, variant: "destructive" });
        return;
      }
      logo_url = supabase.storage.from("community-logos").getPublicUrl(path).data.publicUrl;
    }
    const result = await createChurch.mutateAsync({
      name: form.name,
      description: form.description || undefined,
      denomination: form.denomination || undefined,
      city: form.city || undefined,
      state: form.state || undefined,
      country: form.country,
      address: form.address || undefined,
      website: form.website || undefined,
      phone: form.phone || undefined,
      contact_email: form.contact_email,
      privacy: form.privacy,
      logo_url,
    });
    navigate(`/churches/${result.id}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-peaceful py-12">
        <div className="max-w-lg mx-auto px-4 text-center">
          <Church className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="font-playfair text-2xl font-bold text-foreground mb-4">Sign in to register your community</h1>
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
          <h1 className="font-playfair text-3xl font-bold text-foreground mb-2">Register Your Community</h1>
          <p className="text-muted-foreground">Create a community profile and prayer space on PrayerForward.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-playfair text-xl">Community Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Community Logo</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="h-20 w-20 rounded-lg border border-border bg-muted/40 flex items-center justify-center overflow-hidden shrink-0">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
                    ) : (
                      <Church className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <label className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          {logoFile ? "Replace" : "Upload Image"}
                          <input type="file" accept="image/png, image/jpeg, image/webp, image/gif" className="hidden" onChange={handleLogoSelect} />
                        </label>
                      </Button>
                      {logoFile && (
                        <Button type="button" variant="ghost" size="sm" onClick={clearLogo}>
                          <X className="h-4 w-4 mr-1" /> Remove
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">PNG or JPG, up to 2MB. Square images work best.</p>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="name">Community Name *</Label>
                <Input id="name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} required />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Description</Label>
                  <span className="text-xs text-muted-foreground">
                    {form.description.length}/{DESCRIPTION_LIMIT}
                  </span>
                </div>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value.slice(0, DESCRIPTION_LIMIT))}
                  placeholder="Share a short introduction about your community: who you are, what brings you together, and how people can pray with you."
                  rows={4}
                  maxLength={DESCRIPTION_LIMIT}
                />
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
                <Label htmlFor="contact_email">Contact Email *</Label>
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
              <Button type="submit" className="w-full" disabled={!agreed || createChurch.isPending || uploading || !form.name || !form.contact_email || !form.country}>
                {uploading ? "Uploading logo..." : createChurch.isPending ? "Registering..." : "Register Community"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterChurch;
