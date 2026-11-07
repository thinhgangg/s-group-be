import * as authService from "../service/auth.service.js";
import catchAsync from "../utils/catchAsync.js";
import { sendSuccess } from "../utils/responseHelper.js";

export const register = catchAsync(async (req, res) => {
  const newUser = await authService.register(req.body);
  return sendSuccess(res, 201, "Đăng ký tài khoản thành công!", newUser);
});

export const login = catchAsync(async (req, res) => {
  const result = await authService.login(req.body);
  return sendSuccess(res, 200, "Đăng nhập thành công!", result);
});

export const getMe = catchAsync(async (req, res) => {
  // req.user được gán từ auth.middleware.js sau khi verify token thành công
  const currentUserId = req.user.id;
  const userProfile = await authService.getMe(currentUserId);
  return sendSuccess(
    res,
    200,
    "Lấy thông tin cá nhân thành công!",
    userProfile,
  );
});

export const refreshToken = catchAsync(async (req, res) => {
  const token = req.body?.refreshToken || req.body?.refresh_token;
  const result = await authService.refreshToken(token);
  return sendSuccess(res, 200, "Làm mới token thành công!", result);
});

export const logout = catchAsync(async (req, res) => {
  await authService.logout();
  return sendSuccess(res, 200, "Đăng xuất thành công!");
});
