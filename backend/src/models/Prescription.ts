import { z } from "zod";

export const recordMedicationSchema = z.object({
  name: z.string().trim().min(1, "Medication name is required").max(120),
  dosage: z.string().trim().min(1, "Dosage is required").max(80),
  frequency: z.string().trim().min(1, "Frequency is required").max(120),
  duration: z.string().trim().min(1, "Duration is required").max(80),
  instructions: z.string().trim().max(500).default(""),
});

export type PrescriptionMedication = z.infer<typeof recordMedicationSchema>;
