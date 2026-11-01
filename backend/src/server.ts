import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { connectDatabase } from "./config/database.js";
import { apiRouter } from "./routes/index.js";
import bootstrap = require("./config/bootstrap.js");

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// --- Global middleware ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:8080",
    credentials: true, // needed if you later switch to httpOnly cookies
  }),
);
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

// --- Routes ---
app.use("/api", apiRouter);

// --- Global error handler (must be last) ---
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  },
);

async function startServer(): Promise<void> {
  try {
    await connectDatabase();
    await bootstrap.ensureAdminExists();

    app.listen(PORT, () => {
      console.log(`Doctor backend running at http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("Failed to start backend:", error);
    process.exit(1);
  }
}

void startServer();
