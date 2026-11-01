"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_js_1 = require("../controllers/auth.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post("/register", auth_controller_js_1.register);
exports.authRouter.post("/login", auth_controller_js_1.login);
exports.authRouter.get("/me", auth_middleware_js_1.requireAuth, auth_controller_js_1.me);
//# sourceMappingURL=auth.routes.js.map