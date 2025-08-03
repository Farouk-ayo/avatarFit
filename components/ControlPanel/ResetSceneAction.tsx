import { Box, Typography, Button, Divider } from "@mui/material";
import { Refresh } from "@mui/icons-material";

interface ResetSceneActionProps {
  onResetScene: () => void;
  disabled: boolean;
}

const ResetSceneAction = ({
  onResetScene,
  disabled,
}: ResetSceneActionProps) => {
  return (
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
        disabled={disabled}
      >
        Reset Scene
      </Button>
    </Box>
  );
};

export default ResetSceneAction;
