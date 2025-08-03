import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File, Files, Fields } from "formidable";
import fs from "fs-extra";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), "public", "uploads");
fs.ensureDirSync(uploadDir);

type UploadResponse = {
  success: boolean;
  url: string;
  filename: string;
  originalName: string | undefined;
  size: number;
  type: string;
};

type ErrorResponse = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadResponse | ErrorResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = formidable({
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: 100 * 1024 * 1024, // 100MB
    });

    const [fields, files]: [Fields, Files] = await new Promise(
      (resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve([fields, files]);
        });
      }
    );

    const file = Array.isArray(files.file)
      ? files.file[0]
      : files.file !== undefined
      ? (files.file as File)
      : undefined;
    const type = Array.isArray(fields.type)
      ? fields.type[0]
      : typeof fields.type === "string"
      ? fields.type
      : "";

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const allowedExtensions = [".glb", ".gltf"];
    const fileExtension = path
      .extname(file.originalFilename || "")
      .toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      await fs.remove(file.filepath);
      return res.status(400).json({
        error: "Invalid file type. Only GLB and GLTF files are allowed.",
      });
    }

    const uniqueId = uuidv4();
    const newFilename = `${type}_${uniqueId}${fileExtension}`;
    const newFilepath = path.join(uploadDir, newFilename);

    await fs.move(file.filepath, newFilepath);

    const publicUrl = `/uploads/${newFilename}`;

    res.status(200).json({
      success: true,
      url: publicUrl,
      filename: newFilename,
      originalName: file.originalFilename ?? undefined,
      size: file.size,
      type: type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    console.log(
      "Error details:",
      error instanceof Error ? error.message : error
    );
    res.status(500).json({ error: "Upload failed" });
  }
}
