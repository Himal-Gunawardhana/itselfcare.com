import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, ArrowRight, Hand, Armchair, Footprints } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const PreOrder = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handlePreOrder = (plan: string) => {
    setSelectedPlan(plan);
    navigate(`/bank-details?plan=${encodeURIComponent(plan)}`);
  };

  return (
    <section
      id="preorder"
      className="min-h-screen flex items-center py-20 bg-gradient-to-b from-background to-muted/30"
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Pre-Order Now
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose your RehabX package and start your rehabilitation journey
            today
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
          {/* RehabX Glove */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
            <CardHeader className="text-center pb-8 pt-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <Hand className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold mb-2">
                RehabX Glove
              </CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">
                  LKR 30,000
                </span>
              </div>
              <CardDescription className="text-base mt-2">
                Finger rehabilitation system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-6">
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-foreground">Finger Exerciser Kit</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-foreground">Control Unit</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-foreground">Motivational Games</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-foreground">AI Progress Tracking</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-foreground">1 Year Warranty</span>
              </div>
            </CardContent>
            <CardFooter className="pt-8 pb-8 px-6 mt-auto">
              <Button
                className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white"
                size="lg"
                onClick={() => handlePreOrder("RehabX Glove")}
              >
                Pre-Order Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardFooter>
          </Card>

          {/* RehabX Full Package (Arm) - POPULAR */}
          <Card className="relative overflow-hidden border-2 border-primary hover:border-primary transition-all duration-300 hover:shadow-xl shadow-lg flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary"></div>
            <div className="absolute top-4 right-6 bg-gradient-primary text-white px-4 py-1 rounded-full text-sm font-semibold z-10">
              POPULAR
            </div>
            <CardHeader className="text-center pb-8 pt-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Armchair className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold mb-2 text-primary">
                RehabX Full Package (Arm)
              </CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  LKR 120,000
                </span>
              </div>
              <CardDescription className="text-base mt-2">
                Complete arm rehabilitation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-6">
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground font-medium">
                  Finger Exerciser Kit
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground font-medium">
                  Arm Exerciser Kit
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground font-medium">
                  Control Unit
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground font-medium">
                  Motivational Games
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground font-medium">
                  AI Progress Tracking
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground font-medium">
                  Customizable
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground font-medium">
                  1 Year Warranty
                </span>
              </div>
            </CardContent>
            <CardFooter className="pt-8 pb-8 px-6 mt-auto">
              <Button
                className="w-full bg-gradient-primary hover:opacity-90 text-white"
                size="lg"
                onClick={() => handlePreOrder("RehabX Full Package (Arm)")}
              >
                Pre-Order Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardFooter>
          </Card>

          {/* RehabX Full Package (Leg) */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-600"></div>
            <CardHeader className="text-center pb-8 pt-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-purple-500/10 rounded-full">
                  <Footprints className="h-8 w-8 text-purple-500" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold mb-2">
                RehabX Full Package (Leg)
              </CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">
                  LKR 150,000
                </span>
              </div>
              <CardDescription className="text-base mt-2">
                Complete leg rehabilitation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-6">
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-foreground">Leg Exerciser Kit</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-foreground">Control Unit</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-foreground">Motivational Games</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-foreground">AI Progress Tracking</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-foreground">Customizable</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-foreground">1 Year Warranty</span>
              </div>
            </CardContent>
            <CardFooter className="pt-8 pb-8 px-6 mt-auto">
              <Button
                className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white"
                size="lg"
                onClick={() => handlePreOrder("RehabX Full Package (Leg)")}
              >
                Pre-Order Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Questions about pre-orders? Contact us at{" "}
            <a
              href="mailto:info@itselfcare.com"
              className="text-primary hover:underline font-medium"
            >
              info@itselfcare.com
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default PreOrder;
