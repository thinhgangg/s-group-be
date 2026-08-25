import { readData } from "../repository/readData.js";
import { writeData } from "../repository/writeData.js";

export const getAllUsers = async () => {
  try {
    const data = await readData();
    return data.users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const data = await readData();
    const user = data.users.find((user) => user.id === parseInt(userId));
    return user || null;
  } catch (error) {
    console.error(`Error fetching user with ID ${userId}:`, error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const data = await readData();

    const newUser = {
      id: data.users.length > 0 ? data.users[data.users.length - 1].id + 1 : 1,
      ...userData,
    };

    data.users.push(newUser);

    await writeData(data);

    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const data = await readData();

    const index = data.users.findIndex((user) => user.id === parseInt(userId));

    if (index === -1) {
      return null;
    }

    data.users[index] = {
      ...data.users[index],
      ...userData,
    };

    await writeData(data);

    return data.users[index];
  } catch (error) {
    console.error(`Error updating user with ID ${userId}:`, error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const data = await readData();

    const index = data.users.findIndex((user) => user.id === parseInt(userId));

    if (index === -1) {
      return null;
    }

    const deletedUser = data.users.splice(index, 1)[0];

    await writeData(data);

    return deletedUser;
  } catch (error) {
    console.error(`Error deleting user with ID ${userId}:`, error);
    throw error;
  }
};
