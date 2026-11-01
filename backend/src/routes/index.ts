import { Router } from "express";
import { adminRouter } from "./admin.routes.js";
import { appointmentRouter } from "./appointment.routes.js";
import { authRouter } from "./auth.routes.js";
import { doctorRouter } from "./doctor.routes.js";

export const apiRouter = Router();

// Mount each feature router under its own prefix.

apiRouter.use("/auth", authRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/appointments", appointmentRouter);
apiRouter.use("/doctor", doctorRouter);

// 404 handler for unknown /api/* routes
apiRouter.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});
