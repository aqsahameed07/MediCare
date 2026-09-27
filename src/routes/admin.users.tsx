import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, adminPersona } from "@/components/dashboard/common";
import { adminNav } from "@/lib/nav";
import {
  doctors as allDoctors,
  patients as allPatients,
  formatDate,
  SPECIALTIES,
  type Doctor,
  type Patient,
} from "@/lib/mock-data";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "User Management — MediAI Care" },
      { name: "description", content: "Add, edit and manage patients and doctors across the platform." },
      { property: "og:title", content: "User Management — MediAI Care" },
      { property: "og:description", content: "Admins add, edit, verify and remove platform users." },
    ],
  }),
  component: UsersPage,
});

type Editing<T> = { mode: "add" | "edit"; data: T } | null;

const blankPatient = (): Patient => ({
  id: `p-${Date.now()}`,
  name: "",
  age: 30,
  gender: "Female",
  city: "",
  bloodGroup: "O+",
  healthScore: 80,
  lastVisit: new Date().toISOString(),
  conditions: [],
  email: "",
  phone: "",
  status: "Active",
  avatarHue: Math.floor(Math.random() * 360),
});

const blankDoctor = (): Doctor => ({
  id: `d-${Date.now()}`,
  name: "",
  specialty: SPECIALTIES[0],
  experience: 5,
  rating: 4.5,
  reviews: 0,
  fee: 50,
  hospital: "",
  city: "",
  nextSlot: "Tomorrow, 10:00",
  matchScore: 80,
  bio: "",
  languages: ["English"],
  patients: 0,
  avatarHue: Math.floor(Math.random() * 360),
  verified: true,
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function UsersPage() {
  const [q, setQ] = useState("");
  const [patients, setPatients] = useState(allPatients);
  const [doctors, setDoctors] = useState(allDoctors);
  const [editP, setEditP] = useState<Editing<Patient>>(null);
  const [editD, setEditD] = useState<Editing<Doctor>>(null);
  const m = (s: string) => s.toLowerCase().includes(q.toLowerCase());

  const savePatient = () => {
    if (!editP) return;
    const d = editP.data;
    if (!d.name.trim() || !d.email.trim()) { toast.error("Name and email are required"); return; }
    setPatients((l) => (editP.mode === "add" ? [d, ...l] : l.map((x) => (x.id === d.id ? d : x))));
    toast.success(editP.mode === "add" ? "Patient added" : "Patient updated", { description: d.name });
    setEditP(null);
  };

  const saveDoctor = () => {
    if (!editD) return;
    const d = editD.data;
    if (!d.name.trim() || !d.hospital.trim()) { toast.error("Name and hospital are required"); return; }
    setDoctors((l) => (editD.mode === "add" ? [d, ...l] : l.map((x) => (x.id === d.id ? d : x))));
    toast.success(editD.mode === "add" ? "Doctor account created" : "Doctor updated", {
      description: editD.mode === "add" ? `${d.name} can now sign in` : d.name,
    });
    setEditD(null);
  };

  const setP = (patch: Partial<Patient>) => setEditP((e) => (e ? { ...e, data: { ...e.data, ...patch } } : e));
  const setD = (patch: Partial<Doctor>) => setEditD((e) => (e ? { ...e, data: { ...e.data, ...patch } } : e));

  return (
    <DashboardShell title="User management" subtitle={`${patients.length} patients · ${doctors.length} doctors`} nav={adminNav} role="Admin" persona={adminPersona}>
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users" className="rounded-xl pl-9" />
      </div>
      <Tabs defaultValue="patients">
        <TabsList className="rounded-xl"><TabsTrigger value="patients">Patients</TabsTrigger><TabsTrigger value="doctors">Doctors</TabsTrigger></TabsList>

        <TabsContent value="patients">
          <div className="mb-3 flex justify-end">
            <Button className="rounded-xl" onClick={() => setEditP({ mode: "add", data: blankPatient() })}><Plus className="mr-1 h-4 w-4" /> Add patient</Button>
          </div>
          <GlassCard className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground"><tr><th className="py-2">Name</th><th>Age</th><th>City</th><th>Last visit</th><th>Status</th><th /></tr></thead>
              <tbody>
                {patients.filter((p) => m(p.name)).map((p) => (
                  <tr key={p.id} className="border-t border-border/50">
                    <td className="py-2.5"><div className="flex items-center gap-2"><Avatar name={p.name} hue={p.avatarHue} size={30} /><div><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.email}</p></div></div></td>
                    <td>{p.age}</td><td>{p.city}</td><td>{formatDate(p.lastVisit)}</td>
                    <td><Badge variant="secondary" className={p.status === "Active" ? "bg-success/15 text-success" : ""}>{p.status}</Badge></td>
                    <td className="whitespace-nowrap text-right">
                      <Button size="icon" variant="ghost" aria-label="Edit patient" onClick={() => setEditP({ mode: "edit", data: { ...p } })}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" aria-label="Remove patient" onClick={() => { setPatients((l) => l.filter((x) => x.id !== p.id)); toast("Patient removed"); }}><Trash2 className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        </TabsContent>

        <TabsContent value="doctors">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">Doctors can't sign up themselves — only admins can create doctor accounts.</p>
            <Button className="rounded-xl" onClick={() => setEditD({ mode: "add", data: blankDoctor() })}><Plus className="mr-1 h-4 w-4" /> Add doctor</Button>
          </div>
          <GlassCard className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground"><tr><th className="py-2">Name</th><th>Specialty</th><th>Hospital</th><th>Rating</th><th>Verified</th><th /></tr></thead>
              <tbody>
                {doctors.filter((d) => m(d.name)).map((d) => (
                  <tr key={d.id} className="border-t border-border/50">
                    <td className="py-2.5"><div className="flex items-center gap-2"><Avatar name={d.name} hue={d.avatarHue} size={30} /><p className="font-medium">{d.name}</p></div></td>
                    <td>{d.specialty}</td><td>{d.hospital}</td>
                    <td><span className="inline-flex items-center gap-1"><Star className="h-3 w-3 fill-warning text-warning" />{d.rating}</span></td>
                    <td>
                      <Button size="sm" variant={d.verified ? "secondary" : "outline"} className="h-7 rounded-lg text-xs"
                        onClick={() => setDoctors((l) => l.map((x) => x.id === d.id ? { ...x, verified: !x.verified } : x))}>
                        {d.verified ? "Verified" : "Verify"}
                      </Button>
                    </td>
                    <td className="whitespace-nowrap text-right">
                      <Button size="icon" variant="ghost" aria-label="Edit doctor" onClick={() => setEditD({ mode: "edit", data: { ...d } })}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" aria-label="Remove doctor" onClick={() => { setDoctors((l) => l.filter((x) => x.id !== d.id)); toast("Doctor removed"); }}><Trash2 className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        </TabsContent>
      </Tabs>

      <Dialog open={!!editP} onOpenChange={(o) => !o && setEditP(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editP?.mode === "add" ? "Add patient" : "Edit patient"}</DialogTitle>
            <DialogDescription>Patient details are visible to their assigned doctors.</DialogDescription>
          </DialogHeader>
          {editP && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full name"><Input value={editP.data.name} onChange={(e) => setP({ name: e.target.value })} /></Field>
              <Field label="Email"><Input type="email" value={editP.data.email} onChange={(e) => setP({ email: e.target.value })} /></Field>
              <Field label="Phone"><Input value={editP.data.phone} onChange={(e) => setP({ phone: e.target.value })} /></Field>
              <Field label="City"><Input value={editP.data.city} onChange={(e) => setP({ city: e.target.value })} /></Field>
              <Field label="Age"><Input type="number" min={0} value={editP.data.age} onChange={(e) => setP({ age: Number(e.target.value) })} /></Field>
              <Field label="Gender">
                <Select value={editP.data.gender} onValueChange={(v) => setP({ gender: v as Patient["gender"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Female">Female</SelectItem><SelectItem value="Male">Male</SelectItem></SelectContent>
                </Select>
              </Field>
              <Field label="Blood group">
                <Select value={editP.data.bloodGroup} onValueChange={(v) => setP({ bloodGroup: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Status">
                <Select value={editP.data.status} onValueChange={(v) => setP({ status: v as Patient["status"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
                </Select>
              </Field>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditP(null)}>Cancel</Button>
            <Button onClick={savePatient}>{editP?.mode === "add" ? "Add patient" : "Save changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editD} onOpenChange={(o) => !o && setEditD(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editD?.mode === "add" ? "Create doctor account" : "Edit doctor"}</DialogTitle>
            <DialogDescription>
              {editD?.mode === "add" ? "The doctor will sign in with the credentials you share with them." : "Update this doctor's profile."}
            </DialogDescription>
          </DialogHeader>
          {editD && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full name"><Input value={editD.data.name} placeholder="Dr. …" onChange={(e) => setD({ name: e.target.value })} /></Field>
              <Field label="Specialty">
                <Select value={editD.data.specialty} onValueChange={(v) => setD({ specialty: v as Doctor["specialty"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SPECIALTIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Hospital"><Input value={editD.data.hospital} onChange={(e) => setD({ hospital: e.target.value })} /></Field>
              <Field label="City"><Input value={editD.data.city} onChange={(e) => setD({ city: e.target.value })} /></Field>
              <Field label="Experience (years)"><Input type="number" min={0} value={editD.data.experience} onChange={(e) => setD({ experience: Number(e.target.value) })} /></Field>
              <Field label="Consultation fee ($)"><Input type="number" min={0} value={editD.data.fee} onChange={(e) => setD({ fee: Number(e.target.value) })} /></Field>
              <div className="sm:col-span-2">
                <Field label="Short bio"><Input value={editD.data.bio} onChange={(e) => setD({ bio: e.target.value })} /></Field>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditD(null)}>Cancel</Button>
            <Button onClick={saveDoctor}>{editD?.mode === "add" ? "Create account" : "Save changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
