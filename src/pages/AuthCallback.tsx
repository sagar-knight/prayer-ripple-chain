import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase automatically exchanges the token from the URL hash/query
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          setErrorMessage(error.message);
          setStatus("error");
          return;
        }

        if (data.session) {
          setStatus("success");
          const returnTo = sessionStorage.getItem("returnTo") || "/";
          sessionStorage.removeItem("returnTo");
          // Brief delay so the user sees the success state
          setTimeout(() => navigate(returnTo, { replace: true }), 1500);
        } else {
          // No session yet — might still be processing
          // Wait a moment and try again
          await new Promise((r) => setTimeout(r, 1000));
          const { data: retry, error: retryError } = await supabase.auth.getSession();
          if (retryError || !retry.session) {
            setErrorMessage("Unable to verify your account. Please try signing in.");
            setStatus("error");
          } else {
            setStatus("success");
            const returnTo = sessionStorage.getItem("returnTo") || "/";
            sessionStorage.removeItem("returnTo");
            setTimeout(() => navigate(returnTo, { replace: true }), 1500);
          }
        }
      } catch (err: any) {
        console.error("Auth callback exception:", err);
        setErrorMessage(err.message || "An unexpected error occurred.");
        setStatus("error");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md animate-gentle-fade text-center">
        <CardContent className="pt-8 space-y-4">
          {status === "loading" && (
            <>
              <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
              <h2 className="font-playfair text-2xl font-bold">Verifying Your Account</h2>
              <p className="text-muted-foreground">Please wait while we confirm your email...</p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <h2 className="font-playfair text-2xl font-bold">Email Verified!</h2>
              <p className="text-muted-foreground">Your account is confirmed. Redirecting you now...</p>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="h-12 w-12 text-destructive mx-auto" />
              <h2 className="font-playfair text-2xl font-bold">Verification Issue</h2>
              <p className="text-muted-foreground">{errorMessage}</p>
              <div className="flex flex-col gap-2 mt-4">
                <Button variant="peaceful" onClick={() => navigate("/login", { replace: true })}>
                  Go to Sign In
                </Button>
                <Button variant="outline" onClick={() => navigate("/signup", { replace: true })}>
                  Try Signing Up Again
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;
