"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing"
import { useMemo } from "react"

/* =========================
   CITY GRID
   ========================= */
function CityGrid() {
  const buildings = useMemo(
    () =>
      Array.from({ length: 150 }).map(() => ({
        x: (Math.random() - 0.5) * 60,
        z: (Math.random() - 0.5) * 50,
        height: Math.random() * 5 + 2,
      })),
    []
  )

  return (
    <>
      {buildings.map((b, i) => (
        <mesh key={i} position={[b.x, b.height / 1.2, b.z]}>
          <boxGeometry args={[1.9, b.height, 1.1]} />
          <meshStandardMaterial
            color="#0b0f1a"
            emissive={i % 2 === 0 ? "#0a3057c4" : "#a5cbb9"}
            emissiveIntensity={0.3}
            metalness={0.4}
            roughness={0.5}
          />
        </mesh>
      ))}
    </>
  )
}

export default function Hero3D() {
  return (
    <Canvas
      camera={{ position: [0, 12, 25], fov: 45 }}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
      }}
    >
      {/* BACKGROUND */}
      <color attach="background" args={["#3cbe99"]} />
      <fog attach="fog" args={["#3d080c", 20, 80]} />

      {/* LIGHTING */}
      <ambientLight intensity={0.3} />

      <directionalLight
        position={[10, 15, 10]}
        intensity={1}
        color="#ecebd7"
      />

      <pointLight
        position={[-10, 10, -10]}
        intensity={1.2}
        color="#2d5342fe"
      />

      {/* FLOOR (so you see scale) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#062b12ec" />
      </mesh>

      {/* CITY */}
      <CityGrid />

      {/* CAMERA */}
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.2}
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 3}
      />

      {/* POST FX */}
      <EffectComposer>
        <Bloom intensity={1.3} luminanceThreshold={0.2} />
        <Vignette darkness={0.7} />
      </EffectComposer>
    </Canvas>
  )
}
