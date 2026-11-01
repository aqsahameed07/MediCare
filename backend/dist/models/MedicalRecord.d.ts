import mongoose, { type Document, type Types } from "mongoose";
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
export declare const MedicalRecord: mongoose.Model<IMedicalRecord, {}, {}, {}, Document<unknown, {}, IMedicalRecord, {}, mongoose.DefaultSchemaOptions> & IMedicalRecord & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IMedicalRecord & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
//# sourceMappingURL=MedicalRecord.d.ts.map