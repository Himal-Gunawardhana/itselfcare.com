import React, { createContext, useContext, useState, useEffect } from 'react';

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
      features: string[];
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
    title: "Revolutionizing Healthcare with IoT Technology",
    subtitle: "Transform patient care with our innovative IoT healthcare solutions, comprehensive IT services, and powerful content management systems.",
    description: "Transform patient care with our innovative IoT healthcare solutions, comprehensive IT services, and powerful content management systems.",
    stats: [
      { number: "500+", label: "Healthcare Clients" },
      { number: "99.9%", label: "Uptime" },
      { number: "24/7", label: "Support" }
    ]
  },
  services: {
    title: "Our Services",
    description: "Comprehensive solutions that bridge technology and healthcare to deliver exceptional patient outcomes and operational efficiency.",
    items: [
      {
        title: "IoT Healthcare Products",
        description: "Smart medical devices and sensors that revolutionize patient monitoring and care delivery.",
        features: [
          "Real-time patient monitoring",
          "Remote health tracking", 
          "Smart medical devices",
          "Data analytics platform"
        ]
      },
      {
        title: "IT Services",
        description: "Comprehensive technology solutions designed specifically for healthcare organizations.",
        features: [
          "Cloud infrastructure",
          "System integration",
          "Technical support",
          "Security consulting"
        ]
      },
      {
        title: "Content Management System",
        description: "Powerful CMS platform tailored for healthcare content and compliance requirements.",
        features: [
          "HIPAA compliant",
          "Custom workflows",
          "Multi-user collaboration",
          "Advanced reporting"
        ]
      }
    ]
  },
  about: {
    title: "Transforming Healthcare Through Technology",
    description: "Founded with a mission to bridge the gap between advanced technology and compassionate healthcare, InnovateCare has been at the forefront of digital health transformation for over a decade.",
    mission: "Our mission is to empower healthcare organizations with innovative IoT solutions and comprehensive IT services that improve patient outcomes, enhance operational efficiency, and drive the future of digital health.",
    achievements: [
      { number: "10+", label: "Years Experience" },
      { number: "500+", label: "Healthcare Partners" },
      { number: "1M+", label: "Patients Monitored" },
      { number: "99.9%", label: "System Reliability" }
    ]
  },
  contact: {
    title: "Get In Touch",
    description: "Ready to transform your healthcare organization? Let's discuss how our IoT solutions and IT services can help you achieve your goals.",
    address: "123 Healthcare Innovation Dr, Medical District, CA 90210",
    phone: "+1 (555) 123-4567",
    email: "hello@innovatecare.com",
    hours: "Mon - Fri: 8:00 AM - 6:00 PM"
  }
};

interface CMSContextType {
  content: CMSContent;
  updateContent: (section: keyof CMSContent, data: any) => void;
  resetContent: () => void;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<CMSContent>(defaultContent);

  // Load content from localStorage on mount
  useEffect(() => {
    const savedContent = localStorage.getItem('cms-content');
    if (savedContent) {
      try {
        setContent(JSON.parse(savedContent));
      } catch (error) {
        console.error('Error loading saved content:', error);
      }
    }
  }, []);

  // Save content to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cms-content', JSON.stringify(content));
  }, [content]);

  const updateContent = (section: keyof CMSContent, data: any) => {
    setContent(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const resetContent = () => {
    setContent(defaultContent);
    localStorage.removeItem('cms-content');
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
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
};