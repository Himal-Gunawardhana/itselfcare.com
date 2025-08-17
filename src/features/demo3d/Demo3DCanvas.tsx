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
  performExercise: (exerciseType: string) => void;
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
        }
      });
    }
  }, [gltf, onLoad]);

  useImperativeHandle(ref, () => ({
    rotateBone: (boneName: string, axis: "x" | "y" | "z", angle: number) => {
      const bone = bonesMap.current.get(boneName);
      if (bone) {
        const radians = (angle * Math.PI) / 180;
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
      }
    },

    resetPose: () => {
      bonesMap.current.forEach((bone) => {
        bone.rotation.set(0, 0, 0);
      });
    },

    performExercise: (exerciseType: string) => {
      // Simple exercise animation
      const upperArm = bonesMap.current.get("UpperArm");
      const foreArm = bonesMap.current.get("ForeArm");

      if (exerciseType === "bend" && upperArm && foreArm) {
        // Animate arm bending
        let progress = 0;
        const animate = () => {
          progress += 0.02;
          const angle = Math.sin(progress) * 45;
          upperArm.rotation.z = (angle * Math.PI) / 180;
          foreArm.rotation.z = (Math.abs(angle) * Math.PI) / 180;

          if (progress < Math.PI * 4) {
            requestAnimationFrame(animate);
          }
        };
        animate();
      }
    },
  }));

  useFrame(({ clock }) => {
    if (!modelRef.current) return;
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
