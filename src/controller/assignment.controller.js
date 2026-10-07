import catchAsync from "../utils/catchAsync.js";
import * as assignmentService from "../service/assignment.service.js";
import { sendSuccess } from "../utils/responseHelper.js";

export const getAssignmentsByClassId = catchAsync(async (req, res) => {
  const assignments = await assignmentService.getAssignmentsByClassId(
    req.params.id,
    req.user,
  );

  return sendSuccess(
    res,
    200,
    "Lấy danh sách assignment thành công!",
    assignments,
  );
});

export const getAssignmentById = catchAsync(async (req, res) => {
  const assignment = await assignmentService.getAssignmentById(
    req.params.id,
    req.user,
  );

  return sendSuccess(
    res,
    200,
    "Lấy dữ liệu assignment thành công!",
    assignment,
  );
});

export const createAssignment = catchAsync(async (req, res) => {
  const assignment = await assignmentService.createAssignment(
    {
      ...req.body,
      classId: req.params.id,
    },
    req.user,
  );

  return sendSuccess(res, 201, "Tạo assignment thành công!", assignment);
});

export const updateAssignment = catchAsync(async (req, res) => {
  const assignment = await assignmentService.updateAssignment(
    req.params.id,
    req.body,
    req.user,
  );

  return sendSuccess(res, 200, "Cập nhật assignment thành công!", assignment);
});

export const deleteAssignment = catchAsync(async (req, res) => {
  const assignment = await assignmentService.deleteAssignment(
    req.params.id,
    req.user,
  );

  return sendSuccess(res, 200, "Xóa assignment thành công!", assignment);
});
