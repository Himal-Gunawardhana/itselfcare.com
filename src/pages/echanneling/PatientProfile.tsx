import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";

interface PatientData {
  patientId: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
}

export default function PatientProfile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [patientData, setPatientData] = useState<PatientData>({
    patientId: "",
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
  });

  useEffect(() => {
    const fetchPatientData = async (patientId: string) => {
      try {
        const apiUrl =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
        const authToken = localStorage.getItem("auth_token");

        const response = await fetch(`${apiUrl}/patients/${patientId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch patient data");
        }

        const data: PatientData = await response.json();
        setPatientData({
          patientId: data.patientId,
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split("T")[0] : "",
          address: data.address || "",
        });
      } catch (error) {
        console.error("Error fetching patient data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    // Check authentication
    const authToken = localStorage.getItem("auth_token");
    const userType = localStorage.getItem("user_type");
    const patientId = localStorage.getItem("patient_id");

    if (!authToken || userType !== "patient") {
      navigate("/echanneling/login");
      return;
    }

    // Fetch patient data
    fetchPatientData(patientId!);
  }, [navigate, toast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const apiUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      const authToken = localStorage.getItem("auth_token");

      const response = await fetch(
        `${apiUrl}/patients/${patientData.patientId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: patientData.name,
            phone: patientData.phone,
            dateOfBirth: patientData.dateOfBirth,
            address: patientData.address,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Update localStorage with new name
      localStorage.setItem("user_name", patientData.name);

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      // Navigate back to dashboard
      navigate("/echanneling/patient/dashboard");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof PatientData, value: string) => {
    setPatientData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/echanneling/patient/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold mb-2">Edit Profile</h1>
          <p className="text-muted-foreground">
            Update your personal information
          </p>
        </div>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Keep your profile up to date for better service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={patientData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                  placeholder="Enter your full name"
                  maxLength={100}
                  minLength={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={patientData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                  disabled
                  placeholder="your.email@example.com"
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed for security reasons
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={patientData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  maxLength={20}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={patientData.dateOfBirth}
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={patientData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Enter your address"
                  rows={3}
                  maxLength={500}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={saving} className="flex-1">
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/echanneling/patient/dashboard")}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
