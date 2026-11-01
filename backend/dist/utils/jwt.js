"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.signToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secret = () => {
    const s = process.env.JWT_SECRET;
    if (!s)
        throw new Error("JWT_SECRET missing");
    return s;
};
const signToken = (payload) => jsonwebtoken_1.default.sign(payload, secret(), { expiresIn: "7d" });
exports.signToken = signToken;
const verifyToken = (token) => jsonwebtoken_1.default.verify(token, secret());
exports.verifyToken = verifyToken;
//# sourceMappingURL=jwt.js.map