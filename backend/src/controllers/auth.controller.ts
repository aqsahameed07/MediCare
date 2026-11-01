import type { Request, Response } from "express";
import { z } from "zod";
import { User } from "../models/User.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import {
  loginSchema,
  patientProfileSchema,
  registerSchema,
} from "../validators/auth.js";

const sanitize = (user: any) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  age: user.age ?? null,
  gender: user.gender ?? null,
});

export async function register(req: Request, res: Response) {
  console.log("[register] Received body:", req.body);
  try {
    const data = registerSchema.parse(req.body);
    console.log("[register] Zod parsed OK:", data);

    const exists = await User.findOne({ email: data.email });
    if (exists) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    // Only patients can self-register. Doctors/admins are created by an admin.
    const role = data.role ?? "patient";
    if (role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patient accounts can self-register",
      });
    }

    const hashed = await hashPassword(data.password);
    console.log("[register] Password hashed, creating user…");
    const user = await User.create({ ...data, password: hashed });

    const token = signToken({ sub: user.id, role: user.role });

    return res.status(201).json({
      success: true,
      token,
      user: sanitize(user),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error("[register] Zod issues:", JSON.stringify(err.issues, null, 2));
      return res.status(400).json({ success: false, errors: err.issues });
    }
    console.error("[register] Non-Zod error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function login(req: Request, res: Response) {
  console.log("[login] Received body:", req.body);
  try {
    const data = loginSchema.parse(req.body);
    console.log("[login] Zod parsed OK:", data);

    const user = await User.findOne({ email: data.email }).select("+password");
    if (!user) {
      console.log("[login] No user found for email:", data.email);
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const ok = await verifyPassword(data.password, user.password);
    if (!ok) {
      console.log("[login] Password mismatch for:", data.email);
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = signToken({ sub: user.id, role: user.role });
    console.log("[login] Success for:", data.email, "role:", user.role);

    return res.json({
      success: true,
      token,
      user: sanitize(user),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error("[login] Zod issues:", JSON.stringify(err.issues, null, 2));
      return res.status(400).json({ success: false, errors: err.issues });
    }
    console.error("[login] Non-Zod error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function me(req: Request, res: Response) {
  // req.user is set by requireAuth middleware
  const user = await User.findById((req as any).user.sub);
  if (!user) return res.status(404).json({ success: false });
  return res.json({ success: true, user: sanitize(user) });
}

export async function updatePatientProfile(req: Request, res: Response) {
  try {
    const data = patientProfileSchema.parse(req.body);
    const actor = (req as Request & { user: { sub: string; role: string } }).user;
    if (actor.role !== "patient") {
      return res.status(403).json({ success: false, message: "Patient account required" });
    }
    const user = await User.findOneAndUpdate(
      { _id: actor.sub, role: "patient" },
      { $set: data },
      { new: true, runValidators: true },
    ).exec();
    if (!user) return res.status(404).json({ success: false, message: "Patient account not found" });
    return res.json({ success: true, user: sanitize(user) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.issues.map((issue) => issue.message).join(", "),
        errors: error.issues,
      });
    }
    console.error("[profile] Failed to update patient profile:", error);
    return res.status(500).json({ success: false, message: "Failed to update patient profile" });
  }
}