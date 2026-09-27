import catchAsync from "../utils/catchAsync.js";
import { sendSuccess } from "../utils/responseHelper.js";
import { uploadFiles } from "../service/uploads.service.js";

export const upload = catchAsync(async (req, res) => {
  const files = req.files;

  const result = await uploadFiles(files, req.user.id);

  return sendSuccess(res, 201, "Files uploaded successfully", result);
});
