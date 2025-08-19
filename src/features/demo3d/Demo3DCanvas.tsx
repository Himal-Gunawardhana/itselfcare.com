import React, {
  Suspense,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as MeshoptDecoder from "meshoptimizer/meshopt_decoder.module.js";

type MeshoptDecoderModule = {
  ready?: Promise<void>;
  decodeMeshopt?: (...args: unknown[]) => unknown;
};

export type Demo3DCanvasProps = {
  modelUrl?: string;
  className?: string;
  cameraPosition?: [number, number, number];
  fov?: number;
  onModelLoad?: (armature: THREE.Object3D | null) => void;
};

export type ArmatureControls = {
  rotateBone: (boneName: string, axis: "x" | "y" | "z", angle: number) => void;
  resetPose: () => void;
  performExercise: (
    exerciseType: string,
    duration?: number,
    repetitions?: number
  ) => void;
  debugBone: (boneName: string) => void;
};

const Model = forwardRef<
  ArmatureControls,
  { url: string; onLoad?: (armature: THREE.Object3D | null) => void }
>(({ url, onLoad }, ref) => {
  const gltf = useLoader(GLTFLoader, url, (loader) => {
    const decoder = MeshoptDecoder as unknown as MeshoptDecoderModule;
    const loaderWithDecoder = loader as GLTFLoader & {
      setMeshoptDecoder?: (decoder: MeshoptDecoderModule | null) => void;
    };
    loaderWithDecoder.setMeshoptDecoder?.(decoder);
  });

  const modelRef = useRef<THREE.Object3D | null>(null);
  const armatureRef = useRef<THREE.Object3D | null>(null);
  const bonesMap = useRef<Map<string, THREE.Bone>>(new Map());

  // Store initial bone rotations when model loads
  const initialRotations = useRef<
    Map<string, { x: number; y: number; z: number }>
  >(new Map());

  React.useEffect(() => {
    if (gltf.scene) {
      modelRef.current = gltf.scene;

      // Find armature and bones
      gltf.scene.traverse((child) => {
        if (child.name === "Armature") {
          armatureRef.current = child;
          onLoad?.(child);
        }
        if (child instanceof THREE.Bone) {
          bonesMap.current.set(child.name, child);

          // Store initial rotation for this bone
          initialRotations.current.set(child.name, {
            x: child.rotation.x,
            y: child.rotation.y,
            z: child.rotation.z,
          });

          // DEBUG: Log bone positions and rotations
          console.log(`🦴 Bone: ${child.name}`);
          console.log(
            `   Position: x=${child.position.x.toFixed(
              3
            )}, y=${child.position.y.toFixed(3)}, z=${child.position.z.toFixed(
              3
            )}`
          );
          console.log(
            `   Rotation: x=${child.rotation.x.toFixed(
              3
            )}, y=${child.rotation.y.toFixed(3)}, z=${child.rotation.z.toFixed(
              3
            )}`
          );
          console.log(`   ---`);
        }
      });

      // DEBUG: Log all found bones
      console.log("📋 All Bones Found:", Array.from(bonesMap.current.keys()));
      console.log("💾 Initial rotations stored for all bones");
    }
  }, [gltf, onLoad]);

  useImperativeHandle(ref, () => ({
    rotateBone: (boneName: string, axis: "x" | "y" | "z", angle: number) => {
      const bone = bonesMap.current.get(boneName);
      if (bone) {
        const radians = (angle * Math.PI) / 180;

        // DEBUG: Log before rotation
        console.log(`🔄 Rotating ${boneName} on ${axis}-axis to ${angle}°`);
        console.log(
          `   Before: x=${bone.rotation.x.toFixed(
            3
          )}, y=${bone.rotation.y.toFixed(3)}, z=${bone.rotation.z.toFixed(3)}`
        );

        switch (axis) {
          case "x":
            bone.rotation.x = radians;
            break;
          case "y":
            bone.rotation.y = radians;
            break;
          case "z":
            bone.rotation.z = radians;
            break;
        }

        // DEBUG: Log after rotation
        console.log(
          `   After:  x=${bone.rotation.x.toFixed(
            3
          )}, y=${bone.rotation.y.toFixed(3)}, z=${bone.rotation.z.toFixed(3)}`
        );
      }
    },

    resetPose: () => {
      // Return to stored initial positions instead of (0,0,0)
      bonesMap.current.forEach((bone, boneName) => {
        const initialRot = initialRotations.current.get(boneName);
        if (initialRot) {
          bone.rotation.set(initialRot.x, initialRot.y, initialRot.z);
        } else {
          // Fallback to (0,0,0) if no initial rotation stored
          bone.rotation.set(0, 0, 0);
        }
      });
      console.log("🔄 All bones reset to initial model positions");
    },

    performExercise: (
      exerciseType: string,
      duration = 2000,
      repetitions = 3
    ) => {
      // Define exercise-specific configurations
      const exerciseConfigs = {
        bend: {
          defaultDuration: 3000, // 3 seconds per rep
          defaultReps: 5,
          description: "Elbow Flexion",
        },
        wrist: {
          defaultDuration: 2500, // 2.5 seconds per rep
          defaultReps: 8,
          description: "Wrist Rotation",
        },
        grip: {
          defaultDuration: 2000, // 2 seconds per rep
          defaultReps: 10,
          description: "Finger Grip",
        },
        full: {
          defaultDuration: 4000, // 4 seconds per rep
          defaultReps: 3,
          description: "Full Range Motion",
        },
      };

      const config =
        exerciseConfigs[exerciseType as keyof typeof exerciseConfigs];
      const animationDuration = duration || config?.defaultDuration || 2000;
      const totalReps = repetitions || config?.defaultReps || 3;

      console.log(`🏃‍♂️ Starting ${config?.description || exerciseType}:`);
      console.log(`   Duration per rep: ${animationDuration}ms`);
      console.log(`   Total repetitions: ${totalReps}`);

      let currentRep = 0;
      const startTime = Date.now();

      // Helper function to return to initial positions
      const returnToInitialPositions = () => {
        bonesMap.current.forEach((bone, boneName) => {
          const initialRot = initialRotations.current.get(boneName);
          if (initialRot) {
            bone.rotation.set(initialRot.x, initialRot.y, initialRot.z);
          }
        });
      };

      const animateExercise = () => {
        const elapsed = Date.now() - startTime;
        const totalDuration = animationDuration * totalReps;
        const overallProgress = elapsed / totalDuration;

        // Calculate current repetition and progress within that rep
        currentRep = Math.floor(elapsed / animationDuration) + 1;
        const repProgress = (elapsed % animationDuration) / animationDuration;

        if (overallProgress >= 1 || currentRep > totalReps) {
          // Exercise complete - return to initial positions
          returnToInitialPositions();
          console.log(
            `✅ Exercise complete! (${totalReps} reps finished) - Returning to initial model position`
          );
          return;
        }

        // Create smooth wave motion for current repetition
        const waveProgress = Math.sin(repProgress * Math.PI * 2) * 0.5 + 0.5;

        if (exerciseType === "bend") {
          // Arm Flexion - ForeArm bending
          const foreArm = bonesMap.current.get("ForeArm");
          if (foreArm) {
            const flexAngle = waveProgress * -90; // 0 to -90 degrees
            foreArm.rotation.z = (flexAngle * Math.PI) / 180;
          }
        } else if (exerciseType === "wrist") {
          // Wrist Rotation - Multiple axis movement (faster internal oscillation)
          const wrist = bonesMap.current.get("Wrist");
          if (wrist) {
            const flexAngle = Math.sin(repProgress * Math.PI * 6) * 45; // 3 oscillations per rep
            wrist.rotation.z = (flexAngle * Math.PI) / 180;
          }
        } else if (exerciseType === "grip") {
          // Finger Grip - All fingers closing and opening
          const fingerBones = [
            "Index0",
            "Index1",
            "Index2",
            "Middle0",
            "Middle1",
            "Middle2",
            "Ring0",
            "Ring1",
            "Ring2",
            "Pinky0",
            "Pinky1",
            "Pinky2",
            "Thumb0",
            "Thumb1",
            "Thumb2",
          ];

          fingerBones.forEach((boneName, index) => {
            const bone = bonesMap.current.get(boneName);
            if (bone) {
              // Different angles for different finger segments
              let maxAngle = -60; // Base angle
              if (boneName.includes("1")) maxAngle = -80; // Middle segments bend more
              if (boneName.includes("2")) maxAngle = -70; // Tip segments
              if (boneName.includes("Thumb")) maxAngle = -40; // Thumb less flexion

              // Add slight delay between fingers for realistic motion
              const delay = (index % 3) * 0.05;
              const delayedProgress = Math.max(
                0,
                Math.min(1, repProgress - delay)
              );
              const gripAngle =
                Math.sin(delayedProgress * Math.PI * 2) * maxAngle;

              bone.rotation.z = (gripAngle * Math.PI) / 180;
            }
          });
        } else if (exerciseType === "full") {
          // Full Range - Combination of all movements
          const foreArm = bonesMap.current.get("ForeArm");
          const wrist = bonesMap.current.get("Wrist");
          const hand = bonesMap.current.get("Hand");

          // Elbow flexion (slower cycle)
          if (foreArm) {
            const flexAngle = Math.sin(repProgress * Math.PI * 2) * -90;
            foreArm.rotation.z = (flexAngle * Math.PI) / 180;
          }

          // Wrist movement (medium speed)
          if (wrist) {
            const wristFlex = Math.cos(repProgress * Math.PI * 4) * 35;
            const wristRot = Math.sin(repProgress * Math.PI * 3) * 25;
            wrist.rotation.x = (wristFlex * Math.PI) / 180;
            wrist.rotation.y = (wristRot * Math.PI) / 180;
          }

          // Hand rotation
          if (hand) {
            const handRot = Math.sin(repProgress * Math.PI * 2) * 20;
            hand.rotation.y = (handRot * Math.PI) / 180;
          }

          // Sequential finger movement
          const fingerGroups = [
            ["Index0", "Index1", "Index2"],
            ["Middle0", "Middle1", "Middle2"],
            ["Ring0", "Ring1", "Ring2"],
            ["Pinky0", "Pinky1", "Pinky2"],
            ["Thumb0", "Thumb1", "Thumb2"],
          ];

          fingerGroups.forEach((group, groupIndex) => {
            const groupDelay = groupIndex * 0.1;
            const groupProgress = Math.max(
              0,
              Math.min(1, repProgress - groupDelay)
            );

            group.forEach((boneName, segmentIndex) => {
              const bone = bonesMap.current.get(boneName);
              if (bone) {
                const segmentDelay = segmentIndex * 0.03;
                const segmentProgress = Math.max(
                  0,
                  Math.min(1, groupProgress - segmentDelay)
                );

                let maxAngle = -45;
                if (segmentIndex === 1) maxAngle = -70; // Middle segments
                if (segmentIndex === 2) maxAngle = -55; // Tip segments
                if (boneName.includes("Thumb")) maxAngle *= 0.7; // Thumb reduction

                const fingerAngle =
                  Math.sin(segmentProgress * Math.PI * 2) * maxAngle;
                bone.rotation.z = (fingerAngle * Math.PI) / 180;
              }
            });
          });
        }

        requestAnimationFrame(animateExercise);
      };

      animateExercise();
    },

    // DEBUG: Add debug method for specific bone inspection
    debugBone: (boneName: string) => {
      const bone = bonesMap.current.get(boneName);
      if (bone) {
        console.log(`🎯 Debug ${boneName}:`);
        console.log(
          `   Position: x=${bone.position.x.toFixed(
            3
          )}, y=${bone.position.y.toFixed(3)}, z=${bone.position.z.toFixed(3)}`
        );
        console.log(
          `   Current Rotation: x=${bone.rotation.x.toFixed(
            3
          )}, y=${bone.rotation.y.toFixed(3)}, z=${bone.rotation.z.toFixed(3)}`
        );

        const initialRot = initialRotations.current.get(boneName);
        if (initialRot) {
          console.log(
            `   Initial Rotation: x=${initialRot.x.toFixed(
              3
            )}, y=${initialRot.y.toFixed(3)}, z=${initialRot.z.toFixed(3)}`
          );
        }

        console.log(
          `   Quaternion: x=${bone.quaternion.x.toFixed(
            3
          )}, y=${bone.quaternion.y.toFixed(3)}, z=${bone.quaternion.z.toFixed(
            3
          )}, w=${bone.quaternion.w.toFixed(3)}`
        );
      } else {
        console.log(`❌ Bone '${boneName}' not found`);
      }
    },
  }));

  useFrame(({ clock }) => {
    if (!modelRef.current) return;
    // Gentle idle rotation
    modelRef.current.rotation.y =
      Math.sin(clock.getElapsedTime() * 0.25) * 0.12;
  });

  return <primitive object={gltf.scene} />;
});

const Demo3DCanvas = forwardRef<ArmatureControls, Demo3DCanvasProps>(
  (
    {
      modelUrl = "/models/RehabX.glb",
      className = "",
      cameraPosition = [1.6, 1.2, 1.8],
      fov = 45,
      onModelLoad,
    },
    ref
  ) => {
    return (
      <div
        className={`w-full h-full rounded-2xl border overflow-hidden ${className}`}
      >
        <Canvas
          camera={{ position: cameraPosition, fov }}
          shadows
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={<Html center>Loading 3D model...</Html>}>
            <Model ref={ref} url={modelUrl} onLoad={onModelLoad} />
            <OrbitControls enableDamping dampingFactor={0.05} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          </Suspense>
        </Canvas>
      </div>
    );
  }
);

Demo3DCanvas.displayName = "Demo3DCanvas";

export default Demo3DCanvas;
