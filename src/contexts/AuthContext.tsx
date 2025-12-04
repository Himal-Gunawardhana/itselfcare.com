import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { CognitoUserSession } from "amazon-cognito-identity-js";
import * as auth from "@/services/auth";

interface AuthContextType {
  user: auth.AuthUser | null;
  userType: "patient" | "therapist" | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isCognitoConfigured: boolean;
  signIn: (
    userType: "patient" | "therapist",
    email: string,
    password: string
  ) => Promise<void>;
  signUp: (
    userType: "patient" | "therapist",
    params: auth.SignUpParams
  ) => Promise<{ userSub: string; userConfirmed: boolean }>;
  signOut: () => void;
  confirmSignUp: (
    userType: "patient" | "therapist",
    email: string,
    code: string
  ) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Check if Cognito is configured
const isCognitoConfigured = !!(
  import.meta.env.VITE_COGNITO_PATIENT_USER_POOL_ID &&
  import.meta.env.VITE_COGNITO_PATIENT_CLIENT_ID &&
  import.meta.env.VITE_COGNITO_THERAPIST_USER_POOL_ID &&
  import.meta.env.VITE_COGNITO_THERAPIST_CLIENT_ID
);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<auth.AuthUser | null>(null);
  const [userType, setUserType] = useState<"patient" | "therapist" | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Skip auth check if Cognito is not configured
      if (!isCognitoConfigured) {
        console.log(
          "Cognito not configured. Skipping auth check. See QUICK_START_AUTH.md for setup instructions."
        );
        setIsLoading(false);
        return;
      }

      // Check localStorage for user type
      const storedUserType = localStorage.getItem("user_type") as
        | "patient"
        | "therapist"
        | null;

      if (!storedUserType) {
        setIsLoading(false);
        return;
      }

      const session = await auth.getCurrentSession(storedUserType);
      if (session.isValid()) {
        const userData = await auth.getUserAttributes(storedUserType);
        setUser(userData);
        setUserType(storedUserType);
        setIsAuthenticated(true);

        // Store token
        localStorage.setItem("auth_token", session.getIdToken().getJwtToken());
        localStorage.setItem("user_type", storedUserType);
      }
    } catch (error) {
      console.warn(
        "Auth check failed (this is normal if not configured yet):",
        error
      );
      // Clear invalid session
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_type");
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (
    type: "patient" | "therapist",
    email: string,
    password: string
  ) => {
    try {
      const session = await auth.signIn(type, { email, password });
      const userData = await auth.getUserAttributes(type);

      setUser(userData);
      setUserType(type);
      setIsAuthenticated(true);

      // Store in localStorage
      localStorage.setItem("auth_token", session.getIdToken().getJwtToken());
      localStorage.setItem("user_type", type);
      localStorage.setItem("user_email", email);
      localStorage.setItem("user_name", userData.name || email.split("@")[0]);

      // Fetch and store patient/therapist ID from backend
      await fetchUserIdFromBackend(type, email, userData.sub);
    } catch (error) {
      console.error("Sign in failed:", error);
      throw error;
    }
  };

  const signUp = async (
    type: "patient" | "therapist",
    params: auth.SignUpParams
  ) => {
    try {
      const result = await auth.signUp(type, params);
      return result;
    } catch (error) {
      console.error("Sign up failed:", error);
      throw error;
    }
  };

  const confirmSignUp = async (
    type: "patient" | "therapist",
    email: string,
    code: string
  ) => {
    try {
      await auth.confirmSignUp(type, email, code);
    } catch (error) {
      console.error("Confirm sign up failed:", error);
      throw error;
    }
  };

  const signOut = () => {
    if (userType) {
      auth.signOut(userType);
    }
    setUser(null);
    setUserType(null);
    setIsAuthenticated(false);
  };

  const refreshUser = async () => {
    if (!userType) return;

    try {
      const userData = await auth.getUserAttributes(userType);
      setUser(userData);
    } catch (error) {
      console.error("Refresh user failed:", error);
    }
  };

  // Helper function to fetch user ID from backend
  const fetchUserIdFromBackend = async (
    type: "patient" | "therapist",
    email: string,
    cognitoSub: string
  ) => {
    try {
      const apiUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

      if (type === "therapist") {
        // Search for therapist by email
        const response = await fetch(
          `${apiUrl}/therapists/top/rated?limit=100`
        );
        if (response.ok) {
          const therapists: Array<{
            theraphistId: string;
            email: string;
            userId: string;
          }> = await response.json();
          const therapist = therapists.find(
            (t) => t.email === email || t.userId === cognitoSub
          );
          if (therapist) {
            localStorage.setItem("therapist_id", therapist.theraphistId);
          }
        }
      }
      // Add patient lookup logic here when endpoint is available
    } catch (error) {
      console.error("Failed to fetch user ID from backend:", error);
    }
  };

  const value = {
    user,
    userType,
    isLoading,
    isAuthenticated,
    isCognitoConfigured,
    signIn,
    signUp,
    signOut,
    confirmSignUp,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
