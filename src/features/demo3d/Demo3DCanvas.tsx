import React, { Suspense, useRef } from "react";
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
  /** Default: '/models/RehabX.glb' (place under public/) */
  modelUrl?: string;
  className?: string;
  cameraPosition?: [number, number, number];
  fov?: number;
};

const Model: React.FC<{ url: string }> = ({ url }) => {
  const gltf = useLoader(GLTFLoader, url, (loader) => {
    // meshoptimizer's module doesn't match the exact TS shape expected by three's types,
    // assert a narrower, typed shape without using `any`.
    const decoder = MeshoptDecoder as unknown as MeshoptDecoderModule;
    // some versions of the loader typings don't include setMeshoptDecoder in the declared type;
    // cast to a narrower loader type that optionally exposes the method without using `any`.
    const loaderWithDecoder = loader as GLTFLoader & {
      setMeshoptDecoder?: (decoder: MeshoptDecoderModule | null) => void;
    };
    loaderWithDecoder.setMeshoptDecoder?.(decoder);
  });

  const ref = useRef<THREE.Object3D | null>(null);

  // Tiny idle motion so you can see it rendering
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.25) * 0.12;
  });

  // Optional: tidy render flags
  gltf.scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((mesh as any).isMesh) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
  });

  return <primitive ref={ref} object={gltf.scene} />;
};

const Demo3DCanvas: React.FC<Demo3DCanvasProps> = ({
  modelUrl = "/models/RehabX.glb",
  className = "",
  cameraPosition = [1.6, 1.2, 1.8],
  fov = 45,
}) => {
  return (
    <div
      className={`w-full h-[70vh] rounded-2xl border overflow-hidden ${className}`}
    >
      <Canvas
        camera={{ position: cameraPosition, fov, near: 0.1, far: 100 }}
        shadows
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 5, 2]} intensity={1} castShadow />
        <Suspense fallback={<Html center>Loading 3D…</Html>}>
          <Model url={modelUrl} />
        </Suspense>
        <OrbitControls enablePan enableZoom enableRotate />
      </Canvas>
    </div>
  );
};

export default Demo3DCanvas;
