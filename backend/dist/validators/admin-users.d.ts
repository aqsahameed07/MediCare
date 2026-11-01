import { z } from "zod";
export declare const managedRoleSchema: z.ZodEnum<{
    doctor: "doctor";
    patient: "patient";
}>;
export declare const createManagedUserSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodLiteral<"patient">;
}, z.core.$strip>, z.ZodObject<{
    profilePhoto: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    gender: z.ZodEnum<{
        Female: "Female";
        Male: "Male";
        Other: "Other";
    }>;
    dateOfBirth: z.ZodISODate;
    phoneNumber: z.ZodString;
    address: z.ZodString;
    specialization: z.ZodString;
    qualifications: z.ZodString;
    yearsOfExperience: z.ZodNumber;
    medicalLicenseNumber: z.ZodString;
    department: z.ZodString;
    consultationFee: z.ZodNumber;
    bio: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodLiteral<"doctor">;
}, z.core.$strip>], "role">;
export declare const updateManagedUserSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    profilePhoto: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    gender: z.ZodOptional<z.ZodEnum<{
        Female: "Female";
        Male: "Male";
        Other: "Other";
    }>>;
    dateOfBirth: z.ZodOptional<z.ZodISODate>;
    phoneNumber: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    specialization: z.ZodOptional<z.ZodString>;
    qualifications: z.ZodOptional<z.ZodString>;
    yearsOfExperience: z.ZodOptional<z.ZodNumber>;
    medicalLicenseNumber: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
    consultationFee: z.ZodOptional<z.ZodNumber>;
    bio: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=admin-users.d.ts.map