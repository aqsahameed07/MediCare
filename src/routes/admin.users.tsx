import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/shell";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, adminPersona } from "@/components/dashboard/common";
import { adminNav } from "@/lib/nav";
import { doctors as allDoctors, patients as allPatients, formatDate } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "User Management — MediAI Care" },
      { name: "description", content: "Manage patients and doctors across the platform." },
      { property: "og:title", content: "User Management — MediAI Care" },
      { property: "og:description", content: "Search, verify and remove platform users." },
    ],
  }),
  component: UsersPage,
});

function UsersPage() {
  const [q, setQ] = useState("");
  const [patients, setPatients] = useState(allPatients);
  const [doctors, setDoctors] = useState(allDoctors);
  const m = (s: string) => s.toLowerCase().includes(q.toLowerCase());

  return (
    <DashboardShell title="User management" subtitle={`${patients.length} patients · ${doctors.length} doctors`} nav={adminNav} role="Admin" persona={adminPersona}>
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users" className="rounded-xl pl-9" />
      </div>
      <Tabs defaultValue="patients">
        <TabsList className="rounded-xl"><TabsTrigger value="patients">Patients</TabsTrigger><TabsTrigger value="doctors">Doctors</TabsTrigger></TabsList>
        <TabsContent value="patients">
          <GlassCard className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground"><tr><th className="py-2">Name</th><th>Age</th><th>City</th><th>Last visit</th><th>Status</th><th /></tr></thead>
              <tbody>
                {patients.filter((p) => m(p.name)).map((p) => (
                  <tr key={p.id} className="border-t border-border/50">
                    <td className="py-2.5"><div className="flex items-center gap-2"><Avatar name={p.name} hue={p.avatarHue} size={30} /><div><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.email}</p></div></div></td>
                    <td>{p.age}</td><td>{p.city}</td><td>{formatDate(p.lastVisit)}</td>
                    <td><Badge variant="secondary" className={p.status === "Active" ? "bg-success/15 text-success" : ""}>{p.status}</Badge></td>
                    <td><Button size="icon" variant="ghost" onClick={() => { setPatients((l) => l.filter((x) => x.id !== p.id)); toast("Patient removed"); }}><Trash2 className="h-4 w-4" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        </TabsContent>
        <TabsContent value="doctors">
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
                    <td><Button size="icon" variant="ghost" onClick={() => { setDoctors((l) => l.filter((x) => x.id !== d.id)); toast("Doctor removed"); }}><Trash2 className="h-4 w-4" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
