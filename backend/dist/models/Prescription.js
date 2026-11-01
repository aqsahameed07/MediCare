"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordMedicationSchema = void 0;
const zod_1 = require("zod");
exports.recordMedicationSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1, "Medication name is required").max(120),
    dosage: zod_1.z.string().trim().min(1, "Dosage is required").max(80),
    frequency: zod_1.z.string().trim().min(1, "Frequency is required").max(120),
    duration: zod_1.z.string().trim().min(1, "Duration is required").max(80),
    instructions: zod_1.z.string().trim().max(500).default(""),
});
//# sourceMappingURL=Prescription.js.map