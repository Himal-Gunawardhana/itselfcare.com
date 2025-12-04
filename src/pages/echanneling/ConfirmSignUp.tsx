import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { confirmSignUp, resendConfirmationCode } from "@/services/auth";
import { ArrowLeft } from "lucide-react";

const ConfirmSignUp = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const email = searchParams.get("email") || "";
  const userType = (searchParams.get("type") || "patient") as
    | "patient"
    | "therapist";

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await confirmSignUp(userType, email, code);

      toast({
        title: "Success",
        description: "Email verified successfully! You can now sign in.",
      });

      // Redirect to login
      setTimeout(() => {
        navigate(`/echanneling/login?type=${userType}`);
      }, 1500);
    } catch (error) {
      console.error("Confirmation error:", error);

      let errorMessage = "Verification failed. Please check your code.";
      if (error instanceof Error) {
        if (error.message.includes("CodeMismatchException")) {
          errorMessage = "Invalid verification code. Please try again.";
        } else if (error.message.includes("ExpiredCodeException")) {
          errorMessage = "Verification code expired. Please request a new one.";
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);

    try {
      await resendConfirmationCode(userType, email);

      toast({
        title: "Success",
        description: "Verification code sent! Check your email.",
      });
    } catch (error) {
      console.error("Resend error:", error);

      toast({
        title: "Error",
        description: "Failed to resend code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            Verify Your Email
          </CardTitle>
          <CardDescription>
            We sent a verification code to {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleConfirm} className="space-y-4">
            <div>
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                required
              />
              <p className="text-sm text-muted-foreground mt-2">
                Check your email inbox for the verification code
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Verifying...
                </div>
              ) : (
                "Verify Email"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button
              type="button"
              variant="link"
              onClick={handleResendCode}
              disabled={resending}
              className="text-sm"
            >
              {resending ? "Sending..." : "Didn't receive the code? Resend"}
            </Button>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/echanneling/login"
              className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmSignUp;
