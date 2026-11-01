import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IRecordMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface IMedicalRecord extends Document {
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  symptoms: string;
  diagnosis: string;
  recommendedTests: string[];
  medications: IRecordMedication[];
  instructions: string;
  followUpDate: string;
  createdAt: Date;
  updatedAt: Date;
}

const medicationSchema = new Schema<IRecordMedication>(
  {
    name: { type: String, required: true, trim: true },
    dosage: { type: String, required: true, trim: true },
    frequency: { type: String, required: true, trim: true },
    duration: { type: String, required: true, trim: true },
    instructions: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const medicalRecordSchema = new Schema<IMedicalRecord>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    symptoms: { type: String, required: true, trim: true },
    diagnosis: { type: String, default: "", trim: true },
    recommendedTests: { type: [String], default: [] },
    medications: { type: [medicationSchema], default: [] },
    instructions: { type: String, default: "", trim: true },
    followUpDate: { type: String, default: "" },
  },
  { timestamps: true },
);

medicalRecordSchema.index({ doctorId: 1, patientId: 1, createdAt: -1 });

export const MedicalRecord = mongoose.model<IMedicalRecord>(
  "MedicalRecord",
  medicalRecordSchema,
);
