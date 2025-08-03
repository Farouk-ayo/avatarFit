"use client";

import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";
import type { SceneProps } from "./types";

export default function Scene3D({ sceneState, onSceneReady }: SceneProps) {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas shadows camera={{ position: [0, 1.5, 3.5], fov: 45 }}>
        <Scene sceneState={sceneState} onSceneReady={onSceneReady} />
      </Canvas>
    </div>
  );
}
