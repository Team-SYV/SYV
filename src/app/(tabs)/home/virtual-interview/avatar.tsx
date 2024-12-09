import React, { Suspense } from "react";
import { View, ImageBackground } from "react-native";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { Model } from "@/components/Avatar/Model";

export default function Avatar() {
  return (
    <View className="flex-1">
      <ImageBackground
        source={require("@/assets/images/background.png")}
        className="w-[96%] h-56 rounded-xl mx-auto my-2 overflow-hidden"
      >
        <Suspense fallback={null}>
          <View className="absolute bottom-0 right-0 left-0 top-0">
            <Canvas gl={{ localClippingEnabled: true }}>
              <PerspectiveCamera makeDefault position={[0, 0.8, 4]} fov={50} />
              <ambientLight intensity={0.8} />
              <directionalLight position={[5, 5, 5]} />
              <Model />
            </Canvas>
          </View>
        </Suspense>
      </ImageBackground>
    </View>
  );
}
