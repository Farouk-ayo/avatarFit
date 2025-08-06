import { Drawer, IconButton, Fab, Box, Typography } from "@mui/material";
import {
  Close as CloseIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";

interface MobileControlsProps {
  drawerOpen: boolean;
  onDrawerToggle: () => void;
  onDrawerClose: () => void;
  drawerWidth: number;
  children: React.ReactNode;
}

export default function MobileControls({
  drawerOpen,
  onDrawerToggle,
  onDrawerClose,
  drawerWidth,
  children,
}: MobileControlsProps) {
  return (
    <>
      <Drawer
        variant="temporary"
        anchor="left"
        open={drawerOpen}
        onClose={onDrawerClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            backgroundColor: "background.paper",
            backgroundImage: "none",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 1,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" sx={{ color: "primary.main", ml: 1 }}>
            Controls
          </Typography>
          <IconButton onClick={onDrawerClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ overflow: "auto", height: "100%" }}>{children}</Box>
      </Drawer>

      <Fab
        color="primary"
        aria-label="open controls"
        onClick={onDrawerToggle}
        sx={{
          position: "fixed",
          bottom: 24,
          left: 24,
          zIndex: 1000,
        }}
      >
        <SettingsIcon />
      </Fab>
    </>
  );
}
