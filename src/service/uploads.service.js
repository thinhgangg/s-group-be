import { randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import pool from "../config/db.config.js";
import { BadRequestError } from "../core/error.response.js";
import { config } from "../config/env.config.js";

const getR2Client = () => {
  if (
    !config.r2.accessKeyId ||
    !config.r2.secretAccessKey ||
    !config.r2.bucketName ||
    !config.r2.endpoint
  ) {
    throw new BadRequestError("R2 is not configured");
  }

  return new S3Client({
    region: "auto",
    endpoint: config.r2.endpoint,
    credentials: {
      accessKeyId: config.r2.accessKeyId,
      secretAccessKey: config.r2.secretAccessKey,
    },
  });
};

const createFileKey = (file) => {
  const extension = file.originalname.includes(".")
    ? file.originalname.substring(file.originalname.lastIndexOf("."))
    : "";

  return `uploads/${randomUUID()}${extension}`;
};

export const uploadFiles = async (files, uploadedBy) => {
  if (!files || files.length === 0) {
    throw new BadRequestError("At least one file is required");
  }

  const client = getR2Client();
  const result = [];

  for (const file of files) {
    const key = createFileKey(file);

    // Upload file lên Cloudflare R2
    await client.send(
      new PutObjectCommand({
        Bucket: config.r2.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const url = `${config.r2.publicBaseUrl}/${key}`;

    // Lưu thông tin file vào database
    const dbResult = await pool.query(
      `INSERT INTO uploads
        (uploaded_by, object_key, url, original_name, mime_type, size)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [uploadedBy, key, url, file.originalname, file.mimetype, file.size],
    );

    result.push(dbResult.rows[0]);
  }

  return result;
};
