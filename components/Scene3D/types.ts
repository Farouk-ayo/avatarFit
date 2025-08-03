import * as THREE from "three";

export type SceneProps = {
  sceneState: {
    avatarModel?: string;
    clothingModel?: string;
    clothingVisible?: boolean;
    clothingColor?: string;
  };
  onSceneReady: (sceneManager: SceneManager) => void;
};

export type SceneManager = {
  toggleClothingVisibility: (visible: boolean) => void;
  changeClothingColor: (color: string) => void;
  clearScene: () => void;
};

export type ModelProps = {
  url: string;
  onLoad?: (scene: THREE.Group) => void;
};

export type ClothingModelProps = {
  url: string;
  visible: boolean;
  color?: string;
  avatarData: AvatarData | null;
  onLoad?: (scene: THREE.Group) => void;
};

export type AvatarData = {
  bounds: THREE.Box3;
  center: THREE.Vector3;
  size: THREE.Vector3;
  keyPoints: {
    head: THREE.Vector3;
    chest: THREE.Vector3;
    waist: THREE.Vector3;
    shoulders: THREE.Vector3;
  };
};
