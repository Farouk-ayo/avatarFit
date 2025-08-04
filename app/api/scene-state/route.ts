import { type NextRequest, NextResponse } from "next/server";
import fs from "fs-extra";
import path from "path";

// Use local file storage for scene state
const dataDir = path.join(process.cwd(), "data");
const stateFilePath = path.join(dataDir, "scene-state.json");

// Ensure directory exists
fs.ensureDirSync(dataDir);

type SceneState = {
  avatarModel: string | null;
  clothingModel: string | null;
  clothingVisible: boolean;
  clothingColor: string;
  timestamp?: string;
};

// Helper function to get default state
const getDefaultState = (): SceneState => ({
  avatarModel: null,
  clothingModel: null,
  clothingVisible: true,
  clothingColor: "#ffffff",
});

// GET - Retrieve scene state
export async function GET(req: NextRequest) {
  try {
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
    };

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
