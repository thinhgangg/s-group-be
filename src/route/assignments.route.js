import { Router } from "express";
import * as assignmentController from "../controller/assignment.controller.js";
import {
  validate,
  assignmentIdParamRules,
  updateAssignmentRules,
} from "../middleware/validate.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/:id",
  authenticateToken,
  validate(assignmentIdParamRules),
  assignmentController.getAssignmentById,
);

router.patch(
  "/:id",
  authenticateToken,
  validate([...assignmentIdParamRules, ...updateAssignmentRules]),
  assignmentController.updateAssignment,
);

router.delete(
  "/:id",
  authenticateToken,
  validate(assignmentIdParamRules),
  assignmentController.deleteAssignment,
);

export default router;
