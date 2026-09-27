import { Router } from "express";
import multer from "multer";
import { BadRequestError } from "../core/error.response.js";
import { config } from "../config/env.config.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { upload } from "../controller/uploads.controller.js";

const allowedMimeTypes = new Set([
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

const uploader = multer({
  storage: multer.memoryStorage(),
  limits: { files: 5, fileSize: config.r2.maxFileSize },
  fileFilter: (req, file, callback) => {
    if (
      file.mimetype.startsWith("image/") ||
      allowedMimeTypes.has(file.mimetype)
    ) {
      return callback(null, true);
    }
    return callback(
      new BadRequestError("Only images and common document files are allowed"),
    );
  },
});

const router = Router();

router.post("/", authenticateToken, uploader.array("files", 5), upload);

export default router;
