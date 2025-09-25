import React, { createContext, useContext, useState, useEffect } from "react";

interface CMSContent {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    stats: Array<{ number: string; label: string }>;
  };
  services: {
    title: string;
    description: string;
    items: Array<{
      title: string;
      description: string;
      technologies: string[];
      learnMoreLink: string;
    }>;
  };
  about: {
    title: string;
    description: string;
    mission: string;
    achievements: Array<{ number: string; label: string }>;
  };
  contact: {
    title: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    hours: string;
  };
}

const defaultContent: CMSContent = {
  hero: {
    title: "Revolutionizing Healthcare Rehabilitation",
    subtitle:
      "Transform patient care with our innovative IoT healthcare solutions, comprehensive IT services, and powerful AI-driven scheduling and progress tracking.",
    description:
      "Transform patient care with our innovative IoT healthcare solutions, comprehensive IT services, and powerful AI-driven scheduling and progress tracking.",
    stats: [
      { number: "10+", label: "StartUp Awards" },
      { number: "90%", label: "Positive Feedback" },
      { number: "24/7", label: "Dedicated Team" },
    ],
  },
  services: {
    title: "Our Services",
    description:
      "Comprehensive technology solutions across multiple domains, delivering innovative and efficient solutions.",
    // ┌─────────────────────────────────────────────────────────────────────────┐
    // │                    EDIT LEARN MORE LINKS HERE                          │
    // │  Change the learnMoreLink property for each service below              │
    // └─────────────────────────────────────────────────────────────────────────┘
    items: [
      {
        title: "Mobile App Development",
        description:
          "Cross-platform mobile applications with modern frameworks and native performance.",
        technologies: ["Flutter", "Dart language"],
        learnMoreLink: "https://flutter.dev/", // 📱 EDIT: Mobile App Development link
      },
      {
        title: "Embedded IoT",
        description:
          "Internet of Things solutions with embedded systems and real-time processing.",
        technologies: ["ESP", "C++"],
        learnMoreLink: "https://www.espressif.com/", // 🔌 EDIT: Embedded IoT link
      },
      {
        title: "Web Development",
        description:
          "Modern web applications with responsive design and robust backend systems.",
        technologies: ["React TS", "Node.js"],
        learnMoreLink: "https://react.dev/", // 🌐 EDIT: Web Development link
      },
      {
        title: "PCB Design",
        description:
          "Professional printed circuit board design and electronic system development.",
        technologies: ["Easy EDA", "Altium"],
        learnMoreLink: "https://easyeda.com/", // ⚡ EDIT: PCB Design link
      },
      {
        title: "Fullstack Development",
        description:
          "End-to-end application development with enterprise-grade solutions.",
        technologies: ["Spring Boot", "Java"],
        learnMoreLink: "https://spring.io/projects/spring-boot", // 💻 EDIT: Fullstack Development link
      },
      {
        title: "3D Modelling and Animation",
        description:
          "Professional 3D modeling, animation, and engineering design solutions.",
        technologies: ["Blender", "SolidWorks"],
        learnMoreLink: "https://www.blender.org/", // 🎨 EDIT: 3D Modelling and Animation link
      },
    ],
  },
  about: {
    title: "Transforming Healthcare Through Technology",
    description:
      "Founded with a mission empowering healthcare with AI-driven robotics and automation while mushrooming patients' hopes.",
    mission:
      "Founded with a mission empowering healthcare with AI-driven robotics and automation while mushrooming patients' hopes.",
    achievements: [
      { number: "10+", label: "Startup Awards" },
      { number: "30+", label: "Community Members" },
      { number: "100%", label: "Young Spirit" },
      { number: "90%", label: "Positive Feedback" },
    ],
  },
  contact: {
    title: "Get In Touch",
    description:
      "Ready to transform your healthcare organization? Let's discuss how our IoT solutions and IT services can help you achieve your goals.",
    address: "Wattala, Gampaha, Western Province, Sri Lanka",
    phone: "+94 70 282 8400",
    email: "info@itselfcare.com",
    hours: "Mon - Fri: 8:00 AM - 6:00 PM",
  },
};

interface CMSContextType {
  content: CMSContent;
  updateContent: (section: keyof CMSContent, data: unknown) => void;
  resetContent: () => void;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [content, setContent] = useState<CMSContent>(defaultContent);

  // Load content from localStorage on mount
  useEffect(() => {
    const savedContent = localStorage.getItem("cms-content");
    if (savedContent) {
      try {
        setContent(JSON.parse(savedContent));
      } catch (error) {
        console.error("Error loading saved content:", error);
      }
    }
  }, []);

  // Save content to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cms-content", JSON.stringify(content));
  }, [content]);

  const updateContent = (section: keyof CMSContent, data: unknown) => {
    setContent((prev) => ({
      ...prev,
      [section]: { ...(prev[section] as object), ...(data as object) },
    }));
  };

  const resetContent = () => {
    setContent(defaultContent);
    localStorage.removeItem("cms-content");
  };

  return (
    <CMSContext.Provider value={{ content, updateContent, resetContent }}>
      {children}
    </CMSContext.Provider>
  );
};

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error("useCMS must be used within a CMSProvider");
  }
  return context;
};
