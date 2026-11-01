import mongoose, { type Document, type Types } from "mongoose";
export type AppointmentStatus = "requested" | "confirmed" | "completed" | "cancelled";
export interface IAppointment extends Document {
    patientId: Types.ObjectId;
    doctorId: Types.ObjectId;
    date: string;
    slot: string;
    status: AppointmentStatus;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Appointment: mongoose.Model<IAppointment, {}, {}, {}, Document<unknown, {}, IAppointment, {}, mongoose.DefaultSchemaOptions> & IAppointment & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAppointment & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
//# sourceMappingURL=Appointment.d.ts.map