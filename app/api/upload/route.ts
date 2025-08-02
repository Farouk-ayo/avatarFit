import { NextRequest, NextResponse } from "next/server";
import fs from "fs-extra";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const uploadDir = path.join(process.cwd(), "public", "uploads");
fs.ensureDirSync(uploadDir);

// Configure runtime and duration for large file uploads
export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes

type UploadResponse = {
  success: boolean;
  url: string;
  filename: string;
  originalName: string;
  size: number;
  type: string;
};

type ErrorResponse = {
  error: string;
  details?: string;
};

export async function POST(
  request: NextRequest
): Promise<NextResponse<UploadResponse | ErrorResponse>> {
  try {
    console.log("=== APP ROUTER UPLOAD API CALLED ===");

    // Check content length
    const contentLength = request.headers.get("content-length");
    console.log("Content-Length:", contentLength);

    const maxSize = 50 * 1024 * 1024; // 50MB

    if (contentLength && parseInt(contentLength) > maxSize) {
      return NextResponse.json(
        {
          error: "File too large",
          details: `Request size ${(
            parseInt(contentLength) /
            1024 /
            1024
          ).toFixed(2)}MB exceeds 50MB limit`,
        },
        { status: 413 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    console.log("File details:", {
      name: file?.name,
      size: file?.size,
      type: type,
    });

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Check file size
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: "File too large",
          details: `File size ${(file.size / 1024 / 1024).toFixed(
            2
          )}MB exceeds 50MB limit`,
        },
        { status: 413 }
      );
    }

    // Validate file extension
    const allowedExtensions = [".glb", ".gltf"];
    const fileExtension = path.extname(file.name).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: "Invalid file type. Only GLB and GLTF files are allowed." },
        { status: 400 }
      );
    }

    // Generate unique filename
    const uniqueId = uuidv4();
    const newFilename = `${type}_${uniqueId}${fileExtension}`;
    const filePath = path.join(uploadDir, newFilename);

    // Convert file to buffer and save
    console.log("Converting file to buffer...");
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("Writing file to disk...");
    await fs.writeFile(filePath, buffer);

    // Verify file was written and get stats
    const stats = await fs.stat(filePath);
    const publicUrl = `/uploads/${newFilename}`;

    console.log("Upload successful:", {
      url: publicUrl,
      size: stats.size,
      filename: newFilename,
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: newFilename,
      originalName: file.name,
      size: stats.size,
      type: type || "unknown",
    });
  } catch (error) {
    console.error("=== APP ROUTER UPLOAD ERROR ===", error);

    if (error instanceof Error) {
      // Handle specific error types
      if (
        error.message.includes("PayloadTooLargeError") ||
        error.message.includes("Body exceeded") ||
        error.message.includes("Request body too large")
      ) {
        return NextResponse.json(
          {
            error: "File too large",
            details: "File exceeds the maximum size limit",
          },
          { status: 413 }
        );
      }

      if (error.message.includes("timeout")) {
        return NextResponse.json(
          {
            error: "Upload timeout",
            details: "Upload took too long to complete",
          },
          { status: 408 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
