import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Heart,
  Activity,
  Settings,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import companylogo from "@/assets/Itself_logo.jpg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const type = localStorage.getItem("user_type");
    const patientId = localStorage.getItem("patient_id");
    const therapistId = localStorage.getItem("therapist_id");

    if (token && type) {
      setIsLoggedIn(true);
      setUserType(type);
      // For now, use a generic name. Later this can be fetched from API
      setUserName(type === "patient" ? "Patient" : "Therapist");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_type");
    localStorage.removeItem("patient_id");
    localStorage.removeItem("therapist_id");
    setIsLoggedIn(false);
    setUserType(null);
    setUserName("");
    navigate("/");
  };

  const handleDashboard = () => {
    if (userType === "patient") {
      navigate("/echanneling/patient/dashboard");
    } else if (userType === "therapist") {
      navigate("/echanneling/therapist/dashboard");
    }
  };

  const handleProfile = () => {
    if (userType === "patient") {
      navigate("/echanneling/patient/profile");
    } else if (userType === "therapist") {
      navigate("/echanneling/therapist/profile");
    }
  };

  // Function to scroll to preorder section
  const scrollToPreOrder = () => {
    const preorderSection = document.getElementById("preorder");
    if (preorderSection) {
      preorderSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    // Close mobile menu if open
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-primary rounded-lg">
              <img
                src={companylogo}
                alt="Itself_logo.jpg"
                className="w-10 h-10 rounded-lg"
              />
            </div>
            <span className="text-xl font-bold text-foreground">ITSELF</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#home"
              className="text-foreground hover:text-primary transition-colors"
            >
              Home
            </a>
            <a
              href="#services"
              className="text-foreground hover:text-primary transition-colors"
            >
              Services
            </a>
            <a
              href="#about"
              className="text-foreground hover:text-primary transition-colors"
            >
              About
            </a>
            <a
              href="#preorder"
              className="text-foreground hover:text-primary transition-colors"
            >
              Pre-Order
            </a>
            <a
              href="#contact"
              className="text-foreground hover:text-primary transition-colors"
            >
              Contact
            </a>
          </nav>

          {/* CTA Button & User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {!isLoggedIn ? (
              <>
                <Link to="/echanneling/login">
                  <Button variant="outline" size="lg">
                    Login
                  </Button>
                </Link>
                <Button variant="hero" size="lg" onClick={scrollToPreOrder}>
                  Pre Order
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="lg" onClick={scrollToPreOrder}>
                  Pre Order
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="hero" size="lg" className="gap-2">
                      <User className="h-4 w-4" />
                      {userName}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDashboard}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleProfile}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              <a
                href="#home"
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </a>
              <a
                href="#services"
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </a>
              <a
                href="#about"
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </a>
              <a
                href="#preorder"
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Pre-Order
              </a>
              <a
                href="#contact"
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </a>

              {!isLoggedIn ? (
                <>
                  <Link to="/echanneling/login">
                    <Button variant="outline" size="lg" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full"
                    onClick={scrollToPreOrder}
                  >
                    Pre Order
                  </Button>
                </>
              ) : (
                <>
                  <div className="pt-4 border-t border-border">
                    <div className="text-sm font-medium text-foreground mb-2 px-2">
                      {userName}
                    </div>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full mb-2 justify-start"
                      onClick={() => {
                        handleDashboard();
                        setIsMenuOpen(false);
                      }}
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full mb-2 justify-start"
                      onClick={() => {
                        handleProfile();
                        setIsMenuOpen(false);
                      }}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Button>
                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full mb-2"
                      onClick={scrollToPreOrder}
                    >
                      Pre Order
                    </Button>
                    <Button
                      variant="destructive"
                      size="lg"
                      className="w-full justify-start"
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
