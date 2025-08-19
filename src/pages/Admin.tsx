import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import ContentEditor from "@/components/admin/ContentEditor";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Users,
  Eye,
  Activity,
  TrendingUp,
  Shield,
  Clock,
} from "lucide-react";

const Admin = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin/login");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const stats = [
    {
      icon: FileText,
      title: "Content Sections",
      value: "4",
      description: "Hero, Services, About, Contact",
    },
    {
      icon: Eye,
      title: "Live Preview",
      value: "Active",
      description: "Real-time content updates",
    },
    {
      icon: Activity,
      title: "CMS Status",
      value: "Online",
      description: "All systems operational",
    },
    {
      icon: Shield,
      title: "Security",
      value: "Secure",
      description: "Admin access protected",
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="bg-card/50 backdrop-blur-sm border-border/50"
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>CMS Overview</span>
            </CardTitle>
            <CardDescription>
              Manage your website content with ease using the ITSELF CMS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">
                  Available Features
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">✓</Badge>
                    <span className="text-sm">Real-time content editing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">✓</Badge>
                    <span className="text-sm">Live preview functionality</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">✓</Badge>
                    <span className="text-sm">
                      Section-based content management
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">✓</Badge>
                    <span className="text-sm">
                      Automatic content persistence
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">
                  Content Sections
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Hero Section</span>
                    <Badge variant="secondary">Editable</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Services</span>
                    <Badge variant="secondary">Editable</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">About Us</span>
                    <Badge variant="secondary">Editable</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Contact Info</span>
                    <Badge variant="secondary">Editable</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Editor */}
        <ContentEditor />
      </div>
    </AdminLayout>
  );
};

export default Admin;
