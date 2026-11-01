import { Badge } from "@/components/ui/badge";
import { currentDoctor, currentPatient, type AppointmentStatus } from "@/lib/mock-data";

export const chartTooltip = {
  contentStyle: {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: "0.85rem",
    color: "var(--popover-foreground)",
    fontSize: 12,
  },
};

export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--primary)",
];

export const patientPersona = {
  name: currentPatient.name,
  meta: `${currentPatient.age} yrs · ${currentPatient.bloodGroup}`,
  hue: currentPatient.avatarHue,
};
export const doctorPersona = {
  name: currentDoctor.name,
  meta: currentDoctor.specialty,
  hue: currentDoctor.avatarHue,
};
export const adminPersona = { name: "Admin Console", meta: "Super administrator", hue: 200 };

export function Avatar({ name, hue, size = 40 }: { name: string; hue: number; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full text-xs font-semibold text-primary-foreground"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, hsl(${hue} 70% 45%), hsl(${(hue + 48) % 360} 70% 55%))`,
      }}
    >
      {name
        .replace("Dr. ", "")
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")}
    </span>
  );
}

const statusStyle: Record<AppointmentStatus, string> = {
  upcoming: "bg-primary/15 text-primary",
  confirmed: "bg-primary/15 text-primary",
  completed: "bg-success/15 text-success",
  cancelled: "bg-destructive/15 text-destructive",
  pending: "bg-warning/20 text-warning-foreground",
  requested: "bg-warning/20 text-warning-foreground",
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <Badge variant="secondary" className={`rounded-full capitalize ${statusStyle[status]}`}>
      {status}
    </Badge>
  );
}
