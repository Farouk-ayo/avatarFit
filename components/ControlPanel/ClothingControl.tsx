import React, { useState } from "react";
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Button,
} from "@mui/material";
import { Visibility, VisibilityOff, Palette } from "@mui/icons-material";
import { ChromePicker } from "react-color";
import { SceneState } from "@/types";

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
    setColorPickerOpen(false);
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

        {colorPickerOpen && (
          <Box sx={{ mt: 2 }}>
            <ChromePicker
              color={clothingColor || "#ffffff"}
              onChangeComplete={(color) => handleColorSelect(color.hex)}
              disableAlpha
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ClothingControls;
