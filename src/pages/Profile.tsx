import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut, KeyRound, Trash2, ShieldAlert } from "lucide-react";
import AvatarUploader from "@/components/AvatarUploader";

const Profile = () => {
  const { user, signOut, updatePassword, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");

  // Change password dialog
  const [pwOpen, setPwOpen] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  // Remove account – two-step
  const [removeStep, setRemoveStep] = useState<0 | 1 | 2>(0);
  const [confirmText, setConfirmText] = useState("");
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth?redirect=/profile");
      return;
    }
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, city, state")
        .eq("id", user.id)
        .maybeSingle();
      if (!active) return;
      setDisplayName(data?.display_name ?? "");
      setCity(data?.city ?? "");
      setStateName(data?.state ?? "");
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user, navigate]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || null,
        city: city.trim() || null,
        state: stateName.trim() || null,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated" });
    }
  };

  const handleChangePassword = async () => {
    if (newPw.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters.", variant: "destructive" });
      return;
    }
    if (newPw !== confirmPw) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    setPwSaving(true);
    const { error } = await updatePassword(newPw);
    setPwSaving(false);
    if (error) {
      toast({ title: "Could not change password", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated" });
      setPwOpen(false);
      setNewPw("");
      setConfirmPw("");
    }
  };

  const handleSendRecovery = async () => {
    if (!user?.email) return;
    const { error } = await resetPassword(user.email);
    if (error) {
      toast({ title: "Could not send email", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Recovery email sent", description: `Check ${user.email}.` });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleRemoveAccount = async () => {
    if (confirmText.trim().toUpperCase() !== "DELETE") {
      toast({ title: 'Type "DELETE" to confirm', variant: "destructive" });
      return;
    }
    setRemoving(true);
    try {
      const { error } = await supabase.functions.invoke("delete-account");
      if (error) throw error;
      await supabase.auth.signOut();
      toast({ title: "Account removed" });
      navigate("/");
    } catch (err) {
      toast({
        title: "Could not remove account",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setRemoving(false);
      setRemoveStep(0);
      setConfirmText("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10 pb-28">
      <div className="max-w-xl mx-auto px-4 space-y-8">
        <header className="text-center">
          <h1 className="font-playfair text-2xl font-semibold tracking-wide text-foreground">
            Profile
          </h1>
        </header>

        {/* ===== Profile form ===== */}
        <Card>
          <CardContent className="pt-6 space-y-5">
            {user && (
              <AvatarUploader userId={user.id} displayName={displayName} />
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" value={user?.email ?? ""} disabled />
              <p className="text-xs text-muted-foreground">
                Email is verified and cannot be changed here.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="State"
                />
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
            </Button>
          </CardContent>
        </Card>

        {/* ===== Account ===== */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Account
          </h2>
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              <button
                onClick={() => setPwOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-muted/40 transition"
              >
                <KeyRound className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-sm text-foreground">Change Password</span>
              </button>
              <button
                onClick={handleSendRecovery}
                className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-muted/40 transition"
              >
                <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-sm text-foreground">
                  Send recovery email
                </span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-muted/40 transition"
              >
                <LogOut className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-sm text-foreground">Logout</span>
              </button>
            </CardContent>
          </Card>
        </section>

        {/* ===== Danger zone ===== */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-destructive">
            Danger Zone
          </h2>
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => setRemoveStep(1)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove Account
          </Button>
        </section>
      </div>

      {/* Change password dialog */}
      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>
              Choose a new password at least 8 characters long.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="new-pw">New password</Label>
              <Input
                id="new-pw"
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pw">Confirm password</Label>
              <Input
                id="confirm-pw"
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPwOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={pwSaving}>
              {pwSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove account – Step 1: confirm intent */}
      <AlertDialog open={removeStep === 1} onOpenChange={(o) => !o && setRemoveStep(0)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes your profile, prayer requests, and all
              activity. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                setRemoveStep(2);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove account – Step 2: type DELETE */}
      <AlertDialog open={removeStep === 2} onOpenChange={(o) => !o && setRemoveStep(0)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Type DELETE to confirm</AlertDialogTitle>
            <AlertDialogDescription>
              For your safety, type <span className="font-semibold">DELETE</span>{" "}
              below to permanently remove your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            autoFocus
          />
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setConfirmText("");
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleRemoveAccount();
              }}
              disabled={removing || confirmText.trim().toUpperCase() !== "DELETE"}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remove account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;
