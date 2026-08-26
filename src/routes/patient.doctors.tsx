import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { BadgeCheck, CalendarCheck, MapPin, Search, Star, Video } from "lucide-react";
import { toast } from "sonner";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, ListSkeleton, useSimulatedLoad } from "@/components/dashboard/states";
import { patientNav } from "@/lib/nav";
import {
  SPECIALTIES,
  TIME_SLOTS,
  bookedSlotsFor,
  currentPatient,
  doctors,
  formatDate,
  type Doctor,
} from "@/lib/mock-data";

export const Route = createFileRoute("/patient/doctors")({
  head: () => ({
    meta: [
      { title: "Find Doctors — MediAI Care" },
      {
        name: "description",
        content:
          "Browse verified specialists with AI match scores, ratings, fees and live availability, then book in two taps.",
      },
      { property: "og:title", content: "Find Doctors — MediAI Care" },
      {
        property: "og:description",
        content: "AI match-scored specialists with live slot availability and instant booking.",
      },
    ],
  }),
  component: FindDoctors,
});

const DATES = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 7, 26 + i));
  return d.toISOString().slice(0, 10);
});

function FindDoctors() {
  const ready = useSimulatedLoad(500);
  const [q, setQ] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [sort, setSort] = useState("match");
  const [selected, setSelected] = useState<Doctor | null>(null);
  const [date, setDate] = useState(DATES[0]!);
  const [slot, setSlot] = useState<string | null>(null);

  const results = useMemo(() => {
    const list = doctors.filter(
      (d) =>
        (specialty === "all" || d.specialty === specialty) &&
        (q.trim() === "" ||
          d.name.toLowerCase().includes(q.toLowerCase()) ||
          d.specialty.toLowerCase().includes(q.toLowerCase()) ||
          d.hospital.toLowerCase().includes(q.toLowerCase())),
    );
    const sorted = [...list];
    if (sort === "match") sorted.sort((a, b) => b.matchScore - a.matchScore);
    if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    if (sort === "fee") sorted.sort((a, b) => a.fee - b.fee);
    if (sort === "experience") sorted.sort((a, b) => b.experience - a.experience);
    return sorted;
  }, [q, specialty, sort]);

  const booked = selected ? bookedSlotsFor(date, selected.id) : [];

  return (
    <DashboardShell
      title="Find a doctor"
      subtitle={`${results.length} verified specialists matched to your profile`}
      nav={patientNav}
      role="Patient"
      persona={{ name: currentPatient.name, meta: `${currentPatient.city} · ${currentPatient.bloodGroup}`, hue: currentPatient.avatarHue }}
    >
      <Toaster />
      <GlassCard hover={false} className="mb-6">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, specialty or hospital"
              className="rounded-xl pl-9"
            />
          </div>
          <Select value={specialty} onValueChange={setSpecialty}>
            <SelectTrigger className="w-full rounded-xl md:w-52">
              <SelectValue placeholder="Specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All specialties</SelectItem>
              {SPECIALTIES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full rounded-xl md:w-44">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="match">Best AI match</SelectItem>
              <SelectItem value="rating">Highest rated</SelectItem>
              <SelectItem value="experience">Most experienced</SelectItem>
              <SelectItem value="fee">Lowest fee</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      {!ready ? (
        <ListSkeleton rows={6} />
      ) : results.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No doctors match that search"
          description="Try a different specialty or clear the search field to see all available specialists."
          action={
            <Button
              className="rounded-xl"
              onClick={() => {
                setQ("");
                setSpecialty("all");
              }}
            >
              Reset filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
              className="glass hover-lift group flex flex-col rounded-2xl p-5"
            >
              <div className="flex items-start gap-3">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-semibold text-white transition-transform duration-500 group-hover:scale-105"
                  style={{ background: `linear-gradient(135deg, hsl(${d.avatarHue} 68% 50%), hsl(${(d.avatarHue + 45) % 360} 68% 60%))` }}
                >
                  {d.name.split(" ").slice(1).map((w) => w[0]).join("")}
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1 truncate text-sm font-semibold">
                    {d.name}
                    {d.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
                  </p>
                  <p className="text-xs text-muted-foreground">{d.specialty}</p>
                </div>
                <Badge className="ml-auto shrink-0 rounded-full">{d.matchScore}%</Badge>
              </div>

              <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">{d.bio}</p>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-muted/60 py-2">
                  <p className="font-semibold">
                    <Star className="mr-0.5 inline h-3 w-3 fill-warning text-warning" />
                    {d.rating}
                  </p>
                  <p className="text-muted-foreground">{d.reviews} reviews</p>
                </div>
                <div className="rounded-xl bg-muted/60 py-2">
                  <p className="font-semibold">{d.experience} yrs</p>
                  <p className="text-muted-foreground">experience</p>
                </div>
                <div className="rounded-xl bg-muted/60 py-2">
                  <p className="font-semibold">${d.fee}</p>
                  <p className="text-muted-foreground">per visit</p>
                </div>
              </div>

              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {d.hospital}, {d.city}
              </p>
              <p className="mt-1 text-xs text-primary">Next slot · {d.nextSlot}</p>

              <Button
                className="mt-4 w-full rounded-xl"
                onClick={() => {
                  setSelected(d);
                  setSlot(null);
                  setDate(DATES[0]!);
                }}
              >
                <CalendarCheck className="mr-1 h-4 w-4" /> Book appointment
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">Book with {selected?.name}</DialogTitle>
            <DialogDescription>
              {selected?.specialty} · {selected?.hospital} · ${selected?.fee} consultation fee
            </DialogDescription>
          </DialogHeader>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Select date</p>
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
              {DATES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setDate(d);
                    setSlot(null);
                  }}
                  className={`shrink-0 rounded-xl border px-3 py-2 text-xs transition-all ${
                    date === d
                      ? "border-primary bg-primary/12 text-primary"
                      : "border-border/70 hover:border-primary/40"
                  }`}
                >
                  {formatDate(d)}
                </button>
              ))}
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Available slots
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {TIME_SLOTS.map((t) => {
                const taken = booked.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={taken}
                    onClick={() => setSlot(t)}
                    className={`rounded-xl border px-2 py-2 text-xs transition-all ${
                      taken
                        ? "cursor-not-allowed border-border/40 text-muted-foreground/40 line-through"
                        : slot === t
                          ? "border-primary bg-primary/12 text-primary"
                          : "border-border/70 hover:-translate-y-0.5 hover:border-primary/40"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Video className="h-3.5 w-3.5" /> Video or in-person, confirmed by the clinic
              </span>
              <Button
                className="rounded-xl"
                disabled={!slot}
                onClick={() => {
                  toast.success("Appointment requested", {
                    description: `${selected?.name} · ${formatDate(date)} at ${slot}`,
                  });
                  setSelected(null);
                }}
              >
                Confirm booking
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
