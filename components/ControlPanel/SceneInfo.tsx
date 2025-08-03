import React from "react";
import { Box, Typography } from "@mui/material";

const SceneInfo = () => {
  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        backgroundColor: "action.hover",
        borderRadius: 1,
      }}
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
  );
};

export default SceneInfo;
