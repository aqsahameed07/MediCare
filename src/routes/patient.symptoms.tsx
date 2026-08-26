import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Bot, Plus, RotateCcw, Sparkles, X } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/dashboard/states";
import { patientNav } from "@/lib/nav";
import {
  SYMPTOM_SUGGESTIONS,
  assessSymptoms,
  currentPatient,
  recommendDoctors,
  type AIAssessment,
} from "@/lib/mock-data";

export const Route = createFileRoute("/patient/symptoms")({
  head: () => ({
    meta: [
      { title: "AI Symptom Checker — MediAI Care" },
      {
        name: "description",
        content:
          "Select your symptoms and get an AI-ranked differential, urgency guidance and the specialist you should see.",
      },
      { property: "og:title", content: "AI Symptom Checker — MediAI Care" },
      {
        property: "og:description",
        content: "Ranked conditions, severity, urgency and matched specialists in seconds.",
      },
    ],
  }),
  component: SymptomChecker;
});

function severityTone(s: string) {
  return s === "High"
    ? "bg-destructive/15 text-destructive"
    : s === "Moderate"
      ? "bg-warning/20 text-warning-foreground"
      : "bg-success/15 text-success";
}

function SymptomChecker() {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AIAssessment | null>(null);

  const add = (s: string) => {
    const v = s.trim();
    if (!v || symptoms.includes(v)) return;
    setSymptoms((p) => [...p, v]);
    setDraft("");
  };

  const run = () => {
    if (!symptoms.length) return;
    setAnalyzing(true);
    setResult(null);
    setTimeout(() => {
      setResult(assessSymptoms(symptoms));
      setAnalyzing(false);
    }, 1400);
  };

  const matched = result ? recommendDoctors(result.specialist, 3) : [];

  return (
    <DashboardShell
      title="AI Symptom Checker"
      subtitle="Describe what you're feeling — the care engine ranks likely conditions and routes you to the right specialist."
      nav={patientNav}
      role="Patient"
      persona={{ name: currentPatient.name, meta: `${currentPatient.city} · ${currentPatient.bloodGroup}`, hue: currentPatient.avatarHue }}
    >
      <div className="grid gap-4 lg:grid-cols-5">
        <GlassCard className="lg:col-span-2">
          <h2 className="font-display text-lg font-semibold">Your symptoms</h2>
          <p className="text-xs text-muted-foreground">Add as many as apply for a sharper assessment.</p>

          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              add(draft);
            }}
          >
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="e.g. chest pain"
              className="rounded-xl"
            />
            <Button type="submit" size="icon" className="rounded-xl">
              <Plus className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            <AnimatePresence>
              {symptoms.map((s) => (
                <motion.button
                  key={s}
                  type="button"
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  onClick={() => setSymptoms((p) => p.filter((x) => x !== s))}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/12 px-3 py-1.5 text-xs font-medium text-primary"
                >
                  {s} <X className="h-3 w-3" />
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Common symptoms
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SYMPTOM_SUGGESTIONS.filter((s) => !symptoms.includes(s)).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => add(s)}
                className="rounded-full border border-border/70 px-3 py-1.5 text-xs transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary"
              >
                {s}
              </button>
            ))}
          </div>

          <div className="mt-6 flex gap-2">
            <Button onClick={run} disabled={!symptoms.length || analyzing} className="hover-lift flex-1 rounded-xl">
              <Sparkles className="mr-1 h-4 w-4" />
              {analyzing ? "Analysing…" : "Run AI assessment"}
            </Button>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                setSymptoms([]);
                setResult(null);
              }}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </GlassCard>

        <div className="space-y-4 lg:col-span-3">
          {analyzing && (
            <GlassCard hover={false}>
              <div className="flex items-center gap-3">
                <span className="animate-pulse-ring flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Bot className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">Analysing {symptoms.length} symptoms…</p>
                  <Progress value={66} className="mt-2 h-1.5" />
                </div>
              </div>
            </GlassCard>
          )}

          {!analyzing && !result && (
            <EmptyState
              icon={Bot}
              title="No assessment yet"
              description="Add your symptoms on the left and run the AI assessment to see ranked conditions, urgency and matched specialists."
            />
          )}

          {result && !analyzing && (
            <>
              <GlassCard>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-semibold">Assessment result</h2>
                    <p className="text-xs text-muted-foreground">
                      Confidence {result.confidence}% · Suggested specialty: {result.specialist}
                    </p>
                  </div>
                  <Badge
                    className="rounded-full"
                    variant={result.urgency === "Urgent" ? "destructive" : "secondary"}
                  >
                    {result.urgency}
                  </Badge>
                </div>

                <div className="mt-5 space-y-4">
                  {result.conditions.map((c, i) => (
                    <motion.div
                      key={c.name}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{c.name}</span>
                        <span className="flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[11px] ${severityTone(c.severity)}`}>
                            {c.severity}
                          </span>
                          <span className="tabular-nums text-muted-foreground">{c.probability}%</span>
                        </span>
                      </div>
                      <Progress value={c.probability} className="mt-2 h-2" />
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-border/60 bg-muted/40 p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    <AlertTriangle className="h-3.5 w-3.5" /> Care advice
                  </p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {result.advice.map((a) => (
                      <li key={a} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </GlassCard>

              <GlassCard delay={0.1}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold">Recommended doctors</h2>
                  <Link to="/patient/doctors" className="text-xs text-primary hover:underline">
                    See all matches
                  </Link>
                </div>
                <div className="space-y-3">
                  {matched.map((d) => (
                    <div
                      key={d.id}
                      className="flex flex-wrap items-center gap-3 rounded-xl border border-border/50 p-3 transition-colors hover:bg-accent/40"
                    >
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold text-white"
                        style={{ background: `linear-gradient(135deg, hsl(${d.avatarHue} 68% 50%), hsl(${(d.avatarHue + 45) % 360} 68% 60%))` }}
                      >
                        {d.name.split(" ").slice(1).map((w) => w[0]).join("")}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{d.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {d.specialty} · {d.experience} yrs · ⭐ {d.rating}
                        </p>
                      </div>
                      <Badge className="ml-auto rounded-full">{d.matchScore}% match</Badge>
                      <Button asChild size="sm" className="rounded-xl">
                        <Link to="/patient/doctors">Book</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
