import { Activity, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      "IoT Healthcare Products",
      "IT Services",
      "Content Management",
      "Cloud Solutions",
      "Technical Support",
    ],
    company: ["About Us", "Our Team", "Careers", "Press & News", "Partners"],
    resources: [
      "Documentation",
      "Case Studies",
      "White Papers",
      "Blog",
      "Support Center",
    ],
    legal: [
      "Privacy Policy",
      "Terms of Service",
      "Cookie Policy",
      "HIPAA Compliance",
      "Security",
    ],
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 py-12">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-10 h-10 bg-primary-foreground/10 rounded-lg">
                <Activity className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold">ITSELF</span>
            </div>
            <p className="text-primary-foreground/80 text-sm max-w-md">
              Transform patient care with our innovative IoT healthcare
              solutions, comprehensive IT services, and powerful AI-driven
              scheduling and progress tracking.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>info@itselfcare.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+94 70 282 8400</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>
                  275/13, St. Michael Mawatha, Pattiyawala, Uswetakeiyawa,
                  Wattala, Gampaha, Western Province, Sri Lanka
                </span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Services</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-sm text-primary-foreground/80">
              © {currentYear} ITSELF. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm text-primary-foreground/80">
              <span>South Asia</span>
              <span>•</span>
              <span>Sri Lanka</span>
              <span>•</span>
              <span>Copyright</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
