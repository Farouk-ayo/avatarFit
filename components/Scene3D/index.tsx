"use client";

import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";
import type { SceneProps } from "./types";
import { useGLTF } from "@react-three/drei";
import { Leva } from "leva";

export default function Scene3D({ sceneState, onSceneReady }: SceneProps) {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Leva collapsed /> {/* Debug UI Panel */}
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
