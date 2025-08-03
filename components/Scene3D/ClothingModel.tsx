import { useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { ClothingModelProps } from "./types";
import { fitClothingToAvatar } from "./utils";

export default function ClothingModel({
  url,
  visible,
  color,
  avatarData,
  onLoad,
}: ClothingModelProps) {
  const gltf = useLoader(GLTFLoader, url);
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);

  useEffect(() => {
    if (gltf && onLoad) {
      onLoad(gltf.scene);
    }
  }, [gltf, onLoad]);

  useEffect(() => {
    if (gltf && avatarData) {
      fitClothingToAvatar(gltf.scene, avatarData);
    }
  }, [gltf, avatarData]);

  const coloredScene = useMemo(() => {
    if (!gltf?.scene || !color) return gltf.scene;
    const cloned = gltf.scene.clone(true);
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(color),
        });
        materialRef.current = mesh.material as THREE.MeshStandardMaterial;
      }
    });
    return cloned;
  }, [gltf.scene, color]);

  if (!visible) return null;
  return <primitive object={coloredScene} />;
}
