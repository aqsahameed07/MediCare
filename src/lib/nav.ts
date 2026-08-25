import {
  BarChart3,
  Bot,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Pill,
  Stethoscope,
  Users,
  History,
  KanbanSquare,
} from "lucide-react";
import type { NavItem } from "@/components/dashboard/shell";

export const patientNav: NavItem[] = [
  { label: "Overview", to: "/patient", icon: LayoutDashboard },
  { label: "AI Symptom Checker", to: "/patient/symptoms", icon: Bot },
  { label: "Find Doctors", to: "/patient/doctors", icon: Stethoscope },
  { label: "Appointments", to: "/patient/appointments", icon: CalendarDays },
  { label: "Prescriptions", to: "/patient/prescriptions", icon: Pill },
  { label: "Medical History", to: "/patient/history", icon: History },
];

export const doctorNav: NavItem[] = [
  { label: "Overview", to: "/doctor", icon: LayoutDashboard },
  { label: "Appointments", to: "/doctor/appointments", icon: KanbanSquare },
  { label: "Patients", to: "/doctor/patients", icon: Users },
  { label: "Schedule", to: "/doctor/schedule", icon: CalendarDays },
];

export const adminNav: NavItem[] = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard },
  { label: "Users", to: "/admin/users", icon: ClipboardList },
  { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
];
