'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * The hero fabric.
 *
 * A subdivided plane pushed around by layered simplex-ish noise, shaded with
 * the brand palette rather than a texture — so it reads as cloth catching
 * light, not as a photograph. Pointer position bends it; scroll damps the
 * amplitude so it settles as you read on.
 */
const vertex = /* glsl */ `
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uAmplitude;
  varying vec2 vUv;
  varying float vElevation;

  // Classic 2D simplex noise (Ashima Arts, MIT).
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vUv = uv;
    vec3 pos = position;

    float drift = uTime * 0.16;
    float wave =
        snoise(vec2(pos.x * 0.55 + drift, pos.y * 0.75)) * 0.5
      + snoise(vec2(pos.x * 1.4 - drift * 0.7, pos.y * 1.9)) * 0.22
      + snoise(vec2(pos.x * 3.1, pos.y * 3.4 + drift * 1.3)) * 0.08;

    // The pointer acts like a hand lifting the cloth.
    float grab = 1.0 - smoothstep(0.0, 2.2, distance(pos.xy, uPointer * 2.4));
    wave += grab * 0.42;

    pos.z += wave * uAmplitude;
    vElevation = wave;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const fragment = /* glsl */ `
  uniform vec3 uColorDeep;
  uniform vec3 uColorMid;
  uniform vec3 uColorLift;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    float e = smoothstep(-0.6, 0.9, vElevation);
    vec3 col = mix(uColorDeep, uColorMid, e);

    // Champagne only on the crests, and only just — this is the difference
    // between "premium" and "gradient".
    col = mix(col, uColorLift, smoothstep(0.62, 1.0, e) * 0.55);

    // Vignette so the plane dissolves into the page rather than ending.
    float vig = smoothstep(1.05, 0.25, distance(vUv, vec2(0.5)));
    gl_FragColor = vec4(col, vig);
  }
`

function Fabric() {
  const mesh = useRef<THREE.Mesh>(null)
  const { viewport } = useThree()
  const pointer = useRef(new THREE.Vector2(0, 0))

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uAmplitude: { value: 0.55 },
      uColorDeep: { value: new THREE.Color('#0b0b0c') },
      uColorMid: { value: new THREE.Color('#12352e') },
      uColorLift: { value: new THREE.Color('#c6a664') },
    }),
    []
  )

  useFrame((state, delta) => {
    uniforms.uTime.value += delta
    pointer.current.lerp(state.pointer, 0.045)
    uniforms.uPointer.value.copy(pointer.current)

    // Scroll damping: the cloth calms down once the hero is behind you.
    const scrolled = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1)
    uniforms.uAmplitude.value = 0.55 * (1 - scrolled * 0.8)

    if (mesh.current) mesh.current.rotation.z = Math.sin(uniforms.uTime.value * 0.06) * 0.03
  })

  return (
    <mesh ref={mesh} scale={[viewport.width / 3.2, viewport.height / 3.2, 1]}>
      <planeGeometry args={[4, 4, 128, 128]} />
      <shaderMaterial
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  )
}

export default function FabricScene() {
  return (
    <Canvas
      // Capped so a high-DPI phone does not render four times the pixels it
      // needs for what is, in the end, a background texture.
      dpr={[1, 1.75]}
      gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      camera={{ position: [0, 0, 3], fov: 45 }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Fabric />
    </Canvas>
  )
}
