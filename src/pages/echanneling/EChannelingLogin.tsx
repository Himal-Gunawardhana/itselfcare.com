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
      const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      
      // TODO: Implement Cognito authentication here
      // For now, mock login and search for user by email
      const mockToken = `mock_${userType}_${Date.now()}`;

      console.log(`Logging in as ${userType} with email:`, form.email);

      // Search for therapist/patient by email in the database
      let userId = null;
      let userName = form.email.split("@")[0];

      if (userType === "therapist") {
        // Get all therapists and find by email
        const response = await fetch(`${apiUrl}/therapists/top/rated?limit=100`);
        if (response.ok) {
          const therapists: Array<{ theraphistId: string; email: string; name: string }> = await response.json();
          const therapist = therapists.find((t) => t.email === form.email);
          if (therapist) {
            userId = therapist.theraphistId;
            userName = therapist.name;
            console.log("Found therapist:", therapist);
          } else {
            alert("Therapist account not found. Please register first.");
            setLoading(false);
            return;
          }
        }
      } else {
        // For patient, we'd need a similar endpoint to search by email
        // For now, show message to register
        alert("Patient login: Please use the email you registered with. If you haven't registered, please register first.");
        // We'll need to implement a patient search endpoint
      }

      if (userType === "therapist" && !userId) {
        alert("Therapist account not found with this email. Please register first.");
        setLoading(false);
        return;
      }

      localStorage.setItem("auth_token", mockToken);
      localStorage.setItem("user_type", userType);
      localStorage.setItem("user_name", userName);
      localStorage.setItem("user_email", form.email);

      if (userType === "therapist" && userId) {
        localStorage.setItem("therapist_id", userId);
      }

      alert(`Login successful as ${userType}!`);
      
      if (userType === "patient") {
        navigate("/echanneling/patient/dashboard");
      } else {
        navigate("/echanneling/therapist/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please check your credentials and try again.");
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
