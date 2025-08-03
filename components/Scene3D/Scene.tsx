import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { Environment, OrbitControls, Stage } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import AvatarModel from "./AvatarModel";
import ClothingModel from "./ClothingModel";
import { analyzeAvatar } from "./utils";
import type { SceneProps, AvatarData, SceneManager } from "./types";
import { useControls } from "leva";

export default function Scene({ sceneState, onSceneReady }: SceneProps) {
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

  // Leva Controls
  const {
    ambientIntensity,
    dirIntensity,
    cameraX,
    cameraY,
    cameraZ,
    showHelpers,
  } = useControls("Debug Controls", {
    ambientIntensity: { value: 0.6, min: 0, max: 2, step: 0.1 },
    dirIntensity: { value: 1.0, min: 0, max: 5, step: 0.1 },
    cameraX: { value: 0, min: -10, max: 10, step: 0.1 },
    cameraY: { value: 1, min: -10, max: 10, step: 0.1 },
    cameraZ: { value: 5, min: -10, max: 20, step: 0.1 },
    showHelpers: false,
  });

  // Sync camera position
  useEffect(() => {
    camera.position.set(cameraX, cameraY, cameraZ);
    camera.lookAt(0, 0, 0);
  }, [cameraX, cameraY, cameraZ, camera]);

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      onSceneReady(sceneManager.current);
      initialized.current = true;
    }
  }, [onSceneReady]);

  return (
    <>
      {showHelpers && <axesHelper args={[2]} />}
      <ambientLight intensity={ambientIntensity} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={dirIntensity}
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
