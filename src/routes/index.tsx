import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  Bot,
  CalendarCheck,
  HeartPulse,
  LineChart,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Users,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Counter, Parallax, ScrollReveal } from "@/components/motion/reveal";
import { platformStats, testimonials, doctors } from "@/lib/mock-data";
import heroImage from "@/assets/hero-medical.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MediAI Care — AI-Powered Healthcare Platform" },
      {
        name: "description",
        content:
          "MediAI Care matches patients to the right specialist with AI symptom analysis, instant booking, medical history timelines and clinic analytics.",
      },
      { property: "og:title", content: "MediAI Care — AI-Powered Healthcare Platform" },
      {
        property: "og:description",
        content:
          "AI symptom checker, smart doctor recommendations, appointment management and clinical analytics in one premium platform.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Bot,
    title: "AI Symptom Analysis",
    body: "Describe how you feel and get a ranked list of likely conditions, urgency level and the specialty you should see.",
  },
  {
    icon: Stethoscope,
    title: "Smart Doctor Matching",
    body: "Match scores blend specialty fit, experience, ratings and availability so the right clinician surfaces first.",
  },
  {
    icon: CalendarCheck,
    title: "Frictionless Booking",
    body: "Live slot availability, in-person or video, with confirmations and reminders handled automatically.",
  },
  {
    icon: HeartPulse,
    title: "Unified Medical History",
    body: "Diagnoses, prescriptions, lab results and visits on one searchable, filterable timeline.",
  },
  {
    icon: LineChart,
    title: "Clinic Analytics",
    body: "Revenue, patient growth and specialty demand rendered in animated, drill-down dashboards.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy by Design",
    body: "Role-scoped access, audit-ready records and encryption patterns modelled on HIPAA guidance.",
  },
];

const roles = [
  {
    title: "Patient",
    to: "/auth?role=patient",
    icon: HeartPulse,
    body: "Symptom checker, AI doctor recommendations, bookings, prescriptions and health timeline.",
  },
  {
    title: "Doctor",
    to: "/auth?role=doctor",
    icon: Stethoscope,
    body: "Appointment kanban, patient records, weekly schedule and consultation performance.",
  },
  {
    title: "Admin",
    to: "/auth?role=admin",
    icon: Users,
    body: "Platform-wide metrics, user management and revenue & specialty analytics.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="gradient-hero relative overflow-hidden pb-24 pt-32">
        <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full bg-info/15 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI triage · 94% diagnostic agreement
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 font-display text-4xl font-semibold leading-[1.05] sm:text-6xl"
            >
              Healthcare that thinks <span className="text-gradient">before you book</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16, duration: 0.7 }}
              className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg"
            >
              MediAI Care turns symptoms into a care plan: analyse, match with a verified specialist,
              book the slot and keep every record in one timeline.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Button asChild size="lg" className="hover-lift rounded-xl">
                <Link to="/auth" search={{ role: "patient" }}>
                  Try the AI checker <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl">
                <Link to="/auth" search={{ role: "doctor" }}>View doctor console</Link>
              </Button>
            </motion.div>

            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {platformStats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                >
                  <p className="font-display text-2xl font-semibold">
                    <Counter value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <Parallax strength={40}>
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <img
                src={heroImage}
                alt="Clinician reviewing AI-assisted patient insights on MediAI Care"
                className="shadow-elegant w-full rounded-[2rem] object-cover"
                loading="eager"
              />
              <GlassCard className="animate-float absolute -bottom-6 -left-4 w-56" hover={false} delay={0.5}>
                <p className="text-xs text-muted-foreground">AI confidence</p>
                <p className="font-display text-2xl font-semibold text-primary">
                  <Counter value={91} suffix="%" />
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Cardiology referral suggested</p>
              </GlassCard>
              <GlassCard className="absolute -right-3 top-8 w-48" hover={false} delay={0.7}>
                <p className="text-xs text-muted-foreground">Next available</p>
                <p className="text-sm font-medium">{doctors[0]!.name}</p>
                <p className="text-xs text-primary">{doctors[0]!.nextSlot}</p>
              </GlassCard>
            </motion.div>
          </Parallax>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20">
        <ScrollReveal className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Everything a modern clinic runs on
          </h2>
          <p className="mt-3 text-muted-foreground">
            One product surface for patients, clinicians and operators — no spreadsheets, no paper files.
          </p>
        </ScrollReveal>

        <ScrollReveal stagger className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="glass hover-lift group rounded-2xl p-6">
              <span className="gradient-primary flex h-11 w-11 items-center justify-center rounded-xl text-primary-foreground transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </ScrollReveal>
      </section>

      <section id="ai" className="scroll-mt-24 border-y border-border/60 bg-muted/30 py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2">
          <ScrollReveal>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              AI Care Engine
            </span>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
              From symptoms to the right specialist in under a minute
            </h2>
            <p className="mt-4 text-muted-foreground">
              Select symptoms, get a ranked differential with severity and urgency, then jump straight
              into a match-scored list of verified doctors with live availability.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Ranked conditions with probability and severity",
                "Urgency guidance: self-care, see a doctor, urgent",
                "Specialty routing into match-scored doctor results",
                "Personalised care advice you can act on today",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Sparkles className="h-3 w-3" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8 rounded-xl">
              <Link to="/patient/symptoms">
                Run an assessment <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </ScrollReveal>

          <ScrollReveal stagger className="grid gap-4">
            {roles.map((r) => (
              <Link
                key={r.title}
                to={r.to}
                className="glass hover-lift group flex items-start gap-4 rounded-2xl p-5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
                  <r.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display font-semibold">{r.title} dashboard</p>
                  <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
                </div>
                <ArrowRight className="ml-auto mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </ScrollReveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <ScrollReveal className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Trusted by care teams</h2>
          <p className="mt-3 text-muted-foreground">
            Clinics, specialists and patients using MediAI Care every day.
          </p>
        </ScrollReveal>
        <ScrollReveal stagger className="mt-10 grid gap-5 md:grid-cols-2">
          {testimonials.map((t) => (
            <div key={t.name} className="glass hover-lift rounded-2xl p-6">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < t.rating ? "fill-warning text-warning" : "text-muted-foreground/40"}`}
                  />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed">"{t.quote}"</p>
              <p className="mt-4 text-sm font-medium">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </div>
          ))}
        </ScrollReveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24">
        <ScrollReveal className="gradient-primary shadow-elegant relative overflow-hidden rounded-[2rem] px-8 py-14 text-center text-primary-foreground">
          <div className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-white/15 blur-3xl" />
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Start with a symptom. End with a plan.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm opacity-90">
            Explore the full MediAI Care experience across patient, doctor and admin workspaces.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary" className="rounded-xl">
              <Link to="/patient">Patient workspace</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl border-white/40 bg-transparent">
              <Link to="/admin">Admin analytics</Link>
            </Button>
          </div>
        </ScrollReveal>
      </section>

      <SiteFooter />
    </div>
  );
}
