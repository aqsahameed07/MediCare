"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentRouter = void 0;
const express_1 = require("express");
const appointment_controller_js_1 = require("../controllers/appointment.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
exports.appointmentRouter = (0, express_1.Router)();
exports.appointmentRouter.use(auth_middleware_js_1.requireAuth);
exports.appointmentRouter.get("/doctors", (0, auth_middleware_js_1.requireRole)("patient"), appointment_controller_js_1.getAppointmentDoctors);
exports.appointmentRouter.get("/availability", (0, auth_middleware_js_1.requireRole)("patient"), appointment_controller_js_1.getAppointmentAvailability);
exports.appointmentRouter.get("/", (0, auth_middleware_js_1.requireRole)("patient", "doctor"), appointment_controller_js_1.listAppointments);
exports.appointmentRouter.post("/", (0, auth_middleware_js_1.requireRole)("patient"), appointment_controller_js_1.createAppointment);
exports.appointmentRouter.patch("/:id/status", (0, auth_middleware_js_1.requireRole)("patient", "doctor"), appointment_controller_js_1.updateAppointmentStatus);
//# sourceMappingURL=appointment.routes.js.map