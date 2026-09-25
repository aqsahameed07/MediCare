import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Plus, Video, MapPin } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/dashboard/states";
import { Avatar, StatusBadge, patientPersona } from "@/components/dashboard/common";
import { patientNav } from "@/lib/nav";
import {
  TIME_SLOTS, bookedSlotsFor, currentPatient, doctors, formatDate, patientAppointments,
  type Appointment, type AppointmentStatus,
} from "@/lib/mock-data";

export const Route = createFileRoute("/patient/appointments")({
  head: () => ({
    meta: [
      { title: "Appointments — MediAI Care" },
      { name: "description", content: "Book, view and manage your doctor appointments." },
      { property: "og:title", content: "Appointments — MediAI Care" },
      { property: "og:description", content: "Interactive booking calendar with live slot availability." },
    ],
  }),
  component: AppointmentsPage,
});

function AppointmentsPage() {
  const [list, setList] = useState<Appointment[]>(() => patientAppointments(currentPatient.id));
  const [tab, setTab] = useState<AppointmentStatus | "all">("all");
  const [open, setOpen] = useState(false);
  const [doctorId, setDoctorId] = useState(doctors[0]!.id);
  const [date, setDate] = useState<Date | undefined>(new Date("2026-08-26"));
  const [slot, setSlot] = useState<string | null>(null);

  const iso = date ? date.toISOString().slice(0, 10) : "";
  const booked = useMemo(() => (iso ? bookedSlotsFor(iso, doctorId) : []), [iso, doctorId]);
  const filtered = tab === "all" ? list : list.filter((a) => a.status === tab);

  function book() {
    const d = doctors.find((x) => x.id === doctorId)!;
    setList((l) => [
      {
        id: `new-${Date.now()}`, patientId: currentPatient.id, patientName: currentPatient.name,
        doctorId: d.id, doctorName: d.name, specialty: d.specialty, date: iso, time: slot!,
        mode: "In-person", status: "upcoming", reason: "General consultation", fee: d.fee,
      },
      ...l,
    ]);
    toast.success(`Booked with ${d.name}`, { description: `${formatDate(iso)} at ${slot}` });
    setOpen(false);
    setSlot(null);
  }

  return (
    <DashboardShell
      title="Appointments"
      subtitle="Manage upcoming visits and book new ones"
      nav={patientNav}
      role="Patient"
      persona={patientPersona}
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl"><Plus className="mr-1 h-4 w-4" />Book</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl rounded-2xl">
            <DialogHeader><DialogTitle>Book an appointment</DialogTitle></DialogHeader>
            <Select value={doctorId} onValueChange={(v) => { setDoctorId(v); setSlot(null); }}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name} · {d.specialty} · ${d.fee}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
              <Calendar mode="single" selected={date} onSelect={(d) => { setDate(d); setSlot(null); }} className="rounded-xl border" />
              <div>
                <p className="mb-2 text-sm font-medium">Available slots</p>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((t) => {
                    const taken = booked.includes(t);
                    return (
                      <button
                        key={t}
                        disabled={taken}
                        onClick={() => setSlot(t)}
                        className={`rounded-lg border px-2 py-2 text-xs transition-all ${
                          taken ? "cursor-not-allowed opacity-35 line-through"
                            : slot === t ? "gradient-primary border-transparent text-primary-foreground"
                            : "hover:border-primary hover:text-primary"
                        }`}
                      >{t}</button>
                    );
                  })}
                </div>
              </div>
            </div>
            <Button disabled={!slot || !iso} onClick={book} className="rounded-xl">Confirm booking</Button>
          </DialogContent>
        </Dialog>
      }
    >
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mb-4">
        <TabsList className="rounded-xl">
          {["all", "upcoming", "pending", "completed", "cancelled"].map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {filtered.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No appointments" description="Nothing in this category yet." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((a, i) => {
            const d = doctors.find((x) => x.id === a.doctorId);
            return (
              <GlassCard key={a.id} delay={Math.min(i, 8) * 0.04} className="flex items-center gap-4">
                <Avatar name={a.doctorName} hue={d?.avatarHue ?? 180} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{a.doctorName}</p>
                  <p className="text-xs text-muted-foreground">{a.specialty} · {a.reason}</p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    {a.mode === "Video" ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                    {formatDate(a.date)} · {a.time}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={a.status} />
                  {a.status === "upcoming" && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs"
                      onClick={() => { setList((l) => l.map((x) => x.id === a.id ? { ...x, status: "cancelled" } : x)); toast("Appointment cancelled"); }}>
                      Cancel
                    </Button>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
