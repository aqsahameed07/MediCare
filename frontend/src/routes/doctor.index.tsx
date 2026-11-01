import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, DollarSign, Star, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DashboardShell } from "@/components/dashboard/shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Avatar, StatusBadge, chartTooltip, doctorPersona } from "@/components/dashboard/common";
import { doctorNav } from "@/lib/nav";
import { appointments, currentDoctor, doctorWeekly, patients } from "@/lib/mock-data";

export const Route = createFileRoute("/doctor/")({
  head: () => ({
    meta: [
      { title: "Doctor Console — MediAI Care" },
      { name: "description", content: "Today's schedule, patient load and practice analytics for doctors." },
      { property: "og:title", content: "Doctor Console — MediAI Care" },
      { property: "og:description", content: "Your practice at a glance." },
    ],
  }),
  component: DoctorOverview,
});

function DoctorOverview() {
  const mine = appointments.filter((a) => a.doctorId === currentDoctor.id);
  const today = mine.filter((a) => a.status === "upcoming" || a.status === "pending").slice(0, 6);
  return (
    <DashboardShell title={`Good morning, ${currentDoctor.name}`} subtitle="Here's your practice today" nav={doctorNav} role="Doctor" persona={doctorPersona}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total patients" value={currentDoctor.patients} icon={Users} change={8} />
        <MetricCard label="Appointments" value={mine.length} icon={CalendarDays} change={12} delay={0.05} />
        <MetricCard label="Revenue" value={mine.filter((a) => a.status === "completed").reduce((s, a) => s + a.fee, 0)} prefix="$" icon={DollarSign} change={5} delay={0.1} />
        <MetricCard label="Rating" value={currentDoctor.rating} icon={Star} hint={`${currentDoctor.reviews} reviews`} delay={0.15} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <GlassCard className="lg:col-span-3">
          <p className="font-display font-semibold">Weekly consultations</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <BarChart data={doctorWeekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip {...chartTooltip} />
                <Bar dataKey="consultations" fill="var(--primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
        <GlassCard className="lg:col-span-2" delay={0.1}>
          <div className="flex items-center justify-between">
            <p className="font-display font-semibold">Up next</p>
            <Button asChild size="sm" variant="ghost"><Link to="/doctor/appointments">View all</Link></Button>
          </div>
          <div className="mt-3 space-y-2">
            {today.map((a) => {
              const p = patients.find((x) => x.id === a.patientId);
              return (
                <div key={a.id} className="flex items-center gap-3 rounded-xl p-2 hover:bg-accent/50">
                  <Avatar name={a.patientName} hue={p?.avatarHue ?? 150} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{a.patientName}</p>
                    <p className="text-xs text-muted-foreground">{a.time} · {a.reason}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </DashboardShell>
  );
}
