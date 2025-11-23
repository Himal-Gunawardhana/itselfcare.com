import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  HelpCircle,
  Bell,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface GlobalHeaderProps {
  userName?: string;
  userType?: "patient" | "therapist" | "guest";
  onMessagesClick?: () => void;
  onHelpClick?: () => void;
  unreadCount?: number;
}

export default function GlobalHeader({
  userName = "Guest",
  userType = "guest",
  onMessagesClick,
  onHelpClick,
  unreadCount = 0,
}: GlobalHeaderProps) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/echanneling/login");
  };

  const handleMessagesClick = () => {
    if (onMessagesClick) {
      onMessagesClick();
    } else {
      if (userType === "patient") {
        navigate("/echanneling/patient/messages");
      } else if (userType === "therapist") {
        navigate("/echanneling/therapist/messages");
      }
    }
  };

  const handleHelpClick = () => {
    if (onHelpClick) {
      onHelpClick();
    } else {
      navigate("/help");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-200 ${
        scrolled
          ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm"
          : "bg-background"
      }`}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
            ItSelfCare
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {userType !== "guest" && (
            <>
              {/* Messages Icon */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={handleMessagesClick}
              >
                <MessageCircle className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Button>

              {/* Help Icon */}
              <Button variant="ghost" size="icon" onClick={handleHelpClick}>
                <HelpCircle className="h-5 w-5" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" alt={userName} />
                      <AvatarFallback className="bg-gradient-primary text-white">
                        {getInitials(userName)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userType === "patient" ? "Patient" : "Therapist"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      navigate(
                        userType === "patient"
                          ? "/echanneling/patient/dashboard"
                          : "/echanneling/therapist/dashboard"
                      )
                    }
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleMessagesClick}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    <span>Messages</span>
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {unreadCount}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {userType === "guest" && (
            <>
              <Button variant="ghost" asChild>
                <Link to="/echanneling/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/echanneling/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          {userType !== "guest" && unreadCount > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={handleMessagesClick}
            >
              <MessageCircle className="h-5 w-5" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container py-4 space-y-2">
            {userType !== "guest" && (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    handleMessagesClick();
                    setMobileMenuOpen(false);
                  }}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Messages
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    handleHelpClick();
                    setMobileMenuOpen(false);
                  }}
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help & Support
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    navigate(
                      userType === "patient"
                        ? "/echanneling/patient/dashboard"
                        : "/echanneling/therapist/dashboard"
                    );
                    setMobileMenuOpen(false);
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </>
            )}

            {userType === "guest" && (
              <>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    navigate("/echanneling/login");
                    setMobileMenuOpen(false);
                  }}
                >
                  Login
                </Button>
                <Button
                  className="w-full"
                  onClick={() => {
                    navigate("/echanneling/register");
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
