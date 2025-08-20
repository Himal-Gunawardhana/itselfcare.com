import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useCMS } from "@/contexts/CMSContext";
import { Link } from "react-router-dom"; // ✅ Add this import
import heroImage from "@/assets/RehabX.jpg";

const Hero = () => {
  const { content } = useCMS();

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
      </div>
    </section>
  );
};

export default Hero;
