import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { handleAuthCallback } from "@/services/auth";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("AuthCallback: Starting OAuth callback handling...");
        console.log("Current URL:", window.location.href);
        console.log("Search params:", window.location.search);
        
        // Use Amplify to handle the OAuth callback
        const { session, userType } = await handleAuthCallback();
        
        console.log("Session received:", session);
        console.log("User type:", userType);

        if (!session.tokens) {
          throw new Error("No tokens received");
        }

        // Get user info from ID token
        const idToken = session.tokens.idToken;
        if (!idToken) {
          throw new Error("No ID token");
        }

        const payload = idToken.payload;

        // Store tokens and user info
        localStorage.setItem("auth_token", idToken.toString());
        localStorage.setItem("user_type", userType);
        localStorage.setItem("user_email", payload.email as string);
        localStorage.setItem(
          "user_name",
          (payload.name as string) || (payload.email as string).split("@")[0]
        );

        // Fetch or create user profile in backend
        await createUserProfile(userType, {
          sub: payload.sub as string,
          email: payload.email as string,
          name: payload.name as string,
        });

        setStatus("success");

        toast({
          title: "Success",
          description: "Signed in successfully with Google!",
        });

        // Redirect to dashboard
        setTimeout(() => {
          navigate(
            userType === "patient"
              ? "/echanneling/patient/dashboard"
              : "/echanneling/therapist/dashboard"
          );
        }, 1500);
      } catch (error) {
        console.error("OAuth callback error:", error);
        setStatus("error");

        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Authentication failed",
          variant: "destructive",
        });

        // Redirect back to login
        setTimeout(() => {
          navigate("/echanneling/login");
        }, 3000);
      }
    };

    const createUserProfile = async (
      userType: "patient" | "therapist",
      cognitoUser: { sub: string; email: string; name?: string }
    ) => {
      try {
        const apiUrl =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

        if (userType === "therapist") {
          // Check if therapist exists
          const response = await fetch(
            `${apiUrl}/therapists/top/rated?limit=100`
          );
          if (response.ok) {
            const therapists: Array<{
              theraphistId: string;
              email: string;
              userId: string;
            }> = await response.json();
            const existing = therapists.find(
              (t) =>
                t.email === cognitoUser.email || t.userId === cognitoUser.sub
            );

            if (existing) {
              localStorage.setItem("therapist_id", existing.theraphistId);
            } else {
              // Create new therapist profile
              const createResponse = await fetch(`${apiUrl}/therapists`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId: cognitoUser.sub,
                  name: cognitoUser.name || cognitoUser.email.split("@")[0],
                  email: cognitoUser.email,
                  specialties: [],
                  languages: ["English"],
                  hourlyRate: 0,
                  bio: "",
                  geoLat: 6.927079,
                  geoLng: 79.861244,
                }),
              });

              if (createResponse.ok) {
                const newTherapist = await createResponse.json();
                localStorage.setItem("therapist_id", newTherapist.theraphistId);
              }
            }
          }
        } else {
          // Similar logic for patient
          // TODO: Implement patient profile creation
        }
      } catch (error) {
        console.error("Failed to create user profile:", error);
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>
            {status === "processing" && "Processing..."}
            {status === "success" && "Success!"}
            {status === "error" && "Authentication Failed"}
          </CardTitle>
          <CardDescription>
            {status === "processing" && "Completing your sign-in..."}
            {status === "success" && "Redirecting to your dashboard..."}
            {status === "error" && "Redirecting back to login..."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {status === "processing" && (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          )}
          {status === "success" && <div className="text-6xl">✓</div>}
          {status === "error" && <div className="text-6xl">✗</div>}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;
