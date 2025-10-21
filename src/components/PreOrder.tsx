import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, ArrowRight, Star } from "lucide-react";
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
            Choose your plan and secure your ITSELF rehabilitation system today
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          {/* Basic Plan */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-400 to-gray-600"></div>
            <CardHeader className="text-center pb-8 pt-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-muted rounded-full">
                  <span className="text-3xl">🙌</span>
                </div>
              </div>
              <CardTitle className="text-3xl font-bold mb-2">
                Basic Plan
              </CardTitle>
              <div className="mt-4">
                <span className="text-5xl font-bold text-foreground">$300</span>
              </div>
              <CardDescription className="text-base mt-2">
                One-time payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-6">
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-foreground">Exerciser Kit</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-foreground">Control Unit</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-foreground">2 Years Warranty</span>
              </div>
            </CardContent>
            <CardFooter className="pt-8 pb-8 px-6 mt-auto">
              <Button
                className="w-full bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white"
                size="lg"
                onClick={() => handlePreOrder("Basic Plan")}
              >
                Pre-Order Basic Plan
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardFooter>
          </Card>

          {/* Premium Plan */}
          <Card className="relative overflow-hidden border-2 border-primary hover:border-primary transition-all duration-300 hover:shadow-xl shadow-lg flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary"></div>
            <div className="absolute top-4 right-6 bg-gradient-primary text-white px-4 py-1 rounded-full text-sm font-semibold z-10">
              POPULAR
            </div>
            <CardHeader className="text-center pb-8 pt-8">
              <div className="flex justify-center mb-4">
                <div className="relative p-3 bg-primary/10 rounded-full">
                  <Star className="h-8 w-8 text-primary fill-primary" />
                  <Star className="h-4 w-4 text-primary fill-primary absolute -top-1 -right-1" />
                  <Star className="h-3 w-3 text-primary fill-primary absolute -bottom-0 -left-0" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold mb-2 text-primary">
                Premium Plan
              </CardTitle>
              <div className="mt-4">
                <span className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  $400
                </span>
                <span className="text-2xl text-muted-foreground"> + </span>
                <span className="text-3xl font-bold text-foreground">15$</span>
                <span className="text-lg text-muted-foreground">/Month</span>
              </div>
              <CardDescription className="text-base mt-2">
                Advanced features included
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-6">
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground font-medium">
                  Exerciser Kit
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
                  2 Years Warranty
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
                  ML Based Progress Tracking
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground font-medium">
                  E-Channeling
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground font-medium">
                  Power Back Up
                </span>
              </div>
            </CardContent>
            <CardFooter className="pt-8 pb-8 px-6 mt-auto">
              <Button
                className="w-full bg-gradient-primary hover:opacity-90 text-white"
                size="lg"
                onClick={() => handlePreOrder("Premium Plan")}
              >
                Pre-Order Premium Plan
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
