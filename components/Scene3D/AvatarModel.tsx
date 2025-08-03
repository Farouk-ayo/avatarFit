import * as THREE from "three";
import { useEffect, useRef } from "react";
import { ModelProps } from "./types";
import { useGLTF } from "@react-three/drei";

export default function AvatarModel({ url, onLoad }: ModelProps) {
  const { scene } = useGLTF(url) as { scene: THREE.Group };
  const initRef = useRef(false);

  useEffect(() => {
    if (scene && !initRef.current) {
      initRef.current = true;

      // Normalizing avatar size and position
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
