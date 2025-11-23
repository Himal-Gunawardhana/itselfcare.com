import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Star, MapPin } from "lucide-react";
import { useCMS } from "@/contexts/CMSContext";
import { Link } from "react-router-dom";
import heroImage from "@/assets/RehabX.jpg";
import { useEffect, useState } from "react";
import { therapistAPI, type Therapist } from "@/services/api";
import { mockTherapists, USE_MOCK_DATA } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";

const Hero = () => {
  const { content } = useCMS();
  const [topTherapists, setTopTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopTherapists = async () => {
      try {
        const therapists = await therapistAPI.getTopRated(6);
        setTopTherapists(therapists);
      } catch (error) {
        console.error("Failed to fetch top therapists:", error);
        setTopTherapists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopTherapists();
  }, []);

  return (
    <section
      id="home"
      className="min-h-screen flex items-center bg-gradient-subtle pt-16"
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-up">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                {content.hero.title.split(" ").map((word, index) => {
                  if (word === "Healthcare") {
                    return (
                      <span
                        key={index}
                        className="bg-gradient-primary bg-clip-text text-transparent"
                      >
                        {word}{" "}
                      </span>
                    );
                  }
                  return word + " ";
                })}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                {content.hero.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="glass" size="lg" className="group">
                Explore Solutions
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>

              {/* ✅ Alternative: Use Link component */}
              <Link to="/demo">
                <Button variant="hero" size="lg" className="group">
                  <Play className="mr-2 h-4 w-4" />
                  Watch Demo
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              {content.hero.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative z-10 animate-pulse-glow">
              <img
                src={heroImage}
                alt="IoT Healthcare Technology"
                className="w-full h-auto rounded-2xl shadow-elegant"
              />
            </div>
            {/* Background Decoration */}
            <div className="absolute -inset-4 bg-gradient-hero opacity-20 rounded-3xl blur-xl"></div>
          </div>
        </div>

        {/* E-Channeling Section - Top Rated Therapists */}
        <div className="mt-16 pt-16 border-t border-border">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                E-Channeling
              </span>{" "}
              Platform
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with our top-rated physiotherapists for video
              consultations, home visits, or clinic appointments
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">
                Loading top therapists...
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {topTherapists.map((therapist) => (
                  <Card
                    key={therapist.theraphistId}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">
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
                            per hour
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex flex-wrap gap-1">
                          {therapist.specialties
                            .slice(0, 2)
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
                          {therapist.bio || "Professional physiotherapist"}
                        </p>
                      </div>

                      <Link
                        to={`/echanneling/find-therapist?therapist=${therapist.theraphistId}`}
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          Book Appointment
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center">
                <Link to="/echanneling/find-therapist">
                  <Button variant="glass" size="lg" className="group">
                    View All Therapists
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
