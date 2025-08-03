
import * as THREE from "three";
import { AvatarData } from "./types";

// Detect clothing type by aspect ratio
export function detectClothingType(scene: THREE.Group): string {
  const box = new THREE.Box3().setFromObject(scene);
  const size = box.getSize(new THREE.Vector3());
  const aspectRatio = size.y / size.x;

  if (aspectRatio > 1.5) return "fullbody";
  if (aspectRatio > 0.8) return "jacket";
  if (aspectRatio > 0.4) return "top";
  if (aspectRatio < 0.3) return "hat";
  return "pants";
}

// Analyze avatar and extract key body points
export function analyzeAvatar(scene: THREE.Group): AvatarData {
  const bounds = new THREE.Box3().setFromObject(scene);
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());

  const keyPoints = {
    head: new THREE.Vector3(center.x, bounds.max.y - size.y * 0.1, center.z),
    chest: new THREE.Vector3(center.x, bounds.max.y - size.y * 0.3, center.z),
    waist: new THREE.Vector3(center.x, bounds.max.y - size.y * 0.5, center.z),
    shoulders: new THREE.Vector3(center.x, bounds.max.y - size.y * 0.25, center.z),
  };

  return { bounds, center, size, keyPoints };
}

// Fit clothing based on avatar proportions and type
export function fitClothingToAvatar(
  clothingScene: THREE.Group,
  avatarData: AvatarData
): void {
  const clothingType = detectClothingType(clothingScene);
  const clothingBounds = new THREE.Box3().setFromObject(clothingScene);
  const clothingSize = clothingBounds.getSize(new THREE.Vector3());
  const clothingCenter = clothingBounds.getCenter(new THREE.Vector3());

  clothingScene.scale.set(1, 1, 1);
  clothingScene.position.set(0, 0, 0);
  clothingScene.rotation.set(0, 0, 0);

  let targetScale: THREE.Vector3;
  let targetPosition: THREE.Vector3;

  switch (clothingType) {
    case "fullbody":
      targetScale = new THREE.Vector3(
        (avatarData.size.x * 0.95) / clothingSize.x,
        (avatarData.size.y * 0.9) / clothingSize.y,
        (avatarData.size.z * 0.95) / clothingSize.z
      );
      targetPosition = avatarData.center.clone();
      targetPosition.y -= avatarData.size.y * 0.05;
      break;

    case "jacket":
    case "top":
      const upperHeight = avatarData.size.y * 0.4;
      targetScale = new THREE.Vector3(
        (avatarData.size.x * 1.02) / clothingSize.x,
        upperHeight / clothingSize.y,
        (avatarData.size.z * 1.02) / clothingSize.z
      );
      targetPosition = avatarData.keyPoints.chest.clone();
      targetPosition.y += upperHeight * 0.1;
      break;

    case "pants":
      const lowerHeight = avatarData.size.y * 0.5;
      targetScale = new THREE.Vector3(
        (avatarData.size.x * 1.0) / clothingSize.x,
        lowerHeight / clothingSize.y,
        (avatarData.size.z * 1.0) / clothingSize.z
      );
      targetPosition = avatarData.keyPoints.waist.clone();
      targetPosition.y -= lowerHeight * 0.3;
      break;

    case "hat":
      const headSize = avatarData.size.y * 0.15;
      const scale = headSize / Math.max(clothingSize.x, clothingSize.y, clothingSize.z);
      targetScale = new THREE.Vector3(scale, scale, scale);
      targetPosition = avatarData.keyPoints.head.clone();
      targetPosition.y += headSize * 0.2;
      break;

    default:
      const defaultScale = Math.min(
        avatarData.size.x / clothingSize.x,
        avatarData.size.y / clothingSize.y,
        avatarData.size.z / clothingSize.z
      ) * 1.02;
      targetScale = new THREE.Vector3(defaultScale, defaultScale, defaultScale);
      targetPosition = avatarData.center.clone();
  }

  clothingScene.scale.copy(targetScale);
  const scaledBounds = new THREE.Box3().setFromObject(clothingScene);
  const scaledCenter = scaledBounds.getCenter(new THREE.Vector3());
  clothingScene.position.copy(targetPosition.sub(scaledCenter));
}
