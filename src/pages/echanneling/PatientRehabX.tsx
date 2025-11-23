import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PatientRehabX() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">RehabX Interactive Demo</h1>
        <p className="text-muted-foreground mt-1">
          Experience our 3D interactive rehabilitation platform
        </p>
      </div>

      <Card className="bg-gradient-primary text-white">
        <CardContent className="p-8">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex-1 min-w-[300px]">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Activity className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold">RehabX 3D Platform</h2>
              </div>
              <p className="text-lg opacity-90 mb-6">
                Interact with our advanced 3D model to explore physical therapy
                exercises, anatomy visualizations, and rehabilitation techniques
                in an immersive environment.
              </p>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate("/demo")}
                className="gap-2"
              >
                <Play className="h-5 w-5" />
                Launch Interactive Demo
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
            <div className="hidden lg:block">
              <Activity className="h-48 w-48 opacity-20" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">3D Anatomy Viewer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Explore detailed 3D models of human anatomy with interactive
              rotation, zoom, and highlighting features.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Exercise Library</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Browse through a comprehensive library of rehabilitation exercises
              with visual demonstrations.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Progress Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track your rehabilitation progress with detailed analytics and
              performance metrics.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">✓</span>
              </div>
              <div>
                <p className="font-medium">Interactive 3D Models</p>
                <p className="text-sm text-muted-foreground">
                  Rotate, zoom, and interact with detailed 3D anatomical models
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">✓</span>
              </div>
              <div>
                <p className="font-medium">Real-time Visualization</p>
                <p className="text-sm text-muted-foreground">
                  See exercises and movements demonstrated in real-time 3D
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">✓</span>
              </div>
              <div>
                <p className="font-medium">Educational Content</p>
                <p className="text-sm text-muted-foreground">
                  Access detailed information about muscles, bones, and
                  rehabilitation techniques
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">✓</span>
              </div>
              <div>
                <p className="font-medium">Personalized Experience</p>
                <p className="text-sm text-muted-foreground">
                  Customize views and focus on specific areas relevant to your
                  rehabilitation
                </p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> This is a demonstration version of RehabX.
            Full features will be available after consultation with your
            therapist. The demo provides a preview of the interactive 3D
            environment and basic functionalities.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
