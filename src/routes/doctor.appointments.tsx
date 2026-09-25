import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/shell";
import { Avatar, doctorPersona } from "@/components/dashboard/common";
import { doctorNav } from "@/lib/nav";
import { appointments, currentDoctor, formatDate, patients, type Appointment, type AppointmentStatus } from "@/lib/mock-data";

export const Route = createFileRoute("/doctor/appointments")({
  head: () => ({
    meta: [
      { title: "Appointment Board — MediAI Care" },
      { name: "description", content: "Drag-and-drop kanban board to manage patient appointments." },
      { property: "og:title", content: "Appointment Board — MediAI Care" },
      { property: "og:description", content: "Move appointments between pending, upcoming, completed and cancelled." },
    ],
  }),
  component: Board,
});

const COLUMNS: { key: AppointmentStatus; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "upcoming", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

function Board() {
  const [items, setItems] = useState<Appointment[]>(() => appointments.filter((a) => a.doctorId === currentDoctor.id).slice(0, 32));
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<AppointmentStatus | null>(null);

  function drop(status: AppointmentStatus) {
    if (!dragId) return;
    setItems((l) => l.map((a) => (a.id === dragId ? { ...a, status } : a)));
    toast.success(`Moved to ${COLUMNS.find((c) => c.key === status)!.label}`);
    setDragId(null);
    setOver(null);
  }

  return (
    <DashboardShell title="Appointment board" subtitle="Drag cards between columns to update status" nav={doctorNav} role="Doctor" persona={doctorPersona}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const list = items.filter((a) => a.status === col.key);
          return (
            <div
              key={col.key}
              onDragOver={(e) => { e.preventDefault(); setOver(col.key); }}
              onDragLeave={() => setOver(null)}
              onDrop={() => drop(col.key)}
              className={`glass min-h-[400px] rounded-2xl p-3 transition-all ${over === col.key ? "ring-2 ring-primary" : ""}`}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <p className="text-sm font-semibold">{col.label}</p>
                <span className="rounded-full bg-muted px-2 text-xs">{list.length}</span>
              </div>
              <div className="space-y-2">
                {list.map((a) => {
                  const p = patients.find((x) => x.id === a.patientId);
                  return (
                    <motion.div
                      layout
                      key={a.id}
                      draggable
                      onDragStart={() => setDragId(a.id)}
                      className="cursor-grab rounded-xl border border-border/60 bg-card p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar name={a.patientName} hue={p?.avatarHue ?? 150} size={30} />
                        <p className="truncate text-sm font-medium">{a.patientName}</p>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{a.reason}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{formatDate(a.date)} · {a.time} · {a.mode}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
