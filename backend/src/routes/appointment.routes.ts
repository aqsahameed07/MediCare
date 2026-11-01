import { Router } from "express";
import {
  createAppointment,
  getAppointmentAvailability,
  getAppointmentDoctors,
  listAppointments,
  updateAppointmentStatus,
} from "../controllers/appointment.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

export const appointmentRouter = Router();

appointmentRouter.use(requireAuth);
appointmentRouter.get(
  "/doctors",
  requireRole("patient"),
  getAppointmentDoctors,
);
appointmentRouter.get(
  "/availability",
  requireRole("patient"),
  getAppointmentAvailability,
);
appointmentRouter.get("/", requireRole("patient", "doctor"), listAppointments);
appointmentRouter.post("/", requireRole("patient"), createAppointment);
appointmentRouter.patch(
  "/:id/status",
  requireRole("patient", "doctor"),
  updateAppointmentStatus,
);
