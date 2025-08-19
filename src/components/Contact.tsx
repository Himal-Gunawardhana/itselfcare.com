import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCMS } from "@/contexts/CMSContext";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import emailjs from "@emailjs/browser";

const Contact = () => {
  const { content } = useCMS();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // EmailJS configuration - Replace these with your actual values
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        company: formData.company,
        message: formData.message,
        to_email: "info@itselfcare.com", // Replace with your email address
      };

      await emailjs.send(
        "service_3f9kmde", // Replace with your EmailJS service ID
        "template_aplnqgh", // Replace with your EmailJS template ID
        templateParams,
        "S2s6E6mbgEbz0kBKM" // Replace with your EmailJS public key
      );

      toast({
        title: "Message Sent Successfully!",
        description: "We'll get back to you within 24 hours.",
      });

      setFormData({ name: "", email: "", company: "", message: "" });
    } catch (error) {
      console.error("EmailJS error:", error);
      toast({
        title: "Error sending message",
        description: "Please try again later or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Us",
      details: [
        content.contact.address.split(",")[0],
        content.contact.address.split(",").slice(1).join(",").trim(),
      ],
    },
    {
      icon: Phone,
      title: "Call Us",
      details: [content.contact.phone, "+94 70 282 8400"],
    },
    {
      icon: Mail,
      title: "Email Us",
      details: [content.contact.email, "roman@itselfcare.com"],
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: [content.contact.hours, "24/7 Emergency Support"],
    },
  ];

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            {content.contact.title.split(" ").map((word, index) => {
              if (word === "Touch") {
                return (
                  <span
                    key={index}
                    className="bg-gradient-primary bg-clip-text text-transparent"
                  >
                    {word}
                  </span>
                );
              }
              return word + " ";
            })}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {content.contact.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground">
                Send Us a Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company/Organization</Label>
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    placeholder="Your organization name"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us about your needs and how we can help..."
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full group"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                  <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-foreground">
                Let's Start a Conversation
              </h3>
              <p className="text-muted-foreground">
                Whether you're looking to implement IoT healthcare solutions,
                need IT support, or want to explore our CMS platform, we're here
                to help you every step of the way.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contactInfo.map((info, index) => (
                <Card
                  key={index}
                  className="p-6 bg-card/50 backdrop-blur-sm border-border/50"
                >
                  <CardContent className="space-y-3">
                    <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                      <info.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {info.title}
                      </h4>
                      {info.details.map((detail, detailIndex) => (
                        <p
                          key={detailIndex}
                          className="text-sm text-muted-foreground"
                        >
                          {detail}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Additional CTA */}
            <Card className="p-6 bg-gradient-hero text-primary-foreground">
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">
                    Free Consultation Available
                  </span>
                </div>
                <p className="text-sm opacity-90">
                  Schedule a free 30-minute consultation to discuss your
                  healthcare technology needs and learn how we can help your
                  organization succeed.
                </p>
                <Button
                  variant="glass"
                  size="lg"
                  className="w-full"
                  onClick={() =>
                    window.open(
                      "https://calendar.app.google/vDSDf7xRVQQ9JnyM8",
                      "_blank"
                    )
                  }
                >
                  Schedule Consultation
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
