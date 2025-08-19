import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCMS } from "@/contexts/CMSContext";
import {
  Activity,
  Server,
  FileText,
  Shield,
  Zap,
  Users,
  ArrowRight,
} from "lucide-react";

const Services = () => {
  const { content } = useCMS();

  const serviceIcons = [Activity, Server, FileText];

  return (
    <section id="services" className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            {content.services.title.split(" ").map((word, index) => {
              if (word === "Services") {
                return (
                  <span
                    key={index}
                    className="bg-gradient-primary bg-clip-text text-transparent"
                  >
                    {word}
                  </span>
                );
              }
              return word + " ";
            })}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {content.services.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.services.items.map((service, index) => {
            const IconComponent = serviceIcons[index] || Activity;
            return (
              <Card
                key={index}
                className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 bg-card/50 backdrop-blur-sm border-border/50"
              >
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    {service.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center text-sm text-muted-foreground"
                      >
                        <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="healthcare"
                    className="w-full group"
                    onClick={() =>
                      window.open(
                        "https://www.google.com/search?q=IoT+healthcare",
                        "_blank"
                      )
                    }
                  >
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Services Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-gradient-primary rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Security First
            </h3>
            <p className="text-sm text-muted-foreground">
              Enterprise-grade security with HIPAA compliance and end-to-end
              encryption.
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-gradient-primary rounded-xl flex items-center justify-center">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Lightning Fast
            </h3>
            <p className="text-sm text-muted-foreground">
              Optimized performance with real-time data processing and instant
              insights.
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-gradient-primary rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Expert Support
            </h3>
            <p className="text-sm text-muted-foreground">
              Dedicated healthcare technology experts available 24/7 for your
              success.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
