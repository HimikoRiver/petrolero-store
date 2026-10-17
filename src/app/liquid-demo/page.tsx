"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import * as THREE from "three";
import "./liquid-demo.css";

const MAX_RIPPLES = 12;

type Ripple = {
  x: number;
  y: number;
  time: number;
  strength: number;
};

const VERTEX_SHADER = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  uniform float uTime;
  uniform float uAspect;
  uniform vec4 uRipples[12];
  varying vec2 vUv;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise2(vec2 p) {
    vec2 cell = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash21(cell), hash21(cell + vec2(1.0, 0.0)), f.x),
      mix(hash21(cell + vec2(0.0, 1.0)), hash21(cell + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float oilHeight(vec2 p, float t) {
    // The oil is a smooth height field. Colour comes from reflections below.
    vec2 drift = vec2(t * 0.028, -t * 0.012);
    float warpA = noise2(p * 1.65 + drift);
    float warpB = noise2(p * 1.95 - drift * 0.55 + vec2(5.7, 11.2));
    vec2 flow = p + vec2(warpA - 0.5, warpB - 0.5) * 0.29;
    float major = noise2(flow * 2.4 + vec2(t * 0.017, -t * 0.021));
    float minor = noise2(flow * 5.1 - vec2(t * 0.035, t * 0.011));
    float ribbons = sin(flow.x * 7.8 + flow.y * 3.6 + major * 4.2);
    float waves = sin(flow.y * 5.8 - flow.x * 3.3 + warpB * 2.8);
    return major * 0.14 + minor * 0.024 + ribbons * 0.038 + waves * 0.022;
  }

  float softRect(vec2 uv, vec2 center, vec2 extent, float softness) {
    vec2 delta = max(abs(uv - center) - extent, vec2(0.0));
    return exp(-dot(delta, delta) / (softness * softness));
  }

  void main() {
    // Aspect correction prevents pointer ripples from becoming ovals.
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
    float time = uTime;
    vec2 rippleSlope = vec2(0.0);
    float rippleLight = 0.0;
    float rippleDark = 0.0;

    // Each pointer impulse produces concentric, outward-travelling waves.
    // Only the oil surface normal changes: no artificial image stretching.
    for (int i = 0; i < 12; i++) {
      vec4 hit = uRipples[i];
      float age = time - hit.z;
      if (age < 0.0 || age > 2.4 || hit.w <= 0.0) continue;

      vec2 origin = (hit.xy - 0.5) * vec2(uAspect, 1.0);
      vec2 offset = p - origin;
      float radius = length(offset);
      vec2 direction = offset / max(radius, 0.0001);

      float front = age * 0.32;
      float fromFront = radius - front;
      float width = 0.155;
      float envelope = exp(-pow(fromFront / width, 2.0))
                     * exp(-age * 1.06)
                     * hit.w;

      // Multiple crests inside the advancing wave packet.
      float phase = fromFront * 67.0;
      float crest = sin(phase);
      float radialDerivative = 67.0 * cos(phase)
                            - (2.0 * fromFront / (width * width)) * crest;

      // Analytic height gradient creates realistic circular normal changes.
      rippleSlope += direction * envelope * radialDerivative * 0.0032;

      // A subtle paired highlight/shadow keeps complete rings readable even
      // on near-black parts of the surface without neon outlines.
      rippleLight += envelope * max(cos(phase), 0.0);
      rippleDark += envelope * max(-cos(phase), 0.0);
    }

    vec2 position = p;
    float height = oilHeight(position, time);
    float eps = 0.006;
    vec2 slope = vec2(
      oilHeight(position + vec2(eps, 0.0), time) - height,
      oilHeight(position + vec2(0.0, eps), time) - height
    ) / eps;
    vec3 normal = normalize(vec3(-(slope * 1.30 + rippleSlope), 1.0));

    // Black polished oil reflecting long, restrained studio light sources.
    // No emissive contour stripes or diffuse orange cloud texture.
    vec3 reflected = reflect(vec3(0.0, 0.0, -1.0), normal);
    vec2 env = reflected.xy * 1.05 + vec2(-0.06, 0.12);
    vec2 rotated = vec2(
      env.x * 0.86 + env.y * 0.51,
      -env.x * 0.51 + env.y * 0.86
    );

    float amberKey = softRect(rotated, vec2(-0.16, 0.25), vec2(0.03, 0.24), 0.09);
    float warmStrip = softRect(rotated, vec2(0.48, -0.19), vec2(0.01, 0.42), 0.035);
    float ivoryEdge = softRect(rotated, vec2(-0.59, 0.13), vec2(0.006, 0.45), 0.025);
    float coolReflection = softRect(rotated, vec2(0.07, -0.43), vec2(0.28, 0.02), 0.09);

    float depth = noise2(position * 1.75 + vec2(time * 0.008, -time * 0.009));
    vec3 base = mix(
      vec3(0.002, 0.003, 0.004),
      vec3(0.032, 0.017, 0.009),
      depth * 0.72
    );
    vec3 color = base;
    color += vec3(0.78, 0.35, 0.095) * amberKey * 0.75;
    color += vec3(1.00, 0.66, 0.28) * warmStrip * 0.85;
    color += vec3(1.00, 0.88, 0.63) * ivoryEdge * 0.75;
    color += vec3(0.24, 0.28, 0.31) * coolReflection * 0.27;

    float glint = pow(
      max(dot(normal, normalize(vec3(0.27, 0.48, 1.0))), 0.0),
      86.0
    );
    color += vec3(0.48, 0.29, 0.10) * glint * 0.07;

    // Ring crests catch soft warm reflections; troughs are slightly darker.
    // This stays tied to the same physically expanding waves as the normals.
    float reflectedLight = clamp(
      amberKey * 0.40 + warmStrip * 0.55 + ivoryEdge * 0.20,
      0.0, 1.0
    );
    color *= 1.0 - min(rippleDark, 1.4) * 0.19;
    color += vec3(0.52, 0.37, 0.23)
           * min(rippleLight, 1.6)
           * (0.11 + reflectedLight * 0.20);

    float vignette = 1.0 - 0.45 * smoothstep(
      0.33, 0.91,
      length((vUv - 0.5) * vec2(0.95, 1.0))
    );
    color *= vignette;

    color = 1.0 - exp(-color * 1.16);
    gl_FragColor = vec4(pow(color, vec3(0.93)), 1.0);
  }
`;

function OilSurface({
  ripplesRef,
  motionReduced,
}: {
  ripplesRef: React.RefObject<Ripple[]>;
  motionReduced: boolean;
}) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uRipples: {
        value: Array.from(
          { length: MAX_RIPPLES },
          () => new THREE.Vector4(0, 0, -100, 0),
        ),
      },
    }),
    [],
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

  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ size }) => {
    uniforms.uAspect.value = size.width / Math.max(size.height, 1);
    uniforms.uTime.value = motionReduced ? 0 : performance.now() * 0.001;

    const recent = motionReduced ? [] : ripplesRef.current.slice(-MAX_RIPPLES);
    uniforms.uRipples.value.forEach((target, index) => {
      const entry = recent[index];
      if (entry) {
        target.set(entry.x, entry.y, entry.time, entry.strength);
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

function BrandMark() {
  return (
    <svg className="liquid-demo-mark" viewBox="0 0 70 88" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="liquid-gold" x1="7" y1="6" x2="62" y2="81" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF1C6" />
          <stop offset="0.45" stopColor="#DBA85D" />
          <stop offset="1" stopColor="#8C5522" />
        </linearGradient>
      </defs>
      <path d="M35 2C29 16 7 38 7 56a28 28 0 0 0 56 0C63 38 41 16 35 2Z" fill="url(#liquid-gold)" />
      <path d="M36 29C30 40 22 48 22 57c0 8 6 14 14 14 7 0 12-4 14-10-15 3-24-9-14-32Z" fill="#0D0906" />
    </svg>
  );
}

export default function LiquidDemoPage() {
  const surfaceRef = useRef<HTMLElement>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const lastPointerRef = useRef({ x: -1, y: -1, time: -1 });
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [hasWebGL, setHasWebGL] = useState(false);
  const [motionReduced, setMotionReduced] = useState(false);
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    setHasWebGL(Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl")));
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotionReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    ripplesRef.current = [];
    lastPointerRef.current = { x: -1, y: -1, time: -1 };
    if (motionReduced) {
      setPhase(3);
      return;
    }
    setPhase(0);
    timersRef.current = [
      setTimeout(() => setPhase(1), 700),
      setTimeout(() => setPhase(2), 2650),
      setTimeout(() => setPhase(3), 3650),
    ];
    return () => timersRef.current.forEach(clearTimeout);
  }, [run, motionReduced]);

  const emitRipple = (event: ReactPointerEvent<HTMLElement>, force = false) => {
    if (motionReduced || !surfaceRef.current) return;
    const now = performance.now() * 0.001;
    const rect = surfaceRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, 1 - (event.clientY - rect.top) / rect.height));
    const previous = lastPointerRef.current;
    const movedPx = previous.time < 0
      ? 0
      : Math.hypot((x - previous.x) * rect.width, (y - previous.y) * rect.height);
    const elapsed = now - previous.time;

    // Space impulses out along the cursor path so rings remain distinguishable.
    if (!force && previous.time >= 0 && (elapsed < 0.13 || movedPx < 16)) return;
    if (force && previous.time >= 0 && elapsed < 0.06) return;

    ripplesRef.current.push({
      x,
      y,
      time: now,
      strength: force ? 1.35 : Math.min(1.15, 0.85 + movedPx / 220),
    });
    if (ripplesRef.current.length > MAX_RIPPLES) ripplesRef.current.shift();
    lastPointerRef.current = { x, y, time: now };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    emitRipple(event);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.target instanceof Element && event.target.closest("button, a")) return;
    emitRipple(event, true);
  };

  const skipIntro = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPhase(3);
  };

  return (
    <main
      ref={surfaceRef}
      className="liquid-demo"
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      aria-label="Интерактивное интро Petrolero"
    >
      <div className="liquid-demo-surface" aria-hidden="true">
        {hasWebGL && (
          <Canvas
            orthographic
            camera={{ position: [0, 0, 1], zoom: 1 }}
            dpr={[1, 1.25]}
            frameloop={motionReduced ? "demand" : "always"}
            gl={{ alpha: false, antialias: false, powerPreference: "high-performance" }}
          >
            <OilSurface ripplesRef={ripplesRef} motionReduced={motionReduced} />
          </Canvas>
        )}
      </div>
      <div className="liquid-demo-shade" aria-hidden="true" />

      <div className="liquid-demo-brand" data-phase={phase}>
        <BrandMark />
        <span>PETROLERO</span>
      </div>

      <div className={`liquid-demo-navigation ${phase === 3 ? "is-visible" : ""}`}>
        <span>PREMIUM MOTOR OIL</span>
        <a href="/" className="liquid-demo-back">Вернуться на главную <span aria-hidden="true">↗</span></a>
      </div>

      <section className={`liquid-demo-copy ${phase === 3 ? "is-visible" : ""}`}>
        <p className="liquid-demo-eyebrow">МОТОРНЫЕ МАСЛА PETROLERO</p>
        <h1>ЛУЧШАЯ<br />ЗАЩИТА<br /><em>ДВИГАТЕЛЯ.</em></h1>
        <p className="liquid-demo-description">
          Масло в движении. Проведите курсором по поверхности.
        </p>
      </section>

      <div className="liquid-demo-bottom">
        <span>ЭКСПЕРИМЕНТАЛЬНЫЙ ПЕРВЫЙ ЭКРАН</span>
        {phase < 3 ? (
          <button type="button" onClick={skipIntro}>Пропустить интро →</button>
        ) : (
          <button type="button" onClick={() => setRun((value) => value + 1)}>Повторить интро ↻</button>
        )}
      </div>
    </main>
  );
}
