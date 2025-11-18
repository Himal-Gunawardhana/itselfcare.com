import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapPin, Star, Video, Clock, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock data - will be replaced with AWS API calls
const mockTherapists = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialization: "Sports Injury & Rehabilitation",
    rating: 4.9,
    reviews: 127,
    distance: "1.2 km",
    location: "Colombo 03",
    experience: "8 years",
    availability: "Available Today",
    price: "LKR 5,000",
    online: true,
    inPerson: true,
    image: "/placeholder.svg"
  },
  {
    id: "2",
    name: "Dr. Michael Fernando",
    specialization: "Post-Surgery Rehabilitation",
    rating: 4.8,
    reviews: 98,
    distance: "2.5 km",
    location: "Colombo 05",
    experience: "12 years",
    availability: "Available Tomorrow",
    price: "LKR 6,000",
    online: true,
    inPerson: true,
    image: "/placeholder.svg"
  },
  {
    id: "3",
    name: "Dr. Priya Perera",
    specialization: "Chronic Pain Management",
    rating: 4.9,
    reviews: 156,
    distance: "3.8 km",
    location: "Colombo 07",
    experience: "10 years",
    availability: "Available Today",
    price: "LKR 5,500",
    online: true,
    inPerson: false,
    image: "/placeholder.svg"
  }
];

const FindTherapist = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [therapists, setTherapists] = useState(mockTherapists);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // TODO: Implement AWS API call to search therapists
    const filtered = mockTherapists.filter(t => 
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.specialization.toLowerCase().includes(query.toLowerCase()) ||
      t.location.toLowerCase().includes(query.toLowerCase())
    );
    setTherapists(filtered);
  };

  const handleBookAppointment = (therapistId: string) => {
    // Check if user is logged in
    const isLoggedIn = false; // TODO: Check actual auth status
    if (!isLoggedIn) {
      navigate("/echanneling/login?redirect=/echanneling/book/" + therapistId);
    } else {
      navigate("/echanneling/book/" + therapistId);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 lg:px-6 py-24">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Find Your Physiotherapist
          </h1>
          <p className="text-lg text-muted-foreground">
            {userLocation 
              ? "Showing therapists near your location" 
              : "Enable location to find nearby therapists"}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name, specialization, or location..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          <Button variant="outline" size="lg">
            <Filter className="mr-2 h-5 w-5" />
            Filters
          </Button>
        </div>

        {/* Therapist List */}
        <div className="grid gap-6">
          {therapists.map((therapist) => (
            <Card key={therapist.id} className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex flex-col md:flex-row gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={therapist.image} alt={therapist.name} />
                    <AvatarFallback>{therapist.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl mb-1">{therapist.name}</CardTitle>
                        <CardDescription className="text-base">{therapist.specialization}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{therapist.price}</div>
                        <div className="text-sm text-muted-foreground">per session</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {therapist.rating} ({therapist.reviews} reviews)
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {therapist.distance} away
                      </Badge>
                      <Badge variant="outline">{therapist.experience} experience</Badge>
                      {therapist.online && (
                        <Badge className="bg-green-500 hover:bg-green-600">
                          <Video className="h-3 w-3 mr-1" />
                          Online
                        </Badge>
                      )}
                      {therapist.inPerson && (
                        <Badge className="bg-blue-500 hover:bg-blue-600">In-Person</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{therapist.location}</span>
                  <span className="mx-2">•</span>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-green-600 font-medium">{therapist.availability}</span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-3">
                <Button 
                  className="flex-1 bg-gradient-primary"
                  onClick={() => handleBookAppointment(therapist.id)}
                >
                  Book Appointment
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate(`/echanneling/therapist/${therapist.id}`)}
                >
                  View Profile
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {therapists.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              No therapists found matching your search. Try adjusting your filters.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default FindTherapist;
