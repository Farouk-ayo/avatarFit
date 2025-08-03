import { useEffect, useRef } from "react";
import * as THREE from "three";
import { ClothingModelProps } from "./types";
import { fitClothingToAvatar } from "./utils";
import { useGLTF } from "@react-three/drei";

export default function ClothingModel({
  url,
  visible,
  color,
  avatarData,
  onLoad,
}: ClothingModelProps) {
  const { scene } = useGLTF(url) as { scene: THREE.Group };
  const meshRef = useRef<THREE.Object3D>(null);
  const fittedRef = useRef(false);

  // Automatic fitting when both clothing and avatar are loaded
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
