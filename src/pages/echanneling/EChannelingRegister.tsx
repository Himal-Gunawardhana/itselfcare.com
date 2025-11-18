import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { UserCircle, Stethoscope } from "lucide-react";

const EChannelingRegister = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const defaultType = searchParams.get("type") || "patient";

  // Patient fields
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPassword, setPatientPassword] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientAddress, setPatientAddress] = useState("");

  // Therapist fields
  const [therapistName, setTherapistName] = useState("");
  const [therapistEmail, setTherapistEmail] = useState("");
  const [therapistPassword, setTherapistPassword] = useState("");
  const [therapistPhone, setTherapistPhone] = useState("");
  const [therapistLicense, setTherapistLicense] = useState("");
  const [therapistSpecialization, setTherapistSpecialization] = useState("");
  const [therapistExperience, setTherapistExperience] = useState("");
  const [therapistClinicAddress, setTherapistClinicAddress] = useState("");
  const [therapistBio, setTherapistBio] = useState("");

  const handlePatientRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement AWS Cognito registration
    toast({
      title: "Registration Successful",
      description: "Please check your email to verify your account",
    });
    navigate("/echanneling/login");
  };

  const handleTherapistRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement AWS Cognito registration for therapists
    toast({
      title: "Registration Submitted",
      description: "Your application will be reviewed within 24-48 hours",
    });
    navigate("/echanneling/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 lg:px-6 py-24">
        <div className="w-full max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Create Account
            </h1>
            <p className="text-lg text-muted-foreground">
              Join our e-channeling platform
            </p>
          </div>

          <Tabs defaultValue={defaultType} className="w-full">
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

            {/* Patient Registration */}
            <TabsContent value="patient">
              <Card>
                <form onSubmit={handlePatientRegister}>
                  <CardHeader>
                    <CardTitle>Patient Registration</CardTitle>
                    <CardDescription>
                      Create your patient account to book appointments
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="patient-name">Full Name *</Label>
                      <Input
                        id="patient-name"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patient-email">Email *</Label>
                      <Input
                        id="patient-email"
                        type="email"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patient-password">Password *</Label>
                      <Input
                        id="patient-password"
                        type="password"
                        value={patientPassword}
                        onChange={(e) => setPatientPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patient-phone">Phone Number *</Label>
                      <Input
                        id="patient-phone"
                        type="tel"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patient-address">Address</Label>
                      <Textarea
                        id="patient-address"
                        value={patientAddress}
                        onChange={(e) => setPatientAddress(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full bg-gradient-primary">
                      Register as Patient
                    </Button>
                    <p className="text-sm text-muted-foreground text-center">
                      Already have an account?{" "}
                      <Button
                        variant="link"
                        className="p-0"
                        onClick={() => navigate("/echanneling/login")}
                      >
                        Login here
                      </Button>
                    </p>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            {/* Therapist Registration */}
            <TabsContent value="therapist">
              <Card>
                <form onSubmit={handleTherapistRegister}>
                  <CardHeader>
                    <CardTitle>Therapist Registration</CardTitle>
                    <CardDescription>
                      Apply to join our platform as a verified therapist
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="therapist-name">Full Name *</Label>
                      <Input
                        id="therapist-name"
                        value={therapistName}
                        onChange={(e) => setTherapistName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="therapist-email">Email *</Label>
                      <Input
                        id="therapist-email"
                        type="email"
                        value={therapistEmail}
                        onChange={(e) => setTherapistEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="therapist-password">Password *</Label>
                      <Input
                        id="therapist-password"
                        type="password"
                        value={therapistPassword}
                        onChange={(e) => setTherapistPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="therapist-phone">Phone Number *</Label>
                      <Input
                        id="therapist-phone"
                        type="tel"
                        value={therapistPhone}
                        onChange={(e) => setTherapistPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="therapist-license">License Number *</Label>
                      <Input
                        id="therapist-license"
                        value={therapistLicense}
                        onChange={(e) => setTherapistLicense(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="therapist-specialization">Specialization *</Label>
                      <Input
                        id="therapist-specialization"
                        placeholder="e.g., Sports Injury, Post-Surgery Rehabilitation"
                        value={therapistSpecialization}
                        onChange={(e) => setTherapistSpecialization(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="therapist-experience">Years of Experience *</Label>
                      <Input
                        id="therapist-experience"
                        type="number"
                        value={therapistExperience}
                        onChange={(e) => setTherapistExperience(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="therapist-clinic">Clinic Address *</Label>
                      <Textarea
                        id="therapist-clinic"
                        value={therapistClinicAddress}
                        onChange={(e) => setTherapistClinicAddress(e.target.value)}
                        rows={2}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="therapist-bio">Professional Bio</Label>
                      <Textarea
                        id="therapist-bio"
                        value={therapistBio}
                        onChange={(e) => setTherapistBio(e.target.value)}
                        rows={4}
                        placeholder="Tell patients about your experience and approach..."
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full bg-gradient-primary">
                      Submit Application
                    </Button>
                    <p className="text-sm text-muted-foreground text-center">
                      Already have an account?{" "}
                      <Button
                        variant="link"
                        className="p-0"
                        onClick={() => navigate("/echanneling/login")}
                      >
                        Login here
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

export default EChannelingRegister;
