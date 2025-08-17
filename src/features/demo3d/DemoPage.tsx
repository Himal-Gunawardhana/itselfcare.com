import Demo3DCanvas from "./Demo3DCanvas";
import { Link } from "react-router-dom";

export default function DemoPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Interactive Product Demo</h1>
        <Link to="/" className="px-4 py-2 rounded-xl border">
          Back to Home
        </Link>
      </header>

      <p className="text-gray-600 mb-6">
        This renders <code>RehabX.glb</code> and is portable across projects.
        Just copy the folder
        <code> src/features/demo3d/</code> and place your GLB at{" "}
        <code>public/models/RehabX.glb</code>.
      </p>

      <Demo3DCanvas modelUrl="/models/RehabX.glb" />
    </main>
  );
}
