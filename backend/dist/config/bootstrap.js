"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAdminExists = ensureAdminExists;
const User_js_1 = require("../models/User.js");
const password_js_1 = require("../utils/password.js");
/**
 * Ensures at least one admin account exists.
 * If none exists, creates one from env vars.
 * Idempotent: safe to call on every server start.
 */
async function ensureAdminExists() {
    const existingAdmin = await User_js_1.User.findOne({
        role: { $in: ["admin", "superadmin"] },
    }).select("_id email");
    if (existingAdmin) {
        console.log(`✔ Admin already exists: ${existingAdmin.email}`);
        return;
    }
    const name = process.env.ADMIN_NAME?.trim();
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    if (!name || !email || !password) {
        console.warn("⚠ No admin exists and ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD are not set in .env — skipping admin bootstrap.");
        return;
    }
    if (password.length < 8) {
        throw new Error("ADMIN_PASSWORD must be at least 8 characters");
    }
    // If a *non-admin* user already has this email, don't hijack their account.
    const emailTaken = await User_js_1.User.findOne({ email }).select("_id role");
    if (emailTaken) {
        console.warn(`⚠ Cannot create admin: email "${email}" is already used by a ${emailTaken.role} account. Change ADMIN_EMAIL in .env.`);
        return;
    }
    const hashed = await (0, password_js_1.hashPassword)(password);
    const admin = await User_js_1.User.create({
        name,
        email,
        password: hashed,
        role: "admin",
    });
    console.log(`✔ Admin created: ${admin.email}`);
}
//# sourceMappingURL=bootstrap.js.map