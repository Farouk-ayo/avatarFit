import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import { Checkroom, CloudUpload } from "@mui/icons-material";
import FileUpload from "@/components/fileUpload";
import { SceneState } from "@/types";

interface ClothingUploadProps {
  sceneState: SceneState;
  onClothingUpload: (file: File) => void;
}

const ClothingUpload = ({
  sceneState,
  onClothingUpload,
}: ClothingUploadProps) => (
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
);

export default ClothingUpload;
