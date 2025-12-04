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
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Google Sign-In Button Component
const GoogleSignInButton = ({
  userType,
  onClick,
}: {
  userType: "patient" | "therapist";
  onClick: () => void;
}) => {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className="w-full relative"
    >
      <svg
        className="absolute left-4 h-5 w-5"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      Sign in with Google
    </Button>
  );
};

const EChannelingLoginNew = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [userType, setUserType] = useState<"patient" | "therapist">("patient");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(userType, form.email, form.password);

      toast({
        title: "Success",
        description: "Logged in successfully!",
      });

      // Navigate to appropriate dashboard
      if (userType === "patient") {
        navigate("/echanneling/patient/dashboard");
      } else {
        navigate("/echanneling/therapist/dashboard");
      }
    } catch (error: unknown) {
      console.error("Login error:", error);

      let errorMessage = "Login failed. Please check your credentials.";

      if (error instanceof Error) {
        if (error.message.includes("UserNotConfirmedException")) {
          errorMessage =
            "Please verify your email first. Check your inbox for the verification code.";
          navigate(`/echanneling/confirm?email=${form.email}&type=${userType}`);
        } else if (error.message.includes("NotAuthorizedException")) {
          errorMessage = "Incorrect email or password.";
        } else if (error.message.includes("UserNotFoundException")) {
          errorMessage =
            "No account found with this email. Please register first.";
        } else {
          errorMessage = error.message;
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

  const handleGoogleSignIn = () => {
    // Construct the Cognito Hosted UI URL for Google Sign-In
    const domain =
      userType === "patient"
        ? import.meta.env.VITE_COGNITO_PATIENT_DOMAIN
        : import.meta.env.VITE_COGNITO_THERAPIST_DOMAIN;

    const clientId =
      userType === "patient"
        ? import.meta.env.VITE_COGNITO_PATIENT_CLIENT_ID
        : import.meta.env.VITE_COGNITO_THERAPIST_CLIENT_ID;

    const redirectUri = `${window.location.origin}/auth/callback`;

    const cognitoUrl =
      `https://${domain}/oauth2/authorize?` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `scope=email+openid+profile&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `identity_provider=Google&` +
      `state=${userType}`;

    window.location.href = cognitoUrl;
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
              {/* Google Sign-In Button */}
              <div className="space-y-4 mb-6">
                <GoogleSignInButton
                  userType="patient"
                  onClick={handleGoogleSignIn}
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
            </TabsContent>

            <TabsContent value="therapist">
              {/* Google Sign-In Button */}
              <div className="space-y-4 mb-6">
                <GoogleSignInButton
                  userType="therapist"
                  onClick={handleGoogleSignIn}
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
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm space-y-2">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/echanneling/register"
                className="text-primary hover:underline font-medium"
              >
                Register here
              </Link>
            </p>

            <Button
              variant="link"
              className="text-sm text-muted-foreground p-0 h-auto"
              onClick={() =>
                navigate(`/echanneling/forgot-password?type=${userType}`)
              }
            >
              Forgot password?
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EChannelingLoginNew;
