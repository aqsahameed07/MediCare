import { z } from "zod";
export declare const createMedicalRecordSchema: z.ZodObject<{
    symptoms: z.ZodString;
    diagnosis: z.ZodDefault<z.ZodString>;
    recommendedTests: z.ZodDefault<z.ZodArray<z.ZodString>>;
    medications: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        dosage: z.ZodString;
        frequency: z.ZodString;
        duration: z.ZodString;
        instructions: z.ZodDefault<z.ZodString>;
    }, z.core.$strip>>>;
    instructions: z.ZodDefault<z.ZodString>;
    followUpDate: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=medical-records.d.ts.map