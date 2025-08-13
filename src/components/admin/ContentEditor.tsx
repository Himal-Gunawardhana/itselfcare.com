import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useCMS } from "@/contexts/CMSContext";
import { Save, Plus, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ContentEditor = () => {
  const { content, updateContent } = useCMS();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("hero");

  const handleSave = (section: string) => {
    toast({
      title: "Content Saved",
      description: `${section} section updated successfully!`,
    });
  };

  const renderHeroEditor = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
          <CardDescription>Main landing page content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="hero-title">Main Title</Label>
            <Input
              id="hero-title"
              value={content.hero.title}
              onChange={(e) => updateContent('hero', { title: e.target.value })}
              placeholder="Enter main title"
            />
          </div>
          <div>
            <Label htmlFor="hero-subtitle">Subtitle</Label>
            <Input
              id="hero-subtitle"
              value={content.hero.subtitle}
              onChange={(e) => updateContent('hero', { subtitle: e.target.value })}
              placeholder="Enter subtitle"
            />
          </div>
          <div>
            <Label htmlFor="hero-description">Description</Label>
            <Textarea
              id="hero-description"
              value={content.hero.description}
              onChange={(e) => updateContent('hero', { description: e.target.value })}
              placeholder="Enter description"
              rows={3}
            />
          </div>
          
          <div>
            <Label>Statistics</Label>
            <div className="space-y-2">
              {content.hero.stats.map((stat, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    value={stat.number}
                    onChange={(e) => {
                      const newStats = [...content.hero.stats];
                      newStats[index].number = e.target.value;
                      updateContent('hero', { stats: newStats });
                    }}
                    placeholder="Number"
                    className="w-24"
                  />
                  <Input
                    value={stat.label}
                    onChange={(e) => {
                      const newStats = [...content.hero.stats];
                      newStats[index].label = e.target.value;
                      updateContent('hero', { stats: newStats });
                    }}
                    placeholder="Label"
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>
          
          <Button onClick={() => handleSave('Hero')} variant="hero">
            <Save className="mr-2 h-4 w-4" />
            Save Hero Section
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderServicesEditor = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Services Section</CardTitle>
          <CardDescription>Manage your service offerings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="services-title">Section Title</Label>
            <Input
              id="services-title"
              value={content.services.title}
              onChange={(e) => updateContent('services', { title: e.target.value })}
              placeholder="Enter section title"
            />
          </div>
          <div>
            <Label htmlFor="services-description">Section Description</Label>
            <Textarea
              id="services-description"
              value={content.services.description}
              onChange={(e) => updateContent('services', { description: e.target.value })}
              placeholder="Enter section description"
              rows={3}
            />
          </div>
          
          <div>
            <Label>Service Items</Label>
            <div className="space-y-4">
              {content.services.items.map((service, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Service {index + 1}</Badge>
                    </div>
                    <Input
                      value={service.title}
                      onChange={(e) => {
                        const newItems = [...content.services.items];
                        newItems[index].title = e.target.value;
                        updateContent('services', { items: newItems });
                      }}
                      placeholder="Service title"
                    />
                    <Textarea
                      value={service.description}
                      onChange={(e) => {
                        const newItems = [...content.services.items];
                        newItems[index].description = e.target.value;
                        updateContent('services', { items: newItems });
                      }}
                      placeholder="Service description"
                      rows={2}
                    />
                    <div>
                      <Label className="text-sm">Features (one per line)</Label>
                      <Textarea
                        value={service.features.join('\n')}
                        onChange={(e) => {
                          const newItems = [...content.services.items];
                          newItems[index].features = e.target.value.split('\n').filter(f => f.trim());
                          updateContent('services', { items: newItems });
                        }}
                        placeholder="Feature 1\nFeature 2\nFeature 3"
                        rows={4}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          
          <Button onClick={() => handleSave('Services')} variant="hero">
            <Save className="mr-2 h-4 w-4" />
            Save Services Section
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderAboutEditor = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>About Section</CardTitle>
          <CardDescription>Company information and achievements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="about-title">Section Title</Label>
            <Input
              id="about-title"
              value={content.about.title}
              onChange={(e) => updateContent('about', { title: e.target.value })}
              placeholder="Enter section title"
            />
          </div>
          <div>
            <Label htmlFor="about-description">Description</Label>
            <Textarea
              id="about-description"
              value={content.about.description}
              onChange={(e) => updateContent('about', { description: e.target.value })}
              placeholder="Enter company description"
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="about-mission">Mission Statement</Label>
            <Textarea
              id="about-mission"
              value={content.about.mission}
              onChange={(e) => updateContent('about', { mission: e.target.value })}
              placeholder="Enter mission statement"
              rows={3}
            />
          </div>
          
          <div>
            <Label>Achievements</Label>
            <div className="space-y-2">
              {content.about.achievements.map((achievement, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    value={achievement.number}
                    onChange={(e) => {
                      const newAchievements = [...content.about.achievements];
                      newAchievements[index].number = e.target.value;
                      updateContent('about', { achievements: newAchievements });
                    }}
                    placeholder="Number"
                    className="w-24"
                  />
                  <Input
                    value={achievement.label}
                    onChange={(e) => {
                      const newAchievements = [...content.about.achievements];
                      newAchievements[index].label = e.target.value;
                      updateContent('about', { achievements: newAchievements });
                    }}
                    placeholder="Label"
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>
          
          <Button onClick={() => handleSave('About')} variant="hero">
            <Save className="mr-2 h-4 w-4" />
            Save About Section
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderContactEditor = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contact Section</CardTitle>
          <CardDescription>Contact information and details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="contact-title">Section Title</Label>
            <Input
              id="contact-title"
              value={content.contact.title}
              onChange={(e) => updateContent('contact', { title: e.target.value })}
              placeholder="Enter section title"
            />
          </div>
          <div>
            <Label htmlFor="contact-description">Description</Label>
            <Textarea
              id="contact-description"
              value={content.contact.description}
              onChange={(e) => updateContent('contact', { description: e.target.value })}
              placeholder="Enter section description"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="contact-address">Address</Label>
            <Input
              id="contact-address"
              value={content.contact.address}
              onChange={(e) => updateContent('contact', { address: e.target.value })}
              placeholder="Enter business address"
            />
          </div>
          <div>
            <Label htmlFor="contact-phone">Phone</Label>
            <Input
              id="contact-phone"
              value={content.contact.phone}
              onChange={(e) => updateContent('contact', { phone: e.target.value })}
              placeholder="Enter phone number"
            />
          </div>
          <div>
            <Label htmlFor="contact-email">Email</Label>
            <Input
              id="contact-email"
              value={content.contact.email}
              onChange={(e) => updateContent('contact', { email: e.target.value })}
              placeholder="Enter email address"
            />
          </div>
          <div>
            <Label htmlFor="contact-hours">Business Hours</Label>
            <Input
              id="contact-hours"
              value={content.contact.hours}
              onChange={(e) => updateContent('contact', { hours: e.target.value })}
              placeholder="Enter business hours"
            />
          </div>
          
          <Button onClick={() => handleSave('Contact')} variant="hero">
            <Save className="mr-2 h-4 w-4" />
            Save Contact Section
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Content Editor</h2>
          <p className="text-muted-foreground">Edit your website content in real-time</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => window.open("/", "_blank")}
        >
          <Eye className="mr-2 h-4 w-4" />
          Preview Changes
        </Button>
      </div>

      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>
        
        <TabsContent value="hero" className="mt-6">
          {renderHeroEditor()}
        </TabsContent>
        
        <TabsContent value="services" className="mt-6">
          {renderServicesEditor()}
        </TabsContent>
        
        <TabsContent value="about" className="mt-6">
          {renderAboutEditor()}
        </TabsContent>
        
        <TabsContent value="contact" className="mt-6">
          {renderContactEditor()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentEditor;