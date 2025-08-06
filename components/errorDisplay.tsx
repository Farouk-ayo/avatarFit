import { Box, Alert } from "@mui/material";

interface ErrorDisplayProps {
  error: string;
  onClose: () => void;
}

export default function ErrorDisplay({ error, onClose }: ErrorDisplayProps) {
  return (
    <Box
      sx={{
        position: "absolute",
        top: 16,
        left: 16,
        right: 16,
        zIndex: 1000,
      }}
    >
      <Alert severity="error" onClose={onClose} sx={{ mb: 2 }}>
        {error}
      </Alert>
    </Box>
  );
}
