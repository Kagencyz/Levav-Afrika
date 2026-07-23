"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

interface ShaderAnimationProps {
  isVisible?: boolean;
}

export function ShaderAnimation({ isVisible = true }: ShaderAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    camera: THREE.Camera
    scene: THREE.Scene
    renderer: THREE.WebGLRenderer
    uniforms: any
    animationId: number
  } | null>(null)
  const isVisibleRef = useRef(true)
  const isPausedRef = useRef(false)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    // Vertex shader
    const vertexShader = `
      void main() {
        gl_Position = vec4( position, 1.0 );
      }
    `

    // Fragment shader
    const fragmentShader = `
      #define TWO_PI 6.2831853072
      #define PI 3.14159265359

      precision highp float;
      uniform vec2 resolution;
      uniform float time;

      void main(void) {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        float t = time*0.05;
        float lineWidth = 0.002;

        vec3 color = vec3(0.0);
        for(int j = 0; j < 3; j++){
          for(int i=0; i < 5; i++){
            color[j] += lineWidth*float(i*i) / abs(fract(t - 0.01*float(j)+float(i)*0.01)*5.0 - length(uv) + mod(uv.x+uv.y, 0.2));
          }
        }
        
        gl_FragColor = vec4(color[0],color[1],color[2],1.0);
      }
    `

    // Initialize Three.js scene
    const camera = new THREE.Camera()
    camera.position.z = 1

    const scene = new THREE.Scene()
    const geometry = new THREE.PlaneGeometry(2, 2)

    const uniforms = {
      time: { type: "f", value: 1.0 },
      resolution: { type: "v2", value: new THREE.Vector2() },
    }

    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const renderer = new THREE.WebGLRenderer({ antialias: false })
    // Cap pixel ratio to 2 for performance (prevents 3x DPR on mobile)
    const pixelRatio = Math.min(window.devicePixelRatio, 2)
    renderer.setPixelRatio(pixelRatio)

    container.appendChild(renderer.domElement)

    // Handle window resize
    const onWindowResize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      renderer.setSize(width, height)
      uniforms.resolution.value.x = renderer.domElement.width
      uniforms.resolution.value.y = renderer.domElement.height
    }

    // Initial resize
    onWindowResize()
    window.addEventListener("resize", onWindowResize, false)

    // IntersectionObserver: pause when off-screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting
      },
      { threshold: 0 }
    )
    observer.observe(container)

    // Page Visibility API: pause when tab is hidden
    const onVisibilityChange = () => {
      isPausedRef.current = document.hidden
    }
    document.addEventListener("visibilitychange", onVisibilityChange)

    // Animation loop with frame skipping for performance
    let frameCount = 0
    const animate = () => {
      const animationId = requestAnimationFrame(animate)

      if (sceneRef.current) {
        sceneRef.current.animationId = animationId
      }

      // Skip frames when not visible or paused
      if (!isVisibleRef.current || isPausedRef.current || !isVisible) {
        return
      }

      // For reduced motion: render a single static frame and stop updates
      if (prefersReducedMotion) {
        renderer.render(scene, camera)
        // Cancel further animation after one frame
        if (sceneRef.current) {
          cancelAnimationFrame(sceneRef.current.animationId)
        }
        return
      }

      // Frame skipping: render every 2nd frame on low-power devices
      frameCount++
      const isMobile = window.innerWidth < 768
      if (isMobile && frameCount % 2 !== 0) {
        return
      }

      uniforms.time.value += 0.05
      renderer.render(scene, camera)
    }

    // Store scene references for cleanup
    sceneRef.current = {
      camera,
      scene,
      renderer,
      uniforms,
      animationId: 0,
    }

    // Start animation
    animate()

    // Cleanup function
    return () => {
      window.removeEventListener("resize", onWindowResize)
      document.removeEventListener("visibilitychange", onVisibilityChange)
      observer.disconnect()

      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId)

        if (container && sceneRef.current.renderer.domElement) {
          try {
            container.removeChild(sceneRef.current.renderer.domElement)
          } catch {
            // Element may already be removed
          }
        }

        sceneRef.current.renderer.dispose()
        geometry.dispose()
        material.dispose()
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full h-screen"
      style={{
        background: "#000",
        overflow: "hidden",
      }}
    />
  )
}
