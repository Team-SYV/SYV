import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Model } from "@/components/Avatar/Model";
import useControls from "r3f-native-orbitcontrols";
import { Loader } from "@react-three/drei";

export default function Avatar() {
  const [OrbitControls, events] = useControls();

  return (
    <>
    <Loader/>
      <Canvas
        style={{ width: "100%", height: "50" }}
        camera={{ position: [0, 1.5, 5], fov: 45 }}
      >
        <OrbitControls />
        <Suspense fallback={null}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} />
          <Model />
        </Suspense>
      </Canvas>
    </>
  );
}
