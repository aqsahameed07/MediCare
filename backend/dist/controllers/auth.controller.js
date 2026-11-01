"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.me = me;
const zod_1 = require("zod");
const User_js_1 = require("../models/User.js");
const password_js_1 = require("../utils/password.js");
const jwt_js_1 = require("../utils/jwt.js");
const auth_js_1 = require("../validators/auth.js");
const sanitize = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
});
async function register(req, res) {
    console.log("[register] Received body:", req.body);
    try {
        const data = auth_js_1.registerSchema.parse(req.body);
        console.log("[register] Zod parsed OK:", data);
        const exists = await User_js_1.User.findOne({ email: data.email });
        if (exists) {
            return res.status(409).json({ success: false, message: "Email already registered" });
        }
        // Only patients can self-register. Doctors/admins are created by an admin.
        const role = data.role ?? "patient";
        if (role !== "patient") {
            return res.status(403).json({
                success: false,
                message: "Only patient accounts can self-register",
            });
        }
        const hashed = await (0, password_js_1.hashPassword)(data.password);
        console.log("[register] Password hashed, creating user…");
        const user = await User_js_1.User.create({ ...data, password: hashed });
        const token = (0, jwt_js_1.signToken)({ sub: user.id, role: user.role });
        return res.status(201).json({
            success: true,
            token,
            user: sanitize(user),
        });
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            console.error("[register] Zod issues:", JSON.stringify(err.issues, null, 2));
            return res.status(400).json({ success: false, errors: err.issues });
        }
        console.error("[register] Non-Zod error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}
async function login(req, res) {
    console.log("[login] Received body:", req.body);
    try {
        const data = auth_js_1.loginSchema.parse(req.body);
        console.log("[login] Zod parsed OK:", data);
        const user = await User_js_1.User.findOne({ email: data.email }).select("+password");
        if (!user) {
            console.log("[login] No user found for email:", data.email);
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        const ok = await (0, password_js_1.verifyPassword)(data.password, user.password);
        if (!ok) {
            console.log("[login] Password mismatch for:", data.email);
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        const token = (0, jwt_js_1.signToken)({ sub: user.id, role: user.role });
        console.log("[login] Success for:", data.email, "role:", user.role);
        return res.json({
            success: true,
            token,
            user: sanitize(user),
        });
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            console.error("[login] Zod issues:", JSON.stringify(err.issues, null, 2));
            return res.status(400).json({ success: false, errors: err.issues });
        }
        console.error("[login] Non-Zod error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}
async function me(req, res) {
    // req.user is set by requireAuth middleware
    const user = await User_js_1.User.findById(req.user.sub);
    if (!user)
        return res.status(404).json({ success: false });
    return res.json({ success: true, user: sanitize(user) });
}
//# sourceMappingURL=auth.controller.js.map