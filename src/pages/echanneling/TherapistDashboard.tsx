import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  appointmentAPI,
  patientAPI,
  messagingAPI,
  therapistAPI,
  type Appointment,
} from "@/services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Edit,
  CheckCircle,
  XCircle,
  TrendingUp,
  DollarSign,
  Users,
  MessageSquare,
  Star,
  Activity,
  Bell,
  Filter,
  Search,
  BarChart3,
  AlertCircle,
  Video,
  Home,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Target,
  Award,
  Clock3,
  UserCheck,
  CalendarCheck,
  MessageCircle,
  Send,
  Briefcase,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import GlobalHeader from "@/components/GlobalHeader";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface DashboardMetrics {
  totalRevenue: number;
  revenueGrowth: number;
  totalPatients: number;
  patientGrowth: number;
  appointmentsToday: number;
  appointmentsTrend: number;
  averageRating: number;
  completionRate: number;
  responseTime: number;
  unreadMessages: number;
}

interface PatientInfo {
  patientId: string;
  name: string;
  lastAppointment?: string;
  totalAppointments: number;
  status: "active" | "inactive" | "new";
}

interface QuickReplyTemplate {
  id: string;
  title: string;
  message: string;
}

export default function TherapistDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Basic state
  const [therapistName, setTherapistName] = useState("");
  const [therapistId, setTherapistId] = useState("");
  const [loading, setLoading] = useState(true);

  // Appointments state
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>(
    []
  );
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);

  // Dashboard metrics
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRevenue: 0,
    revenueGrowth: 0,
    totalPatients: 0,
    patientGrowth: 0,
    appointmentsToday: 0,
    appointmentsTrend: 0,
    averageRating: 0,
    completionRate: 0,
    responseTime: 0,
    unreadMessages: 0,
  });

  // Patients state
  const [patients, setPatients] = useState<PatientInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [patientFilter, setPatientFilter] = useState<"all" | "active" | "new">(
    "all"
  );

  // Messages state
  const [recentMessages, setRecentMessages] = useState<
    {
      conversationId: string;
      patientName: string;
      lastMessage?: string;
      unreadCount?: number;
    }[]
  >([]);
  const [quickReply, setQuickReply] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<string>("");

  // Quick reply templates
  const quickReplyTemplates: QuickReplyTemplate[] = [
    {
      id: "1",
      title: "Confirm Appointment",
      message:
        "Thank you for booking. Your appointment is confirmed for the scheduled time. Please arrive 10 minutes early.",
    },
    {
      id: "2",
      title: "Follow-up",
      message:
        "How are you feeling after our last session? Please let me know if you have any concerns.",
    },
    {
      id: "3",
      title: "Reschedule",
      message:
        "I understand you need to reschedule. Please let me know your preferred times and I'll do my best to accommodate.",
    },
    {
      id: "4",
      title: "Treatment Plan",
      message:
        "Based on our assessment, I've prepared a personalized treatment plan. Let's discuss it in our next session.",
    },
  ];

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(
    async (therapistId: string) => {
      console.log("Fetching dashboard data for therapist:", therapistId);
      try {
        setLoading(true);

        // Fetch appointments
        console.log("Fetching appointments...");
        const appointments: Appointment[] = await appointmentAPI.getByTherapist(
          therapistId
        );
        console.log("Appointments fetched:", appointments.length);

        // Process appointments
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        const pending: Appointment[] = [];
        const upcoming: Appointment[] = [];
        const past: Appointment[] = [];
        const todayAppts: Appointment[] = [];

        let completedCount = 0;
        let totalRevenueCalc = 0;

        appointments.forEach((apt) => {
          const startTime = new Date(apt.startTime);
          const aptDate = new Date(
            startTime.getFullYear(),
            startTime.getMonth(),
            startTime.getDate()
          );

          // Today's appointments
          if (aptDate.getTime() === today.getTime()) {
            todayAppts.push(apt);
          }

          if (apt.status === "requested") {
            pending.push(apt);
          } else if (apt.status === "confirmed" && startTime >= now) {
            upcoming.push(apt);
          } else if (apt.status === "completed" || startTime < now) {
            past.push(apt);
            if (apt.status === "completed") {
              completedCount++;
              // Estimate revenue (you can fetch actual rates from therapist profile)
              totalRevenueCalc += 75; // Average session rate
            }
          }
        });

        setPendingAppointments(pending);
        setUpcomingAppointments(upcoming);
        setPastAppointments(past);
        setTodayAppointments(todayAppts);

        // Calculate metrics
        const uniquePatients = new Set(
          appointments.map((apt) => apt.patientId)
        );
        const completionRate =
          appointments.length > 0
            ? (completedCount / appointments.length) * 100
            : 0;

        // Fetch therapist data for rating
        let avgRating = 0;
        try {
          const therapistData = await therapistAPI.getById(therapistId);
          avgRating = therapistData.averageRating || 0;
        } catch (error) {
          console.log("Could not fetch therapist rating", error);
        }

        // Fetch messages
        let unreadCount = 0;
        try {
          const conversationsData = await messagingAPI.getConversations(
            therapistId,
            "therapist"
          );
          const conversations = conversationsData.conversations || [];
          unreadCount = conversations.reduce(
            (sum, conv) => sum + (conv.unreadCount || 0),
            0
          );
          setRecentMessages(conversations.slice(0, 5));
        } catch (error) {
          console.log("Could not fetch messages", error);
          setRecentMessages([]);
        }

        // Always set metrics (even if some API calls failed)
        setMetrics({
          totalRevenue: totalRevenueCalc,
          revenueGrowth: 12.5, // Mock data - calculate from historical
          totalPatients: uniquePatients.size,
          patientGrowth: 8.3,
          appointmentsToday: todayAppts.length,
          appointmentsTrend: todayAppts.length > 0 ? 5.2 : -2.1,
          averageRating: avgRating,
          completionRate: completionRate,
          responseTime: 2.5, // Mock - calculate from messaging data
          unreadMessages: unreadCount,
        });

        // Build patient info
        const patientMap = new Map<string, PatientInfo>();
        appointments.forEach((apt) => {
          if (!patientMap.has(apt.patientId)) {
            patientMap.set(apt.patientId, {
              patientId: apt.patientId,
              name: apt.patientName || "Unknown Patient",
              totalAppointments: 1,
              status: "active",
            });
          } else {
            const patient = patientMap.get(apt.patientId)!;
            patient.totalAppointments++;
          }
        });
        setPatients(Array.from(patientMap.values()));
        console.log("Dashboard data loaded successfully");
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load dashboard data";
        console.error("Error fetching dashboard data:", error);
        console.error("Error details:", {
          message: errorMessage,
          therapistId,
          error,
        });
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        // Set empty states on error
        setMetrics({
          totalRevenue: 0,
          revenueGrowth: 0,
          totalPatients: 0,
          patientGrowth: 0,
          appointmentsToday: 0,
          appointmentsTrend: 0,
          averageRating: 0,
          completionRate: 0,
          responseTime: 0,
          unreadMessages: 0,
        });
      } finally {
        console.log("Setting loading to false");
        setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    // Check authentication
    const authToken = localStorage.getItem("auth_token");
    const userType = localStorage.getItem("user_type");
    const tId = localStorage.getItem("therapist_id");

    console.log("TherapistDashboard useEffect - Auth check:", {
      authToken: !!authToken,
      userType,
      therapistId: tId,
    });

    if (!authToken || userType !== "therapist") {
      console.log("Not authenticated as therapist, redirecting to login");
      navigate("/echanneling/login");
      return;
    }

    setTherapistName(localStorage.getItem("user_name") || "Therapist");
    setTherapistId(tId || "");

    if (tId) {
      console.log("Fetching dashboard data for therapist ID:", tId);
      fetchDashboardData(tId);
    } else {
      console.error("No therapist_id found in localStorage!");
      setLoading(false);
      toast({
        title: "Error",
        description: "Therapist ID not found. Please log in again.",
        variant: "destructive",
      });
    }
  }, [navigate, fetchDashboardData, toast]);

  const handleAcceptAppointment = async (appointmentId: string) => {
    try {
      await appointmentAPI.updateStatus(appointmentId, "confirmed");
      toast({
        title: "Success",
        description: "Appointment accepted successfully",
      });
      if (therapistId) {
        await fetchDashboardData(therapistId);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to accept appointment";
      console.error("Error accepting appointment:", error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDeclineAppointment = async (appointmentId: string) => {
    try {
      await appointmentAPI.updateStatus(appointmentId, "cancelled");
      toast({
        title: "Success",
        description: "Appointment declined",
      });
      if (therapistId) {
        await fetchDashboardData(therapistId);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to decline appointment";
      console.error("Error declining appointment:", error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: {
      [key: string]: "default" | "secondary" | "destructive" | "outline";
    } = {
      confirmed: "default",
      requested: "secondary",
      completed: "outline",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "home":
        return <Home className="h-4 w-4" />;
      case "clinic":
        return <Building2 className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const handleSendQuickReply = async () => {
    if (!quickReply.trim() || !selectedConversation) {
      toast({
        title: "Info",
        description: "Please select a conversation and type a message",
      });
      return;
    }

    // Navigate to full messages page for sending
    navigate("/echanneling/therapist/messages");
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = patient.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      patientFilter === "all" || patient.status === patientFilter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <>
        <GlobalHeader
          userName={therapistName}
          userType="therapist"
          onMessagesClick={() => navigate("/echanneling/therapist/messages")}
          onHelpClick={() => navigate("/help")}
        />
        <div className="min-h-screen bg-background pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">
                  Loading dashboard...
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <GlobalHeader
        userName={therapistName}
        userType="therapist"
        unreadCount={metrics.unreadMessages}
        onMessagesClick={() => navigate("/echanneling/therapist/messages")}
        onHelpClick={() => navigate("/help")}
      />

      <div className="min-h-screen bg-gradient-subtle pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Welcome back, Dr. {therapistName}!
                </h1>
                <p className="text-muted-foreground">
                  Here's what's happening with your practice today
                </p>
              </div>
              <Button
                onClick={() => navigate("/echanneling/therapist/profile")}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Revenue Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${metrics.totalRevenue.toFixed(0)}
                </div>
                <div className="flex items-center text-sm mt-2">
                  {metrics.revenueGrowth >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span
                    className={
                      metrics.revenueGrowth >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {Math.abs(metrics.revenueGrowth)}%
                  </span>
                  <span className="text-muted-foreground ml-1">this month</span>
                </div>
              </CardContent>
            </Card>

            {/* Patients Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Patients
                </CardTitle>
                <Users className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {metrics.totalPatients}
                </div>
                <div className="flex items-center text-sm mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-green-600">
                    {metrics.patientGrowth}%
                  </span>
                  <span className="text-muted-foreground ml-1">
                    new patients
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Today's Appointments */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Today's Sessions
                </CardTitle>
                <CalendarCheck className="h-5 w-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {metrics.appointmentsToday}
                </div>
                <div className="flex items-center text-sm mt-2">
                  {metrics.appointmentsTrend >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span
                    className={
                      metrics.appointmentsTrend >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {Math.abs(metrics.appointmentsTrend)}%
                  </span>
                  <span className="text-muted-foreground ml-1">
                    vs last week
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Rating Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Rating
                </CardTitle>
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {metrics.averageRating.toFixed(1)}
                </div>
                <div className="flex items-center text-sm mt-2">
                  <Award className="h-4 w-4 text-yellow-600 mr-1" />
                  <span className="text-muted-foreground">
                    {metrics.completionRate.toFixed(0)}% completion rate
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="appointments"
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Appointments
              </TabsTrigger>
              <TabsTrigger value="patients" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Patients
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Messages
                {metrics.unreadMessages > 0 && (
                  <Badge
                    variant="destructive"
                    className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {metrics.unreadMessages}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Performance Insights */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Performance Insights
                    </CardTitle>
                    <CardDescription>
                      Your key performance indicators
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          Completion Rate
                        </span>
                        <span className="text-sm font-bold">
                          {metrics.completionRate.toFixed(0)}%
                        </span>
                      </div>
                      <Progress
                        value={metrics.completionRate}
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          Patient Satisfaction
                        </span>
                        <span className="text-sm font-bold">
                          {(metrics.averageRating * 20).toFixed(0)}%
                        </span>
                      </div>
                      <Progress
                        value={metrics.averageRating * 20}
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          Response Time
                        </span>
                        <span className="text-sm font-bold">
                          {metrics.responseTime}h avg
                        </span>
                      </div>
                      <Progress
                        value={(5 - metrics.responseTime) * 20}
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Target: &lt; 3 hours
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() =>
                        navigate("/echanneling/therapist/messages")
                      }
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      View All Messages
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigate("/echanneling/therapist/profile")}
                    >
                      <UserCheck className="mr-2 h-4 w-4" />
                      Update Availability
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Briefcase className="mr-2 h-4 w-4" />
                      View Reports
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Pending Requests */}
              {pendingAppointments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-orange-600" />
                      Pending Appointment Requests
                      <Badge variant="secondary">
                        {pendingAppointments.length}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Review and respond to patient requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pendingAppointments.slice(0, 3).map((appointment) => (
                        <div
                          key={appointment.appointmentId}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarFallback>
                                {appointment.patientName?.charAt(0) || "P"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">
                                {appointment.patientName || "Unknown Patient"}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {getTypeIcon(appointment.type)}
                                <span>{formatDate(appointment.startTime)}</span>
                                <span>•</span>
                                <Clock className="h-3 w-3" />
                                <span>{formatTime(appointment.startTime)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleAcceptAppointment(
                                  appointment.appointmentId
                                )
                              }
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleDeclineAppointment(
                                  appointment.appointmentId
                                )
                              }
                            >
                              <XCircle className="mr-1 h-4 w-4" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Today's Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock3 className="h-5 w-5" />
                    Today's Schedule
                  </CardTitle>
                  <CardDescription>
                    {todayAppointments.length} appointments scheduled for today
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {todayAppointments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No appointments scheduled for today
                    </p>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3">
                        {todayAppointments.map((appointment) => (
                          <div
                            key={appointment.appointmentId}
                            className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex-shrink-0">
                              <div className="text-center">
                                <div className="text-2xl font-bold">
                                  {new Date(
                                    appointment.startTime
                                  ).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  })}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(
                                    appointment.endTime
                                  ).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  })}
                                </div>
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold">
                                {appointment.patientName || "Unknown Patient"}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                {getTypeIcon(appointment.type)}
                                <span className="capitalize">
                                  {appointment.type} session
                                </span>
                                <span>•</span>
                                {getStatusBadge(appointment.status)}
                              </div>
                            </div>
                            {appointment.status === "confirmed" && (
                              <Button size="sm" variant="outline">
                                <Video className="mr-2 h-4 w-4" />
                                Start Session
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appointments Tab */}
            <TabsContent value="appointments" className="space-y-6">
              {/* Pending Appointments */}
              {pendingAppointments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Pending Requests ({pendingAppointments.length})
                    </CardTitle>
                    <CardDescription>
                      New appointment requests awaiting your response
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {pendingAppointments.map((appointment) => (
                      <Card key={appointment.appointmentId}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback>
                                    {appointment.patientName?.charAt(0) || "P"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-semibold text-lg">
                                    {appointment.patientName ||
                                      "Unknown Patient"}
                                  </h3>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    {getStatusBadge(appointment.status)}
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    {formatDate(appointment.startTime)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    {formatTime(appointment.startTime)} -{" "}
                                    {formatTime(appointment.endTime)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getTypeIcon(appointment.type)}
                                  <span className="capitalize">
                                    {appointment.type} Session
                                  </span>
                                </div>
                              </div>
                              {appointment.notes && (
                                <div className="mt-3 p-3 bg-muted rounded-md">
                                  <p className="text-sm">
                                    <strong>Notes:</strong> {appointment.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-2 ml-4">
                              <Button
                                onClick={() =>
                                  handleAcceptAppointment(
                                    appointment.appointmentId
                                  )
                                }
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Accept
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() =>
                                  handleDeclineAppointment(
                                    appointment.appointmentId
                                  )
                                }
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Decline
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Upcoming Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Upcoming Appointments ({upcomingAppointments.length})
                  </CardTitle>
                  <CardDescription>
                    Confirmed sessions scheduled
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingAppointments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No upcoming appointments
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {upcomingAppointments.slice(0, 5).map((appointment) => (
                        <Card key={appointment.appointmentId}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback>
                                    {appointment.patientName?.charAt(0) || "P"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-semibold">
                                    {appointment.patientName ||
                                      "Unknown Patient"}
                                  </h4>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                      {formatDate(appointment.startTime)}
                                    </span>
                                    <span>•</span>
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      {formatTime(appointment.startTime)}
                                    </span>
                                    <span>•</span>
                                    {getTypeIcon(appointment.type)}
                                    <span className="capitalize">
                                      {appointment.type}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {getStatusBadge(appointment.status)}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Past Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Recent History ({pastAppointments.length})
                  </CardTitle>
                  <CardDescription>
                    Past appointments and sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pastAppointments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No past appointments
                    </p>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3">
                        {pastAppointments.slice(0, 10).map((appointment) => (
                          <div
                            key={appointment.appointmentId}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {appointment.patientName?.charAt(0) || "P"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">
                                  {appointment.patientName || "Unknown Patient"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(appointment.startTime)} •{" "}
                                  {formatTime(appointment.startTime)}
                                </p>
                              </div>
                            </div>
                            {getStatusBadge(appointment.status)}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Patients Tab */}
            <TabsContent value="patients" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Patient Management</CardTitle>
                  <CardDescription>
                    View and manage your patient roster
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Search and Filter */}
                  <div className="flex gap-4 mb-6">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search patients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select
                      value={patientFilter}
                      onValueChange={(v: "all" | "active" | "new") =>
                        setPatientFilter(v)
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Patients</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Patient List */}
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {filteredPatients.map((patient) => (
                        <Card
                          key={patient.patientId}
                          className="hover:shadow-md transition-shadow"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                  <AvatarFallback>
                                    {patient.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-semibold">
                                    {patient.name}
                                  </h4>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Activity className="h-3 w-3" />
                                    <span>
                                      {patient.totalAppointments} sessions
                                    </span>
                                    {patient.lastAppointment && (
                                      <>
                                        <span>•</span>
                                        <span>
                                          Last:{" "}
                                          {formatDate(patient.lastAppointment)}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    patient.status === "active"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {patient.status}
                                </Badge>
                                <Button size="sm" variant="ghost">
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Conversations List */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Conversations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-2">
                        {recentMessages.map(
                          (conv: {
                            conversationId: string;
                            patientName: string;
                            lastMessage?: string;
                            unreadCount?: number;
                          }) => (
                            <div
                              key={conv.conversationId}
                              onClick={() =>
                                setSelectedConversation(conv.conversationId)
                              }
                              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                selectedConversation === conv.conversationId
                                  ? "bg-primary/10 border-primary"
                                  : "hover:bg-accent"
                              } border`}
                            >
                              <div className="flex items-start gap-2">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback>
                                    {conv.patientName?.charAt(0) || "P"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-sm truncate">
                                      {conv.patientName}
                                    </h4>
                                    {conv.unreadCount > 0 && (
                                      <Badge
                                        variant="destructive"
                                        className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                                      >
                                        {conv.unreadCount}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate mt-1">
                                    {conv.lastMessage || "No messages"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Message Center */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Quick Reply Center</CardTitle>
                    <CardDescription>
                      Send quick responses to patient messages
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Quick Reply Templates */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Quick Reply Templates
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {quickReplyTemplates.map((template) => (
                          <Button
                            key={template.id}
                            variant="outline"
                            size="sm"
                            onClick={() => setQuickReply(template.message)}
                            className="justify-start text-left h-auto py-2"
                          >
                            <div>
                              <div className="font-semibold text-xs">
                                {template.title}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {template.message.substring(0, 40)}...
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Message Compose */}
                    <div className="space-y-2">
                      <Label>Compose Message</Label>
                      <Textarea
                        placeholder="Type your message here..."
                        value={quickReply}
                        onChange={(e) => setQuickReply(e.target.value)}
                        rows={6}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSendQuickReply}
                          disabled={!quickReply.trim() || !selectedConversation}
                          className="flex-1"
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            navigate("/echanneling/therapist/messages")
                          }
                        >
                          View All Messages
                        </Button>
                      </div>
                    </div>

                    {/* Performance Tips */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100">
                            Quick Response Tip
                          </h4>
                          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                            Responding within 2 hours improves patient
                            satisfaction by 40% and increases booking rates.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
