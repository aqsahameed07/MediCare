"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
const express_1 = require("express");
const admin_routes_js_1 = require("./admin.routes.js");
const appointment_routes_js_1 = require("./appointment.routes.js");
const auth_routes_js_1 = require("./auth.routes.js");
const doctor_routes_js_1 = require("./doctor.routes.js");
exports.apiRouter = (0, express_1.Router)();
// Mount each feature router under its own prefix.
exports.apiRouter.use("/auth", auth_routes_js_1.authRouter);
exports.apiRouter.use("/admin", admin_routes_js_1.adminRouter);
exports.apiRouter.use("/appointments", appointment_routes_js_1.appointmentRouter);
exports.apiRouter.use("/doctor", doctor_routes_js_1.doctorRouter);
// 404 handler for unknown /api/* routes
exports.apiRouter.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found",
    });
});
//# sourceMappingURL=index.js.map