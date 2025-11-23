import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Star, Video, Users, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { therapistAPI, type Therapist } from "@/services/api";

const EChanneling = () => {
  const navigate = useNavigate();
  const [recentTherapists, setRecentTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const therapists = await therapistAPI.getTopRated(6);
        setRecentTherapists(therapists);
      } catch (error) {
        console.error("Failed to fetch therapists:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTherapists();
  }, []);

  const features = [
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Find Nearby Therapists",
      description:
        "Discover qualified physiotherapists in your area based on your location",
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Easy Booking",
      description:
        "Schedule appointments instantly with real-time availability",
    },
    {
      icon: <Video className="h-6 w-6" />,
      title: "In-Person & Online",
      description:
        "Choose between physical visits or convenient online consultations",
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Verified Professionals",
      description: "All therapists are certified and experienced professionals",
    },
  ];

  return (
    <section
      id="echanneling"
      className="py-20 bg-gradient-to-b from-muted/30 to-background"
    >
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-4">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Physiotherapy E-Channeling
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with qualified physiotherapists near you. Book appointments
            for in-person or online consultations.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
            >
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                  <div className="text-primary">{feature.icon}</div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-primary rounded-2xl p-8 md:p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Start Your Recovery Journey?
          </h3>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Find the perfect physiotherapist for your needs. Whether you need
            post-surgery rehabilitation, sports injury treatment, or chronic
            pain management, we've got you covered.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate("/echanneling/find-therapist")}
              className="text-lg px-8"
            >
              <MapPin className="mr-2 h-5 w-5" />
              Find Therapists
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/echanneling/register")}
              className="text-lg px-8 bg-white/10 hover:bg-white/20 text-white border-white/30"
            >
              <Users className="mr-2 h-5 w-5" />
              Join as Therapist
            </Button>
          </div>
        </div>

        {/* Featured Therapists */}
        <div className="mt-16">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold">Featured Therapists</h3>
            <Button
              variant="link"
              onClick={() => navigate("/echanneling/find-therapist")}
            >
              View All →
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentTherapists.map((therapist) => (
                <Card
                  key={therapist.theraphistId}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">
                          {therapist.name}
                        </h4>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {therapist.averageRating?.toFixed(1) || "0.0"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({therapist.reviewCount || 0})
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">
                          ${therapist.hourlyRate}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          per hour
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {therapist.specialties
                          .slice(0, 3)
                          .map((specialty, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                            >
                              {specialty}
                            </span>
                          ))}
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {therapist.bio ||
                          "Experienced physiotherapist ready to help"}
                      </p>

                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>Available for home & online visits</span>
                      </div>
                    </div>

                    <Button
                      className="w-full mt-4"
                      onClick={() =>
                        navigate(
                          `/echanneling/find-therapist?id=${therapist.theraphistId}`
                        )
                      }
                    >
                      Book Appointment
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">100+</div>
            <div className="text-sm text-muted-foreground">
              Verified Therapists
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">1000+</div>
            <div className="text-sm text-muted-foreground">Happy Patients</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">Online Support</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">4.8★</div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EChanneling;
