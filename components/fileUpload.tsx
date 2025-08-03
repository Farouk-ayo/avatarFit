import { useCallback, ReactNode } from "react";
import { useDropzone } from "react-dropzone";
import { Box, Button, Typography, Paper } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";

type FileUploadProps = {
  accept?: string;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  label?: string;
  icon?: ReactNode;
};

export default function FileUpload({
  accept,
  onFileSelect,
  disabled = false,
  label,
  icon,
}: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
      ``;
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "model/gltf-binary": [".glb"],
      "model/gltf+json": [".gltf"],
    },
    maxFiles: 1,
    disabled,
  });

  return (
    <Paper
      {...getRootProps()}
      elevation={0}
      sx={{
        p: 2,
        border: "2px dashed",
        borderColor: isDragActive ? "primary.main" : "grey.400",
        backgroundColor: isDragActive ? "action.hover" : "transparent",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s ease",
        opacity: disabled ? 0.5 : 1,
        "&:hover": {
          borderColor: disabled ? "grey.400" : "primary.main",
          backgroundColor: disabled ? "transparent" : "action.hover",
        },
      }}
    >
      <input {...getInputProps()} />

      <Box sx={{ textAlign: "center" }}>
        {icon || (
          <CloudUpload sx={{ fontSize: 40, color: "grey.500", mb: 1 }} />
        )}

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {isDragActive
            ? "Drop the file here..."
            : label || "Click or drag file here"}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Supported formats: GLB, GLTF
        </Typography>

        <Button
          variant="outlined"
          size="small"
          sx={{ mt: 1, display: "block", mx: "auto" }}
          disabled={disabled}
        >
          Browse Files
        </Button>
      </Box>
    </Paper>
  );
}
