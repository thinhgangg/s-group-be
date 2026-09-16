import * as userRepository from "../repository/user.repository.js";
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from "../core/error.response.js";
import { hashPassword, comparePassword } from "../utils/password.helper.js";
import { generateToken } from "../utils/jwt.helper.js";

export const register = async ({ name, email, password, role }) => {
  // 1. Kiểm tra email đã được đăng ký trước đó chưa
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new ConflictError("Email này đã được sử dụng!");
  }

  // 2. Băm mật khẩu trước khi lưu
  const hashedPassword = await hashPassword(password);

  // 3. Lưu vào Database
  const newUser = await userRepository.create({
    name,
    email,
    password: hashedPassword,
    role: role || "MEMBER",
  });

  // 4. Trả về thông tin user vừa tạo (đã bỏ password)
  return newUser;
};

export const login = async ({ email, password }) => {
  // 1. Tìm user theo email
  const user = await userRepository.findByEmail(email);
  if (!user) {
    // Để bảo mật, báo lỗi chung chung, tránh hacker dùng để dò email
    throw new UnauthorizedError("Email hoặc mật khẩu không chính xác!");
  }

  // 2. So sánh mật khẩu người dùng gửi lên với chuỗi hash trong DB
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new UnauthorizedError("Email hoặc mật khẩu không chính xác!");
  }

  // 3. Tạo Payload và ký phát hành JWT
  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateToken(tokenPayload);

  // 4. Trả về token và thông tin cơ bản
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
  };
};

export const getMe = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new NotFoundError("Người dùng không còn tồn tại trên hệ thống!");
  }
  return user;
};
