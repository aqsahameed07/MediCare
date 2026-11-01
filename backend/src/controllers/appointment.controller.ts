import type { Request, Response } from "express";
import mongoose, { type Types } from "mongoose";
import { z } from "zod";
import { Appointment, type IAppointment } from "../models/Appointment.js";
import { User, type IUser } from "../models/User.js";
import {
  appointmentAvailabilityQuerySchema,
  appointmentSlots,
  createAppointmentSchema,
  updateAppointmentStatusSchema,
} from "../validators/appointments.js";

type AppointmentActor = { sub: string; role: "patient" | "doctor" };
type AppointmentWithUsers = IAppointment & {
  patient: IUser | null;
  doctor: IUser | null;
};

function actorFrom(req: Request): AppointmentActor {
  return (req as Request & { user: AppointmentActor }).user;
}

function sendValidationError(res: Response, error: z.ZodError) {
  return res.status(400).json({
    success: false,
    message: error.issues.map((issue) => issue.message).join(", "),
    errors: error.issues,
  });
}

function idString(id: Types.ObjectId | string): string {
  return id.toString();
}

async function attachUsers(
  appointments: IAppointment[],
): Promise<AppointmentWithUsers[]> {
  const userIds = new Set<string>();
  for (const appointment of appointments) {
    userIds.add(idString(appointment.patientId));
    userIds.add(idString(appointment.doctorId));
  }
  const users = await User.find({ _id: { $in: [...userIds] } })
    .select(
      "name email role doctorId profilePhoto specialization department consultationFee",
    )
    .exec();
  const userMap = new Map(users.map((user) => [user._id.toString(), user]));

  return appointments.map((appointment) => ({
    ...appointment.toObject(),
    patient: userMap.get(idString(appointment.patientId)) ?? null,
    doctor: userMap.get(idString(appointment.doctorId)) ?? null,
  })) as AppointmentWithUsers[];
}

function serializeAppointment(appointment: AppointmentWithUsers) {
  return {
    id: appointment._id.toString(),
    date: appointment.date,
    slot: appointment.slot,
    status: appointment.status,
    notes: appointment.notes ?? "",
    createdAt: appointment.createdAt,
    patient: appointment.patient
      ? {
          id: appointment.patient._id.toString(),
          name: appointment.patient.name,
          email: appointment.patient.email,
        }
      : null,
    doctor: appointment.doctor
      ? {
          id: appointment.doctor._id.toString(),
          name: appointment.doctor.name,
          email: appointment.doctor.email,
          doctorId: appointment.doctor.doctorId ?? null,
          profilePhoto: appointment.doctor.profilePhoto ?? null,
          specialization: appointment.doctor.specialization ?? null,
          department: appointment.doctor.department ?? null,
          consultationFee: appointment.doctor.consultationFee ?? null,
        }
      : null,
  };
}

function isDuplicateSlot(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

export async function getAppointmentDoctors(_req: Request, res: Response) {
  try {
    const doctors = await User.find({ role: "doctor" })
      .select(
        "name email doctorId profilePhoto specialization department consultationFee qualifications yearsOfExperience bio",
      )
      .sort({ name: 1 })
      .exec();
    return res.json({
      success: true,
      doctors: doctors.map((doctor) => ({
        id: doctor._id.toString(),
        name: doctor.name,
        email: doctor.email,
        doctorId: doctor.doctorId ?? null,
        profilePhoto: doctor.profilePhoto ?? null,
        specialization: doctor.specialization ?? null,
        department: doctor.department ?? null,
        consultationFee: doctor.consultationFee ?? null,
        qualifications: doctor.qualifications ?? null,
        yearsOfExperience: doctor.yearsOfExperience ?? null,
        bio: doctor.bio ?? null,
      })),
    });
  } catch (error) {
    console.error("[appointments] Failed to list doctors:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load doctors" });
  }
}

export async function getAppointmentAvailability(req: Request, res: Response) {
  const parsed = appointmentAvailabilityQuerySchema.safeParse(req.query);
  if (!parsed.success) return sendValidationError(res, parsed.error);

  try {
    const doctor = await User.findOne({
      _id: parsed.data.doctorId,
      role: "doctor",
    }).select("_id");
    if (!doctor)
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });

    const appointments = await Appointment.find({
      doctorId: doctor._id,
      date: parsed.data.date,
    })
      .select("slot")
      .exec();
    const booked = new Set(appointments.map((appointment) => appointment.slot));
    return res.json({
      success: true,
      slots: appointmentSlots.filter((slot) => !booked.has(slot)),
    });
  } catch (error) {
    console.error("[appointments] Failed to load available slots:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load available slots" });
  }
}

export async function listAppointments(req: Request, res: Response) {
  const actor = actorFrom(req);
  try {
    const query =
      actor.role === "patient"
        ? { patientId: actor.sub }
        : { doctorId: actor.sub };
    const appointments = await Appointment.find(query)
      .sort({ date: 1, slot: 1 })
      .exec();
    const withUsers = await attachUsers(appointments);
    return res.json({
      success: true,
      appointments: withUsers.map(serializeAppointment),
    });
  } catch (error) {
    console.error("[appointments] Failed to list appointments:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load appointments" });
  }
}

export async function createAppointment(req: Request, res: Response) {
  const actor = actorFrom(req);
  const parsed = createAppointmentSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);

  if (parsed.data.date <= new Date().toISOString().slice(0, 10)) {
    return res
      .status(400)
      .json({ success: false, message: "Choose a future date" });
  }

  try {
    const [patient, doctor] = await Promise.all([
      User.findOne({ _id: actor.sub, role: "patient" }).select("_id"),
      User.findOne({ _id: parsed.data.doctorId, role: "doctor" }).select("_id"),
    ]);
    if (!patient)
      return res
        .status(401)
        .json({ success: false, message: "Patient account not found" });
    if (!doctor)
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });

    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      date: parsed.data.date,
      slot: parsed.data.slot,
      notes: parsed.data.notes ?? "",
      status: "requested",
    });
    const [withUsers] = await attachUsers([appointment]);
    return res.status(201).json({
      success: true,
      appointment: serializeAppointment(withUsers!),
    });
  } catch (error) {
    if (isDuplicateSlot(error)) {
      return res.status(409).json({
        success: false,
        message: "That appointment slot is no longer available",
      });
    }
    console.error("[appointments] Failed to create appointment:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create appointment" });
  }
}

export async function updateAppointmentStatus(req: Request, res: Response) {
  const actor = actorFrom(req);
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res
      .status(404)
      .json({ success: false, message: "Appointment not found" });
  }

  const parsed = updateAppointmentStatusSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);

  try {
    const appointment = await Appointment.findById(req.params.id).exec();
    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    const ownsAppointment =
      actor.role === "patient"
        ? idString(appointment.patientId) === actor.sub
        : idString(appointment.doctorId) === actor.sub;
    if (!ownsAppointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    const nextStatus = parsed.data.status;
    const canTransition =
      actor.role === "patient"
        ? nextStatus === "cancelled" &&
          (appointment.status === "requested" ||
            appointment.status === "confirmed")
        : (appointment.status === "requested" &&
            (nextStatus === "confirmed" || nextStatus === "cancelled")) ||
          (appointment.status === "confirmed" &&
            (nextStatus === "completed" || nextStatus === "cancelled"));

    if (!canTransition) {
      return res.status(409).json({
        success: false,
        message: "This appointment can no longer be moved to that status",
      });
    }

    appointment.status = nextStatus;
    await appointment.save();
    const [withUsers] = await attachUsers([appointment]);
    return res.json({
      success: true,
      appointment: serializeAppointment(withUsers!),
    });
  } catch (error) {
    console.error("[appointments] Failed to update appointment:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update appointment" });
  }
}
