"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalRecord = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const medicationSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    dosage: { type: String, required: true, trim: true },
    frequency: { type: String, required: true, trim: true },
    duration: { type: String, required: true, trim: true },
    instructions: { type: String, default: "", trim: true },
}, { _id: false });
const medicalRecordSchema = new mongoose_1.Schema({
    patientId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    symptoms: { type: String, required: true, trim: true },
    diagnosis: { type: String, default: "", trim: true },
    recommendedTests: { type: [String], default: [] },
    medications: { type: [medicationSchema], default: [] },
    instructions: { type: String, default: "", trim: true },
    followUpDate: { type: String, default: "" },
}, { timestamps: true });
medicalRecordSchema.index({ doctorId: 1, patientId: 1, createdAt: -1 });
exports.MedicalRecord = mongoose_1.default.model("MedicalRecord", medicalRecordSchema);
//# sourceMappingURL=MedicalRecord.js.map