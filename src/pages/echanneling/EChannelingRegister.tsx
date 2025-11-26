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
import { Textarea } from "@/components/ui/textarea";
import { User, Stethoscope, UserPlus } from "lucide-react";
import { patientAPI, therapistAPI } from "@/services/api";

const EChannelingRegister = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<"patient" | "therapist">("patient");
  const [loading, setLoading] = useState(false);

  const [patientForm, setPatientForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    dateOfBirth: "",
  });

  const [therapistForm, setTherapistForm] = useState({
    name: "",
    email: "",
    password: "",
    specialties: "",
    languages: "",
    hourlyRate: "",
    bio: "",
    latitude: "",
    longitude: "",
  });

  const handlePatientRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement Cognito sign-up
      // Mock user ID for now
      const mockUserId = "cognito_patient_" + Date.now();

      // Create patient profile in backend
      const result = await patientAPI.register({
        userId: mockUserId,
        name: patientForm.name,
        email: patientForm.email,
        phone: patientForm.phone,
        dateOfBirth: patientForm.dateOfBirth,
      });

      alert(`Registration successful! Patient ID: ${result.patientId}`);

      // Mock login with proper format
      localStorage.setItem("auth_token", `mock_patient_${Date.now()}`);
      localStorage.setItem("user_type", "patient");
      localStorage.setItem("patient_id", result.patientId);
      localStorage.setItem("user_name", patientForm.name);

      navigate("/echanneling/patient/dashboard");
    } catch (error) {
      alert("Registration failed. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTherapistRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement Cognito sign-up
      const mockUserId = "cognito_therapist_" + Date.now();

      // Parse specialties and languages
      const specialties = therapistForm.specialties
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const languages = therapistForm.languages
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean);

      // Get geolocation if provided, otherwise use default
      const lat = parseFloat(therapistForm.latitude) || 6.927079;
      const lng = parseFloat(therapistForm.longitude) || 79.861244;

      const payload = {
        userId: mockUserId,
        name: therapistForm.name,
        email: therapistForm.email,
        specialties: specialties,
        languages: languages,
        geoLat: lat,
        geoLng: lng,
        hourlyRate: parseFloat(therapistForm.hourlyRate) || 0,
        bio: therapistForm.bio,
      };

      console.log("Registering therapist with payload:", payload);

      // Create therapist profile in backend
      const result = await therapistAPI.register(payload);

      console.log("Registration successful:", result);
      alert(`Registration successful! Therapist ID: ${result.theraphistId}`);

      // Mock login with proper format
      localStorage.setItem("auth_token", `mock_therapist_${Date.now()}`);
      localStorage.setItem("user_type", "therapist");
      localStorage.setItem("therapist_id", result.theraphistId);
      localStorage.setItem("user_name", therapistForm.name);
      navigate("/echanneling/therapist/dashboard");
    } catch (error) {
      console.error("Registration error details:", error);
      const errorMessage = error instanceof Error ? error.message : "Registration failed. Please try again.";
      alert(`Registration failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4 py-16">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Join ItselfCare as a patient or therapist
          </CardDescription>
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
              <form onSubmit={handlePatientRegister} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patient-name">Full Name *</Label>
                    <Input
                      id="patient-name"
                      placeholder="John Doe"
                      value={patientForm.name}
                      onChange={(e) =>
                        setPatientForm({ ...patientForm, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="patient-email">Email *</Label>
                    <Input
                      id="patient-email"
                      type="email"
                      placeholder="john@example.com"
                      value={patientForm.email}
                      onChange={(e) =>
                        setPatientForm({
                          ...patientForm,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patient-password">Password *</Label>
                    <Input
                      id="patient-password"
                      type="password"
                      value={patientForm.password}
                      onChange={(e) =>
                        setPatientForm({
                          ...patientForm,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="patient-phone">Phone</Label>
                    <Input
                      id="patient-phone"
                      type="tel"
                      placeholder="+94 77 123 4567"
                      value={patientForm.phone}
                      onChange={(e) =>
                        setPatientForm({
                          ...patientForm,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="patient-dob">Date of Birth</Label>
                  <Input
                    id="patient-dob"
                    type="date"
                    value={patientForm.dateOfBirth}
                    onChange={(e) =>
                      setPatientForm({
                        ...patientForm,
                        dateOfBirth: e.target.value,
                      })
                    }
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating account...
                    </div>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Register as Patient
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="therapist">
              <form onSubmit={handleTherapistRegister} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="therapist-name">Full Name *</Label>
                    <Input
                      id="therapist-name"
                      placeholder="Dr. Jane Smith"
                      value={therapistForm.name}
                      onChange={(e) =>
                        setTherapistForm({
                          ...therapistForm,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="therapist-email">Email *</Label>
                    <Input
                      id="therapist-email"
                      type="email"
                      placeholder="jane@example.com"
                      value={therapistForm.email}
                      onChange={(e) =>
                        setTherapistForm({
                          ...therapistForm,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="therapist-password">Password *</Label>
                    <Input
                      id="therapist-password"
                      type="password"
                      value={therapistForm.password}
                      onChange={(e) =>
                        setTherapistForm({
                          ...therapistForm,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="therapist-rate">Hourly Rate (USD) *</Label>
                    <Input
                      id="therapist-rate"
                      type="number"
                      placeholder="50"
                      value={therapistForm.hourlyRate}
                      onChange={(e) =>
                        setTherapistForm({
                          ...therapistForm,
                          hourlyRate: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="therapist-specialties">
                      Specialties * (comma-separated)
                    </Label>
                    <Input
                      id="therapist-specialties"
                      placeholder="Sports Injury, Rehabilitation"
                      value={therapistForm.specialties}
                      onChange={(e) =>
                        setTherapistForm({
                          ...therapistForm,
                          specialties: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="therapist-languages">
                      Languages (comma-separated)
                    </Label>
                    <Input
                      id="therapist-languages"
                      placeholder="English, Sinhala"
                      value={therapistForm.languages}
                      onChange={(e) =>
                        setTherapistForm({
                          ...therapistForm,
                          languages: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="therapist-bio">Bio</Label>
                  <Textarea
                    id="therapist-bio"
                    placeholder="Tell patients about your experience..."
                    rows={3}
                    value={therapistForm.bio}
                    onChange={(e) =>
                      setTherapistForm({
                        ...therapistForm,
                        bio: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="therapist-lat">Latitude (Optional)</Label>
                    <Input
                      id="therapist-lat"
                      type="number"
                      step="any"
                      placeholder="6.927079"
                      value={therapistForm.latitude}
                      onChange={(e) =>
                        setTherapistForm({
                          ...therapistForm,
                          latitude: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="therapist-lng">Longitude (Optional)</Label>
                    <Input
                      id="therapist-lng"
                      type="number"
                      step="any"
                      placeholder="79.861244"
                      value={therapistForm.longitude}
                      onChange={(e) =>
                        setTherapistForm({
                          ...therapistForm,
                          longitude: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating account...
                    </div>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Register as Therapist
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/echanneling/login"
                className="text-primary hover:underline font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EChannelingRegister;
