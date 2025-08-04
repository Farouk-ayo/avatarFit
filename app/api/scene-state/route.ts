import { type NextRequest, NextResponse } from "next/server";
import fs from "fs-extra";
import path from "path";

// Use /tmp directory for production compatibility
const dataDir =
  process.env.NODE_ENV === "production"
    ? "/tmp/avatar-app-data"
    : path.join(process.cwd(), "data");

const stateFilePath = path.join(dataDir, "scene-state.json");

// Ensure directory exists
fs.ensureDirSync(dataDir);

type SceneState = {
  avatarModel: string | null;
  clothingModel: string | null;
  clothingVisible: boolean;
  clothingColor: string;
  timestamp?: string;
  sessionId?: string;
};

// Helper function to get default state
const getDefaultState = (): SceneState => ({
  avatarModel: null,
  clothingModel: null,
  clothingVisible: true,
  clothingColor: "#ffffff",
});

// Helper function to clean up old state files (optional cleanup)
const cleanupOldStates = async () => {
  try {
    if (process.env.NODE_ENV === "production") {
      const files = await fs.readdir(dataDir);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      for (const file of files) {
        if (file.startsWith("scene-state-") && file.endsWith(".json")) {
          const filePath = path.join(dataDir, file);
          const stats = await fs.stat(filePath);
          if (now - stats.mtime.getTime() > maxAge) {
            await fs.remove(filePath);
          }
        }
      }
    }
  } catch (error) {
    console.log("Cleanup warning:", error);
  }
};

// GET - Retrieve scene state
export async function GET(req: NextRequest) {
  try {
    if (Math.random() < 0.1) {
      cleanupOldStates();
    }

    const stateExists = await fs.pathExists(stateFilePath);
    if (stateExists) {
      const state = await fs.readJson(stateFilePath);
      return NextResponse.json(state as SceneState);
    } else {
      return NextResponse.json(getDefaultState());
    }
  } catch (error) {
    console.error("Error reading scene state:", error);
    return NextResponse.json(getDefaultState(), { status: 200 });
  }
}

// POST - Save scene state
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validState: SceneState = {
      avatarModel: body.avatarModel || null,
      clothingModel: body.clothingModel || null,
      clothingVisible:
        body.clothingVisible !== undefined ? body.clothingVisible : true,
      clothingColor: body.clothingColor || "#ffffff",
      timestamp: new Date().toISOString(),
      sessionId: body.sessionId || `session_${Date.now()}`,
    };

    // Ensure directory exists before writing
    await fs.ensureDir(dataDir);
    await fs.writeJson(stateFilePath, validState, { spaces: 2 });

    return NextResponse.json({ success: true, state: validState });
  } catch (error) {
    console.error("Error saving scene state:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save scene state" },
      { status: 500 }
    );
  }
}

// DELETE - Clear scene state
export async function DELETE(req: NextRequest) {
  try {
    const stateExists = await fs.pathExists(stateFilePath);
    if (stateExists) {
      await fs.remove(stateFilePath);
    }
    return NextResponse.json({ success: true, message: "Scene state cleared" });
  } catch (error) {
    console.error("Error clearing scene state:", error);
    return NextResponse.json({ success: true, message: "Scene state cleared" });
  }
}
