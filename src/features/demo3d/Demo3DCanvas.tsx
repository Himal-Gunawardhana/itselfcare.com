import React, {
  Suspense,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
  useEffect,
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

// AWS S3 Configuration
const getModelUrl = (filename: string) => {
  const cdnUrl =
    import.meta.env.VITE_MODEL_CDN_URL ||
    "https://itself-3d-models.s3.amazonaws.com";
  return `${cdnUrl}/${filename}`;
};

// Enhanced Loading Component
const LoadingFallback: React.FC<{ error?: string; progress?: number }> = ({
  error,
  progress = 0,
}) => {
  const [loadingText, setLoadingText] = useState("Initializing...");

  useEffect(() => {
    if (progress < 25) setLoadingText("Connecting to AWS...");
    else if (progress < 50) setLoadingText("Downloading model...");
    else if (progress < 75) setLoadingText("Processing geometry...");
    else if (progress < 95) setLoadingText("Loading textures...");
    else setLoadingText("Almost ready...");
  }, [progress]);

  return (
    <Html center>
      <div className="flex flex-col items-center space-y-4 p-6 bg-background/95 backdrop-blur-sm rounded-xl border border-border/50 shadow-lg max-w-sm">
        {error ? (
          <>
            <div className="text-destructive text-3xl">⚠️</div>
            <div className="text-center">
              <p className="text-destructive font-semibold mb-2">
                AWS Loading Error
              </p>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <p className="text-xs text-muted-foreground">
                Check your AWS S3 configuration and CORS settings.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* AWS Cloud Icon + Spinner */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <div className="text-primary text-xl">☁️</div>
            </div>

            {/* Progress Bar */}
            <div className="w-48 bg-muted rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-primary to-primary/80 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Loading Text */}
            <div className="text-center">
              <p className="text-foreground font-semibold">
                Loading from AWS S3
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {loadingText}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(progress)}% Complete
              </p>
            </div>
          </>
        )}
      </div>
    </Html>
  );
};

const Model = forwardRef<
  ArmatureControls,
  { url: string; onLoad?: (armature: THREE.Object3D | null) => void }
>(({ url, onLoad }, ref) => {
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadProgress, setLoadProgress] = useState(0);

  const gltf = useLoader(
    GLTFLoader,
    url,
    (loader) => {
      const decoder = MeshoptDecoder as unknown as MeshoptDecoderModule;
      const loaderWithDecoder = loader as GLTFLoader & {
        setMeshoptDecoder?: (decoder: MeshoptDecoderModule | null) => void;
      };
      loaderWithDecoder.setMeshoptDecoder?.(decoder);
    },
    // Progress callback
    (progress) => {
      const percentComplete = (progress.loaded / progress.total) * 100;
      setLoadProgress(percentComplete);
      console.log(
        `📦 AWS S3 Model loading: ${percentComplete.toFixed(1)}% (${(
          progress.loaded / 1024
        ).toFixed(1)}KB / ${(progress.total / 1024).toFixed(1)}KB)`
      );
    }
  );

  const modelRef = useRef<THREE.Object3D | null>(null);
  const armatureRef = useRef<THREE.Object3D | null>(null);
  const bonesMap = useRef<Map<string, THREE.Bone>>(new Map());

  // Store initial bone rotations when model loads
  const initialRotations = useRef<
    Map<string, { x: number; y: number; z: number }>
  >(new Map());

  // ✅ FIXED: Move useFrame BEFORE any conditional returns
  useFrame(({ clock }) => {
    if (!modelRef.current || loadError) return;
    // Gentle idle rotation
    modelRef.current.rotation.y =
      Math.sin(clock.getElapsedTime() * 0.25) * 0.12;
  });

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
      console.log("✅ 3D Model loaded successfully from AWS S3!");
    }
  }, [gltf, onLoad]);

  useImperativeHandle(ref, () => ({
    rotateBone: (boneName: string, axis: "x" | "y" | "z", angle: number) => {
      const bone = bonesMap.current.get(boneName);
      if (bone) {
        const radians = (angle * Math.PI) / 180;

        // Get initial rotation for this bone
        const initialRot = initialRotations.current.get(boneName);
        const baseRotation = {
          x: initialRot?.x || 0,
          y: initialRot?.y || 0,
          z: initialRot?.z || 0,
        };

        console.log(`🔄 Rotating ${boneName} on ${axis}-axis to ${angle}°`);

        switch (axis) {
          case "x":
            bone.rotation.x = baseRotation.x + radians;
            break;
          case "y":
            bone.rotation.y = baseRotation.y + radians;
            break;
          case "z":
            bone.rotation.z = baseRotation.z + radians;
            break;
        }
      }
    },

    resetPose: () => {
      // Return to stored initial positions
      bonesMap.current.forEach((bone, boneName) => {
        const initialRot = initialRotations.current.get(boneName);
        if (initialRot) {
          bone.rotation.set(initialRot.x, initialRot.y, initialRot.z);
        } else {
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
      const exerciseConfigs = {
        bend: {
          defaultDuration: 3000,
          defaultReps: 5,
          description: "Elbow Flexion",
        },
        wrist: {
          defaultDuration: 2500,
          defaultReps: 8,
          description: "Wrist Rotation",
        },
        grip: {
          defaultDuration: 2000,
          defaultReps: 10,
          description: "Finger Grip",
        },
        full: {
          defaultDuration: 4000,
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

        currentRep = Math.floor(elapsed / animationDuration) + 1;
        const repProgress = (elapsed % animationDuration) / animationDuration;

        if (overallProgress >= 1 || currentRep > totalReps) {
          returnToInitialPositions();
          console.log(
            `✅ Exercise complete! (${totalReps} reps finished) - Returning to initial model position`
          );
          return;
        }

        const waveProgress = Math.sin(repProgress * Math.PI * 2) * 0.5 + 0.5;

        if (exerciseType === "bend") {
          const foreArm = bonesMap.current.get("ForeArm");
          if (foreArm) {
            const initialRot = initialRotations.current.get("ForeArm");
            const baseZ = initialRot?.z || 0;
            const flexAngle = waveProgress * -75; // Conservative range
            foreArm.rotation.z = baseZ + (flexAngle * Math.PI) / 180;
          }
        } else if (exerciseType === "wrist") {
          const wrist = bonesMap.current.get("Wrist");
          if (wrist) {
            const initialRot = initialRotations.current.get("Wrist");
            const baseZ = initialRot?.z || 0;
            const flexAngle = Math.sin(repProgress * Math.PI * 6) * 30;
            wrist.rotation.z = baseZ + (flexAngle * Math.PI) / 180;
          }
        } else if (exerciseType === "grip") {
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
              const initialRot = initialRotations.current.get(boneName);
              const baseZ = initialRot?.z || 0;

              let maxAngle = -40;
              if (boneName.includes("1")) maxAngle = -50;
              if (boneName.includes("2")) maxAngle = -45;
              if (boneName.includes("Thumb")) maxAngle = -25;

              const delay = (index % 3) * 0.05;
              const delayedProgress = Math.max(
                0,
                Math.min(1, repProgress - delay)
              );
              const gripAngle =
                Math.sin(delayedProgress * Math.PI * 2) * maxAngle;

              bone.rotation.z = baseZ + (gripAngle * Math.PI) / 180;
            }
          });
        } else if (exerciseType === "full") {
          const foreArm = bonesMap.current.get("ForeArm");
          const wrist = bonesMap.current.get("Wrist");
          const hand = bonesMap.current.get("Hand");

          if (foreArm) {
            const initialRot = initialRotations.current.get("ForeArm");
            const baseZ = initialRot?.z || 0;
            const flexAngle = Math.sin(repProgress * Math.PI * 2) * -60;
            foreArm.rotation.z = baseZ + (flexAngle * Math.PI) / 180;
          }

          if (wrist) {
            const initialRot = initialRotations.current.get("Wrist");
            const baseX = initialRot?.x || 0;
            const baseY = initialRot?.y || 0;

            const wristFlex = Math.cos(repProgress * Math.PI * 4) * 25;
            const wristRot = Math.sin(repProgress * Math.PI * 3) * 20;

            wrist.rotation.x = baseX + (wristFlex * Math.PI) / 180;
            wrist.rotation.y = baseY + (wristRot * Math.PI) / 180;
          }

          if (hand) {
            const initialRot = initialRotations.current.get("Hand");
            const baseY = initialRot?.y || 0;
            const handRot = Math.sin(repProgress * Math.PI * 2) * 15;
            hand.rotation.y = baseY + (handRot * Math.PI) / 180;
          }

          // Conservative finger movement
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
                const initialRot = initialRotations.current.get(boneName);
                const baseZ = initialRot?.z || 0;

                const segmentDelay = segmentIndex * 0.03;
                const segmentProgress = Math.max(
                  0,
                  Math.min(1, groupProgress - segmentDelay)
                );

                let maxAngle = -30;
                if (segmentIndex === 1) maxAngle = -40;
                if (segmentIndex === 2) maxAngle = -35;
                if (boneName.includes("Thumb")) maxAngle *= 0.7;

                const fingerAngle =
                  Math.sin(segmentProgress * Math.PI * 2) * maxAngle;
                bone.rotation.z = baseZ + (fingerAngle * Math.PI) / 180;
              }
            });
          });
        }

        requestAnimationFrame(animateExercise);
      };

      animateExercise();
    },

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
      } else {
        console.log(`❌ Bone '${boneName}' not found`);
      }
    },
  }));

  // ✅ Show error state AFTER all hooks are called
  if (loadError) {
    return <LoadingFallback error={loadError} />;
  }

  return <primitive object={gltf.scene} />;
});

const Demo3DCanvas = forwardRef<ArmatureControls, Demo3DCanvasProps>(
  (
    {
      // AWS S3 Model URL - Update this with your actual S3 URL
      modelUrl = getModelUrl(
        "https://itself-3d-models.s3.amazonaws.com/RehabX.glb"
      ), // This will use your S3 bucket URL
      className = "",
      cameraPosition = [1.6, 1.2, 1.8],
      fov = 45,
      onModelLoad,
    },
    ref
  ) => {
    const [loadProgress, setLoadProgress] = useState(0);

    useEffect(() => {
      console.log("🌐 Loading 3D model from AWS S3:", modelUrl);
    }, [modelUrl]);

    return (
      <div
        className={`w-full h-full rounded-2xl border overflow-hidden bg-gradient-to-br from-background to-muted/20 ${className}`}
      >
        <Canvas
          camera={{
            position: cameraPosition,
            fov,
            near: 0.1,
            far: 1000,
          }}
          shadows
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
          onCreated={(state) => {
            state.gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          }}
        >
          <Suspense fallback={<LoadingFallback progress={loadProgress} />}>
            <Model ref={ref} url={modelUrl} onLoad={onModelLoad} />
            <OrbitControls
              enableDamping
              dampingFactor={0.05}
              enableZoom={true}
              enablePan={false}
              minDistance={1}
              maxDistance={5}
              rotateSpeed={0.8}
              zoomSpeed={0.8}
            />
            <ambientLight intensity={0.6} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1.2}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <pointLight position={[-5, -5, -5]} intensity={0.3} />
          </Suspense>
        </Canvas>
      </div>
    );
  }
);

Demo3DCanvas.displayName = "Demo3DCanvas";

export default Demo3DCanvas;
