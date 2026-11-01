import type { Request, Response } from "express";
import mongoose, { type Types } from "mongoose";
import { z } from "zod";
import { Appointment } from "../models/Appointment.js";
import { MedicalRecord, type IMedicalRecord } from "../models/MedicalRecord.js";
import { User, type IUser } from "../models/User.js";
import { createMedicalRecordSchema } from "../validators/medical-records.js";

type DoctorActor = { sub: string; role: "doctor" };

function actorFrom(req: Request): DoctorActor {
  return (req as Request & { user: DoctorActor }).user;
}

function sendValidationError(res: Response, error: z.ZodError) {
  return res.status(400).json({
    success: false,
    message: error.issues.map((issue) => issue.message).join(", "),
    errors: error.issues,
  });
}

function serializeRecord(record: IMedicalRecord) {
  return {
    id: record._id.toString(),
    patientId: record.patientId.toString(),
    doctorId: record.doctorId.toString(),
    symptoms: record.symptoms,
    diagnosis: record.diagnosis,
    recommendedTests: record.recommendedTests,
    medications: record.medications,
    instructions: record.instructions,
    followUpDate: record.followUpDate,
    createdAt: record.createdAt,
  };
}

function ageFromDateOfBirth(dateOfBirth?: string): number | null {
  if (!dateOfBirth) return null;
  const date = new Date(dateOfBirth);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  if (
    now.getMonth() < date.getMonth() ||
    (now.getMonth() === date.getMonth() && now.getDate() < date.getDate())
  ) {
    age -= 1;
  }
  return age >= 0 ? age : null;
}

export async function listDoctorPatients(req: Request, res: Response) {
  const doctorId = actorFrom(req).sub;
  try {
    const [appointments, records] = await Promise.all([
      Appointment.find({ doctorId }).select("patientId date status").lean().exec(),
      MedicalRecord.find({ doctorId }).select("patientId createdAt").lean().exec(),
    ]);
    const patientIds = new Set<string>();
    for (const appointment of appointments) patientIds.add(appointment.patientId.toString());
    for (const record of records) patientIds.add(record.patientId.toString());

    const users = patientIds.size
      ? await User.find({ _id: { $in: [...patientIds] }, role: "patient" })
          .select("name email age gender dateOfBirth phoneNumber address profilePhoto createdAt")
          .sort({ name: 1 })
          .exec()
      : [];
    const activity = new Map<string, string>();
    for (const appointment of appointments) {
      if (appointment.status !== "completed") continue;
      const patientId = appointment.patientId.toString();
      const current = activity.get(patientId);
      if (!current || appointment.date > current) activity.set(patientId, appointment.date);
    }
    for (const record of records) {
      const patientId = record.patientId.toString();
      const date = record.createdAt.toISOString().slice(0, 10);
      const current = activity.get(patientId);
      if (!current || date > current) activity.set(patientId, date);
    }

    return res.json({
      success: true,
      patients: users.map((patient) => ({
        id: patient._id.toString(),
        name: patient.name,
        email: patient.email,
        gender: patient.gender ?? null,
        age: patient.age ?? ageFromDateOfBirth(patient.dateOfBirth),
        phone: patient.phoneNumber ?? null,
        address: patient.address ?? null,
        profilePhoto: patient.profilePhoto ?? null,
        createdAt: patient.createdAt,
        lastVisit: activity.get(patient._id.toString()) ?? null,
        recordCount: records.reduce(
          (count, record) =>
            count + (record.patientId.toString() === patient._id.toString() ? 1 : 0),
          0,
        ),
      })),
    });
  } catch (error) {
    console.error("[doctor] Failed to list patients:", error);
    return res.status(500).json({ success: false, message: "Failed to load patients" });
  }
}

async function doctorHasPatientAccess(doctorId: Types.ObjectId, patientId: Types.ObjectId) {
  const [appointment, record] = await Promise.all([
    Appointment.exists({ doctorId, patientId }),
    MedicalRecord.exists({ doctorId, patientId }),
  ]);
  return Boolean(appointment || record);
}

export async function listPatientRecords(req: Request, res: Response) {
  const doctorId = new mongoose.Types.ObjectId(actorFrom(req).sub);
  const { patientId } = req.params;
  if (!mongoose.isValidObjectId(patientId)) {
    return res.status(404).json({ success: false, message: "Patient not found" });
  }

  try {
    const patientObjectId = new mongoose.Types.ObjectId(patientId);
    const patient = await User.findOne({ _id: patientObjectId, role: "patient" })
      .select("_id")
      .exec();
    if (!patient || !(await doctorHasPatientAccess(doctorId, patientObjectId))) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    const records = await MedicalRecord.find({ doctorId, patientId: patientObjectId })
      .sort({ createdAt: -1 })
      .exec();
    return res.json({
      success: true,
      records: records.map(serializeRecord),
    });
  } catch (error) {
    console.error("[doctor] Failed to list patient records:", error);
    return res.status(500).json({ success: false, message: "Failed to load patient records" });
  }
}

export async function createPatientRecord(req: Request, res: Response) {
  const doctorId = new mongoose.Types.ObjectId(actorFrom(req).sub);
  const { patientId } = req.params;
  if (!mongoose.isValidObjectId(patientId)) {
    return res.status(404).json({ success: false, message: "Patient not found" });
  }

  const parsed = createMedicalRecordSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);

  try {
    const patientObjectId = new mongoose.Types.ObjectId(patientId);
    const patient = await User.findOne({ _id: patientObjectId, role: "patient" })
      .select("_id")
      .exec();
    if (!patient || !(await doctorHasPatientAccess(doctorId, patientObjectId))) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    const record = await MedicalRecord.create({
      ...parsed.data,
      patientId: patientObjectId,
      doctorId,
    });
    return res.status(201).json({
      success: true,
      record: serializeRecord(record),
    });
  } catch (error) {
    console.error("[doctor] Failed to create patient record:", error);
    return res.status(500).json({ success: false, message: "Failed to save patient record" });
  }
}
