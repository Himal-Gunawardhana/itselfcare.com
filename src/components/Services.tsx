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
  Smartphone,
  Cpu,
  Globe,
  CircuitBoard,
  Database,
  Box,
  Shield,
  Zap,
  Users,
  ArrowRight,
} from "lucide-react";

const Services = () => {
  const { content } = useCMS();

  const serviceIcons = [Smartphone, Cpu, Globe, CircuitBoard, Database, Box];

  /*
  ═══════════════════════════════════════════════════════════════════════════════
                          📝 LEARN MORE LINKS CONFIGURATION
  ═══════════════════════════════════════════════════════════════════════════════
  
  To edit individual "Learn More" button links:
  
  👉 Go to: src/contexts/CMSContext.tsx
  👉 Find: services.items array (around line 56)
  👉 Look for: learnMoreLink property in each service object
  
  Current links:
  📱 Mobile App Development → https://flutter.dev/
  🔌 Embedded IoT → https://www.espressif.com/
  🌐 Web Development → https://react.dev/
  ⚡ PCB Design → https://easyeda.com/
  💻 Fullstack Development → https://spring.io/projects/spring-boot
  🎨 3D Modelling and Animation → https://www.blender.org/
  
  Simply replace the URL in the learnMoreLink property to change where each 
  "Learn More" button redirects!
  
  ═══════════════════════════════════════════════════════════════════════════════
  */

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {content.services.items.map((service, index) => {
            const IconComponent = serviceIcons[index] || Smartphone;
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
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">
                      Technologies & Tools:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {service.technologies.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="healthcare"
                    className="w-full group"
                    onClick={() => {
                      window.open(service.learnMoreLink, "_blank");
                    }}
                  >
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Why Choose Us Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-gradient-primary rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Quality Assurance
            </h3>
            <p className="text-sm text-muted-foreground">
              Rigorous testing and quality control processes ensure reliable and
              robust solutions.
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-gradient-primary rounded-xl flex items-center justify-center">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Modern Technologies
            </h3>
            <p className="text-sm text-muted-foreground">
              Cutting-edge tools and frameworks to deliver high-performance
              solutions.
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-gradient-primary rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Expert Team
            </h3>
            <p className="text-sm text-muted-foreground">
              Experienced developers and engineers ready to bring your ideas to
              life.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
