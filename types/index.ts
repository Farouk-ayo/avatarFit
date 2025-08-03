export interface SceneState {
  avatarModel: string | undefined;
  clothingModel: string | undefined;
  clothingVisible: boolean;
  clothingColor: string;
  loading: boolean;
  error: string | undefined;
}

export interface SceneRef {
  toggleClothingVisibility: (visible: boolean) => void;
  changeClothingColor: (color: string) => void;
  clearScene: () => void;
}

export interface UploadResponse {
  success: boolean;
  url: string;
  filename: string;
  originalName: string;
  size: number;
  type: string;
}
export type ControlPanelProps = {
  sceneState: SceneState;
  onAvatarUpload: (file: File) => void;
  onClothingUpload: (file: File) => void;
  onToggleClothing: () => void;
  onColorChange: (color: string) => void;
  onResetScene: () => void;
};
