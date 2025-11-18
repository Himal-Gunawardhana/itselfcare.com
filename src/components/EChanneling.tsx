import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Star, Video, Users, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EChanneling = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Find Nearby Therapists",
      description: "Discover qualified physiotherapists in your area based on your location"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Easy Booking",
      description: "Schedule appointments instantly with real-time availability"
    },
    {
      icon: <Video className="h-6 w-6" />,
      title: "In-Person & Online",
      description: "Choose between physical visits or convenient online consultations"
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Verified Professionals",
      description: "All therapists are certified and experienced professionals"
    }
  ];

  return (
    <section id="echanneling" className="py-20 bg-gradient-to-b from-muted/30 to-background">
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
            Connect with qualified physiotherapists near you. Book appointments for in-person or online consultations.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                  <div className="text-primary">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
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
            Find the perfect physiotherapist for your needs. Whether you need post-surgery rehabilitation, 
            sports injury treatment, or chronic pain management, we've got you covered.
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

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">100+</div>
            <div className="text-sm text-muted-foreground">Verified Therapists</div>
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
