import { createFileRoute } from "@tanstack/react-router";
import { Download, Pill } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/states";
import { patientPersona } from "@/components/dashboard/common";
import { patientNav } from "@/lib/nav";
import { currentPatient, formatDate, patientPrescriptions } from "@/lib/mock-data";

export const Route = createFileRoute("/patient/prescriptions")({
  head: () => ({
    meta: [
      { title: "Prescriptions — MediAI Care" },
      { name: "description", content: "Your active and past prescriptions with dosage details." },
      { property: "og:title", content: "Prescriptions — MediAI Care" },
      { property: "og:description", content: "Medication, dosage and refill tracking." },
    ],
  }),
  component: PrescriptionsPage,
});

function PrescriptionsPage() {
  const list = patientPrescriptions(currentPatient.id);
  return (
    <DashboardShell title="Prescriptions" subtitle="Medications prescribed by your doctors" nav={patientNav} role="Patient" persona={patientPersona}>
      {list.length === 0 ? (
        <EmptyState icon={Pill} title="No prescriptions" description="Prescriptions from your doctors will appear here." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((p, i) => (
            <GlassCard key={p.id} delay={Math.min(i, 8) * 0.05}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display font-semibold">{p.doctorName}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(p.date)} · {p.refills} refills left</p>
                </div>
                <Badge variant="secondary" className={p.active ? "bg-success/15 text-success" : ""}>
                  {p.active ? "Active" : "Completed"}
                </Badge>
              </div>
              <div className="mt-4 space-y-2">
                {p.medications.map((m) => (
                  <div key={m.name} className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary"><Pill className="h-4 w-4" /></span>
                    <div className="flex-1 text-sm">
                      <p className="font-medium">{m.name} <span className="text-muted-foreground">{m.dosage}</span></p>
                      <p className="text-xs text-muted-foreground">{m.freq} · {m.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{p.notes}</p>
              <Button size="sm" variant="outline" className="mt-3 rounded-xl" onClick={() => toast.success("Prescription PDF downloaded")}>
                <Download className="mr-1 h-3.5 w-3.5" />Download
              </Button>
            </GlassCard>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
