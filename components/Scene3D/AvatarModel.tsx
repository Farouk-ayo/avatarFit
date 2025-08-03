import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { useEffect } from "react";
import { ModelProps } from "./types";

export default function AvatarModel({ url, onLoad }: ModelProps) {
  const gltf = useLoader(GLTFLoader, url);

  useEffect(() => {
    if (gltf && onLoad) {
      onLoad(gltf.scene);
    }
  }, [gltf, onLoad]);

  return <primitive object={gltf.scene} />;
}
