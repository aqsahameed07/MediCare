"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const database_js_1 = require("./config/database.js");
const index_js_1 = require("./routes/index.js");
const bootstrap = require("./config/bootstrap.js");
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 5000;
// --- Global middleware ---
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:8080",
    credentials: true, // needed if you later switch to httpOnly cookies
}));
app.use(express_1.default.json({ limit: "5mb" }));
app.use((0, cookie_parser_1.default)());
// --- Routes ---
app.use("/api", index_js_1.apiRouter);
// --- Global error handler (must be last) ---
app.use((err, _req, res, _next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
});
async function startServer() {
    try {
        await (0, database_js_1.connectDatabase)();
        await bootstrap.ensureAdminExists();
        app.listen(PORT, () => {
            console.log(`Doctor backend running at http://localhost:${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/api/health`);
        });
    }
    catch (error) {
        console.error("Failed to start backend:", error);
        process.exit(1);
    }
}
void startServer();
//# sourceMappingURL=server.js.map