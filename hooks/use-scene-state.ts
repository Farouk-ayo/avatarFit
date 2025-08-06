import { useState, useCallback } from "react";
import type { SceneState, UploadResponse } from "@/types";
import { getStatusErrorMessage } from "@/utils";

type SavedSceneState = Partial<
  Pick<
    SceneState,
    "avatarModel" | "clothingModel" | "clothingVisible" | "clothingColor"
  >
>;

export function useSceneState() {
  const [sceneState, setSceneState] = useState<SceneState>({
    avatarModel: undefined,
    clothingModel: undefined,
    clothingVisible: true,
    clothingColor: "#ffffff",
    loading: false,
    error: undefined,
  });

  // Load initial scene state from backend
  const loadSceneState = useCallback(async () => {
    try {
      const response = await fetch("/api/scene-state");
      if (response.ok) {
        const savedState: SavedSceneState = await response.json();
        setSceneState((prev) => ({
          ...prev,
          avatarModel: savedState.avatarModel || undefined,
          clothingModel: savedState.clothingModel || undefined,
          clothingVisible:
            savedState.clothingVisible !== undefined
              ? savedState.clothingVisible
              : true,
          clothingColor: savedState.clothingColor || "#ffffff",
        }));
        return savedState;
      }
    } catch (error) {
      console.error("Failed to load scene state:", error);
      throw error;
    }
  }, []);

  // Save scene state to backend
  const saveSceneState = useCallback(
    async (stateUpdate: Partial<SceneState>): Promise<void> => {
      try {
        const stateToSave = {
          avatarModel: stateUpdate.avatarModel,
          clothingModel: stateUpdate.clothingModel,
          clothingVisible: stateUpdate.clothingVisible,
          clothingColor: stateUpdate.clothingColor,
        };
        const response = await fetch("/api/scene-state", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(stateToSave),
        });
        if (!response.ok) {
          throw new Error("Failed to save scene state");
        }
      } catch (error) {
        console.error("Failed to save scene state:", error);
        throw error;
      }
    },
    []
  );

  // Handle avatar upload
  const handleAvatarUpload = useCallback(
    async (file: File): Promise<void> => {
      setSceneState((prev) => ({ ...prev, loading: true, error: undefined }));
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "avatar");
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            error: getStatusErrorMessage(response.status),
          }));
          let errorMessage = errorData.error;
          if (errorData.details) {
            errorMessage += `: ${errorData.details}`;
          }
          throw new Error(errorMessage);
        }
        const data: UploadResponse = await response.json();
        const updatedState = {
          avatarModel: data.url,
          clothingModel: sceneState.clothingModel,
          clothingVisible: sceneState.clothingVisible,
          clothingColor: sceneState.clothingColor,
        };
        setSceneState((prev) => ({
          ...prev,
          avatarModel: data.url,
          loading: false,
          error: undefined,
        }));
        await saveSceneState(updatedState);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        console.error("Avatar upload error:", errorMessage);
        setSceneState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
        throw new Error(`Avatar upload failed: ${errorMessage}`);
      }
    },
    [sceneState, saveSceneState]
  );

  // Handle clothing upload
  const handleClothingUpload = useCallback(
    async (file: File): Promise<void> => {
      setSceneState((prev) => ({ ...prev, loading: true, error: undefined }));
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "clothing");
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            error: getStatusErrorMessage(response.status),
          }));
          let errorMessage = errorData.error;
          if (errorData.details) {
            errorMessage += `: ${errorData.details}`;
          }
          throw new Error(errorMessage);
        }
        const data: UploadResponse = await response.json();
        const updatedState = {
          avatarModel: sceneState.avatarModel,
          clothingModel: data.url,
          clothingVisible: sceneState.clothingVisible,
          clothingColor: sceneState.clothingColor,
        };
        setSceneState((prev) => ({
          ...prev,
          clothingModel: data.url,
          loading: false,
          error: undefined,
        }));
        await saveSceneState(updatedState);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        console.error("Clothing upload error:", errorMessage);
        setSceneState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
        throw new Error(`Clothing upload failed: ${errorMessage}`);
      }
    },
    [sceneState, saveSceneState]
  );

  // Reset scene to default state
  const resetScene = useCallback(async (): Promise<void> => {
    const defaultState = {
      avatarModel: undefined,
      clothingModel: undefined,
      clothingVisible: true,
      clothingColor: "#ffffff",
      loading: false,
      error: undefined,
    };
    setSceneState(defaultState);

    try {
      const response = await fetch("/api/scene-state", {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to clear scene state");
      }
    } catch (error) {
      console.error("Failed to clear scene state:", error);
      throw new Error("Scene reset locally, but failed to clear saved state");
    }
  }, []);

  return {
    sceneState,
    setSceneState,
    loadSceneState,
    saveSceneState,
    handleAvatarUpload,
    handleClothingUpload,
    resetScene,
  };
}
