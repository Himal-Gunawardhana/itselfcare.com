import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { appointmentAPI, type Appointment } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, MapPin, Plus, Edit } from "lucide-react";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patientName, setPatientName] = useState("");
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(
    async (patientId: string) => {
      try {
        setLoading(true);
        setError(null);

        const appointments: Appointment[] = await appointmentAPI.getByPatient(
          patientId
        );

        // Separate upcoming and past appointments
        const now = new Date();
        const upcoming: Appointment[] = [];
        const past: Appointment[] = [];

        appointments.forEach((apt) => {
          const startTime = new Date(apt.startTime);
          if (startTime >= now) {
            upcoming.push(apt);
          } else {
            past.push(apt);
          }
        });

        // Sort upcoming by date ascending, past by date descending
        upcoming.sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
        past.sort(
          (a, b) =>
            new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );

        setUpcomingAppointments(upcoming);
        setPastAppointments(past);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load appointments";
        console.error("Error fetching appointments:", error);
        setError(errorMessage);
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
    const patientId = localStorage.getItem("patient_id");

    if (!authToken || userType !== "patient") {
      navigate("/echanneling/login");
      return;
    }

    // Load patient data
    const name = localStorage.getItem("user_name") || "Patient";
    setPatientName(name);

    // Fetch appointments
    fetchAppointments(patientId!);
  }, [navigate, fetchAppointments]);

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

  const renderAppointmentCard = (appointment: Appointment) => (
    <Card key={appointment.appointmentId} className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {appointment.therapistName ||
                `Therapist ${appointment.theraphistId}`}
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
          <h1 className="text-4xl font-bold mb-2">Welcome, {patientName}!</h1>
          <p className="text-muted-foreground">
            Manage your appointments and profile
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate("/echanneling/find-therapist")}
          >
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    Book New Appointment
                  </CardTitle>
                  <CardDescription>Find and book a therapist</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate("/echanneling/patient/profile")}
          >
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Edit className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Edit Profile</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

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
