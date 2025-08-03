import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { OrbitControls, Stage } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import AvatarModel from "./AvatarModel";
import ClothingModel from "./ClothingModel";
import { analyzeAvatar } from "./utils";
import type { SceneProps, AvatarData, SceneManager } from "./types";

export default function Scene({ sceneState, onSceneReady }: SceneProps) {
  const {
    avatarModel,
    clothingModel,
    clothingVisible = true,
    clothingColor = "#ffffff",
  } = sceneState;

  const [avatarData, setAvatarData] = useState<AvatarData | null>(null);
  const clothingRef = useRef<THREE.Group>(null);

  const { scene } = useThree();

  // Init SceneManager
  useEffect(() => {
    const manager: SceneManager = {
      toggleClothingVisibility: (visible) => {
        if (clothingRef.current) {
          clothingRef.current.visible = visible;
        }
      },
      changeClothingColor: (color) => {
        clothingRef.current?.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            (mesh.material as THREE.MeshStandardMaterial).color.set(color);
          }
        });
      },
      clearScene: () => {
        while (scene.children.length > 0) {
          scene.remove(scene.children[0]);
        }
      },
    };

    onSceneReady(manager);
  }, [onSceneReady, scene]);

  return (
    <>
      <Stage intensity={1} environment="city" shadows adjustCamera>
        {avatarModel && (
          <AvatarModel
            url={avatarModel}
            onLoad={(scene) => {
              const data = analyzeAvatar(scene);
              setAvatarData(data);
            }}
          />
        )}
        {clothingModel && avatarData && (
          <group ref={clothingRef}>
            <ClothingModel
              url={clothingModel}
              visible={clothingVisible}
              color={clothingColor}
              avatarData={avatarData}
            />
          </group>
        )}
      </Stage>
      <OrbitControls />
    </>
  );
}
