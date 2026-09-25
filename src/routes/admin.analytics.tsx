import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DashboardShell } from "@/components/dashboard/shell";
import { GlassCard } from "@/components/ui/glass-card";
import { adminPersona, chartTooltip } from "@/components/dashboard/common";
import { adminNav } from "@/lib/nav";
import { appointmentTrend, patientGrowth } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — MediAI Care" },
      { name: "description", content: "Appointment and patient growth analytics for the platform." },
      { property: "og:title", content: "Analytics — MediAI Care" },
      { property: "og:description", content: "Trends across appointments and patient growth." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <DashboardShell title="Analytics" subtitle="Last 12 months" nav={adminNav} role="Admin" persona={adminPersona}>
      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <p className="font-display font-semibold">Appointments</p>
          <div className="mt-4 h-80">
            <ResponsiveContainer>
              <BarChart data={appointmentTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip {...chartTooltip} /><Legend />
                <Bar dataKey="appointments" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="completed" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
        <GlassCard delay={0.1}>
          <p className="font-display font-semibold">Patient growth</p>
          <div className="mt-4 h-80">
            <ResponsiveContainer>
              <LineChart data={patientGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip {...chartTooltip} /><Legend />
                <Line dataKey="patients" stroke="var(--primary)" strokeWidth={2.5} dot={false} />
                <Line dataKey="newPatients" stroke="var(--chart-3)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </DashboardShell>
  );
}
