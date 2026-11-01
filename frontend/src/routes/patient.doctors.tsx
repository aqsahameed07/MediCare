import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { BadgeCheck, CalendarCheck, Search } from "lucide-react";
import { toast } from "sonner";
import {
  appointmentsApi,
  formatAppointmentDate,
  localDateString,
  type AppointmentDoctor,
} from "@/api/appointmentsApi";
import { DashboardShell } from "@/components/dashboard/shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, ListSkeleton } from "@/components/dashboard/states";
import { patientPersona } from "@/components/dashboard/common";
import { patientNav } from "@/lib/nav";

export const Route = createFileRoute("/patient/doctors")({
  head: () => ({
    meta: [
      { title: "Find Doctors — MediAI Care" },
      {
        name: "description",
        content: "Browse doctor profiles and request an appointment with a specialist.",
      },
      { property: "og:title", content: "Find Doctors — MediAI Care" },
      { property: "og:description", content: "Browse doctor profiles and request an appointment." },
    ],
  }),
  component: FindDoctors,
});

const BOOKING_DATES = Array.from({ length: 7 }, (_, index) => {
  const date = new Date();
  date.setDate(date.getDate() + index + 1);
  return localDateString(date);
});

function initials(name: string): string {
  return name
    .replace(/^Dr\.?\s*/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

function FindDoctors() {
  const [doctors, setDoctors] = useState<AppointmentDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [sort, setSort] = useState("experience");
  const [selected, setSelected] = useState<AppointmentDoctor | null>(null);
  const [date, setDate] = useState(BOOKING_DATES[0]!);
  const [slot, setSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booking, setBooking] = useState(false);

  const specialties = useMemo(
    () =>
      [
        ...new Set(
          doctors
            .map((doctor) => doctor.specialization)
            .filter((value): value is string => !!value),
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [doctors],
  );

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    const list = doctors.filter((doctor) => {
      const doctorSpecialty = doctor.specialization ?? doctor.department ?? "";
      return (
        (specialty === "all" || doctorSpecialty === specialty) &&
        (!query ||
          [doctor.name, doctorSpecialty, doctor.department, doctor.qualifications, doctor.bio].some(
            (value) => value?.toLowerCase().includes(query),
          ))
      );
    });
    return [...list].sort((a, b) => {
      if (sort === "fee") return (a.consultationFee ?? Infinity) - (b.consultationFee ?? Infinity);
      if (sort === "name") return a.name.localeCompare(b.name);
      return (b.yearsOfExperience ?? 0) - (a.yearsOfExperience ?? 0);
    });
  }, [doctors, q, sort, specialty]);

  const loadDoctors = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setDoctors(await appointmentsApi.doctors());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load doctors";
      setLoadError(message);
      toast.error("Could not load doctors", { description: message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDoctors();
  }, []);

  useEffect(() => {
    if (!selected) {
      setAvailableSlots([]);
      return;
    }
    let active = true;
    setSlotsLoading(true);
    setAvailableSlots([]);
    setSlot("");
    appointmentsApi
      .availability(selected.id, date)
      .then((slots) => {
        if (active) setAvailableSlots(slots);
      })
      .catch((error: unknown) => {
        if (active) {
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
  }, [selected, date]);

  const bookAppointment = async () => {
    if (!selected || !slot || booking) return;
    setBooking(true);
    try {
      await appointmentsApi.create({ doctorId: selected.id, date, slot });
      toast.success("Appointment requested", {
        description: `${selected.name} · ${formatAppointmentDate(date)} at ${slot}`,
      });
      setSelected(null);
      setSlot("");
    } catch (error) {
      toast.error("Could not request appointment", {
        description: error instanceof Error ? error.message : "Please try again",
      });
      void appointmentsApi
        .availability(selected.id, date)
        .then(setAvailableSlots)
        .catch(() => setAvailableSlots([]));
    } finally {
      setBooking(false);
    }
  };

  return (
    <DashboardShell
      title="Find a doctor"
      subtitle={`${results.length} doctor${results.length === 1 ? "" : "s"} available`}
      nav={patientNav}
      role="Patient"
      persona={patientPersona}
    >
      <Toaster />
      <GlassCard hover={false} className="mb-6">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Search name, specialty, department or qualifications"
              className="rounded-xl pl-9"
            />
          </div>
          <Select value={specialty} onValueChange={setSpecialty}>
            <SelectTrigger className="w-full rounded-xl md:w-52">
              <SelectValue placeholder="Specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All specialties</SelectItem>
              {specialties.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full rounded-xl md:w-52">
              <SelectValue placeholder="Sort doctors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="experience">Most experienced</SelectItem>
              <SelectItem value="fee">Lowest consultation fee</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      {loading ? (
        <ListSkeleton rows={6} />
      ) : loadError ? (
        <EmptyState
          icon={Search}
          title="Doctors could not be loaded"
          description={loadError}
          action={
            <Button variant="outline" onClick={() => void loadDoctors()}>
              Try again
            </Button>
          }
        />
      ) : results.length === 0 ? (
        <EmptyState
          icon={Search}
          title={doctors.length === 0 ? "No doctors available yet" : "No doctors match that search"}
          description={
            doctors.length === 0
              ? "Doctor accounts will appear here once they have been added by an administrator."
              : "Try changing the search or specialty filter."
          }
          action={
            doctors.length > 0 ? (
              <Button
                className="rounded-xl"
                onClick={() => {
                  setQ("");
                  setSpecialty("all");
                }}
              >
                Reset filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((doctor, index) => {
            const doctorSpecialty = doctor.specialization ?? doctor.department ?? "Doctor";
            return (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.4) }}
                className="glass hover-lift group flex flex-col rounded-2xl p-5"
              >
                <div className="flex items-start gap-3">
                  {doctor.profilePhoto ? (
                    <img
                      src={doctor.profilePhoto}
                      alt={doctor.name}
                      className="h-12 w-12 shrink-0 rounded-2xl object-cover"
                    />
                  ) : (
                    <span className="gradient-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold text-primary-foreground">
                      {initials(doctor.name)}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 truncate text-sm font-semibold">
                      {doctor.name}
                      <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
                    </p>
                    <p className="text-xs text-muted-foreground">{doctorSpecialty}</p>
                  </div>
                  {doctor.doctorId && (
                    <Badge
                      variant="secondary"
                      className="ml-auto shrink-0 rounded-full text-[10px]"
                    >
                      {doctor.doctorId}
                    </Badge>
                  )}
                </div>

                <p className="mt-3 line-clamp-3 min-h-12 text-xs text-muted-foreground">
                  {doctor.bio || doctor.qualifications || "Doctor profile"}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="rounded-xl bg-muted/60 py-2">
                    <p className="font-semibold">
                      {doctor.yearsOfExperience ?? "—"}
                      {doctor.yearsOfExperience !== null ? " yrs" : ""}
                    </p>
                    <p className="text-muted-foreground">experience</p>
                  </div>
                  <div className="rounded-xl bg-muted/60 py-2">
                    <p className="font-semibold">
                      {doctor.consultationFee !== null
                        ? `$${doctor.consultationFee}`
                        : "Contact clinic"}
                    </p>
                    <p className="text-muted-foreground">consultation fee</p>
                  </div>
                </div>

                {doctor.qualifications && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Qualifications:</span>{" "}
                    {doctor.qualifications}
                  </p>
                )}
                {doctor.department && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Department:</span>{" "}
                    {doctor.department}
                  </p>
                )}

                <Button
                  className="mt-4 w-full rounded-xl"
                  onClick={() => {
                    setDate(BOOKING_DATES[0]!);
                    setSlot("");
                    setSelected(doctor);
                  }}
                >
                  <CalendarCheck className="mr-1 h-4 w-4" />
                  Book appointment
                </Button>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(isOpen) => !isOpen && setSelected(null)}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">Book with {selected?.name}</DialogTitle>
            <DialogDescription>
              {selected?.specialization ?? selected?.department}
              {selected?.consultationFee !== null && selected?.consultationFee !== undefined
                ? ` · $${selected.consultationFee} consultation fee`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Select date
            </p>
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
              {BOOKING_DATES.map((bookingDate) => (
                <button
                  key={bookingDate}
                  type="button"
                  onClick={() => {
                    setDate(bookingDate);
                    setSlot("");
                  }}
                  className={`shrink-0 rounded-xl border px-3 py-2 text-xs transition-all ${
                    date === bookingDate
                      ? "border-primary bg-primary/12 text-primary"
                      : "border-border/70 hover:border-primary/40"
                  }`}
                >
                  {formatAppointmentDate(bookingDate)}
                </button>
              ))}
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Available slots
            </p>
            {slotsLoading ? (
              <p className="mt-3 text-sm text-muted-foreground">Checking doctor availability…</p>
            ) : availableSlots.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No open appointments on this date. Select another date.
              </p>
            ) : (
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {availableSlots.map((availableSlot) => (
                  <button
                    key={availableSlot}
                    type="button"
                    onClick={() => setSlot(availableSlot)}
                    className={`rounded-xl border px-2 py-2 text-xs transition-all ${
                      slot === availableSlot
                        ? "border-primary bg-primary/12 text-primary"
                        : "border-border/70 hover:-translate-y-0.5 hover:border-primary/40"
                    }`}
                  >
                    {availableSlot}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                The appointment is requested until the doctor confirms it.
              </span>
              <Button
                className="shrink-0 rounded-xl"
                disabled={!slot || booking || slotsLoading}
                onClick={() => void bookAppointment()}
              >
                {booking ? "Requesting…" : "Confirm booking"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
