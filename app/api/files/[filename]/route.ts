import { type NextRequest, NextResponse } from "next/server"
import fs from "fs-extra"
import path from "path"

// This endpoint serves files from /tmp in production
const uploadDir = process.env.NODE_ENV === "production" ? "/tmp/uploads" : path.join(process.cwd(), "public", "uploads")

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const filename = params.filename

    // Security: Only allow specific file types and prevent path traversal
    if (!filename || filename.includes("..") || filename.includes("/")) {
      return new NextResponse("Invalid filename", { status: 400 })
    }

    const allowedExtensions = [".glb", ".gltf"]
    const fileExtension = path.extname(filename).toLowerCase()
    if (!allowedExtensions.includes(fileExtension)) {
      return new NextResponse("File type not allowed", { status: 403 })
    }

    const filePath = path.join(uploadDir, filename)

    // Check if file exists
    const fileExists = await fs.pathExists(filePath)
    if (!fileExists) {
      return new NextResponse("File not found", { status: 404 })
    }

    // Read file
    const fileBuffer = await fs.readFile(filePath)

    // Set appropriate content type
    const contentType = fileExtension === ".glb" ? "model/gltf-binary" : "model/gltf+json"

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error("Error serving file:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}
