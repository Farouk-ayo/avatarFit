import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { Environment, OrbitControls, Stage } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import AvatarModel from "./AvatarModel";
import ClothingModel from "./ClothingModel";
import { analyzeAvatar } from "./utils";
import type { SceneProps, AvatarData, SceneManager } from "./types";

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
