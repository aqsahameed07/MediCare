"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateManagedUserSchema = exports.createManagedUserSchema = exports.managedRoleSchema = void 0;
const zod_1 = require("zod");
exports.managedRoleSchema = zod_1.z.enum(["patient", "doctor"]);
const photoSchema = zod_1.z
    .string()
    .max(4_200_000, "Profile photo must be 3 MB or smaller")
    .regex(/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/, "Profile photo must be PNG, JPEG or WebP")
    .optional();
const doctorProfileSchema = zod_1.z.object({
    profilePhoto: photoSchema.nullable().optional(),
    gender: zod_1.z.enum(["Female", "Male", "Other"]),
    dateOfBirth: zod_1.z.iso.date(),
    phoneNumber: zod_1.z.string().trim().min(5).max(30),
    address: zod_1.z.string().trim().min(2).max(500),
    specialization: zod_1.z.string().trim().min(2).max(100),
    qualifications: zod_1.z.string().trim().min(2).max(250),
    yearsOfExperience: zod_1.z.number().int().min(0).max(80),
    medicalLicenseNumber: zod_1.z.string().trim().min(2).max(100),
    department: zod_1.z.string().trim().min(2).max(100),
    consultationFee: zod_1.z.number().min(0).max(1_000_000),
    bio: zod_1.z.string().trim().min(2).max(5000),
});
const baseUserSchema = {
    name: zod_1.z.string().trim().min(2, "Name must be at least 2 characters").max(80),
    email: zod_1.z.string().trim().email("Invalid email address"),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(128),
};
exports.createManagedUserSchema = zod_1.z.discriminatedUnion("role", [
    zod_1.z.object({ ...baseUserSchema, role: zod_1.z.literal("patient") }),
    zod_1.z.object({
        ...baseUserSchema,
        role: zod_1.z.literal("doctor"),
        ...doctorProfileSchema.shape,
    }),
]);
exports.updateManagedUserSchema = zod_1.z
    .object({
    name: zod_1.z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(80)
        .optional(),
    email: zod_1.z.string().trim().email("Invalid email address").optional(),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(128)
        .optional(),
    profilePhoto: photoSchema.nullable().optional(),
    gender: zod_1.z.enum(["Female", "Male", "Other"]).optional(),
    dateOfBirth: zod_1.z.iso.date().optional(),
    phoneNumber: zod_1.z.string().trim().min(5).max(30).optional(),
    address: zod_1.z.string().trim().min(2).max(500).optional(),
    specialization: zod_1.z.string().trim().min(2).max(100).optional(),
    qualifications: zod_1.z.string().trim().min(2).max(250).optional(),
    yearsOfExperience: zod_1.z.number().int().min(0).max(80).optional(),
    medicalLicenseNumber: zod_1.z.string().trim().min(2).max(100).optional(),
    department: zod_1.z.string().trim().min(2).max(100).optional(),
    consultationFee: zod_1.z.number().min(0).max(1_000_000).optional(),
    bio: zod_1.z.string().trim().min(2).max(5000).optional(),
})
    .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
});
//# sourceMappingURL=admin-users.js.map