import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { z } from "zod";
import { User, type IUser } from "../models/User.js";
import { hashPassword } from "../utils/password.js";
import {
  createManagedUserSchema,
  updateManagedUserSchema,
} from "../validators/admin-users.js";

function serializeUser(user: IUser) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    ...(user.role === "patient"
      ? {
          age: user.age,
          gender: user.gender,
          profilePhoto: user.profilePhoto ?? null,
        }
      : {}),
    ...(user.role === "doctor"
      ? {
          doctorId: user.doctorId,
          profilePhoto: user.profilePhoto ?? null,
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
          phoneNumber: user.phoneNumber,
          address: user.address,
          specialization: user.specialization,
          qualifications: user.qualifications,
          yearsOfExperience: user.yearsOfExperience,
          medicalLicenseNumber: user.medicalLicenseNumber,
          department: user.department,
          consultationFee: user.consultationFee,
          bio: user.bio,
        }
      : {}),
  };
}

function isDuplicateEmail(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

function sendValidationError(res: Response, error: z.ZodError) {
  return res.status(400).json({
    success: false,
    message: error.issues.map((issue) => issue.message).join(", "),
    errors: error.issues,
  });
}

export async function listManagedUsers(_req: Request, res: Response) {
  try {
    const users = await User.find({ role: { $in: ["patient", "doctor"] } })
      .sort({ createdAt: -1 })
      .exec();
    return res.json({ success: true, users: users.map(serializeUser) });
  } catch (error) {
    console.error("[admin users] Failed to list users:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load users" });
  }
}

export async function createManagedUser(req: Request, res: Response) {
  try {
    const data = createManagedUserSchema.parse(req.body);
    const userData =
      data.role === "doctor"
        ? {
            ...data,
            profilePhoto: data.profilePhoto ?? undefined,
            doctorId: `DOC-${randomUUID().toUpperCase()}`,
          }
        : data;
    const user = await User.create({
      ...userData,
      email: data.email.toLowerCase(),
      password: await hashPassword(data.password),
    });
    return res.status(201).json({ success: true, user: serializeUser(user) });
  } catch (error) {
    if (error instanceof z.ZodError) return sendValidationError(res, error);
    if (isDuplicateEmail(error)) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }
    console.error("[admin users] Failed to create user:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create user" });
  }
}

export async function updateManagedUser(req: Request, res: Response) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  try {
    const data = updateManagedUserSchema.parse(req.body);
    const user = await User.findOne({
      _id: req.params.id,
      role: { $in: ["patient", "doctor"] },
    }).exec();
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (data.name !== undefined) user.name = data.name;
    if (data.email !== undefined) user.email = data.email.toLowerCase();
    if (data.password !== undefined)
      user.password = await hashPassword(data.password);
    if (user.role === "doctor") {
      if (!user.doctorId) {
        user.doctorId = `DOC-${randomUUID().toUpperCase()}`;
      }
      if (data.profilePhoto !== undefined) {
        user.set("profilePhoto", data.profilePhoto ?? undefined);
      }
      if (data.gender !== undefined) user.gender = data.gender;
      if (data.dateOfBirth !== undefined) user.dateOfBirth = data.dateOfBirth;
      if (data.phoneNumber !== undefined) user.phoneNumber = data.phoneNumber;
      if (data.address !== undefined) user.address = data.address;
      if (data.specialization !== undefined)
        user.specialization = data.specialization;
      if (data.qualifications !== undefined)
        user.qualifications = data.qualifications;
      if (data.yearsOfExperience !== undefined)
        user.yearsOfExperience = data.yearsOfExperience;
      if (data.medicalLicenseNumber !== undefined)
        user.medicalLicenseNumber = data.medicalLicenseNumber;
      if (data.department !== undefined) user.department = data.department;
      if (data.consultationFee !== undefined)
        user.consultationFee = data.consultationFee;
      if (data.bio !== undefined) user.bio = data.bio;
    } else if (user.role === "patient") {
      if (data.age !== undefined) user.age = data.age;
      if (data.gender !== undefined) user.gender = data.gender;
      if (data.profilePhoto !== undefined) {
        user.set("profilePhoto", data.profilePhoto ?? undefined);
      }
    }

    await user.save();
    return res.json({ success: true, user: serializeUser(user) });
  } catch (error) {
    if (error instanceof z.ZodError) return sendValidationError(res, error);
    if (isDuplicateEmail(error)) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }
    console.error("[admin users] Failed to update user:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update user" });
  }
}

export async function deleteManagedUser(req: Request, res: Response) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  try {
    const user = await User.findOneAndDelete({
      _id: req.params.id,
      role: { $in: ["patient", "doctor"] },
    }).exec();
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    return res.json({ success: true });
  } catch (error) {
    console.error("[admin users] Failed to delete user:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete user" });
  }
}
