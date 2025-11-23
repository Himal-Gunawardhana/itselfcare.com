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

interface TherapistData {
  theraphistId: string;
  name: string;
  email: string;
  bio?: string;
  specialties?: string[];
  languages?: string[];
  hourlyRate?: number;
  geoLat?: number;
  geoLng?: number;
  location?: string;
}

export default function TherapistProfile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [therapistData, setTherapistData] = useState<TherapistData>({
    theraphistId: "",
    name: "",
    email: "",
    bio: "",
    specialties: [],
    languages: [],
    hourlyRate: 0,
    geoLat: 0,
    geoLng: 0,
    location: "",
  });
  const [specialtiesInput, setSpecialtiesInput] = useState("");
  const [languagesInput, setLanguagesInput] = useState("");

  useEffect(() => {
    const fetchTherapistData = async (therapistId: string) => {
      try {
        const apiUrl =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
        const authToken = localStorage.getItem("auth_token");

        const response = await fetch(`${apiUrl}/therapists/${therapistId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch therapist data");
        }

        const data: TherapistData = await response.json();
        setTherapistData({
          theraphistId: data.theraphistId,
          name: data.name || "",
          email: data.email || "",
          bio: data.bio || "",
          specialties: data.specialties || [],
          languages: data.languages || [],
          hourlyRate: data.hourlyRate || 0,
          geoLat: data.geoLat || 0,
          geoLng: data.geoLng || 0,
          location: data.location || "",
        });

        // Set input strings from arrays
        setSpecialtiesInput(data.specialties?.join(", ") || "");
        setLanguagesInput(data.languages?.join(", ") || "");
      } catch (error) {
        console.error("Error fetching therapist data:", error);
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
    const therapistId = localStorage.getItem("therapist_id");

    if (!authToken || userType !== "therapist") {
      navigate("/echanneling/login");
      return;
    }

    // Fetch therapist data
    fetchTherapistData(therapistId!);
  }, [navigate, toast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const apiUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      const authToken = localStorage.getItem("auth_token");

      // Convert comma-separated strings to arrays
      const specialties = specialtiesInput
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const languages = languagesInput
        .split(",")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      const response = await fetch(
        `${apiUrl}/therapists/${therapistData.theraphistId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: therapistData.name,
            bio: therapistData.bio,
            specialties: specialties,
            languages: languages,
            hourlyRate: therapistData.hourlyRate,
            geoLat: therapistData.geoLat,
            geoLng: therapistData.geoLng,
            location: therapistData.location,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Update localStorage with new name
      localStorage.setItem("user_name", therapistData.name);

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      // Navigate back to dashboard
      navigate("/echanneling/therapist/dashboard");
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

  const handleChange = (field: keyof TherapistData, value: string | number) => {
    setTherapistData((prev) => ({
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
            onClick={() => navigate("/echanneling/therapist/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold mb-2">Edit Profile</h1>
          <p className="text-muted-foreground">
            Update your professional information
          </p>
        </div>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
            <CardDescription>
              Keep your profile up to date to attract more clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={therapistData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                    placeholder="Dr. John Doe"
                    maxLength={100}
                    minLength={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={therapistData.email}
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
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    value={therapistData.bio}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    placeholder="Tell clients about your experience and approach..."
                    rows={4}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {therapistData.bio?.length || 0}/1000
                  </p>
                </div>
              </div>

              {/* Specialties & Languages */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Expertise</h3>

                <div className="space-y-2">
                  <Label htmlFor="specialties">Specialties</Label>
                  <Input
                    id="specialties"
                    value={specialtiesInput}
                    onChange={(e) => setSpecialtiesInput(e.target.value)}
                    placeholder="Anxiety, Depression, PTSD (comma-separated)"
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter specialties separated by commas
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="languages">Languages</Label>
                  <Input
                    id="languages"
                    value={languagesInput}
                    onChange={(e) => setLanguagesInput(e.target.value)}
                    placeholder="English, Spanish, French (comma-separated)"
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter languages separated by commas
                  </p>
                </div>
              </div>

              {/* Pricing & Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pricing & Location</h3>

                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    min="0"
                    max="10000"
                    step="0.01"
                    value={therapistData.hourlyRate}
                    onChange={(e) =>
                      handleChange(
                        "hourlyRate",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="150.00"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum rate: $10,000/hour
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={therapistData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="City, State"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="geoLat">Latitude</Label>
                    <Input
                      id="geoLat"
                      type="number"
                      step="0.000001"
                      value={therapistData.geoLat}
                      onChange={(e) =>
                        handleChange("geoLat", parseFloat(e.target.value) || 0)
                      }
                      placeholder="40.7128"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="geoLng">Longitude</Label>
                    <Input
                      id="geoLng"
                      type="number"
                      step="0.000001"
                      value={therapistData.geoLng}
                      onChange={(e) =>
                        handleChange("geoLng", parseFloat(e.target.value) || 0)
                      }
                      placeholder="-74.0060"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={saving} className="flex-1">
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/echanneling/therapist/dashboard")}
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
