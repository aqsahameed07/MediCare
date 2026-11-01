"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
const jwt_js_1 = require("../utils/jwt.js");
function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Missing token" });
    }
    try {
        req.user = (0, jwt_js_1.verifyToken)(header.slice(7));
        next();
    }
    catch {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
}
function requireRole(...roles) {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !roles.includes(user.role)) {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }
        next();
    };
}
//# sourceMappingURL=auth.middleware.js.map