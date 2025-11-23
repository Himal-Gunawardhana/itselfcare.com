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

const EChannelingLogin = () => {
  const navigate = useNavigate();
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
      // TODO: Implement Cognito authentication here
      // For now, mock login with proper format for backend
      const mockToken = `mock_${userType}_${Date.now()}`;

      localStorage.setItem("auth_token", mockToken);
      localStorage.setItem("user_type", userType);
      localStorage.setItem("user_name", form.email.split("@")[0]); // Use email prefix as name for now
      localStorage.setItem("user_email", form.email);

      // ⚠️ IMPORTANT: For production, fetch actual patient_id/therapist_id from backend
      // For now, user must re-register to get a valid ID stored
      // Or check if they have one already from registration

      alert(
        `Login successful as ${userType}! Note: If you encounter "Patient not found" errors when booking, please register a new account.`
      );
      if (userType === "patient") {
        navigate("/echanneling/patient/dashboard");
      } else {
        navigate("/echanneling/therapist/dashboard");
      }
    } catch (error) {
      alert("Login failed. Please check your credentials.");
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
