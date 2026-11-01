import { z } from "zod";

export const appointmentSlots = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
] as const;

export const createAppointmentSchema = z.object({
  doctorId: z.string().regex(/^[a-f\d]{24}$/i, "Choose a valid doctor"),
  date: z.iso.date(),
  slot: z.enum(appointmentSlots),
  notes: z.string().trim().max(1000).optional(),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(["confirmed", "completed", "cancelled"]),
});

export const appointmentAvailabilityQuerySchema = z.object({
  doctorId: z.string().regex(/^[a-f\d]{24}$/i, "Choose a valid doctor"),
  date: z.iso.date(),
});
