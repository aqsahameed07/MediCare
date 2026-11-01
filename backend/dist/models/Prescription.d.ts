import { z } from "zod";
export declare const recordMedicationSchema: z.ZodObject<{
    name: z.ZodString;
    dosage: z.ZodString;
    frequency: z.ZodString;
    duration: z.ZodString;
    instructions: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export type PrescriptionMedication = z.infer<typeof recordMedicationSchema>;
//# sourceMappingURL=Prescription.d.ts.map