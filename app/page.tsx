"use client";
import React, { useState, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import { SceneRef, SceneState, UploadResponse } from "@/types";
import ControlPanel from "@/components/ControlPanel";
import Scene3D from "@/components/Scene3D";
import LoadingSpinner from "@/components/loadingSpinner";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1976d2",
    },
    background: {
      default: "#0a0a0a",
      paper: "#1a1a1a",
    },
  },
});

export default function Home() {
  const [sceneState, setSceneState] = useState<SceneState>({
    avatarModel: undefined,
    clothingModel: undefined,
    clothingVisible: true,
    clothingColor: "#ffffff",
    loading: false,
    error: undefined,
  });

  const [sceneRef, setSceneRef] = useState<SceneRef | null>(null);

  const handleSceneReady = useCallback((scene: SceneRef) => {
    setSceneRef(scene);
  }, []);

  const handleAvatarUpload = useCallback(async (file: File): Promise<void> => {
    setSceneState((prev) => ({ ...prev, loading: true, error: undefined }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "avatar");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data: UploadResponse = await response.json();
      const updatedState = {
        ...sceneState,
        avatarModel: data.url,
      };

      setSceneState((prev) => ({
        ...prev,
        avatarModel: data.url,
        loading: false,
      }));

      // Save scene state
      await saveSceneState(updatedState);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setSceneState((prev) => ({
        ...prev,
        error: errorMessage as string | undefined,
        loading: false,
      }));
    }
  }, []);

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

        if (!response.ok) throw new Error("Upload failed");

        const data: UploadResponse = await response.json();
        const updatedState = {
          ...sceneState,
          clothingModel: data.url,
        };

        setSceneState((prev) => ({
          ...prev,
          clothingModel: data.url,
          loading: false,
        }));

        // Save scene state
        await saveSceneState(updatedState);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setSceneState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
      }
    },
    []
  );

  const { clothingVisible } = sceneState;

  const handleToggleClothing = useCallback((): void => {
    const newVisibility = !clothingVisible;
    setSceneState((prev) => ({
      ...prev,
      clothingVisible: newVisibility,
    }));

    sceneRef?.toggleClothingVisibility?.(newVisibility);
  }, [clothingVisible, sceneRef]);

  const handleColorChange = useCallback(
    (color: string): void => {
      setSceneState((prev) => ({ ...prev, clothingColor: color }));

      if (sceneRef?.changeClothingColor) {
        sceneRef.changeClothingColor(color);
      }
    },
    [, sceneRef]
  );

  const handleResetScene = useCallback(async (): Promise<void> => {
    setSceneState({
      avatarModel: undefined,
      clothingModel: undefined,
      clothingVisible: true,
      clothingColor: "#ffffff",
      loading: false,
      error: undefined,
    });

    if (sceneRef?.clearScene) {
      sceneRef.clearScene();
    }

    // Clear saved state
    try {
      await fetch("/api/scene-state", {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to clear scene state:", error);
    }
  }, [sceneRef]);

  const saveSceneState = async (state: Partial<SceneState>): Promise<void> => {
    try {
      await fetch("/api/scene-state", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(state),
      });
    } catch (error) {
      console.error("Failed to save scene state:", error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ height: "100vh", py: 2 }}>
        <Typography
          variant="h4"
          component="h1"
          align="center"
          gutterBottom
          sx={{ color: "primary.main", fontWeight: "bold" }}
        >
          3D Avatar Fitting App
        </Typography>

        <Box sx={{ display: "flex", gap: 2, height: "calc(100vh - 120px)" }}>
          {/* Control Panel */}
          <Paper
            elevation={3}
            sx={{
              width: 350,
              p: 2,
              backgroundColor: "background.paper",
              overflowY: "auto",
            }}
          >
            <ControlPanel
              sceneState={sceneState}
              onAvatarUpload={handleAvatarUpload}
              onClothingUpload={handleClothingUpload}
              onToggleClothing={handleToggleClothing}
              onColorChange={handleColorChange}
              onResetScene={handleResetScene}
            />
          </Paper>

          {/* 3D Scene */}
          <Paper
            elevation={3}
            sx={{
              flex: 1,
              position: "relative",
              backgroundColor: "background.paper",
              overflow: "hidden",
            }}
          >
            <Scene3D sceneState={sceneState} onSceneReady={handleSceneReady} />

            {sceneState.loading && (
              <LoadingSpinner message="Loading 3D model..." />
            )}
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
