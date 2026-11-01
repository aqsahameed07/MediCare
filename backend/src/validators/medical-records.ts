import { z } from "zod";
import { recordMedicationSchema } from "../models/Prescription.js";

export const createMedicalRecordSchema = z.object({
  symptoms: z.string().trim().min(1, "Symptoms are required").max(3000),
  diagnosis: z.string().trim().max(2000).default(""),
  recommendedTests: z.array(z.string().trim().min(1).max(160)).max(30).default([]),
  medications: z.array(recordMedicationSchema).max(30).default([]),
  instructions: z.string().trim().max(3000).default(""),
  followUpDate: z.string().trim().max(10).default(""),
});
