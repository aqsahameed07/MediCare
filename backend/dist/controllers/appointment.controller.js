"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppointmentDoctors = getAppointmentDoctors;
exports.getAppointmentAvailability = getAppointmentAvailability;
exports.listAppointments = listAppointments;
exports.createAppointment = createAppointment;
exports.updateAppointmentStatus = updateAppointmentStatus;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const Appointment_js_1 = require("../models/Appointment.js");
const User_js_1 = require("../models/User.js");
const appointments_js_1 = require("../validators/appointments.js");
function actorFrom(req) {
    return req.user;
}
function sendValidationError(res, error) {
    return res.status(400).json({
        success: false,
        message: error.issues.map((issue) => issue.message).join(", "),
        errors: error.issues,
    });
}
function idString(id) {
    return id.toString();
}
async function attachUsers(appointments) {
    const userIds = new Set();
    for (const appointment of appointments) {
        userIds.add(idString(appointment.patientId));
        userIds.add(idString(appointment.doctorId));
    }
    const users = await User_js_1.User.find({ _id: { $in: [...userIds] } })
        .select("name email role doctorId profilePhoto specialization department consultationFee")
        .exec();
    const userMap = new Map(users.map((user) => [user._id.toString(), user]));
    return appointments.map((appointment) => ({
        ...appointment.toObject(),
        patient: userMap.get(idString(appointment.patientId)) ?? null,
        doctor: userMap.get(idString(appointment.doctorId)) ?? null,
    }));
}
function serializeAppointment(appointment) {
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
function isDuplicateSlot(error) {
    return (typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000);
}
async function getAppointmentDoctors(_req, res) {
    try {
        const doctors = await User_js_1.User.find({ role: "doctor" })
            .select("name email doctorId profilePhoto specialization department consultationFee qualifications yearsOfExperience bio")
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
    }
    catch (error) {
        console.error("[appointments] Failed to list doctors:", error);
        return res
            .status(500)
            .json({ success: false, message: "Failed to load doctors" });
    }
}
async function getAppointmentAvailability(req, res) {
    const parsed = appointments_js_1.appointmentAvailabilityQuerySchema.safeParse(req.query);
    if (!parsed.success)
        return sendValidationError(res, parsed.error);
    try {
        const doctor = await User_js_1.User.findOne({
            _id: parsed.data.doctorId,
            role: "doctor",
        }).select("_id");
        if (!doctor)
            return res
                .status(404)
                .json({ success: false, message: "Doctor not found" });
        const appointments = await Appointment_js_1.Appointment.find({
            doctorId: doctor._id,
            date: parsed.data.date,
        })
            .select("slot")
            .exec();
        const booked = new Set(appointments.map((appointment) => appointment.slot));
        return res.json({
            success: true,
            slots: appointments_js_1.appointmentSlots.filter((slot) => !booked.has(slot)),
        });
    }
    catch (error) {
        console.error("[appointments] Failed to load available slots:", error);
        return res
            .status(500)
            .json({ success: false, message: "Failed to load available slots" });
    }
}
async function listAppointments(req, res) {
    const actor = actorFrom(req);
    try {
        const query = actor.role === "patient"
            ? { patientId: actor.sub }
            : { doctorId: actor.sub };
        const appointments = await Appointment_js_1.Appointment.find(query)
            .sort({ date: 1, slot: 1 })
            .exec();
        const withUsers = await attachUsers(appointments);
        return res.json({
            success: true,
            appointments: withUsers.map(serializeAppointment),
        });
    }
    catch (error) {
        console.error("[appointments] Failed to list appointments:", error);
        return res
            .status(500)
            .json({ success: false, message: "Failed to load appointments" });
    }
}
async function createAppointment(req, res) {
    const actor = actorFrom(req);
    const parsed = appointments_js_1.createAppointmentSchema.safeParse(req.body);
    if (!parsed.success)
        return sendValidationError(res, parsed.error);
    if (parsed.data.date <= new Date().toISOString().slice(0, 10)) {
        return res
            .status(400)
            .json({ success: false, message: "Choose a future date" });
    }
    try {
        const [patient, doctor] = await Promise.all([
            User_js_1.User.findOne({ _id: actor.sub, role: "patient" }).select("_id"),
            User_js_1.User.findOne({ _id: parsed.data.doctorId, role: "doctor" }).select("_id"),
        ]);
        if (!patient)
            return res
                .status(401)
                .json({ success: false, message: "Patient account not found" });
        if (!doctor)
            return res
                .status(404)
                .json({ success: false, message: "Doctor not found" });
        const appointment = await Appointment_js_1.Appointment.create({
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
            appointment: serializeAppointment(withUsers),
        });
    }
    catch (error) {
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
async function updateAppointmentStatus(req, res) {
    const actor = actorFrom(req);
    if (!mongoose_1.default.isValidObjectId(req.params.id)) {
        return res
            .status(404)
            .json({ success: false, message: "Appointment not found" });
    }
    const parsed = appointments_js_1.updateAppointmentStatusSchema.safeParse(req.body);
    if (!parsed.success)
        return sendValidationError(res, parsed.error);
    try {
        const appointment = await Appointment_js_1.Appointment.findById(req.params.id).exec();
        if (!appointment) {
            return res
                .status(404)
                .json({ success: false, message: "Appointment not found" });
        }
        const ownsAppointment = actor.role === "patient"
            ? idString(appointment.patientId) === actor.sub
            : idString(appointment.doctorId) === actor.sub;
        if (!ownsAppointment) {
            return res
                .status(404)
                .json({ success: false, message: "Appointment not found" });
        }
        const nextStatus = parsed.data.status;
        const canTransition = actor.role === "patient"
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
            appointment: serializeAppointment(withUsers),
        });
    }
    catch (error) {
        console.error("[appointments] Failed to update appointment:", error);
        return res
            .status(500)
            .json({ success: false, message: "Failed to update appointment" });
    }
}
//# sourceMappingURL=appointment.controller.js.map