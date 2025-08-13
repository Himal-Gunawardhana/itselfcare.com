import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Activity, LogOut, Eye } from "lucide-react";
import companylogo from "@/assets/Itself_logo.jpg";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="bg-primary text-primary-foreground border-b">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-8 h-8 bg-primary-foreground/10 rounded-lg">
                  <img
                    src={companylogo}
                    alt="Itself_logo.jpg"
                    className="w-10 h-10 rounded-lg"
                  />
                </div>
                <span className="text-lg font-bold">itselfcare</span>
              </div>
              <div className="hidden md:block">
                <span className="text-sm opacity-80">/ {title}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open("/", "_blank")}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview Site
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="container mx-auto px-4 lg:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground">Manage your website content</p>
        </div>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
