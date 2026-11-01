import { z } from "zod";

export const managedRoleSchema = z.enum(["patient", "doctor"]);

const photoSchema = z
  .string()
  .max(4_200_000, "Profile photo must be 3 MB or smaller")
  .regex(
    /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/,
    "Profile photo must be PNG, JPEG or WebP",
  )
  .optional();

const doctorProfileSchema = z.object({
  profilePhoto: photoSchema.nullable().optional(),
  gender: z.enum(["Female", "Male", "Other"]),
  dateOfBirth: z.iso.date(),
  phoneNumber: z.string().trim().min(5).max(30),
  address: z.string().trim().min(2).max(500),
  specialization: z.string().trim().min(2).max(100),
  qualifications: z.string().trim().min(2).max(250),
  yearsOfExperience: z.number().int().min(0).max(80),
  medicalLicenseNumber: z.string().trim().min(2).max(100),
  department: z.string().trim().min(2).max(100),
  consultationFee: z.number().min(0).max(1_000_000),
  bio: z.string().trim().min(2).max(5000),
});

const baseUserSchema = {
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
};

export const createManagedUserSchema = z.discriminatedUnion("role", [
  z.object({
    ...baseUserSchema,
    role: z.literal("patient"),
    age: z.number().int().min(0).max(120),
    gender: z.enum(["Female", "Male", "Other"]),
    profilePhoto: photoSchema.nullable().optional(),
  }),
  z.object({
    ...baseUserSchema,
    role: z.literal("doctor"),
    ...doctorProfileSchema.shape,
  }),
]);

export const updateManagedUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(80)
      .optional(),
    email: z.string().trim().email("Invalid email address").optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128)
      .optional(),
    profilePhoto: photoSchema.nullable().optional(),
    gender: z.enum(["Female", "Male", "Other"]).optional(),
    age: z.number().int().min(0).max(120).optional(),
    dateOfBirth: z.iso.date().optional(),
    phoneNumber: z.string().trim().min(5).max(30).optional(),
    address: z.string().trim().min(2).max(500).optional(),
    specialization: z.string().trim().min(2).max(100).optional(),
    qualifications: z.string().trim().min(2).max(250).optional(),
    yearsOfExperience: z.number().int().min(0).max(80).optional(),
    medicalLicenseNumber: z.string().trim().min(2).max(100).optional(),
    department: z.string().trim().min(2).max(100).optional(),
    consultationFee: z.number().min(0).max(1_000_000).optional(),
    bio: z.string().trim().min(2).max(5000).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
