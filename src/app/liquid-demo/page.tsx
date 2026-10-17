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
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
      mix(hash21(i + vec2(0.0, 1.0)), hash21(i + 1.0), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float total = 0.0;
    float weight = 0.5;
    for (int i = 0; i < 5; i++) {
      total += noise2(p) * weight;
      p = p * 2.03 + vec2(11.4, 4.9);
      weight *= 0.5;
    }
    return total;
  }

  void main() {
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
    float time = uTime * 0.055;
    float waveLight = 0.0;

    // Impulses are tracked along the pointer trajectory, not just at its tip.
    for (int i = 0; i < 12; i++) {
      vec4 hit = uRipples[i];
      float age = uTime - hit.z;
      float alive = step(0.0, age) * exp(-max(age, 0.0) * 1.65) * hit.w;
      vec2 center = (hit.xy - 0.5) * vec2(uAspect, 1.0);
      vec2 delta = p - center;
      float distanceToHit = length(delta);
      float wake = sin(distanceToHit * 42.0 - age * 8.0)
                 * exp(-distanceToHit * 5.5) * alive;
      p += delta / max(distanceToHit, 0.0001) * wake * 0.011;
      waveLight += abs(wake) * 0.13;
    }

    // Domain warping makes the fine golden folds follow the larger oil currents.
    vec2 drift = vec2(time * 0.19, -time * 0.12);
    float low = fbm(p * 1.65 + drift);
    float medium = fbm(p * 3.25 + vec2(low * 2.1, -low * 1.8) - drift * 0.65);
    vec2 q = p + vec2(low - 0.48, medium - 0.50) * 0.24;

    float folds = sin(q.x * 9.0 + q.y * 3.5 + low * 8.3 + medium * 1.8);
    float swirls = sin(q.x * 14.0 - q.y * 10.0 + low * 11.5 + medium * 4.2);
    float heavyGold = pow(clamp(folds * 0.5 + 0.5, 0.0, 1.0), 8.0);
    float hairlineGold = pow(clamp(swirls * 0.5 + 0.5, 0.0, 1.0), 23.0);
    float bronze = smoothstep(0.36, 0.78, low * 0.64 + medium * 0.40);
    float glassReflection = pow(
      clamp(sin(q.y * 18.0 + low * 13.0) * 0.5 + 0.5, 0.0, 1.0),
      17.0
    );

    vec3 black = vec3(0.005, 0.006, 0.009);
    vec3 darkBronze = vec3(0.115, 0.055, 0.014);
    vec3 gold = vec3(1.00, 0.51, 0.105);
    vec3 paleGold = vec3(1.00, 0.82, 0.46);

    vec3 color = mix(black, darkBronze, bronze * 0.72);
    color += darkBronze * smoothstep(0.33, 0.88, medium) * 0.55;
    color += gold * heavyGold * 0.82;
    color += paleGold * hairlineGold * 0.77;
    color += gold * glassReflection * 0.28;
    color += vec3(0.35, 0.18, 0.045) * min(waveLight, 0.75);

    // A soft reflected studio light, not a uniform orange overlay.
    vec2 softBox = (vUv - vec2(0.66, 0.71)) * vec2(0.9, 1.6);
    float light = exp(-dot(softBox, softBox) * 8.0);
    color += vec3(0.15, 0.083, 0.018) * light * (0.4 + heavyGold);

    float vignette = 1.0 - smoothstep(0.36, 1.12, length((vUv - 0.5) * vec2(uAspect * 0.8, 1.0)));
    color *= 0.48 + vignette * 0.52;
    color += (hash21(gl_FragCoord.xy + uTime) - 0.5) / 255.0;

    gl_FragColor = vec4(pow(max(color, vec3(0.0)), vec3(0.88)), 1.0);
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
  const lastPointerRef = useRef({ x: 0.5, y: 0.5, time: 0 });
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

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (motionReduced || !surfaceRef.current) return;
    const now = performance.now() * 0.001;
    if (now - lastPointerRef.current.time < 0.065) return;
    const rect = surfaceRef.current.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, 1 - (event.clientY - rect.top) / rect.height));
    const distance = Math.hypot(x - lastPointerRef.current.x, y - lastPointerRef.current.y);
    ripplesRef.current.push({
      x,
      y,
      time: now,
      strength: Math.min(1.2, Math.max(0.45, distance * 12)),
    });
    if (ripplesRef.current.length > MAX_RIPPLES) ripplesRef.current.shift();
    lastPointerRef.current = { x, y, time: now };
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
      aria-label="Интерактивное интро Petrolero"
    >
      <div className="liquid-demo-surface" aria-hidden="true">
        {hasWebGL && (
          <Canvas
            orthographic
            camera={{ position: [0, 0, 1], zoom: 1 }}
            dpr={[1, 1.5]}
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
        <h1>СИЛА<br />В КАЖДОЙ<br /><em>КАПЛЕ.</em></h1>
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
