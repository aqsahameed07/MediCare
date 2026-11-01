import { z } from "zod";
export declare const appointmentSlots: readonly ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"];
export declare const createAppointmentSchema: z.ZodObject<{
    doctorId: z.ZodString;
    date: z.ZodISODate;
    slot: z.ZodEnum<{
        "01:00 PM": "01:00 PM";
        "01:30 PM": "01:30 PM";
        "02:00 PM": "02:00 PM";
        "02:30 PM": "02:30 PM";
        "03:00 PM": "03:00 PM";
        "03:30 PM": "03:30 PM";
        "04:00 PM": "04:00 PM";
        "04:30 PM": "04:30 PM";
        "09:00 AM": "09:00 AM";
        "09:30 AM": "09:30 AM";
        "10:00 AM": "10:00 AM";
        "10:30 AM": "10:30 AM";
        "11:00 AM": "11:00 AM";
        "11:30 AM": "11:30 AM";
    }>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateAppointmentStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        cancelled: "cancelled";
        completed: "completed";
        confirmed: "confirmed";
    }>;
}, z.core.$strip>;
export declare const appointmentAvailabilityQuerySchema: z.ZodObject<{
    doctorId: z.ZodString;
    date: z.ZodISODate;
}, z.core.$strip>;
//# sourceMappingURL=appointments.d.ts.map