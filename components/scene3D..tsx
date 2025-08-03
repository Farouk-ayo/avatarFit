import React, { useRef, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";

type SceneProps = {
  sceneState: {
    avatarModel?: string;
    clothingModel?: string;
    clothingVisible?: boolean;
    clothingColor?: string;
  };
  onSceneReady: (sceneManager: SceneManager) => void;
};

type SceneManager = {
  toggleClothingVisibility: (visible: boolean) => void;
  changeClothingColor: (color: string) => void;
  clearScene: () => void;
};

type ModelProps = {
  url: string;
  onLoad?: (scene: THREE.Group) => void;
};

type ClothingModelProps = {
  url: string;
  visible: boolean;
  color?: string;
  avatarData: AvatarData | null;
  onLoad?: (scene: THREE.Group) => void;
};

type AvatarData = {
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

// Utility function to detect clothing type
function detectClothingType(scene: THREE.Group): string {
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

// Enhanced avatar analysis
function analyzeAvatar(scene: THREE.Group): AvatarData {
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

// Smart clothing fitting algorithm
function fitClothingToAvatar(
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

// Avatar Model Component
function AvatarModel({ url, onLoad }: ModelProps) {
  const { scene } = useGLTF(url) as { scene: THREE.Group };
  const initRef = useRef(false);

  useEffect(() => {
    if (scene && !initRef.current) {
      initRef.current = true;

      // Normalize avatar size and position
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const scale = 2 / Math.max(size.x, size.y, size.z);

      scene.scale.setScalar(scale);
      scene.position.sub(center.multiplyScalar(scale));
      scene.position.y = -1; // Place on ground

      onLoad?.(scene);
    }
  }, [scene, onLoad]);

  return scene ? <primitive object={scene} /> : null;
}

// Enhanced Clothing Model Component
function ClothingModel({
  url,
  visible,
  color,
  avatarData,
  onLoad,
}: ClothingModelProps) {
  const { scene } = useGLTF(url) as { scene: THREE.Group };
  const meshRef = useRef<THREE.Object3D>(null);
  const fittedRef = useRef(false);

  // Apply automatic fitting when both clothing and avatar are loaded
  useEffect(() => {
    if (scene && avatarData && !fittedRef.current) {
      fittedRef.current = true;
      console.log("Applying automatic fitting...");
      fitClothingToAvatar(scene, avatarData);
      onLoad?.(scene);
    }
  }, [scene, avatarData, onLoad]);

  // Handle visibility
  useEffect(() => {
    if (scene) {
      scene.visible = visible;
    }
  }, [scene, visible]);

  // Handle color changes
  useEffect(() => {
    if (scene && color) {
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
          const mesh = child as THREE.Mesh;
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map((mat) => {
              const cloned = (mat as THREE.Material).clone();
              if ((cloned as THREE.MeshStandardMaterial).color) {
                (cloned as THREE.MeshStandardMaterial).color = new THREE.Color(
                  color
                );
              }
              return cloned;
            });
          } else {
            const material = (mesh.material as THREE.Material).clone();
            if ((material as THREE.MeshStandardMaterial).color) {
              (material as THREE.MeshStandardMaterial).color = new THREE.Color(
                color
              );
            }
            mesh.material = material;
          }
        }
      });
    }
  }, [scene, color]);

  return scene ? <primitive ref={meshRef} object={scene} /> : null;
}

// Main Scene Component
function Scene({ sceneState, onSceneReady }: SceneProps) {
  const { camera, scene } = useThree();
  const [avatarData, setAvatarData] = useState<AvatarData | null>(null);
  const [avatarScene, setAvatarScene] = useState<THREE.Group | null>(null);
  const [clothingScene, setClothingScene] = useState<THREE.Group | null>(null);

  const sceneManager = useRef<SceneManager>({
    toggleClothingVisibility: (visible: boolean) => {
      if (clothingScene) {
        clothingScene.visible = visible;
      }
    },
    changeClothingColor: (color: string) => {
      if (clothingScene) {
        clothingScene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
            const mesh = child as THREE.Mesh;
            const material = mesh.material as THREE.MeshStandardMaterial;
            if (material.color) {
              material.color.set(color);
            }
          }
        });
      }
    },
    clearScene: () => {
      if (avatarScene) {
        scene.remove(avatarScene);
        setAvatarScene(null);
        setAvatarData(null);
      }
      if (clothingScene) {
        scene.remove(clothingScene);
        setClothingScene(null);
      }
    },
  });

  const handleAvatarLoad = (loadedScene: THREE.Group) => {
    setAvatarScene(loadedScene);
    const data = analyzeAvatar(loadedScene);
    setAvatarData(data);
    console.log("Avatar analyzed:", data);
  };

  const handleClothingLoad = (loadedScene: THREE.Group) => {
    setClothingScene(loadedScene);
    console.log("Clothing loaded");
  };

  useEffect(() => {
    camera.position.set(0, 1, 5);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      onSceneReady(sceneManager.current);
      initialized.current = true;
    }
  }, [onSceneReady]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-10, 10, -5]} intensity={0.3} />

      <Environment preset="studio" />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={10}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
      />

      {sceneState.avatarModel && (
        <AvatarModel url={sceneState.avatarModel} onLoad={handleAvatarLoad} />
      )}

      {sceneState.clothingModel && avatarData && (
        <ClothingModel
          url={sceneState.clothingModel}
          visible={!!sceneState.clothingVisible}
          color={sceneState.clothingColor}
          avatarData={avatarData}
          onLoad={handleClothingLoad}
        />
      )}

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#444" />
      </mesh>
    </>
  );
}

// Main Scene3D Component
export default function Scene3D({ sceneState, onSceneReady }: SceneProps) {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas
        shadows
        camera={{ position: [0, 1, 5], fov: 75 }}
        style={{ width: "100%", height: "100%" }}
      >
        <Scene sceneState={sceneState} onSceneReady={onSceneReady} />
      </Canvas>
    </div>
  );
}

// Preload stub
(useGLTF as any).preload = () => {};
