import React, { useState } from "react";
import { Box, Typography, Alert } from "@mui/material";
import AvatarUpload from "./AvatarUpload";
import ClothingUpload from "./ClothingUpload";
import ClothingControls from "./ClothingControl";
import ResetSceneAction from "./ResetSceneAction";
import SceneInfo from "./SceneInfo";

import { ControlPanelProps } from "@/types";

interface ResponsiveControlPanelProps extends ControlPanelProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export default function ControlPanel({
  sceneState,
  onAvatarUpload,
  onClothingUpload,
  onToggleClothing,
  onColorChange,
  onResetScene,
  isMobile = false,
  onClose,
}: ResponsiveControlPanelProps) {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const handleColorSelect = (color: string) => {
    onColorChange(color);
    setColorPickerOpen(false);
  };

  const handleActionWithClose = (action: () => void) => {
    action();
    if (isMobile && onClose) {
      setTimeout(() => onClose(), 500);
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: isMobile ? 2 : 0,
      }}
    >
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          color: "primary.main",
          borderBottom: isMobile ? "1px solid" : "none",
          borderColor: "divider",
          pb: isMobile ? 1 : 0,
          mb: isMobile ? 2 : 1,
        }}
      >
        Scene Controls
      </Typography>

      {sceneState.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {sceneState.error}
        </Alert>
      )}

      <AvatarUpload
        sceneState={sceneState}
        onAvatarUpload={(file) =>
          handleActionWithClose(() => onAvatarUpload(file))
        }
      />

      <ClothingUpload
        sceneState={sceneState}
        onClothingUpload={(file) =>
          handleActionWithClose(() => onClothingUpload(file))
        }
      />

      {sceneState.clothingModel && (
        <ClothingControls
          clothingVisible={sceneState.clothingVisible}
          clothingColor={sceneState.clothingColor}
          onToggleClothing={() => handleActionWithClose(onToggleClothing)}
          onColorChange={handleColorSelect}
        />
      )}

      <ResetSceneAction
        onResetScene={() => handleActionWithClose(onResetScene)}
        disabled={sceneState.loading}
      />

      <SceneInfo />
    </Box>
  );
}
