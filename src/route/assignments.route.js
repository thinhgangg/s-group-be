import { Router } from "express";
import * as assignmentController from "../controller/assignment.controller.js";
import * as submissionController from "../controller/submission.controller.js";
import {
  validate,
  assignmentIdParamRules,
  updateAssignmentRules,
  submitAssignmentRules,
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

router.post(
  "/:id/submissions",
  authenticateToken,
  validate([...assignmentIdParamRules, ...submitAssignmentRules]),
  submissionController.submitAssignment,
);

router.get(
  "/:id/submissions",
  authenticateToken,
  validate(assignmentIdParamRules),
  submissionController.getSubmissionsByAssignmentId,
);

router.get(
  "/:id/my-submission",
  authenticateToken,
  validate(assignmentIdParamRules),
  submissionController.getMySubmissionByAssignment,
);

export default router;
