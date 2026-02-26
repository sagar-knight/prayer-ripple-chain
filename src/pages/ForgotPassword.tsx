import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await resetPassword(email);
    setIsLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md animate-gentle-fade text-center">
          <CardContent className="pt-8 space-y-4">
            <Mail className="h-12 w-12 text-primary mx-auto" />
            <h2 className="font-playfair text-2xl font-bold">Check Your Email</h2>
            <p className="text-muted-foreground">If an account exists for <strong>{email}</strong>, we've sent a password reset link.</p>
            <Button asChild variant="outline"><Link to="/login">Back to Sign In</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md animate-gentle-fade">
        <CardHeader className="text-center">
          <CardTitle className="font-playfair text-2xl">Reset Password</CardTitle>
          <p className="text-sm text-muted-foreground">Enter your email and we'll send a reset link</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" variant="peaceful" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
