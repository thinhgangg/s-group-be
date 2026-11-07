import { Router } from "express";
import * as authController from "../controller/auth.controller.js";
import {
  validate,
  registerRules,
  loginRules,
  refreshTokenRules,
} from "../middleware/validate.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", validate(registerRules), authController.register);
router.post("/login", validate(loginRules), authController.login);
router.post(
  "/refresh-token",
  validate(refreshTokenRules),
  authController.refreshToken,
);
router.post(
  "/refresh",
  validate(refreshTokenRules),
  authController.refreshToken,
);
router.post("/logout", authenticateToken, authController.logout);

router.get("/me", authenticateToken, authController.getMe);

export default router;
