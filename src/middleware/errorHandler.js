import ApiError from "../core/error.response.js";
import multer from "multer";

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.name}: ${err.message}`);

  if (err instanceof multer.MulterError) {
    let message = err.message;

    if (err.code === "LIMIT_FILE_COUNT") {
      message = "A maximum of 5 files can be uploaded at once";
    }

    if (err.code === "LIMIT_FILE_SIZE") {
      message = "A file exceeds the maximum allowed size";
    }

    return res.status(400).json({
      success: false,
      message,
    });
  }

  if (err instanceof ApiError) {
    const response = {
      success: false,
      message: err.message,
    };
    if (err.errors) response.errors = err.errors;
    return res.status(err.statusCode).json(response);
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};

export default errorHandler;
