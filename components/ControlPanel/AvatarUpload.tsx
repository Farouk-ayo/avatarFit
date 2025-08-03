import { Box, Typography, Chip } from "@mui/material";
import { Person, CloudUpload } from "@mui/icons-material";
import FileUpload from "@/components/fileUpload";
import { SceneState } from "@/types";

interface AvatarUploadProps {
  sceneState: SceneState;
  onAvatarUpload: (file: File) => void;
}

const AvatarUpload = ({ sceneState, onAvatarUpload }: AvatarUploadProps) => (
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
      <Chip label="Avatar Loaded" color="success" size="small" sx={{ mt: 1 }} />
    )}
  </Box>
);

export default AvatarUpload;
