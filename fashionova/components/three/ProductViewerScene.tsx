'use client'

import { Canvas } from '@react-three/fiber'
import { ContactShadows, Environment, OrbitControls, Stage, useGLTF } from '@react-three/drei'
import { Suspense } from 'react'

function Model({ src }: { src: string }) {
  const { scene } = useGLTF(src)
  return <primitive object={scene} />
}

export default function ProductViewerScene({ src }: { src: string }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      // Render on demand: the loop runs when the visitor drags, and stops when
      // they let go. A garment that never moves should not cost a frame.
      frameloop="demand"
      camera={{ position: [0, 0, 4], fov: 40 }}
      gl={{ antialias: true, powerPreference: 'low-power' }}
    >
      <Suspense fallback={null}>
        <Stage intensity={0.4} environment={null} adjustCamera={1.1}>
          <Model src={src} />
        </Stage>
        <Environment preset="studio" />
        <ContactShadows position={[0, -1, 0]} opacity={0.35} blur={2.4} far={4} />
      </Suspense>
      <OrbitControls
        makeDefault
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.8}
      />
    </Canvas>
  )
}
