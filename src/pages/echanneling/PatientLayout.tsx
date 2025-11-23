import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Calendar,
  User,
  CreditCard,
  Users,
  Box,
  LogOut,
  Menu,
  X,
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo and Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
                ItSelfCare
              </span>
            </Link>
          </div>

          {/* Patient Name and Profile Menu */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium">{patientName}</p>
              <p className="text-xs text-muted-foreground">Patient Portal</p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" alt={patientName} />
                    <AvatarFallback className="bg-gradient-primary text-white">
                      {getInitials(patientName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {patientName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {patientEmail}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate("/echanneling/patient/profile")}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("/echanneling/patient/billing")}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

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
