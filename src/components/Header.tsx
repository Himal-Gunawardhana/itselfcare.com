import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Heart, Activity, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import companylogo from "@/assets/Itself_logo.jpg";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
              href="#echanneling"
              className="text-foreground hover:text-primary transition-colors"
            >
              E-Channeling
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

          {/* CTA Button & Admin Link */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="hero" size="lg" onClick={scrollToPreOrder}>
              Pre Order
            </Button>
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
                href="#echanneling"
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                E-Channeling
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
              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={scrollToPreOrder}
              >
                Pre Order
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
