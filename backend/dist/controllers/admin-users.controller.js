"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listManagedUsers = listManagedUsers;
exports.createManagedUser = createManagedUser;
exports.updateManagedUser = updateManagedUser;
exports.deleteManagedUser = deleteManagedUser;
const node_crypto_1 = require("node:crypto");
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const User_js_1 = require("../models/User.js");
const password_js_1 = require("../utils/password.js");
const admin_users_js_1 = require("../validators/admin-users.js");
function serializeUser(user) {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        ...(user.role === "doctor"
            ? {
                doctorId: user.doctorId,
                profilePhoto: user.profilePhoto ?? null,
                gender: user.gender,
                dateOfBirth: user.dateOfBirth,
                phoneNumber: user.phoneNumber,
                address: user.address,
                specialization: user.specialization,
                qualifications: user.qualifications,
                yearsOfExperience: user.yearsOfExperience,
                medicalLicenseNumber: user.medicalLicenseNumber,
                department: user.department,
                consultationFee: user.consultationFee,
                bio: user.bio,
            }
            : {}),
    };
}
function isDuplicateEmail(error) {
    return (typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000);
}
function sendValidationError(res, error) {
    return res.status(400).json({
        success: false,
        message: error.issues.map((issue) => issue.message).join(", "),
        errors: error.issues,
    });
}
async function listManagedUsers(_req, res) {
    try {
        const users = await User_js_1.User.find({ role: { $in: ["patient", "doctor"] } })
            .sort({ createdAt: -1 })
            .exec();
        return res.json({ success: true, users: users.map(serializeUser) });
    }
    catch (error) {
        console.error("[admin users] Failed to list users:", error);
        return res
            .status(500)
            .json({ success: false, message: "Failed to load users" });
    }
}
async function createManagedUser(req, res) {
    try {
        const data = admin_users_js_1.createManagedUserSchema.parse(req.body);
        const userData = data.role === "doctor"
            ? {
                ...data,
                profilePhoto: data.profilePhoto ?? undefined,
                doctorId: `DOC-${(0, node_crypto_1.randomUUID)().toUpperCase()}`,
            }
            : data;
        const user = await User_js_1.User.create({
            ...userData,
            email: data.email.toLowerCase(),
            password: await (0, password_js_1.hashPassword)(data.password),
        });
        return res.status(201).json({ success: true, user: serializeUser(user) });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError)
            return sendValidationError(res, error);
        if (isDuplicateEmail(error)) {
            return res
                .status(409)
                .json({ success: false, message: "Email already registered" });
        }
        console.error("[admin users] Failed to create user:", error);
        return res
            .status(500)
            .json({ success: false, message: "Failed to create user" });
    }
}
async function updateManagedUser(req, res) {
    if (!mongoose_1.default.isValidObjectId(req.params.id)) {
        return res.status(404).json({ success: false, message: "User not found" });
    }
    try {
        const data = admin_users_js_1.updateManagedUserSchema.parse(req.body);
        const user = await User_js_1.User.findOne({
            _id: req.params.id,
            role: { $in: ["patient", "doctor"] },
        }).exec();
        if (!user)
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        if (data.name !== undefined)
            user.name = data.name;
        if (data.email !== undefined)
            user.email = data.email.toLowerCase();
        if (data.password !== undefined)
            user.password = await (0, password_js_1.hashPassword)(data.password);
        if (user.role === "doctor") {
            if (!user.doctorId) {
                user.doctorId = `DOC-${(0, node_crypto_1.randomUUID)().toUpperCase()}`;
            }
            if (data.profilePhoto !== undefined) {
                user.set("profilePhoto", data.profilePhoto ?? undefined);
            }
            if (data.gender !== undefined)
                user.gender = data.gender;
            if (data.dateOfBirth !== undefined)
                user.dateOfBirth = data.dateOfBirth;
            if (data.phoneNumber !== undefined)
                user.phoneNumber = data.phoneNumber;
            if (data.address !== undefined)
                user.address = data.address;
            if (data.specialization !== undefined)
                user.specialization = data.specialization;
            if (data.qualifications !== undefined)
                user.qualifications = data.qualifications;
            if (data.yearsOfExperience !== undefined)
                user.yearsOfExperience = data.yearsOfExperience;
            if (data.medicalLicenseNumber !== undefined)
                user.medicalLicenseNumber = data.medicalLicenseNumber;
            if (data.department !== undefined)
                user.department = data.department;
            if (data.consultationFee !== undefined)
                user.consultationFee = data.consultationFee;
            if (data.bio !== undefined)
                user.bio = data.bio;
        }
        await user.save();
        return res.json({ success: true, user: serializeUser(user) });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError)
            return sendValidationError(res, error);
        if (isDuplicateEmail(error)) {
            return res
                .status(409)
                .json({ success: false, message: "Email already registered" });
        }
        console.error("[admin users] Failed to update user:", error);
        return res
            .status(500)
            .json({ success: false, message: "Failed to update user" });
    }
}
async function deleteManagedUser(req, res) {
    if (!mongoose_1.default.isValidObjectId(req.params.id)) {
        return res.status(404).json({ success: false, message: "User not found" });
    }
    try {
        const user = await User_js_1.User.findOneAndDelete({
            _id: req.params.id,
            role: { $in: ["patient", "doctor"] },
        }).exec();
        if (!user)
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        return res.json({ success: true });
    }
    catch (error) {
        console.error("[admin users] Failed to delete user:", error);
        return res
            .status(500)
            .json({ success: false, message: "Failed to delete user" });
    }
}
//# sourceMappingURL=admin-users.controller.js.map