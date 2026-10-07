import * as assignmentRepository from "../repository/assignment.repository.js";
import * as classRepository from "../repository/class.repository.js";
import { NotFoundError, ForbiddenError } from "../core/error.response.js";

export const getAssignmentsByClassId = async (classId, requestingUser) => {
  const classData = await classRepository.findById(classId);

  if (!classData) {
    throw new NotFoundError("Class không tồn tại!");
  }

  const isAdmin = requestingUser.roles.includes("ADMIN");
  const isMentor = await classRepository.isMentorOfClass(
    classId,
    requestingUser.id,
  );
  const isMember = await classRepository.isMemberOfClass(
    classId,
    requestingUser.id,
  );

  if (!isAdmin && !isMentor && !isMember) {
    throw new ForbiddenError(
      "Bạn không có quyền xem assignment của class này!",
    );
  }

  return await assignmentRepository.findAllByClassId(classId);
};

export const getAssignmentById = async (id, requestingUser) => {
  const assignment = await assignmentRepository.findById(id);

  if (!assignment) {
    throw new NotFoundError("Assignment không tồn tại");
  }

  if (requestingUser.roles.includes("ADMIN")) {
    return assignment;
  }

  const isMember = await classRepository.isMemberOfClass(
    assignment.class_id,
    requestingUser.id,
  );

  const isMentor = await classRepository.isMentorOfClass(
    assignment.class_id,
    requestingUser.id,
  );

  if (!isMember && !isMentor) {
    throw new ForbiddenError(
      "Bạn không có quyền xem assignment của class này!",
    );
  }

  return assignment;
};

export const createAssignment = async (data, requestingUser) => {
  const classData = await classRepository.findById(data.classId);

  if (!classData) {
    throw new NotFoundError("Class không tồn tại!");
  }

  if (!requestingUser.roles.includes("ADMIN")) {
    const isMentor = await classRepository.isMentorOfClass(
      data.classId,
      requestingUser.id,
    );

    if (!isMentor) {
      throw new ForbiddenError(
        "Bạn không có quyền tạo assignment của class này!",
      );
    }
  }

  return await assignmentRepository.create({
    ...data,
    createdBy: requestingUser.id,
  });
};

export const updateAssignment = async (id, data, requestingUser) => {
  const assignment = await assignmentRepository.findById(id);

  if (!assignment) {
    throw new NotFoundError("Assignment không tồn tại!");
  }

  if (!requestingUser.roles.includes("ADMIN")) {
    const isMentor = await classRepository.isMentorOfClass(
      assignment.class_id,
      requestingUser.id,
    );

    if (!isMentor) {
      throw new ForbiddenError(
        "Bạn không có quyền cập nhật assignment của class này!",
      );
    }
  }

  return await assignmentRepository.update(id, data);
};

export const deleteAssignment = async (id, requestingUser) => {
  const assignment = await assignmentRepository.findById(id);

  if (!assignment) {
    throw new NotFoundError("Assignment không tồn tại!");
  }

  if (!requestingUser.roles.includes("ADMIN")) {
    const isMentor = classRepository.isMentorOfClass(
      assignment.class_id,
      requestingUser.id,
    );

    if (!isMentor) {
      throw new ForbiddenError(
        "Bạn không có quyền xóa assignment của class này!",
      );
    }
  }

  return await assignmentRepository.deleteById(id);
};
