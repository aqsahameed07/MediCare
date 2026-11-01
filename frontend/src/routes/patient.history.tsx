import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { CalendarDays, FlaskConical, Pill, Stethoscope } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { patientPersona } from "@/components/dashboard/common";
import { patientNav } from "@/lib/nav";
import { currentPatient, formatDate, patientHistory, type HistoryEvent } from "@/lib/mock-data";

export const Route = createFileRoute("/patient/history")({
  head: () => ({
    meta: [
      { title: "Medical History — MediAI Care" },
      { name: "description", content: "Timeline of your diagnoses, tests, visits and prescriptions." },
      { property: "og:title", content: "Medical History — MediAI Care" },
      { property: "og:description", content: "Your complete health timeline in one place." },
    ],
  }),
  component: HistoryPage,
});

const icons = { Appointment: CalendarDays, Diagnosis: Stethoscope, Prescription: Pill, "Test Result": FlaskConical };

function HistoryPage() {
  const all = patientHistory(currentPatient.id);
  const [type, setType] = useState<HistoryEvent["type"] | "All">("All");
  const list = type === "All" ? all : all.filter((e) => e.type === type);
  return (
    <DashboardShell title="Medical History" subtitle="Your complete health timeline" nav={patientNav} role="Patient" persona={patientPersona}>
      <Tabs value={type} onValueChange={(v) => setType(v as typeof type)} className="mb-6">
        <TabsList className="rounded-xl">
          {["All", "Appointment", "Diagnosis", "Prescription", "Test Result"].map((t) => (
            <TabsTrigger key={t} value={t}>{t}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="relative ml-4 border-l-2 border-primary/25 pl-8">
        {list.map((e, i) => {
          const Icon = icons[e.type];
          return (
            <motion.div key={e.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i, 10) * 0.05 }} className="relative mb-5">
              <span className="gradient-primary absolute -left-[3.05rem] top-3 flex h-9 w-9 items-center justify-center rounded-full text-primary-foreground ring-4 ring-background">
                <Icon className="h-4 w-4" />
              </span>
              <div className="glass rounded-2xl p-4 transition-transform hover:-translate-y-0.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{e.title}</p>
                  <span className="text-xs text-muted-foreground">{formatDate(e.date)}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{e.detail}</p>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <Badge variant="secondary">{e.type}</Badge>
                  <Badge variant="outline">{e.tag}</Badge>
                  <span className="text-muted-foreground">{e.doctor}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
