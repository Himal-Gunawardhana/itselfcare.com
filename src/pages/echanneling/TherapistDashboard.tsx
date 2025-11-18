import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { User, MapPin, Clock, DollarSign, Calendar, Video, Save } from "lucide-react";

const TherapistDashboard = () => {
  const { toast } = useToast();

  // Profile state
  const [name, setName] = useState("Dr. Sarah Johnson");
  const [email, setEmail] = useState("sarah.johnson@example.com");
  const [phone, setPhone] = useState("+94 77 123 4567");
  const [specialization, setSpecialization] = useState("Sports Injury & Rehabilitation");
  const [experience, setExperience] = useState("8");
  const [license, setLicense] = useState("SLMC-12345");
  const [clinicAddress, setClinicAddress] = useState("123 Galle Road, Colombo 03");
  const [bio, setBio] = useState("Specialized in sports injury rehabilitation with 8 years of experience...");
  
  // Availability settings
  const [sessionPrice, setSessionPrice] = useState("5000");
  const [onlineConsultation, setOnlineConsultation] = useState(true);
  const [inPersonConsultation, setInPersonConsultation] = useState(true);
  const [mondayAvailable, setMondayAvailable] = useState(true);
  const [mondayStart, setMondayStart] = useState("09:00");
  const [mondayEnd, setMondayEnd] = useState("17:00");

  const handleSaveProfile = () => {
    // TODO: Implement AWS API call to update profile
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 lg:px-6 py-24">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Therapist Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your profile and availability
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">47</div>
              <p className="text-sm text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">12</div>
              <p className="text-sm text-muted-foreground">Next 7 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Average Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">4.9 ★</div>
              <p className="text-sm text-muted-foreground">127 reviews</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your professional details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license">License Number</Label>
                <Input
                  id="license"
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinic-address">Clinic Address</Label>
                <Textarea
                  id="clinic-address"
                  value={clinicAddress}
                  onChange={(e) => setClinicAddress(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Availability & Pricing */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing & Services
                </CardTitle>
                <CardDescription>
                  Set your consultation fees and services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="session-price">Session Price (LKR)</Label>
                  <Input
                    id="session-price"
                    type="number"
                    value={sessionPrice}
                    onChange={(e) => setSessionPrice(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Online Consultation
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Offer video consultations
                    </p>
                  </div>
                  <Switch
                    checked={onlineConsultation}
                    onCheckedChange={setOnlineConsultation}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      In-Person Consultation
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Accept clinic visits
                    </p>
                  </div>
                  <Switch
                    checked={inPersonConsultation}
                    onCheckedChange={setInPersonConsultation}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Weekly Availability
                </CardTitle>
                <CardDescription>
                  Set your working hours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Monday</Label>
                    <Switch
                      checked={mondayAvailable}
                      onCheckedChange={setMondayAvailable}
                    />
                  </div>
                  {mondayAvailable && (
                    <div className="grid grid-cols-2 gap-3 pl-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Start Time</Label>
                        <Input
                          type="time"
                          value={mondayStart}
                          onChange={(e) => setMondayStart(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">End Time</Label>
                        <Input
                          type="time"
                          value={mondayEnd}
                          onChange={(e) => setMondayEnd(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Configure remaining days similarly...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button 
            size="lg" 
            className="bg-gradient-primary"
            onClick={handleSaveProfile}
          >
            <Save className="mr-2 h-5 w-5" />
            Save All Changes
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TherapistDashboard;
