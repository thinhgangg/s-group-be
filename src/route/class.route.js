import { Router } from "express";
import * as classController from "../controller/class.controller.js";
import {
  validate,
  classIdParamRules,
  createClassRules,
  updateClassRules,
} from "../middleware/validate.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/rbac.middleware.js";

const router = Router();

router.get("/", authenticateToken, classController.getAllClasses);

router.get(
  "/:id",
  authenticateToken,
  validate(classIdParamRules),
  classController.getClassById,
);

router.post(
  "/",
  authenticateToken,
  requirePermission("CLASS_CREATE"),
  validate(createClassRules),
  classController.createClass,
);

router.patch(
  "/:id",
  authenticateToken,
  requirePermission("CLASS_UPDATE"),
  validate([...classIdParamRules, ...updateClassRules]),
  classController.updateClass,
);

router.delete(
  "/:id",
  authenticateToken,
  requirePermission("CLASS_DELETE"),
  validate(classIdParamRules),
  classController.deleteClass,
);

export default router;
