import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, DollarSign, Stethoscope, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardShell } from "@/components/dashboard/shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { GlassCard } from "@/components/ui/glass-card";
import {
  CHART_COLORS,
  StatusBadge,
  adminPersona,
  chartTooltip,
} from "@/components/dashboard/common";
import { adminNav } from "@/lib/nav";
import {
  appointments,
  doctors,
  formatDate,
  patients,
  revenueTrend,
  specialtyDistribution,
} from "@/lib/mock-data";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — MediAI Care" },
      {
        name: "description",
        content: "Platform-wide metrics for patients, doctors, appointments and revenue.",
      },
      { property: "og:title", content: "Admin Dashboard — MediAI Care" },
      { property: "og:description", content: "Operational overview of the MediAI Care platform." },
    ],
  }),
  component: AdminOverview,
});

function AdminOverview() {
  const revenue = appointments
    .filter((a) => a.status === "completed")
    .reduce((s, a) => s + a.fee, 0);
  return (
    <DashboardShell
      title="Platform overview"
      subtitle="Everything happening across MediAI Care"
      nav={adminNav}
      role="Admin"
      persona={adminPersona}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Patients" value={patients.length} icon={Users} change={14} />
        <MetricCard
          label="Doctors"
          value={doctors.length}
          icon={Stethoscope}
          change={6}
          delay={0.05}
        />
        <MetricCard
          label="Appointments"
          value={appointments.length}
          icon={CalendarDays}
          change={18}
          delay={0.1}
        />
        <MetricCard
          label="Revenue"
          value={revenue}
          prefix="$"
          icon={DollarSign}
          change={11}
          delay={0.15}
        />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <p className="font-display font-semibold">Revenue vs target</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip {...chartTooltip} />
                <Area dataKey="revenue" stroke="var(--primary)" fill="url(#rev)" strokeWidth={2} />
                <Area
                  dataKey="target"
                  stroke="var(--chart-2)"
                  fill="transparent"
                  strokeDasharray="4 4"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
        <GlassCard delay={0.1}>
          <p className="font-display font-semibold">By specialty</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={specialtyDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {specialtyDistribution.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
      <GlassCard className="mt-6">
        <p className="font-display font-semibold">Latest appointments</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="py-2">Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Fee</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.slice(0, 8).map((a) => (
                <tr key={a.id} className="border-t border-border/50">
                  <td className="py-2.5">{a.patientName}</td>
                  <td>{a.doctorName}</td>
                  <td>{formatDate(a.date)}</td>
                  <td>${a.fee}</td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </DashboardShell>
  );
}
