import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { appointmentAPI, type Appointment } from "@/services/api";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TherapistDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [therapistName, setTherapistName] = useState("");
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>(
    []
  );
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(
    async (therapistId: string) => {
      try {
        setLoading(true);

        const appointments: Appointment[] = await appointmentAPI.getByTherapist(
          therapistId
        );

        // Separate appointments by status and time
        const now = new Date();
        const pending: Appointment[] = [];
        const upcoming: Appointment[] = [];
        const past: Appointment[] = [];

        appointments.forEach((apt) => {
          const startTime = new Date(apt.startTime);

          if (apt.status === "requested") {
            pending.push(apt);
          } else if (startTime >= now && apt.status === "confirmed") {
            upcoming.push(apt);
          } else if (startTime < now) {
            past.push(apt);
          }
        });

        // Sort pending by date ascending
        pending.sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
        // Sort upcoming by date ascending
        upcoming.sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
        // Sort past by date descending
        past.sort(
          (a, b) =>
            new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );

        setPendingAppointments(pending);
        setUpcomingAppointments(upcoming);
        setPastAppointments(past);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load appointments";
        console.error("Error fetching appointments:", error);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    // Check authentication
    const authToken = localStorage.getItem("auth_token");
    const userType = localStorage.getItem("user_type");
    const therapistId = localStorage.getItem("therapist_id");

    if (!authToken || userType !== "therapist") {
      navigate("/echanneling/login");
      return;
    }

    // Load therapist data
    const name = localStorage.getItem("user_name") || "Therapist";
    setTherapistName(name);

    // Fetch appointments
    fetchAppointments(therapistId!);
  }, [navigate, fetchAppointments]);

  const handleAcceptAppointment = async (appointmentId: string) => {
    try {
      await appointmentAPI.updateStatus(appointmentId, "confirmed");

      toast({
        title: "Success",
        description: "Appointment accepted successfully",
      });

      // Refresh appointments
      const therapistId = localStorage.getItem("therapist_id");
      if (therapistId) {
        await fetchAppointments(therapistId);
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

      // Refresh appointments
      const therapistId = localStorage.getItem("therapist_id");
      if (therapistId) {
        await fetchAppointments(therapistId);
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

  const renderPendingAppointmentCard = (appointment: Appointment) => (
    <Card key={appointment.appointmentId} className="mb-4 border-yellow-500/50">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {appointment.patientName || `Patient ${appointment.patientId}`}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(appointment.startTime)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatTime(appointment.startTime)} -{" "}
                {formatTime(appointment.endTime)}
              </span>
            </CardDescription>
          </div>
          {getStatusBadge(appointment.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm">
              <strong>Type:</strong> {appointment.type}
            </p>
            {appointment.notes && (
              <p className="text-sm mt-2">
                <strong>Notes:</strong> {appointment.notes}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleAcceptAppointment(appointment.appointmentId)}
              className="flex-1"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Accept
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                handleDeclineAppointment(appointment.appointmentId)
              }
              className="flex-1"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Decline
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderAppointmentCard = (appointment: Appointment) => (
    <Card key={appointment.appointmentId} className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {appointment.patientName || `Patient ${appointment.patientId}`}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(appointment.startTime)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatTime(appointment.startTime)} -{" "}
                {formatTime(appointment.endTime)}
              </span>
            </CardDescription>
          </div>
          {getStatusBadge(appointment.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm">
            <strong>Type:</strong> {appointment.type}
          </p>
          {appointment.notes && (
            <p className="text-sm">
              <strong>Notes:</strong> {appointment.notes}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome, Dr. {therapistName}!
          </h1>
          <p className="text-muted-foreground">
            Manage your appointments and profile
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate("/echanneling/therapist/profile")}
          >
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Edit className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Edit Profile</CardTitle>
                  <CardDescription>
                    Update your professional information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Pending Appointment Requests */}
        {pendingAppointments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-yellow-600">
              Pending Requests ({pendingAppointments.length})
            </h2>
            {pendingAppointments.map(renderPendingAppointmentCard)}
          </div>
        )}

        {/* Upcoming Appointments */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Upcoming Appointments</h2>
          {upcomingAppointments.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No upcoming appointments
                </p>
              </CardContent>
            </Card>
          ) : (
            upcomingAppointments.map(renderAppointmentCard)
          )}
        </div>

        {/* Past Appointments */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Past Appointments</h2>
          {pastAppointments.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No past appointments
                </p>
              </CardContent>
            </Card>
          ) : (
            pastAppointments.slice(0, 5).map(renderAppointmentCard)
          )}
        </div>
      </div>
    </div>
  );
}
