import mongoose, { Schema, type Document, type Types } from "mongoose";

export type AppointmentStatus =
  | "requested"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface IAppointment extends Document {
  patientId: Types.ObjectId;   // User._id (role patient)
  doctorId: Types.ObjectId;    // User._id (role doctor)
  date: string;                // "YYYY-MM-DD"
  slot: string;                // "09:00 AM"
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true },
    slot: { type: String, required: true },
    status: {
      type: String,
      enum: ["requested", "confirmed", "completed", "cancelled"],
      default: "requested",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

// prevent double-booking
appointmentSchema.index({ doctorId: 1, date: 1, slot: 1 }, { unique: true });

export const Appointment = mongoose.model<IAppointment>(
  "Appointment",
  appointmentSchema,
);