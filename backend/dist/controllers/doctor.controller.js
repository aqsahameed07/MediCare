"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDoctorPatients = listDoctorPatients;
exports.listPatientRecords = listPatientRecords;
exports.createPatientRecord = createPatientRecord;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const Appointment_js_1 = require("../models/Appointment.js");
const MedicalRecord_js_1 = require("../models/MedicalRecord.js");
const User_js_1 = require("../models/User.js");
const medical_records_js_1 = require("../validators/medical-records.js");
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
function serializeRecord(record) {
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
function ageFromDateOfBirth(dateOfBirth) {
    if (!dateOfBirth)
        return null;
    const date = new Date(dateOfBirth);
    if (Number.isNaN(date.getTime()))
        return null;
    const now = new Date();
    let age = now.getFullYear() - date.getFullYear();
    if (now.getMonth() < date.getMonth() ||
        (now.getMonth() === date.getMonth() && now.getDate() < date.getDate())) {
        age -= 1;
    }
    return age >= 0 ? age : null;
}
async function listDoctorPatients(req, res) {
    const doctorId = actorFrom(req).sub;
    try {
        const [appointments, records] = await Promise.all([
            Appointment_js_1.Appointment.find({ doctorId }).select("patientId date status").lean().exec(),
            MedicalRecord_js_1.MedicalRecord.find({ doctorId }).select("patientId createdAt").lean().exec(),
        ]);
        const patientIds = new Set();
        for (const appointment of appointments)
            patientIds.add(appointment.patientId.toString());
        for (const record of records)
            patientIds.add(record.patientId.toString());
        const users = patientIds.size
            ? await User_js_1.User.find({ _id: { $in: [...patientIds] }, role: "patient" })
                .select("name email gender dateOfBirth phoneNumber address createdAt")
                .sort({ name: 1 })
                .exec()
            : [];
        const activity = new Map();
        for (const appointment of appointments) {
            if (appointment.status !== "completed")
                continue;
            const patientId = appointment.patientId.toString();
            const current = activity.get(patientId);
            if (!current || appointment.date > current)
                activity.set(patientId, appointment.date);
        }
        for (const record of records) {
            const patientId = record.patientId.toString();
            const date = record.createdAt.toISOString().slice(0, 10);
            const current = activity.get(patientId);
            if (!current || date > current)
                activity.set(patientId, date);
        }
        return res.json({
            success: true,
            patients: users.map((patient) => ({
                id: patient._id.toString(),
                name: patient.name,
                email: patient.email,
                gender: patient.gender ?? null,
                age: ageFromDateOfBirth(patient.dateOfBirth),
                phone: patient.phoneNumber ?? null,
                address: patient.address ?? null,
                createdAt: patient.createdAt,
                lastVisit: activity.get(patient._id.toString()) ?? null,
                recordCount: records.reduce((count, record) => count + (record.patientId.toString() === patient._id.toString() ? 1 : 0), 0),
            })),
        });
    }
    catch (error) {
        console.error("[doctor] Failed to list patients:", error);
        return res.status(500).json({ success: false, message: "Failed to load patients" });
    }
}
async function doctorHasPatientAccess(doctorId, patientId) {
    const [appointment, record] = await Promise.all([
        Appointment_js_1.Appointment.exists({ doctorId, patientId }),
        MedicalRecord_js_1.MedicalRecord.exists({ doctorId, patientId }),
    ]);
    return Boolean(appointment || record);
}
async function listPatientRecords(req, res) {
    const doctorId = new mongoose_1.default.Types.ObjectId(actorFrom(req).sub);
    const { patientId } = req.params;
    if (!mongoose_1.default.isValidObjectId(patientId)) {
        return res.status(404).json({ success: false, message: "Patient not found" });
    }
    try {
        const patientObjectId = new mongoose_1.default.Types.ObjectId(patientId);
        const patient = await User_js_1.User.findOne({ _id: patientObjectId, role: "patient" })
            .select("_id")
            .exec();
        if (!patient || !(await doctorHasPatientAccess(doctorId, patientObjectId))) {
            return res.status(404).json({ success: false, message: "Patient not found" });
        }
        const records = await MedicalRecord_js_1.MedicalRecord.find({ doctorId, patientId: patientObjectId })
            .sort({ createdAt: -1 })
            .exec();
        return res.json({
            success: true,
            records: records.map(serializeRecord),
        });
    }
    catch (error) {
        console.error("[doctor] Failed to list patient records:", error);
        return res.status(500).json({ success: false, message: "Failed to load patient records" });
    }
}
async function createPatientRecord(req, res) {
    const doctorId = new mongoose_1.default.Types.ObjectId(actorFrom(req).sub);
    const { patientId } = req.params;
    if (!mongoose_1.default.isValidObjectId(patientId)) {
        return res.status(404).json({ success: false, message: "Patient not found" });
    }
    const parsed = medical_records_js_1.createMedicalRecordSchema.safeParse(req.body);
    if (!parsed.success)
        return sendValidationError(res, parsed.error);
    try {
        const patientObjectId = new mongoose_1.default.Types.ObjectId(patientId);
        const patient = await User_js_1.User.findOne({ _id: patientObjectId, role: "patient" })
            .select("_id")
            .exec();
        if (!patient || !(await doctorHasPatientAccess(doctorId, patientObjectId))) {
            return res.status(404).json({ success: false, message: "Patient not found" });
        }
        const record = await MedicalRecord_js_1.MedicalRecord.create({
            ...parsed.data,
            patientId: patientObjectId,
            doctorId,
        });
        return res.status(201).json({
            success: true,
            record: serializeRecord(record),
        });
    }
    catch (error) {
        console.error("[doctor] Failed to create patient record:", error);
        return res.status(500).json({ success: false, message: "Failed to save patient record" });
    }
}
//# sourceMappingURL=doctor.controller.js.map