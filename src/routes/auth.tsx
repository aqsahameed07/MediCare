import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { Activity, ArrowRight, HeartPulse, Lock, Mail, ShieldCheck, Stethoscope, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import { currentDoctor, currentPatient } from "@/lib/mock-data";
import { dashboardPath, getSession, signIn, type DemoRole } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    role: (["patient", "doctor", "admin"].includes(search.role as string)
      ? search.role
      : "patient") as DemoRole,
  }),
  head: () => ({
    meta: [
      { title: "Sign in or create an account — MediAI Care" },
      {
        name: "description",
        content:
          "Access MediAI Care as a patient, doctor or clinic admin. Demo sign in and sign up with prefilled dummy credentials.",
      },
      { property: "og:title", content: "Sign in — MediAI Care" },
      {
        property: "og:description",
        content: "Patient, doctor and admin access to the MediAI Care platform.",
      },
    ],
  }),
  component: AuthPage,
});

const personas: Record<
  DemoRole,
  { label: string; icon: typeof HeartPulse; name: string; email: string; blurb: string }
> = {
  patient: {
    label: "Patient",
    icon: HeartPulse,
    name: currentPatient.name,
    email: currentPatient.email,
    blurb: "Symptom checker, appointments, prescriptions, history",
  },
  doctor: {
    label: "Doctor",
    icon: Stethoscope,
    name: currentDoctor.name,
    email: "dr.sarah@mediai.care",
    blurb: "Appointment kanban, patient EMR, weekly schedule",
  },
  admin: {
    label: "Admin",
    icon: ShieldCheck,
    name: "Ayesha Khan",
    email: "admin@mediai.care",
    blurb: "Platform analytics, user management, revenue insights",
  },
};

function AuthPage() {
  const navigate = useNavigate();
  const { role } = Route.useSearch();
  const [persona, setPersona] = useState<DemoRole>(role);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [pending, setPending] = useState(false);

  const existing = getSession();
  const active = personas[persona];

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = (form.get("name") as string) || active.name;
    const email = (form.get("email") as string) || active.email;
    setPending(true);
    setTimeout(() => {
      signIn({ role: persona, name, email });
      setPending(false);
      toast.success(
        mode === "signin" ? "Signed in to the demo workspace" : "Demo account created",
        { description: `Continuing as ${name} (${active.label})` },
      );
      navigate({ to: dashboardPath(persona) });
    }, 900);
  };

  return (
    <div className="gradient-hero relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-14">
      <Toaster />
      <div className="pointer-events-none absolute -left-24 top-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-info/15 blur-3xl" />

      <div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:block"
        >
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="gradient-primary flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground">
              <Activity className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-semibold">MediAI Care</span>
          </Link>
          <h1 className="mt-8 font-display text-4xl font-semibold leading-tight">
            One login for your <span className="text-gradient">entire care journey</span>
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            Patients get AI triage, bookings and records. Doctors get schedules, patient charts and
            consultation analytics. Admins run the whole clinic. This is a demo — no real
            credentials required.
          </p>
          <div className="mt-8 space-y-3">
            {(Object.keys(personas) as DemoRole[]).map((key) => {
              const p = personas[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPersona(key)}
                  className={`glass flex w-full items-start gap-3 rounded-2xl p-4 text-left transition-all duration-300 ${
                    persona === key ? "ring-2 ring-primary/60" : "hover:translate-x-1"
                  }`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
                    <p.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{p.label}s</p>
                    <p className="text-xs text-muted-foreground">{p.blurb}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="glass shadow-elegant rounded-[1.75rem] p-6 sm:p-8"
        >
          {existing && (
            <div className="mb-4 flex items-center justify-between rounded-xl bg-primary/10 px-4 py-2.5 text-xs">
              <span className="text-muted-foreground">
                Signed in as <span className="font-medium text-foreground">{existing.name}</span>
              </span>
              <Link
                to={dashboardPath(existing.role)}
                className="font-medium text-primary hover:underline"
              >
                Open dashboard
              </Link>
            </div>
          )}

          <Tabs value={persona} onValueChange={(v) => setPersona(v as DemoRole)}>
            <TabsList className="grid w-full grid-cols-3 rounded-xl">
              <TabsTrigger value="patient" className="rounded-lg">
                <HeartPulse className="mr-1.5 h-4 w-4" /> Patient
              </TabsTrigger>
              <TabsTrigger value="doctor" className="rounded-lg">
                <Stethoscope className="mr-1.5 h-4 w-4" /> Doctor
              </TabsTrigger>
              <TabsTrigger value="admin" className="rounded-lg">
                <ShieldCheck className="mr-1.5 h-4 w-4" /> Admin
              </TabsTrigger>
            </TabsList>

            <TabsContent value={persona} forceMount>
              <div className="mt-6 flex rounded-xl bg-muted/60 p-1 text-sm">
                {(["signin", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`relative flex-1 rounded-lg px-3 py-2 transition-colors ${
                      mode === m ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {mode === m && (
                      <motion.span
                        layoutId="auth-pill"
                        className="gradient-primary absolute inset-0 rounded-lg"
                        transition={{ type: "spring", stiffness: 340, damping: 30 }}
                      />
                    )}
                    <span className="relative">{m === "signin" ? "Sign in" : "Sign up"}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={submit} className="mt-6 space-y-4">
                <AnimatePresence mode="popLayout" initial={false}>
                  {mode === "signup" && (
                    <motion.div
                      key="name"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      <Label htmlFor="name">Full name</Label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="name"
                          name="name"
                          required
                          className="rounded-xl pl-9"
                          placeholder={active.name}
                          defaultValue={active.name}
                          key={`name-${persona}`}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="rounded-xl pl-9"
                      defaultValue={active.email}
                      key={`email-${persona}`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="rounded-xl pl-9"
                      defaultValue="demo1234"
                    />
                  </div>
                </div>

                <Button type="submit" size="lg" className="hover-lift w-full rounded-xl" disabled={pending}>
                  {pending
                    ? "Please wait…"
                    : `${mode === "signin" ? "Sign in" : "Create account"} as ${active.label}`}
                  {!pending && <ArrowRight className="ml-1 h-4 w-4" />}
                </Button>
              </form>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Demo experience with dummy data — credentials are prefilled and never sent anywhere.
              </p>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
