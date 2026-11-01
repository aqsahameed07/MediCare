import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  appointmentsApi,
  formatAppointmentDate,
  localDateString,
  type Appointment,
  type AppointmentDoctor,
  type AppointmentStatus,
} from "@/api/appointmentsApi";
import { DashboardShell } from "@/components/dashboard/shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/dashboard/states";
import { Avatar, StatusBadge, patientPersona } from "@/components/dashboard/common";
import { patientNav } from "@/lib/nav";

export const Route = createFileRoute("/patient/appointments")({
  head: () => ({
    meta: [
      { title: "Appointments — MediAI Care" },
      { name: "description", content: "Book, view and manage your doctor appointments." },
      { property: "og:title", content: "Appointments — MediAI Care" },
      { property: "og:description", content: "Book and manage your doctor appointments." },
    ],
  }),
  component: AppointmentsPage,
});

type StatusFilter = AppointmentStatus | "all";

function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<AppointmentDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<StatusFilter>("all");
  const [open, setOpen] = useState(false);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState<Date | undefined>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [slot, setSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [pending, setPending] = useState(false);

  const selectedDate = date ? localDateString(date) : "";

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [appointmentsResult, doctorResult] = await Promise.all([
        appointmentsApi.list(),
        appointmentsApi.doctors(),
      ]);
      setAppointments(appointmentsResult);
      setDoctors(doctorResult);
      setDoctorId((current) => current || doctorResult[0]?.id || "");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load appointments";
      setLoadError(message);
      toast.error("Could not load appointments", { description: message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (!open || !doctorId || !selectedDate) {
      setAvailableSlots([]);
      return;
    }
    let active = true;
    setSlotsLoading(true);
    setSlot("");
    appointmentsApi
      .availability(doctorId, selectedDate)
      .then((slots) => {
        if (active) setAvailableSlots(slots);
      })
      .catch((error: unknown) => {
        if (active) {
          setAvailableSlots([]);
          toast.error("Could not load available times", {
            description: error instanceof Error ? error.message : "Please try again",
          });
        }
      })
      .finally(() => {
        if (active) setSlotsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open, doctorId, selectedDate]);

  const filtered = useMemo(
    () =>
      tab === "all"
        ? appointments
        : appointments.filter((appointment) => appointment.status === tab),
    [appointments, tab],
  );

  const book = async () => {
    if (!doctorId || !selectedDate || !slot || pending) return;
    setPending(true);
    try {
      const appointment = await appointmentsApi.create({
        doctorId,
        date: selectedDate,
        slot,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });
      setAppointments((current) =>
        [...current, appointment].sort((a, b) =>
          `${a.date} ${a.slot}`.localeCompare(`${b.date} ${b.slot}`),
        ),
      );
      const doctor = doctors.find((item) => item.id === doctorId);
      toast.success("Appointment requested", {
        description: `${doctor?.name ?? "Your doctor"} · ${formatAppointmentDate(selectedDate)} at ${slot}`,
      });
      setOpen(false);
      setSlot("");
      setNotes("");
    } catch (error) {
      toast.error("Could not book appointment", {
        description: error instanceof Error ? error.message : "Please try again",
      });
      if (error instanceof Error && "status" in error) {
        void appointmentsApi
          .availability(doctorId, selectedDate)
          .then(setAvailableSlots)
          .catch(() => setAvailableSlots([]));
      }
    } finally {
      setPending(false);
    }
  };

  const cancel = async (appointment: Appointment) => {
    if (pending) return;
    setPending(true);
    try {
      const updated = await appointmentsApi.updateStatus(appointment.id, "cancelled");
      setAppointments((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      toast.success("Appointment cancelled");
    } catch (error) {
      toast.error("Could not cancel appointment", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <DashboardShell
      title="Appointments"
      subtitle="Book a visit and track your appointment requests"
      nav={patientNav}
      role="Patient"
      persona={patientPersona}
      actions={
        <Dialog
          open={open}
          onOpenChange={(nextOpen) => {
            setOpen(nextOpen);
            if (!nextOpen) setSlot("");
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl" disabled={doctors.length === 0}>
              <Plus className="mr-1 h-4 w-4" />
              Book
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl rounded-2xl">
            <DialogHeader>
              <DialogTitle>Request an appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select
                value={doctorId}
                onValueChange={(value) => {
                  setDoctorId(value);
                  setSlot("");
                }}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Choose a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name} · {doctor.specialization ?? doctor.department ?? "Doctor"}
                      {doctor.consultationFee !== null ? ` · $${doctor.consultationFee}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(nextDate) => {
                    setDate(nextDate);
                    setSlot("");
                  }}
                  disabled={{
                    before: (() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      tomorrow.setHours(0, 0, 0, 0);
                      return tomorrow;
                    })(),
                  }}
                  className="rounded-xl border"
                />
                <div>
                  <p className="mb-2 text-sm font-medium">Available times</p>
                  {slotsLoading ? (
                    <p className="text-sm text-muted-foreground">Checking availability…</p>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No times are available for this date. Choose another date.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((availableSlot) => (
                        <button
                          key={availableSlot}
                          type="button"
                          onClick={() => setSlot(availableSlot)}
                          className={`rounded-lg border px-2 py-2 text-xs transition-colors ${
                            slot === availableSlot
                              ? "gradient-primary border-transparent text-primary-foreground"
                              : "hover:border-primary hover:text-primary"
                          }`}
                        >
                          {availableSlot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Textarea
                value={notes}
                maxLength={1000}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Reason for visit or notes for the doctor (optional)"
              />
              <Button
                disabled={!slot || !selectedDate || !doctorId || pending || slotsLoading}
                onClick={() => void book()}
                className="w-full rounded-xl"
              >
                {pending ? "Requesting…" : "Request appointment"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <Tabs value={tab} onValueChange={(value) => setTab(value as StatusFilter)} className="mb-4">
        <TabsList className="rounded-xl">
          {(["all", "requested", "confirmed", "completed", "cancelled"] as const).map((status) => (
            <TabsTrigger key={status} value={status} className="capitalize">
              {status}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <GlassCard className="py-10 text-center text-sm text-muted-foreground">
          Loading your appointments…
        </GlassCard>
      ) : loadError ? (
        <GlassCard className="py-10 text-center">
          <p className="text-sm text-destructive">{loadError}</p>
          <Button variant="outline" className="mt-3" onClick={() => void loadData()}>
            Try again
          </Button>
        </GlassCard>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No appointments"
          description="Your bookings and appointment requests will appear here."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((appointment) => (
            <GlassCard key={appointment.id} className="flex items-center gap-4">
              {appointment.doctor?.profilePhoto ? (
                <img
                  src={appointment.doctor.profilePhoto}
                  alt={appointment.doctor.name}
                  className="h-11 w-11 shrink-0 rounded-full object-cover"
                />
              ) : (
                <Avatar name={appointment.doctor?.name ?? "Doctor"} hue={180} size={44} />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{appointment.doctor?.name ?? "Doctor"}</p>
                <p className="text-xs text-muted-foreground">
                  {appointment.doctor?.specialization ??
                    appointment.doctor?.department ??
                    "Appointment"}
                </p>
                <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays className="h-3 w-3" />
                  {formatAppointmentDate(appointment.date)} · {appointment.slot}
                </p>
                {appointment.notes && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    Note: {appointment.notes}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={appointment.status} />
                {(appointment.status === "requested" || appointment.status === "confirmed") && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    disabled={pending}
                    onClick={() => void cancel(appointment)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
