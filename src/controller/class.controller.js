import * as classService from "../service/class.service.js";
import catchAsync from "../utils/catchAsync.js";
import { sendSuccess } from "../utils/responseHelper.js";

export const getAllClasses = catchAsync(async (req, res) => {
  const classes = await classService.getAllClasses(req.user);

  return sendSuccess(res, 200, "Lấy danh sách class thành công", classes);
});

export const getClassById = catchAsync(async (req, res) => {
  const classData = await classService.getClassById(req.params.id, req.user);

  return sendSuccess(res, 200, "Lấy thông tin class thành công", classData);
});

export const createClass = catchAsync(async (req, res) => {
  const newClass = await classService.createClass(req.body, req.user);

  return sendSuccess(res, 201, "Tạo class thành công", newClass);
});

export const updateClass = catchAsync(async (req, res) => {
  const updatedClass = await classService.updateClass(req.params.id, req.body);

  return sendSuccess(res, 200, "Cập nhật class thành công", updatedClass);
});

export const deleteClass = catchAsync(async (req, res) => {
  const deletedClass = await classService.deleteClass(req.params.id);

  return sendSuccess(res, 200, "Xóa class thành công", deletedClass);
});
