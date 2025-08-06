"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  ThemeProvider,
  createTheme,
  CssBaseline,
  useMediaQuery,
} from "@mui/material";
import type { SceneRef } from "@/types";
import ControlPanel from "@/components/ControlPanel";
import Scene3D from "@/components/Scene3D";
import LoadingSpinner from "@/components/loadingSpinner";
import { useSceneState } from "@/hooks/use-scene-state";
import { useNotification } from "@/hooks/use-notification";
import MobileControls from "@/components/mobileControl";
import ErrorDisplay from "@/components/errorDisplay";
import NotificationDisplay from "@/components/notificationDisplay";

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

const DRAWER_WIDTH = 350;

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [sceneRef, setSceneRef] = useState<SceneRef | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Custom hooks
  const {
    sceneState,
    setSceneState,
    loadSceneState,
    saveSceneState,
    handleAvatarUpload,
    handleClothingUpload,
    resetScene,
  } = useSceneState();

  const { notification, showNotification, handleCloseNotification } =
    useNotification();

  // Check if we're on mobile
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleDrawerClose = () => {
    setMobileDrawerOpen(false);
  };

  const handleSceneReady = useCallback((scene: SceneRef) => {
    setSceneRef(scene);
  }, []);

  // Wrapper functions that include notifications
  const handleAvatarUploadWithNotification = useCallback(
    async (file: File): Promise<void> => {
      try {
        await handleAvatarUpload(file);
        showNotification("Avatar uploaded successfully", "success");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        showNotification(errorMessage, "error");
      }
    },
    [handleAvatarUpload, showNotification]
  );

  const handleClothingUploadWithNotification = useCallback(
    async (file: File): Promise<void> => {
      try {
        await handleClothingUpload(file);
        showNotification("Clothing uploaded successfully", "success");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        showNotification(errorMessage, "error");
      }
    },
    [handleClothingUpload, showNotification]
  );

  const handleToggleClothing = useCallback(async (): Promise<void> => {
    const newVisibility = !sceneState.clothingVisible;
    setSceneState((prev) => ({
      ...prev,
      clothingVisible: newVisibility,
    }));
    sceneRef?.toggleClothingVisibility?.(newVisibility);
    const updatedState = {
      ...sceneState,
      clothingVisible: newVisibility,
    };
    await saveSceneState(updatedState);
    showNotification(`Clothing ${newVisibility ? "shown" : "hidden"}`, "info");
  }, [sceneState, sceneRef, saveSceneState, showNotification, setSceneState]);

  const handleColorChange = useCallback(
    async (color: string): Promise<void> => {
      setSceneState((prev) => ({ ...prev, clothingColor: color }));
      if (sceneRef?.changeClothingColor) {
        sceneRef.changeClothingColor(color);
      }
      const updatedState = {
        ...sceneState,
        clothingColor: color,
      };
      await saveSceneState(updatedState);
    },
    [sceneState, sceneRef, saveSceneState, setSceneState]
  );

  const handleResetScene = useCallback(async (): Promise<void> => {
    try {
      await resetScene();
      if (sceneRef?.clearScene) {
        sceneRef.clearScene();
      }
      showNotification("Scene reset successfully", "success");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      showNotification(errorMessage, "warning");
    }
  }, [resetScene, sceneRef, showNotification]);

  // Control Panel Component
  const controlPanelContent = (
    <ControlPanel
      sceneState={sceneState}
      onAvatarUpload={handleAvatarUploadWithNotification}
      onClothingUpload={handleClothingUploadWithNotification}
      onToggleClothing={handleToggleClothing}
      onColorChange={handleColorChange}
      onResetScene={handleResetScene}
      isMobile={isMobile}
      onClose={handleDrawerClose}
    />
  );

  // Load initial scene state on mount
  useEffect(() => {
    setHasMounted(true);
    const initializeApp = async () => {
      try {
        const savedState = await loadSceneState();
        if (savedState?.avatarModel || savedState?.clothingModel) {
          showNotification("Previous scene state restored", "success");
        }
      } catch (error) {
        console.error("Failed to load scene state:", error);
      } finally {
        setInitialLoadComplete(true);
      }
    };
    initializeApp();
  }, [loadSceneState, showNotification]);

  // Show loading screen until mounted and initial load is complete
  if (!hasMounted || !initialLoadComplete) {
    return (
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          backgroundColor: theme.palette.background.default,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LoadingSpinner message="Loading application..." />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        maxWidth="xl"
        sx={{
          height: "100vh",
          py: 2,
          px: isMobile ? 1 : 2,
        }}
      >
        <Typography
          variant={isMobile ? "h5" : "h4"}
          component="h1"
          align="center"
          gutterBottom
          sx={{
            color: "primary.main",
            fontWeight: "bold",
            mb: isMobile ? 1.5 : 2,
          }}
        >
          3D Avatar Fitting App
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: isMobile ? 0 : 2,
            height: isMobile ? "calc(100vh - 100px)" : "calc(100vh - 120px)",
          }}
        >
          {/* Desktop Control Panel */}
          {!isMobile && (
            <Paper
              elevation={3}
              sx={{
                width: DRAWER_WIDTH,
                p: 2,
                backgroundColor: "background.paper",
                overflowY: "auto",
              }}
            >
              {controlPanelContent}
            </Paper>
          )}

          {/* Mobile Controls */}
          {isMobile && (
            <MobileControls
              drawerOpen={mobileDrawerOpen}
              onDrawerToggle={handleDrawerToggle}
              onDrawerClose={handleDrawerClose}
              drawerWidth={DRAWER_WIDTH}
            >
              {controlPanelContent}
            </MobileControls>
          )}

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
            {/* Error Display */}
            {sceneState.error && (
              <ErrorDisplay
                error={sceneState.error}
                onClose={() =>
                  setSceneState((prev) => ({ ...prev, error: undefined }))
                }
              />
            )}
          </Paper>
        </Box>

        {/* Notification Display */}
        <NotificationDisplay
          notification={notification}
          onClose={handleCloseNotification}
        />
      </Container>
    </ThemeProvider>
  );
}
