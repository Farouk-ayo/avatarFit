import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs-extra";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const stateFilePath = path.join(dataDir, "scene-state.json");

fs.ensureDirSync(dataDir);

type SceneState = {
  avatarModel: string | null;
  clothingModel: string | null;
  clothingVisible: boolean;
  clothingColor: string;
  timestamp?: string;
};

type ErrorResponse = { error: string };
type SuccessResponse =
  | { success: true; state: SceneState }
  | { success: true; message: string };

export async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SceneState | SuccessResponse | ErrorResponse>
) {
  try {
    switch (req.method) {
      case "GET":
        try {
          const stateExists = await fs.pathExists(stateFilePath);
          if (stateExists) {
            const state = await fs.readJson(stateFilePath);
            return res.status(200).json(state as SceneState);
          } else {
            return res.status(200).json({
              avatarModel: null,
              clothingModel: null,
              clothingVisible: true,
              clothingColor: "#ffffff",
            });
          }
        } catch (error) {
          console.error("Error reading scene state:", error);
          return res.status(200).json({
            avatarModel: null,
            clothingModel: null,
            clothingVisible: true,
            clothingColor: "#ffffff",
          });
        }

      case "POST": {
        const stateData = req.body as Partial<SceneState>;

        const validState: SceneState = {
          avatarModel: stateData.avatarModel || null,
          clothingModel: stateData.clothingModel || null,
          clothingVisible:
            stateData.clothingVisible !== undefined
              ? stateData.clothingVisible
              : true,
          clothingColor: stateData.clothingColor || "#ffffff",
          timestamp: new Date().toISOString(),
        };

        await fs.writeJson(stateFilePath, validState, { spaces: 2 });
        return res.status(200).json({ success: true, state: validState });
      }

      case "DELETE":
        try {
          const stateExists = await fs.pathExists(stateFilePath);
          if (stateExists) {
            await fs.remove(stateFilePath);
          }
          return res
            .status(200)
            .json({ success: true, message: "Scene state cleared" });
        } catch (error) {
          console.error("Error clearing scene state:", error);
          return res
            .status(200)
            .json({ success: true, message: "Scene state cleared" });
        }

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Scene state API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
