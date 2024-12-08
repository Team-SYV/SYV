import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Model } from "@/components/Avatar/Model";
import useControls from "r3f-native-orbitcontrols";

export default function Avatar() {
  const [OrbitControls, events] = useControls();

  return (
    <Canvas>
      <OrbitControls />
      <Suspense fallback={null}>
        <ambientLight />
        <directionalLight position={[5, 5, 5]} />
        <Model />
      </Suspense>
      <perspectiveCamera position={[0, 1, 3]} fov={60} />
    </Canvas>
  );
}
