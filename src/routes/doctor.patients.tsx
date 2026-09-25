import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, doctorPersona } from "@/components/dashboard/common";
import { doctorNav } from "@/lib/nav";
import { formatDate, patientHistory, patientPrescriptions, patients } from "@/lib/mock-data";

export const Route = createFileRoute("/doctor/patients")({
  head: () => ({
    meta: [
      { title: "Patient Records — MediAI Care" },
      { name: "description", content: "Electronic medical records for your patients." },
      { property: "og:title", content: "Patient Records — MediAI Care" },
      { property: "og:description", content: "Search patients and review their EMR." },
    ],
  }),
  component: PatientsPage,
});

function PatientsPage() {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(patients[0]!.id);
  const list = patients.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  const p = patients.find((x) => x.id === sel)!;
  const hist = patientHistory(p.id).slice(0, 5);
  const rx = patientPrescriptions(p.id).slice(0, 3);

  return (
    <DashboardShell title="Patient records" subtitle="Electronic medical records" nav={doctorNav} role="Doctor" persona={doctorPersona}>
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <GlassCard className="p-3">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patients" className="rounded-xl pl-9" />
          </div>
          <div className="max-h-[600px] space-y-1 overflow-y-auto">
            {list.map((x) => (
              <button key={x.id} onClick={() => setSel(x.id)}
                className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors ${sel === x.id ? "bg-primary/12" : "hover:bg-accent/50"}`}>
                <Avatar name={x.name} hue={x.avatarHue} size={34} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{x.name}</p>
                  <p className="text-xs text-muted-foreground">{x.age} · {x.gender}</p>
                </div>
              </button>
            ))}
          </div>
        </GlassCard>
        <div className="space-y-4">
          <GlassCard key={p.id}>
            <div className="flex flex-wrap items-center gap-4">
              <Avatar name={p.name} hue={p.avatarHue} size={60} />
              <div className="flex-1">
                <p className="font-display text-xl font-semibold">{p.name}</p>
                <p className="text-sm text-muted-foreground">{p.email} · {p.phone} · {p.city}</p>
              </div>
              <Badge variant="secondary">{p.status}</Badge>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              {[["Age", p.age], ["Blood", p.bloodGroup], ["Gender", p.gender], ["Last visit", formatDate(p.lastVisit)]].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">{k}</p>
                  <p className="font-medium">{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-sm"><span>Health score</span><span>{p.healthScore}</span></div>
              <Progress value={p.healthScore} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {p.conditions.map((c) => <Badge key={c} variant="outline">{c}</Badge>)}
            </div>
          </GlassCard>
          <div className="grid gap-4 md:grid-cols-2">
            <GlassCard>
              <p className="font-display font-semibold">Recent history</p>
              <div className="mt-3 space-y-3">
                {hist.map((h) => (
                  <div key={h.id} className="border-l-2 border-primary/40 pl-3">
                    <p className="text-sm font-medium">{h.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(h.date)} · {h.type}</p>
                  </div>
                ))}
                {hist.length === 0 && <p className="text-sm text-muted-foreground">No history yet.</p>}
              </div>
            </GlassCard>
            <GlassCard>
              <p className="font-display font-semibold">Prescriptions</p>
              <div className="mt-3 space-y-2">
                {rx.flatMap((r) => r.medications).map((m, i) => (
                  <div key={i} className="rounded-xl bg-muted/50 p-2 text-sm">{m.name} {m.dosage} <span className="text-xs text-muted-foreground">· {m.freq}</span></div>
                ))}
                {rx.length === 0 && <p className="text-sm text-muted-foreground">No prescriptions.</p>}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
