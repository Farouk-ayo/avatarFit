import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
  Chip,
  Stack,
} from "@mui/material";
import {
  CloudUpload,
  Person,
  Checkroom,
  Visibility,
  VisibilityOff,
  Refresh,
  Palette,
} from "@mui/icons-material";
// Assuming this was incorrectly imported from @mui/x-date-pickers — it's not used
// import { ColorPicker } from '@mui/x-date-pickers';
import FileUpload from "./fileUpload";

type SceneState = {
  avatarModel?: string;
  clothingModel?: string;
  clothingVisible?: boolean;
  clothingColor?: string;
  loading?: boolean;
  error?: string;
};

type ControlPanelProps = {
  sceneState: SceneState;
  onAvatarUpload: (file: File) => void;
  onClothingUpload: (file: File) => void;
  onToggleClothing: () => void;
  onColorChange: (color: string) => void;
  onResetScene: () => void;
};

export default function ControlPanel({
  sceneState,
  onAvatarUpload,
  onClothingUpload,
  onToggleClothing,
  onColorChange,
  onResetScene,
}: ControlPanelProps) {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const colorOptions: string[] = [
    "#ffffff",
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#ff00ff",
    "#00ffff",
    "#000000",
    "#ffa500",
    "#800080",
    "#ffc0cb",
    "#a52a2a",
  ];

  const handleColorSelect = (color: string) => {
    onColorChange(color);
    setColorPickerOpen(false);
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Typography variant="h6" gutterBottom sx={{ color: "primary.main" }}>
        Scene Controls
      </Typography>

      {/* Error Display */}
      {sceneState.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {sceneState.error}
        </Alert>
      )}

      {/* Avatar Upload Section */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <Person /> Avatar Model
        </Typography>

        <FileUpload
          accept=".glb,.gltf"
          onFileSelect={onAvatarUpload}
          disabled={sceneState.loading}
          label="Upload Avatar (GLB/GLTF)"
          icon={<CloudUpload />}
        />

        {sceneState.avatarModel && (
          <Chip
            label="Avatar Loaded"
            color="success"
            size="small"
            sx={{ mt: 1 }}
          />
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Clothing Upload Section */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <Checkroom /> Clothing Model
        </Typography>

        <FileUpload
          accept=".glb,.gltf"
          onFileSelect={onClothingUpload}
          disabled={sceneState.loading || !sceneState.avatarModel}
          label="Upload Clothing (GLB/GLTF)"
          icon={<CloudUpload />}
        />

        {!sceneState.avatarModel && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            Upload an avatar first
          </Typography>
        )}

        {sceneState.clothingModel && (
          <Chip
            label="Clothing Loaded"
            color="success"
            size="small"
            sx={{ mt: 1 }}
          />
        )}
      </Box>

      {/* Clothing Controls */}
      {sceneState.clothingModel && (
        <>
          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Clothing Controls
            </Typography>

            {/* Visibility Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={!!sceneState.clothingVisible}
                  onChange={onToggleClothing}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {sceneState.clothingVisible ? (
                    <Visibility />
                  ) : (
                    <VisibilityOff />
                  )}
                  {sceneState.clothingVisible ? "Visible" : "Hidden"}
                </Box>
              }
            />

            {/* Color Picker */}
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Palette />}
                onClick={() => setColorPickerOpen(!colorPickerOpen)}
                sx={{ mb: 1 }}
                fullWidth
              >
                Change Color
              </Button>

              {colorPickerOpen && (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {colorOptions.map((color) => (
                    <Box
                      key={color}
                      sx={{
                        width: 30,
                        height: 30,
                        backgroundColor: color,
                        border: "2px solid",
                        borderColor:
                          sceneState.clothingColor === color
                            ? "primary.main"
                            : "grey.400",
                        borderRadius: 1,
                        cursor: "pointer",
                        "&:hover": {
                          borderColor: "primary.main",
                        },
                      }}
                      onClick={() => handleColorSelect(color)}
                    />
                  ))}
                </Stack>
              )}
            </Box>
          </Box>
        </>
      )}

      {/* Scene Actions */}
      <Box sx={{ mt: "auto" }}>
        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle1" gutterBottom>
          Scene Actions
        </Typography>

        <Button
          variant="outlined"
          color="error"
          startIcon={<Refresh />}
          onClick={onResetScene}
          fullWidth
          disabled={sceneState.loading}
        >
          Reset Scene
        </Button>
      </Box>

      {/* Scene Info */}
      <Box
        sx={{ mt: 2, p: 2, backgroundColor: "action.hover", borderRadius: 1 }}
      >
        <Typography variant="caption" color="text.secondary">
          <strong>Controls:</strong>
          <br />
          • Left click + drag: Rotate
          <br />
          • Right click + drag: Pan
          <br />• Scroll: Zoom in/out
        </Typography>
      </Box>
    </Box>
  );
}
