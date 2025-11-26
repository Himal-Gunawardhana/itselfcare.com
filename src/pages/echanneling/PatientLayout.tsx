import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GlobalHeader from "@/components/GlobalHeader";
import {
  LayoutDashboard,
  Calendar,
  User,
  CreditCard,
  Users,
  Box,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PatientLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");

  useEffect(() => {
    // Check authentication
    const authToken = localStorage.getItem("auth_token");
    const userType = localStorage.getItem("user_type");

    if (!authToken || userType !== "patient") {
      navigate("/echanneling/login");
      return;
    }

    // Load patient data
    setPatientName(localStorage.getItem("user_name") || "Patient");
    setPatientEmail(
      localStorage.getItem("user_email") || "patient@example.com"
    );
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_type");
    localStorage.removeItem("patient_id");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    navigate("/echanneling/login");
  };

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/echanneling/patient/dashboard",
      description: "View overview",
    },
    {
      icon: Calendar,
      label: "Appointments",
      path: "/echanneling/patient/appointments",
      description: "Manage bookings",
    },
    {
      icon: User,
      label: "Profile",
      path: "/echanneling/patient/profile",
      description: "Edit details",
    },
    {
      icon: CreditCard,
      label: "Billing & Payments",
      path: "/echanneling/patient/billing",
      description: "Payment methods",
    },
    {
      icon: Users,
      label: "Refer a Friend",
      path: "/echanneling/patient/referrals",
      description: "Earn rewards",
    },
    {
      icon: Box,
      label: "RehabX Demo",
      path: "/echanneling/patient/rehabx",
      description: "Interactive 3D",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Global Header */}
      <GlobalHeader
        userName={patientName}
        userType="patient"
        onMessagesClick={() => navigate("/echanneling/patient/messages")}
        onHelpClick={() => navigate("/help")}
      />
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-background pt-16 transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 lg:pt-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-full flex-col gap-2 p-4">
            <div className="mb-4">
              <h2 className="mb-2 px-4 text-lg font-semibold">
                Patient Portal
              </h2>
              <p className="px-4 text-xs text-muted-foreground">
                Manage your health journey
              </p>
            </div>

            <nav className="flex-1 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                        isActive
                          ? "bg-accent text-accent-foreground font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <div className="flex-1">
                        <div>{item.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t pt-4">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
