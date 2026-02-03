"use client";

import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";

function Coin({
  texture,
  position,
  scale = 0.6,
}: {
  texture: string;
  position: [number, number, number];
  scale?: number;
}) {
  const map = useTexture(texture);

  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
      <mesh position={position} scale={scale}>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial
          map={map}
          transparent
          emissive={new THREE.Color("#08b52e")}
          emissiveIntensity={1.2}
        />
      </mesh>
    </Float>
  );
}

export default function CryptoScene() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={2} />
        <pointLight position={[-5, -5, -5]} intensity={1.5} color="#a855f7" />

        {/* TOP LEFT */}
        <Coin texture="/sol.png" position={[-6, 3.5, -5]} />

        {/* TOP RIGHT */}
        <Coin texture="/eth.png" position={[6, 3, -6]} />

        {/* CENTER FAR BACK */}
        <Coin texture="/sol.png" position={[0, 0, -8]} scale={0.5} />

        {/* BOTTOM RIGHT */}
        <Coin texture="/eth.png" position={[5, -3.5, -6]} scale={0.5} />

        {/* BOTTOM LEFT */}
        <Coin texture="/sol.png" position={[-5, -8, -6]} scale={0.5} />

        <Coin texture="/sol.png" position={[-6, 6, -5]} />

        {/* TOP RIGHT */}
        <Coin texture="/eth.png" position={[6, 2, -6]} />

        {/* CENTER FAR BACK */}
        <Coin texture="/sol.png" position={[2, 1, -8]} scale={0.5} />


        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.15}
        />
      </Canvas>
    </div>
  );
}
