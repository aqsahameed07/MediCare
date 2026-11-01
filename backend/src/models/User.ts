import mongoose, { Schema, type Document } from "mongoose";

export type UserRole = "patient" | "doctor" | "admin" | "superadmin";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  doctorId?: string;
  profilePhoto?: string;
  gender?: "Female" | "Male" | "Other";
  age?: number;
  dateOfBirth?: string;
  phoneNumber?: string;
  address?: string;
  specialization?: string;
  qualifications?: string;
  yearsOfExperience?: number;
  medicalLicenseNumber?: string;
  department?: string;
  consultationFee?: number;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false }, // hidden by default
    role: {
      type: String,
      enum: ["patient", "doctor", "admin", "superadmin"],
      default: "patient",
    },
    doctorId: { type: String, unique: true, sparse: true },
    profilePhoto: { type: String },
    gender: { type: String, enum: ["Female", "Male", "Other"] },
    age: { type: Number, min: 0, max: 120 },
    dateOfBirth: { type: String },
    phoneNumber: { type: String, trim: true },
    address: { type: String, trim: true },
    specialization: { type: String, trim: true },
    qualifications: { type: String, trim: true },
    yearsOfExperience: { type: Number, min: 0 },
    medicalLicenseNumber: { type: String, trim: true },
    department: { type: String, trim: true },
    consultationFee: { type: Number, min: 0 },
    bio: { type: String, trim: true },
  },
  { timestamps: true },
);

export const User = mongoose.model<IUser>("User", userSchema);
