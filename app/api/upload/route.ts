import { type NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { v4 as uuidv4 } from "uuid";
import path from "path";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

type UploadResponse = {
  success: boolean;
  url: string;
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
    // Check if BLOB_READ_WRITE_TOKEN is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        {
          error: "Storage configuration error",
          details: "Blob storage not configured",
        },
        { status: 500 }
      );
    }

    const maxSize = 200 * 1024 * 1024;

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

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
          )}MB exceeds 200MB limit`,
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

    // Generate unique filename for blob storage
    const uniqueId = uuidv4();
    const blobFilename = `${type}_${uniqueId}${fileExtension}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Vercel Blob
    const blob = await put(blobFilename, buffer, {
      access: "public",
      contentType:
        fileExtension === ".glb" ? "model/gltf-binary" : "model/gltf+json",
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      originalName: file.name,
      size: buffer.length,
      type: type || "unknown",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
