import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/shell";
import { GlassCard } from "@/components/ui/glass-card";
import { doctorPersona } from "@/components/dashboard/common";
import { doctorNav } from "@/lib/nav";
import { TIME_SLOTS, appointments, currentDoctor } from "@/lib/mock-data";

export const Route = createFileRoute("/doctor/schedule")({
  head: () => ({
    meta: [
      { title: "Weekly Schedule — MediAI Care" },
      { name: "description", content: "Your weekly consultation schedule at a glance." },
      { property: "og:title", content: "Weekly Schedule — MediAI Care" },
      { property: "og:description", content: "Week view of booked consultations." },
    ],
  }),
  component: SchedulePage,
});

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function SchedulePage() {
  const mine = appointments.filter((a) => a.doctorId === currentDoctor.id && a.status !== "cancelled");
  const cell = (d: number, t: string) => mine.find((a, i) => i % 6 === d && a.time === t);
  return (
    <DashboardShell title="Weekly schedule" subtitle="Consultations for this week" nav={doctorNav} role="Doctor" persona={doctorPersona}>
      <GlassCard className="overflow-x-auto p-3">
        <div className="grid min-w-[760px] grid-cols-[80px_repeat(6,1fr)] gap-2">
          <div />
          {DAYS.map((d) => <p key={d} className="text-center text-sm font-semibold">{d}</p>)}
          {TIME_SLOTS.map((t) => (
            <div key={t} className="contents">
              <p className="py-3 text-xs text-muted-foreground">{t}</p>
              {DAYS.map((_, d) => {
                const a = cell(d, t);
                return a ? (
                  <div key={d} className="gradient-primary rounded-xl p-2 text-primary-foreground transition-transform hover:scale-[1.03]">
                    <p className="truncate text-xs font-semibold">{a.patientName}</p>
                    <p className="truncate text-[10px] opacity-85">{a.reason}</p>
                  </div>
                ) : (
                  <div key={d} className="rounded-xl border border-dashed border-border/60" />
                );
              })}
            </div>
          ))}
        </div>
      </GlassCard>
    </DashboardShell>
  );
}
