import * as THREE from "three";
import React, { useEffect, useState, useRef } from "react";
import { useGLTF } from "@react-three/drei/native";
import { GLTF } from "three-stdlib";
import { useFrame } from "@react-three/fiber";
import { Audio } from "expo-av";
import { visemesMapping } from "@/constants/vismesMapping";

type Viseme = {
  time: number;
  type: string;
  value: string;
};

type GLTFResult = GLTF & {
  nodes: {
    EyeLeft: THREE.SkinnedMesh;
    EyeRight: THREE.SkinnedMesh;
    Wolf3D_Head: THREE.SkinnedMesh;
    Wolf3D_Teeth: THREE.SkinnedMesh;
    Wolf3D_Tongue: THREE.SkinnedMesh;
    ["hair-60"]: THREE.SkinnedMesh;
    Wolf3D_Glasses: THREE.SkinnedMesh;
    Wolf3D_Outfit_Top: THREE.SkinnedMesh;
    Hips: THREE.Bone;
  };
  materials: {
    Wolf3D_Eye: THREE.MeshStandardMaterial;
    Wolf3D_Skin: THREE.MeshStandardMaterial;
    Wolf3D_Teeth: THREE.MeshStandardMaterial;
    M_Hair_60: THREE.MeshStandardMaterial;
    Wolf3D_Glasses: THREE.MeshStandardMaterial;
    Wolf3D_Outfit_Top: THREE.MeshStandardMaterial;
  };
  scene: THREE.Scene;
};

export function Model({
  audio,
  visemes,
}: {
  audio: string;
  visemes: Viseme[];
}) {
  const [blink, setBlink] = useState(false);
  const [currentViseme, setCurrentViseme] = useState<Viseme | null>(null);

  const { nodes, materials, scene } = useGLTF(
    require("@/assets/models/Avatar.glb")
  ) as GLTFResult;

  const audioRef = useRef<Audio.Sound | null>(null);
  const audioPlayingRef = useRef<boolean>(false);

  // Changes the influence of a specific morph target on a 3D model
  const lerpMorphTarget = (
    target: string,
    value: number,
    speed = 0.1
  ): void => {
    scene.traverse((child) => {
      const skinnedMesh = child as THREE.SkinnedMesh;
      if (skinnedMesh.isSkinnedMesh && skinnedMesh.morphTargetDictionary) {
        const index = skinnedMesh.morphTargetDictionary[target];
        if (
          index === undefined ||
          skinnedMesh.morphTargetInfluences[index] === undefined
        ) {
          return;
        }
        skinnedMesh.morphTargetInfluences[index] = THREE.MathUtils.lerp(
          skinnedMesh.morphTargetInfluences[index],
          value,
          speed
        );
      }
    });
  };

  // Loads and play an audio file
  useEffect(() => {
    if (audioPlayingRef.current) return;
    let isMounted = true;

    const loadAudio = async () => {
      const { sound } = await Audio.Sound.createAsync({
        uri: `data:audio/mp3;base64,${audio}`,
      });

      if (!isMounted) {
        sound.unloadAsync();
        return;
      }

      audioRef.current = sound;
      await sound.playAsync();
    };

    if (audio) {
      loadAudio();
    }

    // Cleanup on unmount
    return () => {
      isMounted = false;
      if (audioRef.current) {
        audioRef.current.stopAsync();
        audioRef.current.unloadAsync();
        audioRef.current = null;
      }
    };
  }, [audio]);

  // Updates the eye blink animation
  useFrame(() => {
    lerpMorphTarget("eyeBlinkLeft", blink ? 1 : 0, 0.5);
    lerpMorphTarget("eyeBlinkRight", blink ? 1 : 0, 0.5);
  });

  // Schedule the next blink after a random interval
  useEffect(() => {
    let blinkTimeout;
    const startBlinking = () => {
      setBlink(true);
      setTimeout(() => setBlink(false), 200);

      blinkTimeout = setTimeout(
        startBlinking,
        THREE.MathUtils.randInt(1000, 5000)
      );
    };
    startBlinking();
    return () => clearTimeout(blinkTimeout);
  }, []);

  // Matches the current audio playback time with mouth cues to set the appropriate viseme.
  useFrame(() => {
    if (!visemes || !audioRef.current) return;

    audioRef.current.getStatusAsync().then((status) => {
      if (!status.isLoaded) return;

      const elapsedTime = status.positionMillis;

      const current = visemes
        .slice()
        .reverse()
        .find((viseme) => viseme.time <= elapsedTime);

      if (current) {
        if (current.value !== currentViseme?.value) {
          setCurrentViseme(current);

          Object.keys(visemesMapping).forEach((key) =>
            lerpMorphTarget(visemesMapping[key], 0, 0.5)
          );

          const targetViseme = visemesMapping[current.value];
          if (targetViseme) {
            lerpMorphTarget(targetViseme, 2, 0.2);
          }
        }
      }
    });
  });


  return (
    <group dispose={null} scale={[2.4, 2.4, 1]} position={[0, -3, 2.8]}>
      <primitive object={nodes.Hips} />
      <skinnedMesh
        name="EyeLeft"
        geometry={nodes.EyeLeft.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeLeft.skeleton}
        morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
      />
      <skinnedMesh
        name="EyeRight"
        geometry={nodes.EyeRight.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeRight.skeleton}
        morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Head"
        geometry={nodes.Wolf3D_Head.geometry}
        material={materials.Wolf3D_Skin}
        skeleton={nodes.Wolf3D_Head.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Teeth"
        geometry={nodes.Wolf3D_Teeth.geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={nodes.Wolf3D_Teeth.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
      />
      <skinnedMesh
        geometry={nodes["hair-60"].geometry}
        material={materials.M_Hair_60}
        skeleton={nodes["hair-60"].skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Glasses.geometry}
        material={materials.Wolf3D_Glasses}
        skeleton={nodes.Wolf3D_Glasses.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Top.geometry}
        material={materials.Wolf3D_Outfit_Top}
        skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
      />
    </group>
  );
}

useGLTF.preload(require("@/assets/models/Avatar.glb"));
