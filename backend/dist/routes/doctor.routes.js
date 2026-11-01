"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorRouter = void 0;
const express_1 = require("express");
const doctor_controller_js_1 = require("../controllers/doctor.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
exports.doctorRouter = (0, express_1.Router)();
exports.doctorRouter.use(auth_middleware_js_1.requireAuth, (0, auth_middleware_js_1.requireRole)("doctor"));
exports.doctorRouter.get("/patients", doctor_controller_js_1.listDoctorPatients);
exports.doctorRouter.get("/patients/:patientId/records", doctor_controller_js_1.listPatientRecords);
exports.doctorRouter.post("/patients/:patientId/records", doctor_controller_js_1.createPatientRecord);
//# sourceMappingURL=doctor.routes.js.map