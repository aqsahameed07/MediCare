import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  CalendarDays,
  HeartPulse,
  Pill,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardShell } from "@/components/dashboard/shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardSkeletonGrid, useSimulatedLoad } from "@/components/dashboard/states";
import { patientNav } from "@/lib/nav";
import {
  currentPatient,
  formatDate,
  healthTrend,
  patientAppointments,
  patientPrescriptions,
  patientHistory,
} from "@/lib/mock-data";

export const Route = createFileRoute("/patient/")({
  head: () => ({
    meta: [
      { title: "Patient Dashboard — MediAI Care" },
      {
        name: "description",
        content:
          "Track your health score, upcoming appointments, active prescriptions and recent medical activity.",
      },
      { property: "og:title", content: "Patient Dashboard — MediAI Care" },
      {
        property: "og:description",
        content: "Health score trends, appointments, prescriptions and history in one workspace.",
      },
    ],
  }),
  component: PatientOverview,
});

const chartTooltip = {
  contentStyle: {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: "0.85rem",
    fontSize: 12,
    color: "var(--popover-foreground)",
  },
} as const;

function PatientOverview() {
  const ready = useSimulatedLoad(600);
  const appts = patientAppointments(currentPatient.id);
  const upcoming = appts.filter((a) => a.status === "upcoming" || a.status === "pending").slice(0, 4);
  const rx = patientPrescriptions(currentPatient.id).filter((p) => p.active);
  const events = patientHistory(currentPatient.id).slice(0, 5);

  return (
    <DashboardShell
      title={`Welcome back, ${currentPatient.name.split(" ")[0]}`}
      subtitle="Here's how your health is tracking this month."
      nav={patientNav}
      role="Patient"
      persona={{ name: currentPatient.name, meta: `${currentPatient.city} · ${currentPatient.bloodGroup}`, hue: currentPatient.avatarHue }}
      actions={
        <Button asChild size="sm" className="rounded-xl">
          <Link to="/patient/symptoms">
            <Sparkles className="mr-1 h-4 w-4" /> AI check
          </Link>
        </Button>
      }
    >
      {!ready ? (
        <CardSkeletonGrid />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Health score" value={currentPatient.healthScore} icon={HeartPulse} change={4} suffix="/100" />
          <MetricCard label="Upcoming visits" value={upcoming.length} icon={CalendarDays} change={12} delay={0.06} />
          <MetricCard label="Active prescriptions" value={rx.length} icon={Pill} change={-8} delay={0.12} />
          <MetricCard label="Records on file" value={patientHistory(currentPatient.id).length} icon={Activity} change={6} delay={0.18} />
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2" delay={0.1}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">Health score trend</h2>
              <p className="text-xs text-muted-foreground">Last 6 months</p>
            </div>
            <Badge variant="secondary" className="rounded-full">Improving</Badge>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={healthTrend}>
              <defs>
                <linearGradient id="hs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <Tooltip {...chartTooltip} />
              <Area type="monotone" dataKey="score" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#hs)" animationDuration={1400} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard delay={0.16}>
          <h2 className="font-display text-lg font-semibold">Resting heart rate</h2>
          <p className="text-xs text-muted-foreground">bpm, 6-month average</p>
          <ResponsiveContainer width="100%" height={210} className="mt-4">
            <LineChart data={healthTrend}>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <Tooltip {...chartTooltip} />
              <Line type="monotone" dataKey="restingHr" stroke="var(--chart-3)" strokeWidth={2.5} dot={false} animationDuration={1400} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-3 flex flex-wrap gap-2">
            {currentPatient.conditions.map((c) => (
              <Badge key={c} variant="outline" className="rounded-full">{c}</Badge>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <GlassCard delay={0.2}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Upcoming appointments</h2>
            <Link to="/patient/appointments" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {upcoming.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-xl border border-border/50 p-3 transition-colors hover:bg-accent/40">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
                  <CalendarDays className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{a.doctorName}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.specialty} · {formatDate(a.date)} · {a.time}
                  </p>
                </div>
                <Badge className="ml-auto rounded-full" variant={a.status === "upcoming" ? "default" : "secondary"}>
                  {a.mode}
                </Badge>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard delay={0.26}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent activity</h2>
            <Link to="/patient/history" className="text-xs text-primary hover:underline">
              Full timeline <ArrowRight className="inline h-3 w-3" />
            </Link>
          </div>
          <ol className="relative space-y-4 border-l border-border/70 pl-5">
            {events.map((e) => (
              <li key={e.id} className="relative">
                <span className="gradient-primary absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full" />
                <p className="text-sm font-medium">{e.title}</p>
                <p className="text-xs text-muted-foreground">
                  {e.type} · {e.doctor} · {formatDate(e.date)}
                </p>
              </li>
            ))}
          </ol>
        </GlassCard>
      </div>
    </DashboardShell>
  );
}
