import * as THREE from "three";
import React, { useEffect, useState, useRef } from "react";
import { useGLTF } from "@react-three/drei/native";
import { GLTF } from "three-stdlib";
import { useFrame } from "@react-three/fiber";
import { Audio } from "expo-av";  

const visemesMapping = {
  A: "viseme_PP",
  B: "viseme_kk",
  C: "viseme_I",
  D: "viseme_AA",
  E: "viseme_O",
  F: "viseme_U",
  G: "viseme_FF",
  H: "viseme_TH",
  X: "viseme_PP",
};

type GLTFResult = GLTF & {
  nodes: {
    EyeLeft: THREE.SkinnedMesh;
    EyeRight: THREE.SkinnedMesh;
    Wolf3D_Head: THREE.SkinnedMesh;
    Wolf3D_Teeth: THREE.SkinnedMesh;
    Wolf3D_Tongue: THREE.SkinnedMesh;  // Assuming you have a "tongue" mesh
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

type ModelProps = JSX.IntrinsicElements["group"] & {
  isTalking?: boolean;
  visemeData?: {
    metadata: { soundFile: string; duration: number };
    mouthCues: { start: number; end: number; value: string }[];
  };
};

export function Model({ visemeData, ...props }: ModelProps) {
  const [currentViseme, setCurrentViseme] = useState<string | null>(null);
  const [blink, setBlink] = useState(false);
  const { nodes, materials, scene } = useGLTF(
    require("@/assets/models/Avatar.glb")
  ) as GLTFResult;

  const audioRef = useRef<Audio.Sound | null>(null);

  // Lerp function for head morphs
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

  // Load and play audio
  useEffect(() => {
    if (visemeData && visemeData.metadata.soundFile) {
      const loadAudio = async () => {
        const { sound } = await Audio.Sound.createAsync(
          { uri: `data:audio/wav;base64,${visemeData.metadata.soundFile}` }
        );
        audioRef.current = sound;
        await sound.playAsync();

        return () => {
          sound.stopAsync();
          sound.unloadAsync();
          audioRef.current = null;
        };
      };

      loadAudio();
    }
  }, [visemeData]);

  // Update eye blink animation
  useFrame(() => {
    lerpMorphTarget("eyeBlinkLeft", blink ? 1 : 0, 0.5);
    lerpMorphTarget("eyeBlinkRight", blink ? 1 : 0, 0.5);
  });

  // Initiates a random blinking sequence
  useEffect(() => {
    let blinkTimeout;
    const nextBlink = () => {
      blinkTimeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          nextBlink();
        }, 200);
      }, THREE.MathUtils.randInt(1000, 5000));
    };
    nextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  // Handle the mouth, teeth, and tongue viseme updates
  useFrame(() => {
    if (!visemeData || !visemeData.mouthCues.length || !audioRef.current) return;

    const elapsed = audioRef.current.getStatusAsync().then(status => {
      if (status.isLoaded) {
        return status.positionMillis / 1000;
      } else {
        return 0;
      }
    });

    elapsed.then(time => {
      const cue = visemeData.mouthCues.find(
        (cue) => time >= cue.start && time <= cue.end
      );

      if (cue && visemesMapping[cue.value]) {
        setCurrentViseme(visemesMapping[cue.value]);
      } else {
        setCurrentViseme(null);
      }

      // Apply viseme to head
      if (currentViseme) {
        lerpMorphTarget(currentViseme, 1, 0.1);
      }

      // Apply viseme to teeth (for wide mouth shapes like "AA", "O", etc.)
      if (currentViseme && (currentViseme === "viseme_AA" || currentViseme === "viseme_O")) {
        lerpMorphTarget("jawOpen", 1, 0.1);  // Open the jaw for "AA", "O"
      } else {
        lerpMorphTarget("jawOpen", 0, 0.1);  // Close teeth for non-speech
      }

      // Apply viseme to tongue (e.g., when "I", "S", "TH" or certain phonemes are present)
      if (currentViseme && (currentViseme === "viseme_I" || currentViseme === "viseme_S" || currentViseme === "viseme_TH")) {
        lerpMorphTarget("tongueOut", 1, 0.1);  // Extend tongue for these phonemes
      } else {
        lerpMorphTarget("tongueOut", 0, 0.1);  // Retract tongue for others
      }

      // Reset all other visemes to 0
      Object.values(visemesMapping).forEach((viseme) => {
        if (viseme !== currentViseme) {
          lerpMorphTarget(viseme, 0, 0.1);
        }
      });
    });
  });

  return (
    <group
      {...props}
      dispose={null}
      scale={[2.4, 2.4, 1]}
      position={[0, -3, 2.8]}
    >
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
