'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { gsap, ScrollTrigger } from '@/lib/gsap'

/**
 * The lookbook transition.
 *
 * Two images are on the GPU at once and a noise field decides, per pixel,
 * which one you are looking at — so one photograph dissolves into the next
 * along the grain of the cloth rather than cross-fading flatly. Progress is
 * scrubbed by scroll, so the visitor controls the dissolve.
 */
const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragment = /* glsl */ `
  uniform sampler2D uFrom;
  uniform sampler2D uTo;
  uniform sampler2D uNoise;
  uniform float uProgress;
  uniform vec2 uFromScale;
  uniform vec2 uToScale;
  varying vec2 vUv;

  // Cover-fit: keeps the photograph's aspect ratio whatever the viewport does.
  vec2 cover(vec2 uv, vec2 scale) {
    return (uv - 0.5) * scale + 0.5;
  }

  void main() {
    float n = texture2D(uNoise, vUv).r;

    // A travelling threshold — the dissolve sweeps rather than appearing
    // everywhere at once.
    float p = uProgress * 1.35 - 0.175;
    float edge = smoothstep(p - 0.28, p + 0.28, n * 0.7 + vUv.y * 0.3);

    // Each side pulls slightly towards the noise while it hands over, which
    // reads as cloth being drawn away.
    vec2 disp = vec2(n - 0.5) * 0.09;
    vec4 from = texture2D(uFrom, cover(vUv + disp * uProgress, uFromScale));
    vec4 to = texture2D(uTo, cover(vUv - disp * (1.0 - uProgress), uToScale));

    gl_FragColor = mix(to, from, edge);
  }
`

/** Value noise baked once into a texture — cheaper than computing it per frame. */
function useNoiseTexture(size = 256) {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d')!
    const image = ctx.createImageData(size, size)

    // Layered smoothed noise: a few octaves of random grid, bilinearly read.
    const grid = 16
    const cells = Array.from({ length: (grid + 1) * (grid + 1) }, () => Math.random())
    const at = (x: number, y: number) => cells[y * (grid + 1) + x]

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const gx = (x / size) * grid
        const gy = (y / size) * grid
        const x0 = Math.floor(gx)
        const y0 = Math.floor(gy)
        const fx = gx - x0
        const fy = gy - y0
        const sx = fx * fx * (3 - 2 * fx)
        const sy = fy * fy * (3 - 2 * fy)
        const top = at(x0, y0) * (1 - sx) + at(x0 + 1, y0) * sx
        const bottom = at(x0, y0 + 1) * (1 - sx) + at(x0 + 1, y0 + 1) * sx
        const v = (top * (1 - sy) + bottom * sy) * 255
        const i = (y * size + x) * 4
        image.data[i] = image.data[i + 1] = image.data[i + 2] = v
        image.data[i + 3] = 255
      }
    }

    ctx.putImageData(image, 0, 0)
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    return texture
  }, [size])
}

/**
 * Loads an image into a texture through a canvas.
 *
 * Going via canvas rather than TextureLoader means the placeholder SVGs work
 * as textures too — TextureLoader cannot rasterise them, and a lookbook that
 * only works once real photography exists is a lookbook nobody can review.
 */
function loadTexture(url: string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth || 1200
      canvas.height = img.naturalHeight || 1600
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      const texture = new THREE.CanvasTexture(canvas)
      texture.colorSpace = THREE.SRGBColorSpace
      texture.userData.aspect = canvas.width / canvas.height
      resolve(texture)
    }
    img.onerror = reject
    img.src = url
  })
}

function Slides({ textures, progress }: { textures: THREE.Texture[]; progress: { value: number } }) {
  const { viewport } = useThree()
  const noise = useNoiseTexture()
  const material = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({
      uFrom: { value: textures[0] },
      uTo: { value: textures[1] ?? textures[0] },
      uNoise: { value: noise },
      uProgress: { value: 0 },
      uFromScale: { value: new THREE.Vector2(1, 1) },
      uToScale: { value: new THREE.Vector2(1, 1) },
    }),
    [textures, noise]
  )

  const fit = (texture: THREE.Texture, target: THREE.Vector2) => {
    const viewAspect = viewport.width / viewport.height
    const imageAspect = (texture.userData.aspect as number) ?? 1
    if (viewAspect > imageAspect) target.set(1, viewAspect / imageAspect)
    else target.set(imageAspect / viewAspect, 1)
  }

  useFrame(() => {
    if (!material.current) return
    const total = textures.length - 1
    const scaled = gsap.utils.clamp(0, total, progress.value * total)
    const index = Math.min(Math.floor(scaled), Math.max(total - 1, 0))

    uniforms.uFrom.value = textures[index]
    uniforms.uTo.value = textures[Math.min(index + 1, textures.length - 1)]
    uniforms.uProgress.value = 1 - (scaled - index)

    fit(uniforms.uFrom.value, uniforms.uFromScale.value)
    fit(uniforms.uTo.value, uniforms.uToScale.value)
  })

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
      />
    </mesh>
  )
}

export default function LookbookScene({
  images,
  triggerId,
}: {
  images: string[]
  triggerId: string
}) {
  const [textures, setTextures] = useState<THREE.Texture[] | null>(null)
  const progress = useRef({ value: 0 })

  useEffect(() => {
    let cancelled = false
    Promise.all(images.map(loadTexture))
      .then((loaded) => {
        if (!cancelled) setTextures(loaded)
      })
      .catch(() => setTextures(null))
    return () => {
      cancelled = true
    }
  }, [images])

  useEffect(() => {
    const el = document.getElementById(triggerId)
    if (!el) return

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      onUpdate: (self) => {
        progress.current.value = self.progress
      },
    })

    return () => st.kill()
  }, [triggerId])

  if (!textures) return null

  return (
    <Canvas dpr={[1, 1.75]} gl={{ antialias: false, powerPreference: 'low-power' }} orthographic
      camera={{ position: [0, 0, 1], zoom: 1 }}>
      <Slides textures={textures} progress={progress.current} />
    </Canvas>
  )
}
