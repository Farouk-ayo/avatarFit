import { Snackbar, Alert } from "@mui/material";

interface NotificationDisplayProps {
  notification: {
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  };
  onClose: () => void;
}

export default function NotificationDisplay({
  notification,
  onClose,
}: NotificationDisplayProps) {
  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert
        onClose={onClose}
        severity={notification.severity}
        sx={{ width: "100%" }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
}
