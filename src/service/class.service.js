import * as classRepository from "../repository/class.repository.js";
import { NotFoundError, ForbiddenError } from "../core/error.response.js";

export const getAllClasses = async (requestingUser) => {
  if (requestingUser.roles.includes("ADMIN")) {
    return await classRepository.findAll();
  }

  return await classRepository.findAllByMemberId(requestingUser.id);
};

export const getClassById = async (id, requestingUser) => {
  const classData = await classRepository.findById(id);

  if (!classData) {
    throw new NotFoundError("Class không tồn tại!");
  }

  if (requestingUser.roles.includes("ADMIN")) {
    return classData;
  }

  const isMember = await classRepository.isMemberOfClass(id, requestingUser.id);

  if (!isMember) {
    throw new ForbiddenError("Bạn không phải thành viên của class này!");
  }

  return classData;
};

export const createClass = async (data, requestingUser) => {
  const newClass = await classRepository.create({
    ...data,
    createdBy: requestingUser.id,
  });

  return newClass;
};

export const updateClass = async (id, data) => {
  const classData = await classRepository.findById(id);

  if (!classData) {
    throw new NotFoundError("Class không tồn tại!");
  }

  return await classRepository.update(id, data);
};

export const deleteClass = async (id) => {
  const classData = await classRepository.findById(id);

  if (!classData) {
    throw new NotFoundError("Class không tồn tại!");
  }

  return await classRepository.deleteById(id);
};
