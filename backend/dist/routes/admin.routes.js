"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const admin_users_controller_js_1 = require("../controllers/admin-users.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
exports.adminRouter = (0, express_1.Router)();
const usersRouter = (0, express_1.Router)();
exports.adminRouter.use(auth_middleware_js_1.requireAuth, (0, auth_middleware_js_1.requireRole)("admin", "superadmin"));
usersRouter.get("/", admin_users_controller_js_1.listManagedUsers);
usersRouter.post("/", admin_users_controller_js_1.createManagedUser);
usersRouter.patch("/:id", admin_users_controller_js_1.updateManagedUser);
usersRouter.delete("/:id", admin_users_controller_js_1.deleteManagedUser);
exports.adminRouter.use("/users", usersRouter);
//# sourceMappingURL=admin.routes.js.map