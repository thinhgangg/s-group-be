import * as lessonRepository from "../repository/lesson.repository.js";
import * as classRepository from "../repository/class.repository.js";
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from "../core/error.response.js";

export const getLessonsByClassId = async (classId, requestingUser) => {
  const classData = await classRepository.findById(classId);

  if (!classData) {
    throw new NotFoundError("Class không tồn tại!");
  }

  const isAdmin = requestingUser.roles.includes("ADMIN");
  const isMentor = classData.mentor_id === requestingUser.id;
  const isMember = await classRepository.isMemberOfClass(
    classId,
    requestingUser.id,
  );

  if (!isAdmin && !isMentor && !isMember) {
    throw new ForbiddenError("Bạn không có quyền xem lesson của class này!");
  }

  return await lessonRepository.findAllByClassId(classId);
};

export const getLessonById = async (id, requestingUser) => {
  const lesson = await lessonRepository.findById(id);

  if (!lesson) {
    throw new NotFoundError("Lesson không tồn tại!");
  }

  if (requestingUser.roles.includes("ADMIN")) {
    return lesson;
  }

  const isMember = await classRepository.isMemberOfClass(
    lesson.class_id,
    requestingUser.id,
  );

  const isMentor = await classRepository.isMentorOfClass(
    lesson.class_id,
    requestingUser.id,
  );

  if (!isMember && !isMentor) {
    throw new ForbiddenError("Bạn không có quyền xem lesson này!");
  }

  return lesson;
};

export const createLesson = async (data, requestingUser) => {
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
      throw new ForbiddenError("Bạn không có quyền tạo lesson của class này!");
    }
  }

  return await lessonRepository.create({
    ...data,
    createdBy: requestingUser.id,
  });
};

export const updateLesson = async (id, data, requestingUser) => {
  const lesson = await lessonRepository.findById(id);

  if (!lesson) {
    throw new NotFoundError("Lesson không tồn tại!");
  }

  if (!requestingUser.roles.includes("ADMIN")) {
    const isMentor = await classRepository.isMentorOfClass(
      lesson.class_id,
      requestingUser.id,
    );

    if (!isMentor) {
      throw new ForbiddenError("Bạn không có quyền cập nhật lesson này!");
    }
  }

  return await lessonRepository.update(id, data);
};

export const deleteLesson = async (id, requestingUser) => {
  const lesson = await lessonRepository.findById(id);

  if (!lesson) {
    throw new NotFoundError("Lesson không tồn tại!");
  }

  if (!requestingUser.roles.includes("ADMIN")) {
    const isMentor = await classRepository.isMentorOfClass(
      lesson.class_id,
      requestingUser.id,
    );

    if (!isMentor) {
      throw new ForbiddenError("Bạn không có quyền xóa lesson này!");
    }
  }

  return await lessonRepository.deleteById(id);
};

export const completeLesson = async (lessonId, requestingUser) => {
  const lesson = await lessonRepository.findById(lessonId);

  if (!lesson) {
    throw new NotFoundError("Lesson không tồn tại!");
  }

  const isMember = await classRepository.isMemberOfClass(
    lesson.class_id,
    requestingUser.id,
  );

  if (!isMember) {
    throw new ForbiddenError("Bạn không phải thành viên của class này!");
  }

  const progress = await lessonRepository.findProgress(
    lessonId,
    requestingUser.id,
  );

  if (progress) {
    throw new ConflictError("Bạn đã hoàn thành lesson này!");
  }

  return await lessonRepository.completeLesson(lessonId, requestingUser.id);
};
