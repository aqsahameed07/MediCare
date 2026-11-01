import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Check, Clock3, X } from "lucide-react";
import { toast } from "sonner";
import {
  appointmentsApi,
  formatAppointmentDate,
  type Appointment,
  type AppointmentStatus,
} from "@/api/appointmentsApi";
import { DashboardShell } from "@/components/dashboard/shell";
import { Avatar, doctorPersona, StatusBadge } from "@/components/dashboard/common";
import { EmptyState } from "@/components/dashboard/states";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { doctorNav } from "@/lib/nav";

export const Route = createFileRoute("/doctor/appointments")({
  head: () => ({
    meta: [
      { title: "Appointment Board — MediAI Care" },
      { name: "description", content: "Review requests and manage patient appointments." },
      { property: "og:title", content: "Appointment Board — MediAI Care" },
      { property: "og:description", content: "Manage your patient appointments." },
    ],
  }),
  component: AppointmentBoard,
});

const columns: { status: AppointmentStatus; title: string }[] = [
  { status: "requested", title: "Requests" },
  { status: "confirmed", title: "Confirmed" },
  { status: "completed", title: "Completed" },
  { status: "cancelled", title: "Cancelled" },
];

function AppointmentBoard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const loadAppointments = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setAppointments(await appointmentsApi.list());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load appointments";
      setLoadError(message);
      toast.error("Could not load appointments", { description: message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAppointments();
  }, []);

  const updateStatus = async (appointment: Appointment, status: AppointmentStatus) => {
    if (pendingId) return;
    setPendingId(appointment.id);
    try {
      const updated = await appointmentsApi.updateStatus(appointment.id, status);
      setAppointments((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      const message: Record<AppointmentStatus, string> = {
        requested: "Appointment request received",
        confirmed: "Appointment confirmed",
        completed: "Appointment marked complete",
        cancelled: "Appointment declined",
      };
      toast.success(message[status]);
    } catch (error) {
      toast.error("Could not update appointment", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setPendingId(null);
    }
  };

  return (
    <DashboardShell
      title="Appointments"
      subtitle="Review requests, confirm visits and update appointment outcomes"
      nav={doctorNav}
      role="Doctor"
      persona={doctorPersona}
    >
      {loading ? (
        <GlassCard className="py-10 text-center text-sm text-muted-foreground">
          Loading your appointments…
        </GlassCard>
      ) : loadError ? (
        <GlassCard className="py-10 text-center">
          <p className="text-sm text-destructive">{loadError}</p>
          <Button variant="outline" className="mt-3" onClick={() => void loadAppointments()}>
            Try again
          </Button>
        </GlassCard>
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No appointments yet"
          description="Patient appointment requests will appear here."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {columns.map((column) => {
            const items = appointments.filter((item) => item.status === column.status);
            return (
              <section
                key={column.status}
                className="glass min-h-72 rounded-2xl p-3"
                aria-label={`${column.title} appointments`}
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 className="text-sm font-semibold">{column.title}</h2>
                  <span className="rounded-full bg-muted px-2 text-xs">{items.length}</span>
                </div>
                {items.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border/70 px-3 py-6 text-center text-xs text-muted-foreground">
                    Nothing here
                  </p>
                ) : (
                  <div className="space-y-2">
                    {items.map((appointment) => (
                      <GlassCard key={appointment.id} className="space-y-3 p-3">
                        <div className="flex items-center gap-2">
                          <Avatar
                            name={appointment.patient?.name ?? "Patient"}
                            hue={150}
                            size={32}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {appointment.patient?.name ?? "Patient"}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {appointment.patient?.email}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p className="flex items-center gap-1.5">
                            <Clock3 className="h-3.5 w-3.5" />
                            {formatAppointmentDate(appointment.date)} · {appointment.slot}
                          </p>
                          {appointment.notes && (
                            <p className="pt-1 text-foreground">Note: {appointment.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <StatusBadge status={appointment.status} />
                          {appointment.status === "requested" && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                className="h-7 px-2"
                                disabled={pendingId !== null}
                                onClick={() => void updateStatus(appointment, "confirmed")}
                              >
                                <Check className="mr-1 h-3.5 w-3.5" />
                                Confirm
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                aria-label="Decline appointment"
                                disabled={pendingId !== null}
                                onClick={() => void updateStatus(appointment, "cancelled")}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          {appointment.status === "confirmed" && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2"
                                disabled={pendingId !== null}
                                onClick={() => void updateStatus(appointment, "completed")}
                              >
                                Complete
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                aria-label="Cancel appointment"
                                disabled={pendingId !== null}
                                onClick={() => void updateStatus(appointment, "cancelled")}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
