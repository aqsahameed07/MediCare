import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { Activity, ArrowRight, HeartPulse, Lock, Mail, Stethoscope, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import { currentDoctor, currentPatient } from "@/lib/mock-data";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or create an account — MediAI Care" },
      {
        name: "description",
        content:
          "Access MediAI Care as a patient or doctor. Demo sign in and sign up with prefilled dummy credentials.",
      },
      { property: "og:title", content: "Sign in — MediAI Care" },
      {
        property: "og:description",
        content: "Patient and doctor access to the MediAI Care platform.",
      },
    ],
  }),
  component: AuthPage,
});

type Persona = "patient" | "doctor";

function AuthPage() {
  const navigate = useNavigate();
  const [persona, setPersona] = useState<Persona>("patient");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [pending, setPending] = useState(false);

  const demoEmail = persona === "patient" ? currentPatient.email : "dr.sarah@mediai.care";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setTimeout(() => {
      setPending(false);
      toast.success(
        mode === "signin" ? "Signed in to the demo workspace" : "Demo account created",
        { description: `Continuing as ${persona === "patient" ? currentPatient.name : currentDoctor.name}` },
      );
      navigate({ to: persona === "patient" ? "/patient" : "/doctor" });
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
            consultation analytics. This is a demo — no real credentials required.
          </p>
          <div className="mt-8 space-y-3">
            {[
              { icon: HeartPulse, t: "Patients", d: "Symptom checker, appointments, prescriptions, history" },
              { icon: Stethoscope, t: "Doctors", d: "Appointment kanban, patient EMR, weekly schedule" },
            ].map((r) => (
              <div key={r.t} className="glass flex items-start gap-3 rounded-2xl p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
                  <r.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-medium">{r.t}</p>
                  <p className="text-xs text-muted-foreground">{r.d}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="glass shadow-elegant rounded-[1.75rem] p-6 sm:p-8"
        >
          <Tabs value={persona} onValueChange={(v) => setPersona(v as Persona)}>
            <TabsList className="grid w-full grid-cols-2 rounded-xl">
              <TabsTrigger value="patient" className="rounded-lg">
                <HeartPulse className="mr-1.5 h-4 w-4" /> Patient
              </TabsTrigger>
              <TabsTrigger value="doctor" className="rounded-lg">
                <Stethoscope className="mr-1.5 h-4 w-4" /> Doctor
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
                          required
                          className="rounded-xl pl-9"
                          placeholder={persona === "patient" ? currentPatient.name : currentDoctor.name}
                          defaultValue={persona === "patient" ? currentPatient.name : currentDoctor.name}
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
                      type="email"
                      required
                      className="rounded-xl pl-9"
                      defaultValue={demoEmail}
                      key={demoEmail}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      required
                      className="rounded-xl pl-9"
                      defaultValue="demo1234"
                    />
                  </div>
                </div>

                <Button type="submit" size="lg" className="hover-lift w-full rounded-xl" disabled={pending}>
                  {pending ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
                  {!pending && <ArrowRight className="ml-1 h-4 w-4" />}
                </Button>
              </form>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Demo experience with dummy data — credentials are prefilled and never sent anywhere.
              </p>
              <p className="mt-3 text-center text-xs">
                <Link to="/admin" className="text-primary hover:underline">
                  Continue as clinic admin
                </Link>
              </p>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
