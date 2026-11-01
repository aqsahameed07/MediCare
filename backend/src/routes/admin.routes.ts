import { Router } from "express";
import {
  createManagedUser,
  deleteManagedUser,
  listManagedUsers,
  updateManagedUser,
} from "../controllers/admin-users.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

export const adminRouter = Router();
const usersRouter = Router();

adminRouter.use(requireAuth, requireRole("admin", "superadmin"));

usersRouter.get("/", listManagedUsers);
usersRouter.post("/", createManagedUser);
usersRouter.patch("/:id", updateManagedUser);
usersRouter.delete("/:id", deleteManagedUser);

adminRouter.use("/users", usersRouter);