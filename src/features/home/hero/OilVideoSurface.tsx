"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import type { RefObject } from "react";
import * as THREE from "three";

export type OilRipple = {
  x: number;
  y: number;
  time: number;
  strength: number;
};

const MAX_RIPPLES = 12;

const VERTEX_SHADER = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  varying vec2 vUv;

  uniform sampler2D uVideo;
  uniform float uTime;
  uniform float uAspect;
  uniform float uVideoAspect;
  uniform vec4 uRipples[12];

  vec2 coverUv(vec2 uv) {
    // Match CSS object-fit: cover without stretching or letterboxing the video.
    if (uAspect > uVideoAspect) {
      uv.y = (uv.y - 0.5) * (uVideoAspect / uAspect) + 0.5;
    } else {
      uv.x = (uv.x - 0.5) * (uAspect / uVideoAspect) + 0.5;
    }
    return uv;
  }

  void main() {
    vec2 point = (vUv - 0.5) * vec2(uAspect, 1.0);

    vec2 offsetFromWaves = vec2(0.0);
    float rippleLight = 0.0;
    float rippleDark = 0.0;

    for (int i = 0; i < 12; i++) {
      vec4 impulse = uRipples[i];
      float age = uTime - impulse.z;
      if (age < 0.0 || age > 2.4 || impulse.w <= 0.0) continue;

      vec2 origin = (impulse.xy - 0.5) * vec2(uAspect, 1.0);
      vec2 delta = point - origin;
      float distanceToOrigin = length(delta);
      vec2 direction = delta / max(distanceToOrigin, 0.0001);

      float positionInRing = distanceToOrigin - age * 0.32;
      float ringWidth = 0.155;
      float envelope = exp(-pow(positionInRing / ringWidth, 2.0))
                     * exp(-age * 1.06) * impulse.w;

      float phase = positionInRing * 67.0;
      float crest = cos(phase);

      // The distortion displaces pixels of the actual moving oil video.
      // Same rings also modulate the reflected highlights.
      offsetFromWaves += direction * sin(phase) * envelope * 0.014;
      rippleLight += envelope * max(crest, 0.0);
      rippleDark += envelope * max(-crest, 0.0);
    }

    vec2 warpedUv = vUv + vec2(
      offsetFromWaves.x / max(uAspect, 0.001),
      offsetFromWaves.y
    );
    vec3 color = texture2D(uVideo, clamp(coverUv(warpedUv), 0.001, 0.999)).rgb;

    // Subtle warm ring crests and shadowed troughs, not neon outlines.
    color *= 1.0 - min(rippleDark, 1.6) * 0.16;
    color += vec3(0.25, 0.14, 0.045) * min(rippleLight, 1.5) * 0.19;

    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
  }
`;

function VideoRipplePlane({
  video,
  ripplesRef,
  reducedMotion,
}: {
  video: HTMLVideoElement;
  ripplesRef: RefObject<OilRipple[]>;
  reducedMotion: boolean;
}) {
  const texture = useMemo(() => {
    const result = new THREE.VideoTexture(video);
    result.colorSpace = THREE.SRGBColorSpace;
    result.minFilter = THREE.LinearFilter;
    result.magFilter = THREE.LinearFilter;
    result.generateMipmaps = false;
    return result;
  }, [video]);

  const uniforms = useMemo(
    () => ({
      uVideo: { value: texture },
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uVideoAspect: { value: 16 / 9 },
      uRipples: {
        value: Array.from(
          { length: MAX_RIPPLES },
          () => new THREE.Vector4(0, 0, -100, 0),
        ),
      },
    }),
    [texture],
  );

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms,
        depthTest: false,
        depthWrite: false,
      }),
    [uniforms],
  );

  useEffect(
    () => () => {
      material.dispose();
      texture.dispose();
    },
    [material, texture],
  );

  useFrame(({ size }) => {
    uniforms.uAspect.value = size.width / Math.max(size.height, 1);
    uniforms.uVideoAspect.value =
      video.videoWidth / Math.max(video.videoHeight, 1);
    uniforms.uTime.value = performance.now() * 0.001;

    const ripples = reducedMotion ? [] : ripplesRef.current.slice(-MAX_RIPPLES);
    uniforms.uRipples.value.forEach((target, index) => {
      const impulse = ripples[index];
      if (impulse) {
        target.set(impulse.x, impulse.y, impulse.time, impulse.strength);
      } else {
        target.set(0, 0, -100, 0);
      }
    });
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <primitive attach="material" object={material} />
    </mesh>
  );
}

export default function OilVideoSurface({
  video,
  ripplesRef,
  reducedMotion,
}: {
  video: HTMLVideoElement;
  ripplesRef: RefObject<OilRipple[]>;
  reducedMotion: boolean;
}) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 1], zoom: 1 }}
      dpr={[1, 1.25]}
      gl={{
        alpha: false,
        antialias: false,
        powerPreference: "high-performance",
      }}
    >
      <VideoRipplePlane
        video={video}
        ripplesRef={ripplesRef}
        reducedMotion={reducedMotion}
      />
    </Canvas>
  );
}
