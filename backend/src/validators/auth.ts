import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  age: z.number().int().min(0, "Age must be 0 or older").max(120, "Enter a valid age"),
  gender: z.enum(["Female", "Male", "Other"]),
  role: z.enum(["patient", "doctor", "admin", "superadmin"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const patientProfileSchema = z.object({
  age: z.number().int().min(0, "Age must be 0 or older").max(120, "Enter a valid age"),
  gender: z.enum(["Female", "Male", "Other"]),
});