import React, { useRef, useEffect, useState, MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center, Environment } from "@react-three/drei";
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
  avatarBounds: THREE.Box3;
  onLoad?: (scene: THREE.Group) => void;
};

// Avatar Model Component
function AvatarModel({ url, onLoad }: ModelProps) {
  const { scene } = useGLTF(url) as { scene: THREE.Group };
  const initRef = useRef(false);

  useEffect(() => {
    if (scene && !initRef.current) {
      initRef.current = true;

      // compute bounding box
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const scale = 2 / Math.max(size.x, size.y, size.z);

      // apply transforms once
      scene.scale.setScalar(scale);
      scene.position.sub(center.multiplyScalar(scale));
      scene.position.y = -1;

      onLoad?.(scene);
    }
  }, [scene, onLoad]);

  return scene ? <primitive object={scene} /> : null;
}

// Clothing Model Component
function ClothingModel({
  url,
  visible,
  color,
  avatarBounds,
  onLoad,
}: ClothingModelProps) {
  const { scene } = useGLTF(url) as { scene: THREE.Group };
  const meshRef = useRef<THREE.Object3D>(null);

  useEffect(() => {
    if (scene && avatarBounds) {
      const clothingBox = new THREE.Box3().setFromObject(scene);
      const clothingSize = clothingBox.getSize(new THREE.Vector3());
      const avatarSize = avatarBounds.getSize(new THREE.Vector3());

      const scaleX = avatarSize.x / clothingSize.x;
      const scaleY = avatarSize.y / clothingSize.y;
      const scaleZ = avatarSize.z / clothingSize.z;
      const uniformScale = Math.min(scaleX, scaleY, scaleZ) * 1.05;

      scene.scale.setScalar(uniformScale);

      const avatarCenter = avatarBounds.getCenter(new THREE.Vector3());
      scene.position.copy(avatarCenter);
      scene.position.y += 0.1;
    }

    onLoad?.(scene);
  }, [scene, avatarBounds, onLoad]);

  useEffect(() => {
    if (scene) {
      scene.visible = visible;
    }
  }, [scene, visible]);

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
  const [avatarBounds, setAvatarBounds] = useState<THREE.Box3 | null>(null);
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
            (
              (child as THREE.Mesh).material as THREE.MeshStandardMaterial
            ).color = new THREE.Color(color);
          }
        });
      }
    },
    clearScene: () => {
      if (avatarScene) {
        scene.remove(avatarScene);
        setAvatarScene(null);
        setAvatarBounds(null);
      }
      if (clothingScene) {
        scene.remove(clothingScene);
        setClothingScene(null);
      }
    },
  });

  const handleAvatarLoad = (loadedScene: THREE.Group) => {
    setAvatarScene(loadedScene);
    const bounds = new THREE.Box3().setFromObject(loadedScene);
    setAvatarBounds(bounds);
  };

  const handleClothingLoad = (loadedScene: THREE.Group) => {
    setClothingScene(loadedScene);
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
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-10, 10, -5]} intensity={0.5} />

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

      {sceneState.clothingModel && avatarBounds && (
        <ClothingModel
          url={sceneState.clothingModel}
          visible={!!sceneState.clothingVisible}
          color={sceneState.clothingColor}
          avatarBounds={avatarBounds}
          onLoad={handleClothingLoad}
        />
      )}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#333" />
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

// Preload stub (adjust as needed)
(useGLTF as any).preload = () => {};
