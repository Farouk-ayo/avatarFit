import { useState } from "react";
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Button,
  ClickAwayListener,
} from "@mui/material";
import { Visibility, VisibilityOff, Palette } from "@mui/icons-material";
import { ChromePicker } from "react-color";

interface ClothingControlsProps {
  clothingVisible: boolean;
  clothingColor: string;
  onToggleClothing: () => void;
  onColorChange: (color: string) => void;
}

const ClothingControls = ({
  clothingVisible,
  clothingColor,
  onToggleClothing,
  onColorChange,
}: ClothingControlsProps) => {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const handleColorSelect = (color: string) => {
    onColorChange(color);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        Clothing Controls
      </Typography>

      <FormControlLabel
        control={
          <Switch
            checked={clothingVisible}
            onChange={onToggleClothing}
            color="primary"
          />
        }
        label={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {clothingVisible ? <Visibility /> : <VisibilityOff />}
            {clothingVisible ? "Visible" : "Hidden"}
          </Box>
        }
      />

      <Box sx={{ mt: 2 }}>
        <Button
          variant="outlined"
          startIcon={<Palette />}
          onClick={() => setColorPickerOpen(!colorPickerOpen)}
          sx={{ mb: 1 }}
          fullWidth
        >
          Change Color
        </Button>

        {/* ✅ Wrap color picker in ClickAwayListener */}
        {colorPickerOpen && (
          <ClickAwayListener onClickAway={() => setColorPickerOpen(false)}>
            <Box sx={{ mt: 2, zIndex: 10 }}>
              <ChromePicker
                color={clothingColor || "#ffffff"}
                onChangeComplete={(color) => handleColorSelect(color.hex)}
                disableAlpha
              />
            </Box>
          </ClickAwayListener>
        )}
      </Box>
    </Box>
  );
};

export default ClothingControls;
