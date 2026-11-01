"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMedicalRecordSchema = void 0;
const zod_1 = require("zod");
const Prescription_js_1 = require("../models/Prescription.js");
exports.createMedicalRecordSchema = zod_1.z.object({
    symptoms: zod_1.z.string().trim().min(1, "Symptoms are required").max(3000),
    diagnosis: zod_1.z.string().trim().max(2000).default(""),
    recommendedTests: zod_1.z.array(zod_1.z.string().trim().min(1).max(160)).max(30).default([]),
    medications: zod_1.z.array(Prescription_js_1.recordMedicationSchema).max(30).default([]),
    instructions: zod_1.z.string().trim().max(3000).default(""),
    followUpDate: zod_1.z.string().trim().max(10).default(""),
});
//# sourceMappingURL=medical-records.js.map