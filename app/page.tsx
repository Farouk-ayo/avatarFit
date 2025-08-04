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
  Drawer,
  IconButton,
  useMediaQuery,
  Fab,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Close as CloseIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import type { SceneRef, SceneState, UploadResponse } from "@/types";
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

const DRAWER_WIDTH = 350;

// Generate a session ID for this session
const SESSION_ID = `session_${Date.now()}_${Math.random()
  .toString(36)
  .substr(2, 9)}`;

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [sceneState, setSceneState] = useState<SceneState>({
    avatarModel: undefined,
    clothingModel: undefined,
    clothingVisible: true,
    clothingColor: "#ffffff", // Fixed: was "#"
    loading: false,
    error: undefined,
  });
  const [sceneRef, setSceneRef] = useState<SceneRef | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  // Check if we're on mobile
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Show notification helper
  const showNotification = useCallback(
    (
      message: string,
      severity: "success" | "error" | "info" | "warning" = "info"
    ) => {
      setNotification({ open: true, message, severity });
    },
    []
  );

  // Close notification
  const handleCloseNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  const handleDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleDrawerClose = () => {
    setMobileDrawerOpen(false);
  };

  const handleSceneReady = useCallback((scene: SceneRef) => {
    setSceneRef(scene);
  }, []);

  // Load initial scene state from backend
  const loadSceneState = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch("/api/scene-state");
      if (response.ok) {
        const savedState = await response.json();
        console.log("Loaded scene state:", savedState);

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

        if (savedState.avatarModel || savedState.clothingModel) {
          showNotification("Previous scene state restored", "success");
        }
      }
    } catch (error) {
      console.error("Failed to load scene state:", error);
      // Don't show error notification for initial load failure
    } finally {
      setInitialLoadComplete(true);
    }
  }, [showNotification]);

  // Save scene state to backend
  const saveSceneState = useCallback(
    async (stateUpdate: Partial<SceneState>): Promise<void> => {
      try {
        const stateToSave = {
          avatarModel: stateUpdate.avatarModel,
          clothingModel: stateUpdate.clothingModel,
          clothingVisible: stateUpdate.clothingVisible,
          clothingColor: stateUpdate.clothingColor,
          sessionId: SESSION_ID,
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

        console.log("Scene state saved successfully");
      } catch (error) {
        console.error("Failed to save scene state:", error);
        showNotification("Failed to save scene state", "warning");
      }
    },
    [showNotification]
  );

  // Add this utility function at the top of your page.tsx file

  const uploadWithRetry = async (
    file: File,
    type: string,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<UploadResponse> => {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Upload attempt ${attempt}/${maxRetries}`);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);

        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
          signal: controller.signal,
          // Add headers to help with SSL issues
          headers: {
            Accept: "application/json",
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const data: UploadResponse = await response.json();
        console.log(`Upload successful on attempt ${attempt}:`, data);
        return data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");
        console.error(`Upload attempt ${attempt} failed:`, lastError.message);

        // Don't retry on certain errors
        if (
          lastError.message.includes("File too large") ||
          lastError.message.includes("Invalid file type") ||
          lastError.message.includes("413") ||
          lastError.message.includes("400")
        ) {
          throw lastError;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1);
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error("Upload failed after all retries");
  };

  // Replace your handleAvatarUpload function with this:
  const handleAvatarUpload = useCallback(
    async (file: File): Promise<void> => {
      setSceneState((prev) => ({ ...prev, loading: true, error: undefined }));

      try {
        // Validate file size before upload
        const maxSize = 50 * 1024 * 1024; // Reduce to 50MB for better reliability
        if (file.size > maxSize) {
          throw new Error(
            `File size ${(file.size / 1024 / 1024).toFixed(
              2
            )}MB exceeds 50MB limit`
          );
        }

        console.log("Starting avatar upload:", {
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
          type: file.type,
        });

        const data = await uploadWithRetry(file, "avatar");

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

        // Save scene state with updated values
        await saveSceneState(updatedState);
        showNotification("Avatar uploaded successfully", "success");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        console.error("Avatar upload error:", errorMessage);

        setSceneState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));

        showNotification(`Avatar upload failed: ${errorMessage}`, "error");
      }
    },
    [sceneState, saveSceneState, showNotification]
  );

  // Replace your handleClothingUpload function with this:
  const handleClothingUpload = useCallback(
    async (file: File): Promise<void> => {
      setSceneState((prev) => ({ ...prev, loading: true, error: undefined }));

      try {
        // Validate file size before upload
        const maxSize = 50 * 1024 * 1024; // Reduce to 50MB for better reliability
        if (file.size > maxSize) {
          throw new Error(
            `File size ${(file.size / 1024 / 1024).toFixed(
              2
            )}MB exceeds 50MB limit`
          );
        }

        console.log("Starting clothing upload:", {
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
          type: file.type,
        });

        const data = await uploadWithRetry(file, "clothing");

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

        // Save scene state with updated values
        await saveSceneState(updatedState);
        showNotification("Clothing uploaded successfully", "success");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        console.error("Clothing upload error:", errorMessage);

        setSceneState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));

        showNotification(`Clothing upload failed: ${errorMessage}`, "error");
      }
    },
    [sceneState, saveSceneState, showNotification]
  );
  const handleToggleClothing = useCallback(async (): Promise<void> => {
    const newVisibility = !sceneState.clothingVisible;

    setSceneState((prev) => ({
      ...prev,
      clothingVisible: newVisibility,
    }));

    // Update 3D scene
    sceneRef?.toggleClothingVisibility?.(newVisibility);

    // Save state
    const updatedState = {
      ...sceneState,
      clothingVisible: newVisibility,
    };
    await saveSceneState(updatedState);

    showNotification(`Clothing ${newVisibility ? "shown" : "hidden"}`, "info");
  }, [sceneState, sceneRef, saveSceneState, showNotification]);

  const handleColorChange = useCallback(
    async (color: string): Promise<void> => {
      setSceneState((prev) => ({ ...prev, clothingColor: color }));

      // Update 3D scene
      if (sceneRef?.changeClothingColor) {
        sceneRef.changeClothingColor(color);
      }

      // Save state
      const updatedState = {
        ...sceneState,
        clothingColor: color,
      };
      await saveSceneState(updatedState);
    },
    [sceneState, sceneRef, saveSceneState]
  );

  const handleResetScene = useCallback(async (): Promise<void> => {
    const defaultState = {
      avatarModel: undefined,
      clothingModel: undefined,
      clothingVisible: true,
      clothingColor: "#ffffff",
      loading: false,
      error: undefined,
    };

    setSceneState(defaultState);

    // Clear 3D scene
    if (sceneRef?.clearScene) {
      sceneRef.clearScene();
    }

    // Clear saved state
    try {
      const response = await fetch("/api/scene-state", {
        method: "DELETE",
      });

      if (response.ok) {
        showNotification("Scene reset successfully", "success");
      } else {
        throw new Error("Failed to clear scene state");
      }
    } catch (error) {
      console.error("Failed to clear scene state:", error);
      showNotification(
        "Scene reset locally, but failed to clear saved state",
        "warning"
      );
    }
  }, [sceneRef, showNotification]);

  // Control Panel Component
  const controlPanelContent = (
    <ControlPanel
      sceneState={sceneState}
      onAvatarUpload={handleAvatarUpload}
      onClothingUpload={handleClothingUpload}
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
    loadSceneState();
  }, [loadSceneState]);

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

          {/* Mobile Drawer */}
          {isMobile && (
            <Drawer
              variant="temporary"
              anchor="left"
              open={mobileDrawerOpen}
              onClose={handleDrawerClose}
              ModalProps={{
                keepMounted: true,
              }}
              sx={{
                "& .MuiDrawer-paper": {
                  width: DRAWER_WIDTH,
                  backgroundColor: "background.paper",
                  backgroundImage: "none",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="h6" sx={{ color: "primary.main", ml: 1 }}>
                  Controls
                </Typography>
                <IconButton onClick={handleDrawerClose} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
              <Box sx={{ overflow: "auto", height: "100%" }}>
                {controlPanelContent}
              </Box>
            </Drawer>
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
              <Box
                sx={{
                  position: "absolute",
                  top: 16,
                  left: 16,
                  right: 16,
                  zIndex: 1000,
                }}
              >
                <Alert
                  severity="error"
                  onClose={() =>
                    setSceneState((prev) => ({ ...prev, error: undefined }))
                  }
                  sx={{ mb: 2 }}
                >
                  {sceneState.error}
                </Alert>
              </Box>
            )}
          </Paper>

          {/* Mobile Action Button */}
          {isMobile && (
            <Fab
              color="primary"
              aria-label="open controls"
              onClick={handleDrawerToggle}
              sx={{
                position: "fixed",
                bottom: 24,
                left: 24,
                zIndex: 1000,
              }}
            >
              <SettingsIcon />
            </Fab>
          )}
        </Box>

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={4000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}
