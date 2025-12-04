import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Stethoscope, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { signInWithGoogle } from "@/services/auth";

const GoogleSignInButton = ({
  onClick,
  userType,
}: {
  onClick: () => void;
  userType: string;
}) => (
  <Button type="button" variant="outline" className="w-full" onClick={onClick}>
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
    Sign in with Google as {userType}
  </Button>
);

const EChannelingLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn: cognitoSignIn, isCognitoConfigured } = useAuth();
  const [userType, setUserType] = useState<"patient" | "therapist">("patient");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleGoogleSignIn = async () => {
    if (!isCognitoConfigured) {
      toast({
        title: "Authentication Not Configured",
        description:
          "AWS Cognito is not configured. Please contact the administrator or see QUICK_START_AUTH.md",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await signInWithGoogle(userType);
      // Redirect will happen automatically via Amplify
    } catch (error) {
      console.error("Google Sign-In error:", error);
      toast({
        title: "Error",
        description: "Failed to initiate Google Sign-In. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!isCognitoConfigured) {
        toast({
          title: "Authentication Not Configured",
          description:
            "AWS Cognito is not configured. Please contact the administrator or see QUICK_START_AUTH.md",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Authenticate with Cognito
      await cognitoSignIn(userType, form.email, form.password);

      toast({
        title: "Success!",
        description: `Signed in successfully as ${userType}!`,
      });

      if (userType === "patient") {
        navigate("/echanneling/patient/dashboard");
      } else {
        navigate("/echanneling/therapist/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Login failed. Please check your credentials.";

      if (error instanceof Error) {
        if (error.message.includes("UserNotConfirmedException")) {
          errorMessage = "Please verify your email before signing in.";
          toast({
            title: "Email Not Verified",
            description: errorMessage,
            variant: "destructive",
          });
          navigate(
            `/echanneling/confirm?email=${encodeURIComponent(
              form.email
            )}&type=${userType}`
          );
          return;
        } else if (error.message.includes("NotAuthorizedException")) {
          errorMessage = "Incorrect email or password.";
        } else if (error.message.includes("UserNotFoundException")) {
          errorMessage = "Account not found. Please register first.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your ItselfCare account</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="patient"
            onValueChange={(v) => setUserType(v as "patient" | "therapist")}
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="patient" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Patient
              </TabsTrigger>
              <TabsTrigger
                value="therapist"
                className="flex items-center gap-2"
              >
                <Stethoscope className="h-4 w-4" />
                Therapist
              </TabsTrigger>
            </TabsList>

            <TabsContent value="patient">
              <div className="space-y-4">
                <GoogleSignInButton
                  onClick={handleGoogleSignIn}
                  userType="Patient"
                />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="patient-email">Email</Label>
                    <Input
                      id="patient-email"
                      type="email"
                      placeholder="patient@example.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="patient-password">Password</Label>
                    <Input
                      id="patient-password"
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Signing in...
                      </div>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In as Patient
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="therapist">
              <div className="space-y-4">
                <GoogleSignInButton
                  onClick={handleGoogleSignIn}
                  userType="Therapist"
                />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="therapist-email">Email</Label>
                    <Input
                      id="therapist-email"
                      type="email"
                      placeholder="therapist@example.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="therapist-password">Password</Label>
                    <Input
                      id="therapist-password"
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Signing in...
                      </div>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In as Therapist
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/echanneling/register"
                className="text-primary hover:underline font-medium"
              >
                Register here
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Button variant="link" className="text-sm text-muted-foreground">
              Forgot password?
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EChannelingLogin;
