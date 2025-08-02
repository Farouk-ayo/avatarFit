import React from "react";
import { Box, CircularProgress, Typography, Backdrop } from "@mui/material";

type LoadingSpinnerProps = {
  message?: string;
};

export default function LoadingSpinner({
  message = "Loading...",
}: LoadingSpinnerProps) {
  return (
    <Backdrop
      sx={{
        position: "absolute",
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
      }}
      open={true}
    >
      <Box sx={{ textAlign: "center" }}>
        <CircularProgress color="primary" size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {message}
        </Typography>
      </Box>
    </Backdrop>
  );
}
