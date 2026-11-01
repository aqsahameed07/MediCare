import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  ArrowRight,
  HeartPulse,
  Lock,
  Mail,
  ShieldCheck,
  Stethoscope,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import {
  authApi,
  ApiError,
  dashboardPath,
  getSession,
  saveSession,
  type AuthUser,
  type Role as AuthRole,
} from "@/api/authApi";

type DemoRole = Exclude<AuthRole, "superadmin">;

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    role: (["patient", "doctor", "admin"].includes(search["role"] as string)
      ? search["role"]
      : "patient") as DemoRole,
  }),
  head: () => ({
    meta: [
      { title: "Sign in or create an account — MediAI Care" },
      {
        name: "description",
        content:
          "Access MediAI Care as a patient, doctor or clinic admin. Secure sign in and sign up.",
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

const DEMO_PASSWORD = "ChangeMe123!";

const personas: Record<
  DemoRole,
  { label: string; icon: typeof HeartPulse; name: string; email: string; blurb: string }
> = {
  patient: {
    label: "Patient",
    icon: HeartPulse,
    name: "Ali Patient",
    email: "patient@test.com",
    blurb: "Symptom checker, appointments, prescriptions, history",
  },
  doctor: {
    label: "Doctor",
    icon: Stethoscope,
    name: "Dr Sarah",
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
  const [existing, setExisting] = useState<AuthUser | null>(null);

  // Controlled form fields — always exactly what we send.
  const [name, setName] = useState(personas[role].name);
  const [email, setEmail] = useState(personas[role].email);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"Female" | "Male" | "Other" | "">("");

  // Read the session AFTER hydration so SSR and client agree.
  useEffect(() => {
    setExisting(getSession());
  }, []);

  const active = useMemo(() => personas[persona], [persona]);
  const canSignUp = persona === "patient";
  const effectiveMode = canSignUp ? mode : "signin";

  // When persona changes, prefill demo values (but keep whatever user typed if non-empty).
  const onPersonaChange = (next: DemoRole) => {
    setPersona(next);
    if (!name || name === personas[persona].name) setName(personas[next].name);
    if (!email || email === personas[persona].email) setEmail(personas[next].email);
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const finalName = name.trim() || active.name;
    const finalEmail = email.trim() || active.email;
    const finalPassword = password || DEMO_PASSWORD;

    if (finalPassword.length < 8) {
      toast.error("Password too short", {
        description: "Use at least 8 characters (or keep the demo password).",
      });
      return;
    }

    setPending(true);
    try {
      const data =
        effectiveMode === "signin"
          ? await authApi.login(finalEmail, finalPassword)
          : await authApi.register(finalName, finalEmail, finalPassword, {
              age: Number(age),
              gender: gender as "Female" | "Male" | "Other",
            });

      saveSession(data.token, data.user);
      setExisting(data.user);

      toast.success(effectiveMode === "signin" ? "Signed in" : "Account created", {
        description: `${data.user.name} · ${data.user.role}`,
      });
      navigate({ to: dashboardPath(data.user.role) });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Network error — is the backend running?";
      toast.error("Authentication failed", { description: message });
    } finally {
      setPending(false);
    }
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
            consultation analytics. Admins run the whole clinic.
          </p>
          <div className="mt-8 space-y-3">
            {(Object.keys(personas) as DemoRole[]).map((key) => {
              const p = personas[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onPersonaChange(key)}
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

          <Tabs value={persona} onValueChange={(v) => onPersonaChange(v as DemoRole)}>
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
              {canSignUp ? (
                <div className="mt-6 flex rounded-xl bg-muted/60 p-1 text-sm">
                  {(["signin", "signup"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={`relative flex-1 rounded-lg px-3 py-2 transition-colors ${
                        mode === m
                          ? "text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
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
              ) : (
                <p className="mt-6 rounded-xl bg-muted/60 px-4 py-3 text-xs text-muted-foreground">
                  {persona === "doctor"
                    ? "Doctor accounts are created by an administrator. Sign in with the credentials you were given."
                    : "Admin access is invite-only. Sign in with your admin credentials."}
                </p>
              )}

              <form onSubmit={submit} className="mt-6 space-y-4">
                <AnimatePresence mode="popLayout" initial={false}>
                  {effectiveMode === "signup" && (
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
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {effectiveMode === "signup" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        required
                        min={0}
                        max={120}
                        step={1}
                        inputMode="numeric"
                        placeholder="Age"
                        value={age}
                        onChange={(event) => setAge(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <select
                        id="gender"
                        name="gender"
                        required
                        value={gender}
                        onChange={(event) =>
                          setGender(event.target.value as "Female" | "Male" | "Other" | "")
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="" disabled>Select gender</option>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                )}

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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      minLength={8}
                      className="rounded-xl pl-9"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">Minimum 8 characters.</p>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="hover-lift w-full rounded-xl"
                  disabled={pending}
                >
                  {pending
                    ? "Please wait…"
                    : `${effectiveMode === "signin" ? "Sign in" : "Create account"} as ${active.label}`}
                  {!pending && <ArrowRight className="ml-1 h-4 w-4" />}
                </Button>
              </form>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Credentials are sent securely to the server. Use the prefilled demo accounts or
                create your own.
              </p>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
