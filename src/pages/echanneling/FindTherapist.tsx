import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  therapistAPI,
  appointmentAPI,
  referralAPI,
  type Therapist,
} from "@/services/api";
import {
  MapPin,
  Star,
  Video,
  Home,
  Building2,
  Search,
  Calendar,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const FindTherapist = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [useGeolocation, setUseGeolocation] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(
    null
  );
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    minRating: 0,
    language: "all",
    specialty: "all",
    maxDistance: 100, // km
    sortBy: "rating" as "rating" | "price" | "distance" | "reviews",
  });

  const [locationFilter, setLocationFilter] = useState({
    enabled: false,
    lat: 6.9271,
    lng: 79.8612,
    radius: 50,
  });

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    date: "",
    time: "",
    type: "video" as "video" | "home" | "clinic",
    notes: "",
    referralCode: "",
  });

  // Referral validation state
  const [referralValidation, setReferralValidation] = useState<{
    isValid: boolean;
    isValidating: boolean;
    discountPercentage: number;
    referrerName: string;
    error: string;
  }>({
    isValid: false,
    isValidating: false,
    discountPercentage: 0,
    referrerName: "",
    error: "",
  });

  useEffect(() => {
    // Check if therapist ID is in URL
    const therapistId = searchParams.get("id");
    if (therapistId) {
      loadTherapist(therapistId);
    } else {
      loadAllTherapists();
    }
  }, [searchParams]);

  const loadTherapist = async (id: string) => {
    try {
      const therapist = await therapistAPI.getById(id);
      setTherapists([therapist]);
      setSelectedTherapist(therapist);
      setBookingDialogOpen(true);
    } catch (error) {
      console.error("Failed to load therapist:", error);
      loadAllTherapists();
    } finally {
      setLoading(false);
    }
  };

  const loadAllTherapists = async () => {
    try {
      const data = await therapistAPI.getTopRated(20);
      setTherapists(data);
    } catch (error) {
      console.error("Failed to load therapists:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchNearby = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const data = await therapistAPI.searchNearby({
            lat: latitude,
            lng: longitude,
            radius: filters.maxDistance,
          });
          setTherapists(data);
          setLocationFilter({
            enabled: true,
            lat: latitude,
            lng: longitude,
            radius: filters.maxDistance,
          });
        } catch (error) {
          console.error("Failed to search nearby:", error);
          alert("Failed to search nearby. Please try again.");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to get your location. Please enable location services.");
        setLoading(false);
      }
    );
  };

  const handleBookAppointment = (therapist: Therapist) => {
    // Check if user is logged in
    const token = localStorage.getItem("auth_token");
    if (!token) {
      alert("Please login to book an appointment");
      navigate("/echanneling/login");
      return;
    }

    setSelectedTherapist(therapist);
    setBookingDialogOpen(true);
    // Reset referral validation when opening dialog
    setReferralValidation({
      isValid: false,
      isValidating: false,
      discountPercentage: 0,
      referrerName: "",
      error: "",
    });
  };

  const validateReferralCode = async () => {
    const patientId = localStorage.getItem("patient_id");
    if (!patientId || !bookingForm.referralCode.trim()) return;

    setReferralValidation((prev) => ({
      ...prev,
      isValidating: true,
      error: "",
    }));

    try {
      const validation = await referralAPI.validate(
        bookingForm.referralCode.trim(),
        patientId
      );

      if (validation.valid) {
        setReferralValidation({
          isValid: true,
          isValidating: false,
          discountPercentage: validation.discountPercentage,
          referrerName: validation.referrerName,
          error: "",
        });
      } else {
        setReferralValidation({
          isValid: false,
          isValidating: false,
          discountPercentage: 0,
          referrerName: "",
          error: "Invalid referral code",
        });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to validate referral code";
      setReferralValidation({
        isValid: false,
        isValidating: false,
        discountPercentage: 0,
        referrerName: "",
        error: errorMessage,
      });
    }
  };

  const submitBooking = async () => {
    if (!selectedTherapist) return;

    const token = localStorage.getItem("auth_token");
    const patientId = localStorage.getItem("patient_id");

    if (!token) {
      alert("Please login to book an appointment");
      navigate("/echanneling/login");
      return;
    }

    if (!patientId) {
      alert(
        "Patient ID not found. Please register a new account at /echanneling/register to create your patient profile."
      );
      navigate("/echanneling/register");
      return;
    }

    if (!bookingForm.date || !bookingForm.time) {
      alert("Please select date and time");
      return;
    }

    try {
      const startDateTime = new Date(`${bookingForm.date}T${bookingForm.time}`);
      const endDateTime = new Date(startDateTime.getTime() + 45 * 60000); // 45 min session

      const appointmentCost = selectedTherapist.hourlyRate || 100;

      const booking = await appointmentAPI.create({
        therapistId: selectedTherapist.theraphistId,
        patientId: patientId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        type: bookingForm.type,
        notes: bookingForm.notes,
        referralCode: referralValidation.isValid
          ? bookingForm.referralCode.trim()
          : undefined,
        appointmentCost: appointmentCost,
      });

      alert(`Appointment booked successfully! ID: ${booking.appointmentId}`);
      setBookingDialogOpen(false);
      navigate("/echanneling/patient/dashboard");
    } catch (error: any) {
      const errorMsg = error.message || "Unknown error";
      if (errorMsg.includes("Patient not found")) {
        alert(
          "Your patient profile was not found in the system. Please register at /echanneling/register to create a valid patient account."
        );
        navigate("/echanneling/register");
      } else {
        alert(`Booking failed: ${errorMsg}`);
      }
    }
  };

  // Get unique languages and specialties for filter dropdowns
  const availableLanguages = Array.from(
    new Set(therapists.flatMap((t) => t.languages || []))
  ).sort();

  const availableSpecialties = Array.from(
    new Set(therapists.flatMap((t) => t.specialties || []))
  ).sort();

  // Apply all filters
  const filteredTherapists = therapists
    .filter((t) => {
      // Search query filter
      const matchesSearch =
        !searchQuery ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.specialties.some((s) =>
          s.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        t.bio?.toLowerCase().includes(searchQuery.toLowerCase());

      // Rating filter
      const matchesRating = (t.averageRating || 0) >= filters.minRating;

      // Language filter
      const matchesLanguage =
        filters.language === "all" ||
        t.languages?.some(
          (lang) => lang.toLowerCase() === filters.language.toLowerCase()
        );

      // Specialty filter
      const matchesSpecialty =
        filters.specialty === "all" ||
        t.specialties?.some(
          (spec) => spec.toLowerCase() === filters.specialty.toLowerCase()
        );

      // Distance filter (if location-based search)
      const matchesDistance =
        !locationFilter.enabled ||
        !t.distance ||
        t.distance <= filters.maxDistance;

      return (
        matchesSearch &&
        matchesRating &&
        matchesLanguage &&
        matchesSpecialty &&
        matchesDistance
      );
    })
    .sort((a, b) => {
      // Sort based on selected criteria
      switch (filters.sortBy) {
        case "rating":
          return (b.averageRating || 0) - (a.averageRating || 0);
        case "price":
          return a.hourlyRate - b.hourlyRate;
        case "distance":
          return (a.distance || 999) - (b.distance || 999);
        case "reviews":
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gradient-subtle pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Find Your Therapist</h1>
          <p className="text-muted-foreground">
            Search for qualified physiotherapists near you
          </p>
        </div>

        {/* Search & Filter Section */}
        <Card className="mb-8">
          <CardContent className="p-6 space-y-6">
            {/* Search Bar */}
            <div>
              <Label htmlFor="search">Search Therapists</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="search"
                  placeholder="Search by name, specialty, or bio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filters Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Rating Filter */}
              <div>
                <Label htmlFor="rating">Minimum Rating</Label>
                <Select
                  value={filters.minRating.toString()}
                  onValueChange={(val) =>
                    setFilters({ ...filters, minRating: parseFloat(val) })
                  }
                >
                  <SelectTrigger id="rating">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">All Ratings</SelectItem>
                    <SelectItem value="3">⭐ 3.0+</SelectItem>
                    <SelectItem value="3.5">⭐ 3.5+</SelectItem>
                    <SelectItem value="4">⭐ 4.0+</SelectItem>
                    <SelectItem value="4.5">⭐ 4.5+</SelectItem>
                    <SelectItem value="5">⭐ 5.0</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Language Filter */}
              <div>
                <Label htmlFor="language">Language</Label>
                <Select
                  value={filters.language}
                  onValueChange={(val) =>
                    setFilters({ ...filters, language: val })
                  }
                >
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    {availableLanguages.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Specialty Filter */}
              <div>
                <Label htmlFor="specialty">Specialty</Label>
                <Select
                  value={filters.specialty}
                  onValueChange={(val) =>
                    setFilters({ ...filters, specialty: val })
                  }
                >
                  <SelectTrigger id="specialty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    {availableSpecialties.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div>
                <Label htmlFor="sortBy">Sort By</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(val: any) =>
                    setFilters({ ...filters, sortBy: val })
                  }
                >
                  <SelectTrigger id="sortBy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rating</SelectItem>
                    <SelectItem value="reviews">Most Reviews</SelectItem>
                    <SelectItem value="price">Lowest Price</SelectItem>
                    <SelectItem value="distance">Nearest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location Search */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <Label>Location-Based Search</Label>
                {locationFilter.enabled && (
                  <span className="text-sm text-muted-foreground">
                    Within {filters.maxDistance} km
                  </span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant={locationFilter.enabled ? "default" : "outline"}
                  className="flex-1"
                  onClick={searchNearby}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {locationFilter.enabled
                    ? "Update Location"
                    : "Use My Location"}
                </Button>
                {locationFilter.enabled && (
                  <div className="flex gap-2 flex-1">
                    <Select
                      value={filters.maxDistance.toString()}
                      onValueChange={(val) =>
                        setFilters({ ...filters, maxDistance: parseInt(val) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">Within 5 km</SelectItem>
                        <SelectItem value="10">Within 10 km</SelectItem>
                        <SelectItem value="25">Within 25 km</SelectItem>
                        <SelectItem value="50">Within 50 km</SelectItem>
                        <SelectItem value="100">Within 100 km</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setLocationFilter({
                          ...locationFilter,
                          enabled: false,
                        });
                        loadAllTherapists();
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Active Filters Display */}
            {(filters.minRating > 0 ||
              filters.language !== "all" ||
              filters.specialty !== "all" ||
              locationFilter.enabled) && (
              <div className="flex flex-wrap gap-2 border-t pt-4">
                <span className="text-sm text-muted-foreground">
                  Active filters:
                </span>
                {filters.minRating > 0 && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    ⭐ {filters.minRating}+
                  </span>
                )}
                {filters.language !== "all" && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {filters.language}
                  </span>
                )}
                {filters.specialty !== "all" && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {filters.specialty}
                  </span>
                )}
                {locationFilter.enabled && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    📍 Near me
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-6"
                  onClick={() => {
                    setFilters({
                      minRating: 0,
                      language: "all",
                      specialty: "all",
                      maxDistance: 100,
                      sortBy: "rating",
                    });
                    setLocationFilter({ ...locationFilter, enabled: false });
                    loadAllTherapists();
                  }}
                >
                  Clear All
                </Button>
              </div>
            )}

            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
              Showing {filteredTherapists.length} of {therapists.length}{" "}
              therapists
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading therapists...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTherapists.map((therapist) => (
              <Card
                key={therapist.theraphistId}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-xl">
                        {therapist.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {therapist.averageRating?.toFixed(1) || "0.0"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({therapist.reviewCount || 0} reviews)
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        ${therapist.hourlyRate}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        per session
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex flex-wrap gap-1">
                      {therapist.specialties.map((specialty, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>

                    {therapist.languages && therapist.languages.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Languages: {therapist.languages.join(", ")}
                      </p>
                    )}

                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {therapist.bio || "Experienced physiotherapist"}
                    </p>

                    {therapist.distance && (
                      <div className="flex items-center text-sm text-primary">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{therapist.distance.toFixed(1)} km away</span>
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => handleBookAppointment(therapist)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredTherapists.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No therapists found. Try adjusting your search.
            </p>
          </div>
        )}
      </div>

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Book Appointment</DialogTitle>
            <DialogDescription>
              {selectedTherapist && (
                <>Schedule a session with {selectedTherapist.name}</>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={bookingForm.date}
                onChange={(e) =>
                  setBookingForm({ ...bookingForm, date: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={bookingForm.time}
                onChange={(e) =>
                  setBookingForm({ ...bookingForm, time: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="type">Session Type</Label>
              <Select
                value={bookingForm.type}
                onValueChange={(value: "video" | "home" | "clinic") =>
                  setBookingForm({ ...bookingForm, type: value })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">
                    <div className="flex items-center">
                      <Video className="h-4 w-4 mr-2" />
                      Video Consultation
                    </div>
                  </SelectItem>
                  <SelectItem value="home">
                    <div className="flex items-center">
                      <Home className="h-4 w-4 mr-2" />
                      Home Visit
                    </div>
                  </SelectItem>
                  <SelectItem value="clinic">
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-2" />
                      Clinic Visit
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any specific concerns or requirements..."
                value={bookingForm.notes}
                onChange={(e) =>
                  setBookingForm({ ...bookingForm, notes: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="referralCode">Referral Code (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="referralCode"
                  placeholder="Enter referral code"
                  value={bookingForm.referralCode}
                  onChange={(e) => {
                    setBookingForm({
                      ...bookingForm,
                      referralCode: e.target.value,
                    });
                    // Reset validation when code changes
                    if (
                      referralValidation.isValid ||
                      referralValidation.error
                    ) {
                      setReferralValidation({
                        isValid: false,
                        isValidating: false,
                        discountPercentage: 0,
                        referrerName: "",
                        error: "",
                      });
                    }
                  }}
                  className={
                    referralValidation.isValid
                      ? "border-green-500"
                      : referralValidation.error
                      ? "border-red-500"
                      : ""
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={validateReferralCode}
                  disabled={
                    !bookingForm.referralCode.trim() ||
                    referralValidation.isValidating
                  }
                >
                  {referralValidation.isValidating ? "Checking..." : "Apply"}
                </Button>
              </div>
              {referralValidation.isValid && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ Valid code from {referralValidation.referrerName} -{" "}
                  {referralValidation.discountPercentage}% discount applied!
                </p>
              )}
              {referralValidation.error && (
                <p className="text-sm text-red-600 mt-1">
                  {referralValidation.error}
                </p>
              )}
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span>Session Fee:</span>
                <span className="font-semibold">
                  ${selectedTherapist?.hourlyRate || 0}
                </span>
              </div>
              {referralValidation.isValid &&
                referralValidation.discountPercentage > 0 && (
                  <>
                    <div className="flex justify-between text-sm mb-2 text-green-600">
                      <span>
                        Discount ({referralValidation.discountPercentage}%):
                      </span>
                      <span className="font-semibold">
                        -$
                        {(
                          ((selectedTherapist?.hourlyRate || 0) *
                            referralValidation.discountPercentage) /
                          100
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-2 font-bold border-t pt-2">
                      <span>Final Cost:</span>
                      <span className="text-green-600">
                        $
                        {(
                          (selectedTherapist?.hourlyRate || 0) *
                          (1 - referralValidation.discountPercentage / 100)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Duration:</span>
                <span>45 minutes</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setBookingDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={submitBooking} className="flex-1">
              Confirm Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FindTherapist;
