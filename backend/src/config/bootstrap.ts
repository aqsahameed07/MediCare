import { User } from "../models/User.js";
import { hashPassword } from "../utils/password.js";

/**
 * Ensures at least one admin account exists.
 * If none exists, creates one from env vars.
 * Idempotent: safe to call on every server start.
 */
export async function ensureAdminExists(): Promise<void> {
  const existingAdmin = await User.findOne({
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
    console.warn(
      "⚠ No admin exists and ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD are not set in .env — skipping admin bootstrap.",
    );
    return;
  }

  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters");
  }

  // If a *non-admin* user already has this email, don't hijack their account.
  const emailTaken = await User.findOne({ email }).select("_id role");
  if (emailTaken) {
    console.warn(
      `⚠ Cannot create admin: email "${email}" is already used by a ${emailTaken.role} account. Change ADMIN_EMAIL in .env.`,
    );
    return;
  }

  const hashed = await hashPassword(password);
  const admin = await User.create({
    name,
    email,
    password: hashed,
    role: "admin",
  });

  console.log(`✔ Admin created: ${admin.email}`);
}