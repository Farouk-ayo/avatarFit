import * as THREE from "three";
import { AvatarData } from "./types";

// Detect clothing type by aspect ratio
export function detectClothingType(scene: THREE.Group): string {
  const box = new THREE.Box3().setFromObject(scene);
  const size = box.getSize(new THREE.Vector3());
  const aspectRatio = size.y / size.x;

  // Simple heuristics based on model dimensions
  if (aspectRatio > 1.5) return "fullbody"; // dress, jumpsuit
  if (aspectRatio > 0.8) return "jacket"; // jacket, shirt
  if (aspectRatio > 0.4) return "top"; // t-shirt, blouse
  if (aspectRatio < 0.3) return "hat"; // hat, cap
  return "pants"; // pants, shorts
}

// Analyze avatar and extract key body points
export function analyzeAvatar(scene: THREE.Group): AvatarData {
  const bounds = new THREE.Box3().setFromObject(scene);
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());

  // Calculate key body points based on typical human proportions
  const keyPoints = {
    head: new THREE.Vector3(center.x, bounds.max.y - size.y * 0.1, center.z),
    chest: new THREE.Vector3(center.x, bounds.max.y - size.y * 0.3, center.z),
    waist: new THREE.Vector3(center.x, bounds.max.y - size.y * 0.5, center.z),
    shoulders: new THREE.Vector3(
      center.x,
      bounds.max.y - size.y * 0.25,
      center.z
    ),
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

  console.log("Detected clothing type:", clothingType);

  // Reset transforms
  clothingScene.scale.set(1, 1, 1);
  clothingScene.position.set(0, 0, 0);
  clothingScene.rotation.set(0, 0, 0);

  // Calculate scale based on avatar proportions
  let targetScale: THREE.Vector3;
  let targetPosition: THREE.Vector3;

  switch (clothingType) {
    case "fullbody":
      // Full body clothing (dresses, jumpsuits)
      targetScale = new THREE.Vector3(
        (avatarData.size.x * 0.95) / clothingSize.x,
        (avatarData.size.y * 0.9) / clothingSize.y,
        (avatarData.size.z * 0.95) / clothingSize.z
      );
      targetPosition = avatarData.center.clone();
      targetPosition.y -= avatarData.size.y * 0.05; // Slight offset down
      break;

    case "jacket":
    case "top":
      // Upper body clothing
      const upperBodyHeight = avatarData.size.y * 0.4; // Top 40% of body
      targetScale = new THREE.Vector3(
        (avatarData.size.x * 1.02) / clothingSize.x, // Slightly larger for comfort
        upperBodyHeight / clothingSize.y,
        (avatarData.size.z * 1.02) / clothingSize.z
      );
      targetPosition = avatarData.keyPoints.chest.clone();
      targetPosition.y += upperBodyHeight * 0.1; // Offset to chest level
      break;

    case "pants":
      // Lower body clothing
      const lowerBodyHeight = avatarData.size.y * 0.5; // Bottom 50% of body
      targetScale = new THREE.Vector3(
        (avatarData.size.x * 1.0) / clothingSize.x,
        lowerBodyHeight / clothingSize.y,
        (avatarData.size.z * 1.0) / clothingSize.z
      );
      targetPosition = avatarData.keyPoints.waist.clone();
      targetPosition.y -= lowerBodyHeight * 0.3; // Position at waist
      break;

    case "hat":
      // Head accessories
      const headSize = avatarData.size.y * 0.15; // Head is ~15% of body
      const uniformScale =
        headSize / Math.max(clothingSize.x, clothingSize.y, clothingSize.z);
      targetScale = new THREE.Vector3(uniformScale, uniformScale, uniformScale);
      targetPosition = avatarData.keyPoints.head.clone();
      targetPosition.y += headSize * 0.2; // Slightly above head
      break;

    default:
      // Default fitting - proportional scaling
      const uniformDefaultScale =
        Math.min(
          avatarData.size.x / clothingSize.x,
          avatarData.size.y / clothingSize.y,
          avatarData.size.z / clothingSize.z
        ) * 1.02;
      targetScale = new THREE.Vector3(
        uniformDefaultScale,
        uniformDefaultScale,
        uniformDefaultScale
      );
      targetPosition = avatarData.center.clone();
  }

  // Apply transforms
  clothingScene.scale.copy(targetScale);

  // Recalculate bounds after scaling
  const scaledBounds = new THREE.Box3().setFromObject(clothingScene);
  const scaledCenter = scaledBounds.getCenter(new THREE.Vector3());

  // Position clothing so its center aligns with target position
  clothingScene.position.copy(targetPosition.sub(scaledCenter));

  console.log("Applied fitting:", {
    type: clothingType,
    scale: targetScale,
    position: clothingScene.position,
  });
}
