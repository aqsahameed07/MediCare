"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentAvailabilityQuerySchema = exports.updateAppointmentStatusSchema = exports.createAppointmentSchema = exports.appointmentSlots = void 0;
const zod_1 = require("zod");
exports.appointmentSlots = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "01:00 PM",
    "01:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
];
exports.createAppointmentSchema = zod_1.z.object({
    doctorId: zod_1.z.string().regex(/^[a-f\d]{24}$/i, "Choose a valid doctor"),
    date: zod_1.z.iso.date(),
    slot: zod_1.z.enum(exports.appointmentSlots),
    notes: zod_1.z.string().trim().max(1000).optional(),
});
exports.updateAppointmentStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["confirmed", "completed", "cancelled"]),
});
exports.appointmentAvailabilityQuerySchema = zod_1.z.object({
    doctorId: zod_1.z.string().regex(/^[a-f\d]{24}$/i, "Choose a valid doctor"),
    date: zod_1.z.iso.date(),
});
//# sourceMappingURL=appointments.js.map