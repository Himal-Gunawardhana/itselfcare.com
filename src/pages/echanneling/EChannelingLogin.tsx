import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { UserCircle, Stethoscope } from "lucide-react";

const EChannelingLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const redirect = searchParams.get("redirect") || "/echanneling/dashboard";

  const [patientEmail, setPatientEmail] = useState("");
  const [patientPassword, setPatientPassword] = useState("");
  const [therapistEmail, setTherapistEmail] = useState("");
  const [therapistPassword, setTherapistPassword] = useState("");

  const handlePatientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement AWS Cognito authentication
    toast({
      title: "Login Successful",
      description: "Welcome back!",
    });
    navigate(redirect);
  };

  const handleTherapistLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement AWS Cognito authentication for therapists
    toast({
      title: "Login Successful",
      description: "Welcome back to your therapist dashboard!",
    });
    navigate("/echanneling/therapist/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 lg:px-6 py-24 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              E-Channeling Login
            </h1>
            <p className="text-lg text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <Tabs defaultValue="patient" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="patient" className="flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                Patient
              </TabsTrigger>
              <TabsTrigger value="therapist" className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Therapist
              </TabsTrigger>
            </TabsList>

            {/* Patient Login */}
            <TabsContent value="patient">
              <Card>
                <form onSubmit={handlePatientLogin}>
                  <CardHeader>
                    <CardTitle>Patient Login</CardTitle>
                    <CardDescription>
                      Enter your credentials to access your patient account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="patient-email">Email</Label>
                      <Input
                        id="patient-email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patient-password">Password</Label>
                      <Input
                        id="patient-password"
                        type="password"
                        value={patientPassword}
                        onChange={(e) => setPatientPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <a href="#" className="text-primary hover:underline">
                        Forgot password?
                      </a>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full bg-gradient-primary">
                      Login as Patient
                    </Button>
                    <p className="text-sm text-muted-foreground text-center">
                      Don't have an account?{" "}
                      <Button
                        variant="link"
                        className="p-0"
                        onClick={() => navigate("/echanneling/register?type=patient")}
                      >
                        Register here
                      </Button>
                    </p>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            {/* Therapist Login */}
            <TabsContent value="therapist">
              <Card>
                <form onSubmit={handleTherapistLogin}>
                  <CardHeader>
                    <CardTitle>Therapist Login</CardTitle>
                    <CardDescription>
                      Enter your credentials to access your therapist dashboard
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="therapist-email">Email</Label>
                      <Input
                        id="therapist-email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={therapistEmail}
                        onChange={(e) => setTherapistEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="therapist-password">Password</Label>
                      <Input
                        id="therapist-password"
                        type="password"
                        value={therapistPassword}
                        onChange={(e) => setTherapistPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <a href="#" className="text-primary hover:underline">
                        Forgot password?
                      </a>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full bg-gradient-primary">
                      Login as Therapist
                    </Button>
                    <p className="text-sm text-muted-foreground text-center">
                      Don't have an account?{" "}
                      <Button
                        variant="link"
                        className="p-0"
                        onClick={() => navigate("/echanneling/register?type=therapist")}
                      >
                        Register here
                      </Button>
                    </p>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EChannelingLogin;
