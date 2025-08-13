import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCMS } from "@/contexts/CMSContext";
import { 
  Award, 
  Target, 
  Heart, 
  Lightbulb,
  Users,
  TrendingUp,
  Shield
} from "lucide-react";

const About = () => {
  const { content } = useCMS();

  const values = [
    {
      icon: Heart,
      title: "Patient-Centric",
      description: "Every solution we build puts patient care and safety at the center."
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "Pioneering cutting-edge technologies to transform healthcare delivery."
    },
    {
      icon: Shield,
      title: "Security",
      description: "Uncompromising commitment to data protection and regulatory compliance."
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Working closely with healthcare professionals to understand real needs."
    }
  ];

  return (
    <section id="about" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Main About Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                {content.about.title.split(' ').map((word, index) => {
                  if (word === 'Technology') {
                    return (
                      <span key={index} className="bg-gradient-primary bg-clip-text text-transparent">
                        {word}
                      </span>
                    );
                  }
                  return word + " ";
                })}
              </h2>
              <p className="text-lg text-muted-foreground">
                {content.about.description}
              </p>
              <p className="text-muted-foreground">
                Our team of healthcare experts and technology innovators work together to 
                create solutions that not only improve operational efficiency but also 
                enhance patient outcomes and satisfaction.
              </p>
            </div>
            <Button variant="hero" size="lg">
              Learn Our Story
            </Button>
          </div>

          {/* Achievement Stats */}
          <div className="grid grid-cols-2 gap-6">
            {content.about.achievements.map((achievement, index) => (
              <Card key={index} className="text-center p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="space-y-2">
                  <div className="text-2xl md:text-3xl font-bold text-primary">
                    {achievement.number}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {achievement.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">
              Our Core Values
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do and every solution we create.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card 
                key={index} 
                className="text-center p-6 group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 bg-card/50 backdrop-blur-sm border-border/50"
              >
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 mx-auto bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <value.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h4 className="text-lg font-semibold text-foreground">
                    {value.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mission Statement */}
        <div className="mt-20 text-center space-y-6">
          <div className="max-w-4xl mx-auto">
            <blockquote className="text-xl md:text-2xl font-medium text-foreground italic">
              "{content.about.mission}"
            </blockquote>
            <cite className="text-muted-foreground mt-4 block">
              — InnovateCare Leadership Team
            </cite>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;