import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Video,
  Home,
  Building,
  AlertCircle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { appointmentAPI, type Appointment } from "@/services/api";

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const patientId =
        localStorage.getItem("userId") ||
        localStorage.getItem("patient_id") ||
        "";
      const data = await appointmentAPI.getByPatient(patientId);

      // Sort by startTime
      const sorted = data.sort((a, b) => {
        const dateA = new Date(a.startTime);
        const dateB = new Date(b.startTime);
        return dateB.getTime() - dateA.getTime();
      });

      setAppointments(sorted);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCancelDialogOpen(true);
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      await appointmentAPI.updateStatus(
        selectedAppointment.appointmentId,
        "cancelled"
      );
      await fetchAppointments();
      setCancelDialogOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
      }
    > = {
      requested: { variant: "secondary", label: "Requested" },
      confirmed: { variant: "default", label: "Confirmed" },
      cancelled: { variant: "destructive", label: "Cancelled" },
      completed: { variant: "outline", label: "Completed" },
    };

    return (
      <Badge variant={config[status].variant}>{config[status].label}</Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-5 w-5" />;
      case "home-visit":
        return <Home className="h-5 w-5" />;
      case "in-person":
        return <Building className="h-5 w-5" />;
      default:
        return <Video className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "video":
        return "Video Consultation";
      case "home-visit":
        return "Home Visit";
      case "in-person":
        return "In-Person Visit";
      default:
        return "Appointment";
    }
  };

  const isUpcoming = (appointment: Appointment) => {
    const appointmentDate = new Date(appointment.startTime);
    return appointmentDate > new Date() && appointment.status !== "cancelled";
  };

  const upcomingAppointments = appointments.filter(isUpcoming);
  const pastAppointments = appointments.filter((a) => !isUpcoming(a));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Appointments</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your therapy appointments
        </p>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>
            Upcoming Appointments ({upcomingAppointments.length})
          </CardTitle>
          <CardDescription>Your scheduled therapy sessions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No upcoming appointments
            </div>
          ) : (
            upcomingAppointments.map((appointment) => (
              <Card key={appointment.appointmentId}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center text-white">
                          {getTypeIcon(appointment.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {appointment.therapistName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {getTypeLabel(appointment.type)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 ml-13">
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(appointment.startTime).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(appointment.startTime).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}{" "}
                            -{" "}
                            {new Date(appointment.endTime).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      {getStatusBadge(appointment.status)}

                      {appointment.status === "confirmed" && (
                        <div className="flex gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelClick(appointment)}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}

                      {appointment.status === "requested" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelClick(appointment)}
                        >
                          Cancel Request
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Past Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Past Appointments ({pastAppointments.length})</CardTitle>
          <CardDescription>Your appointment history</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pastAppointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No past appointments
            </div>
          ) : (
            pastAppointments.map((appointment) => (
              <Card key={appointment.appointmentId} className="opacity-75">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          {getTypeIcon(appointment.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {appointment.therapistName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {getTypeLabel(appointment.type)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 ml-13">
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(
                              appointment.startTime
                            ).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(appointment.startTime).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}{" "}
                            -{" "}
                            {new Date(appointment.endTime).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      {getStatusBadge(appointment.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Cancel Appointment
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment with{" "}
              <strong>{selectedAppointment?.therapistName}</strong> on{" "}
              {selectedAppointment &&
                new Date(selectedAppointment.startTime).toLocaleDateString()}
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelAppointment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Appointment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
