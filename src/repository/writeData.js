import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pathToDataFile = path.join(__dirname, "../data.json");

export const writeData = async (data) => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    await fs.promises.writeFile(pathToDataFile, jsonString, "utf-8");
  } catch (error) {
    console.error("Error writing data:", error);
    throw error;
  }
};
