import { readData, writeData } from "../repository/readData.js";

export const getAllUsers = async () => {
  const data = await readData();
  return data.users;
};

export const getUserById = async (userId) => {
  const data = await readData();
  return data.users.find((user) => user.id === parseInt(userId)) || null;
};

export const createUser = async (userData) => {
  const data = await readData();
  const maxId = data.users.reduce((max, user) => Math.max(max, user.id), 0);
  const newUser = {
    id: maxId + 1,
    ...userData,
  };

  data.users.push(newUser);
  await writeData(data);

  return newUser;
};

export const updateUser = async (userId, userData) => {
  const data = await readData();
  const parsedId = parseInt(userId, 10);
  const userIndex = data.users.findIndex((user) => user.id === parsedId);

  if (userIndex === -1) {
    return null;
  }

  const updatedUser = {
    ...data.users[userIndex],
    ...userData,
    id: parsedId,
  };

  data.users[userIndex] = updatedUser;
  await writeData(data);

  return updatedUser;
};

export const deleteUser = async (userId) => {
  const data = await readData();
  const parsedId = parseInt(userId, 10);
  const userIndex = data.users.findIndex((user) => user.id === parsedId);

  if (userIndex === -1) {
    return null;
  }

  const [deletedUser] = data.users.splice(userIndex, 1);
  await writeData(data);

  return deletedUser;
};
