import { Router } from "express";
import {
  createPatientRecord,
  listDoctorPatients,
  listPatientRecords,
} from "../controllers/doctor.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

export const doctorRouter = Router();

doctorRouter.use(requireAuth, requireRole("doctor"));
doctorRouter.get("/patients", listDoctorPatients);
doctorRouter.get("/patients/:patientId/records", listPatientRecords);
doctorRouter.post("/patients/:patientId/records", createPatientRecord);