// src/types/meshopt.d.ts
declare module "three/examples/jsm/libs/meshopt_decoder.module.js" {
  /**
   * Minimal but strictly typed interface for the runtime Meshopt decoder expected by GLTFLoader.
   */
  export interface MeshoptDecoderType {
    supported: boolean;
    ready: Promise<void>;
    useWorkers: boolean; // <-- required by some three typings

    decodeVertexBuffer(
      target: Uint8Array,
      count: number,
      size: number,
      source: Uint8Array,
      filter?: string
    ): void;

    decodeIndexBuffer(
      target: Uint8Array,
      count: number,
      size: number,
      source: Uint8Array
    ): void;

    decodeIndexSequence(target: Uint8Array, count: number, size: number): void;

    decodeGltfBuffer(
      count: number,
      size: number,
      source: Uint8Array,
      mode: string,
      filter?: string
    ): void;

    decodeGltfBufferAsync(
      count: number,
      size: number,
      source: Uint8Array,
      mode: string,
      filter?: string
    ): Promise<ArrayBuffer>;
  }

  export const MeshoptDecoder: MeshoptDecoderType;
}
