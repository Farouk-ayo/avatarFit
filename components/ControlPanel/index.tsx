import React, { useState } from "react";
import { Box, Typography, Alert } from "@mui/material";
import FileUpload from "../fileUpload";
import AvatarUpload from "./AvatarUpload";
import ClothingUpload from "./ClothingUpload";
import ClothingControls from "./ClothingControl";
import ResetSceneAction from "./ResetSceneAction";
import SceneInfo from "./SceneInfo";

import { ControlPanelProps } from "@/types";

export default function ControlPanel({
  sceneState,
  onAvatarUpload,
  onClothingUpload,
  onToggleClothing,
  onColorChange,
  onResetScene,
}: ControlPanelProps) {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const handleColorSelect = (color: string) => {
    onColorChange(color);
    setColorPickerOpen(false);
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Typography variant="h6" gutterBottom sx={{ color: "primary.main" }}>
        Scene Controls
      </Typography>

      {sceneState.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {sceneState.error}
        </Alert>
      )}

      <AvatarUpload sceneState={sceneState} onAvatarUpload={onAvatarUpload} />

      <ClothingUpload
        sceneState={sceneState}
        onClothingUpload={onClothingUpload}
      />

      {sceneState.clothingModel && (
        <ClothingControls
          clothingVisible={sceneState.clothingVisible}
          clothingColor={sceneState.clothingColor}
          onToggleClothing={onToggleClothing}
          onColorChange={handleColorSelect}
        />
      )}

      <ResetSceneAction
        onResetScene={onResetScene}
        disabled={sceneState.loading}
      />

      <SceneInfo />
    </Box>
  );
}
