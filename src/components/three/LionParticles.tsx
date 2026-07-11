"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { heroScrollMix } from "@/lib/scroll-mix";

/**
 * Particle field forming CDA's geometric lion. The mask is drawn once on an
 * offscreen 2D canvas (spiky mane ring, face disc, punched-out eyes and nose),
 * sampled into particle positions — no external model or texture to download.
 * Colors are Cameroon-flag weighted: mostly green, some yellow, a rare red.
 */

const SIZE = 240;
const SPREAD = 2.4;

/** Soft radial sprite so points render as circular glows, not hard squares */
let spriteTexture: THREE.CanvasTexture | null = null;
function getSprite() {
  if (spriteTexture) return spriteTexture;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.55)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  spriteTexture = new THREE.CanvasTexture(c);
  return spriteTexture;
}

function drawLionMask(ctx: CanvasRenderingContext2D) {
  const cx = SIZE / 2;
  const cy = SIZE / 2 - 8;
  ctx.fillStyle = "#fff";

  // Mane — 14-spike star
  ctx.beginPath();
  const spikes = 14;
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? 104 : 78;
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  // Hollow the mane into a ring
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(cx, cy + 4, 70, 0, Math.PI * 2);
  ctx.fill();

  // Face disc
  ctx.globalCompositeOperation = "source-over";
  ctx.beginPath();
  ctx.arc(cx, cy + 4, 54, 0, Math.PI * 2);
  ctx.fill();

  // Punch out eyes and nose
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(cx - 20, cy - 4, 8, 0, Math.PI * 2);
  ctx.arc(cx + 20, cy - 4, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - 9, cy + 22);
  ctx.lineTo(cx + 9, cy + 22);
  ctx.lineTo(cx, cy + 34);
  ctx.closePath();
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
}

function buildLion(count: number, eyeCount: number) {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;
  drawLionMask(ctx);

  const data = ctx.getImageData(0, 0, SIZE, SIZE).data;
  const filled: [number, number][] = [];
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      if (data[(y * SIZE + x) * 4 + 3] > 128) filled.push([x, y]);
    }
  }

  const total = count + eyeCount;
  const positions = new Float32Array(total * 3);
  const baseX = new Float32Array(total);
  const baseY = new Float32Array(total);
  const baseZ = new Float32Array(total);
  // Scroll morph target: particles re-form into vertical data streams
  const streamX = new Float32Array(total);
  const streamY = new Float32Array(total);
  const colors = new Float32Array(total * 3);
  const phase = new Float32Array(total);
  const speed = new Float32Array(total);

  const columns = 16;
  for (let i = 0; i < total; i++) {
    const col = i % columns;
    streamX[i] = ((col - (columns - 1) / 2) / ((columns - 1) / 2)) * 2.6 + (Math.random() - 0.5) * 0.12;
    streamY[i] = (Math.random() - 0.5) * 3.4;
  }

  const green = new THREE.Color("#00C08B");
  const yellow = new THREE.Color("#FCD116");
  const red = new THREE.Color("#E23A4E");

  for (let i = 0; i < count; i++) {
    const [px, py] = filled[Math.floor(Math.random() * filled.length)];
    positions[i * 3] = (px / SIZE - 0.5 + (Math.random() - 0.5) / SIZE) * SPREAD;
    positions[i * 3 + 1] = -(py / SIZE - 0.5) * SPREAD;
    const z = (Math.random() - 0.5) * 0.3;
    positions[i * 3 + 2] = z;
    baseX[i] = positions[i * 3];
    baseY[i] = positions[i * 3 + 1];
    baseZ[i] = z;

    const r = Math.random();
    const c = r < 0.7 ? green : r < 0.94 ? yellow : red;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
    phase[i] = Math.random() * Math.PI * 2;
    speed[i] = 0.4 + Math.random() * 0.8;
  }

  // Lion eyes — dense warm-yellow clusters in the punched-out sockets
  const cx = SIZE / 2;
  const cy = SIZE / 2 - 8;
  for (let j = 0; j < eyeCount; j++) {
    const i = count + j;
    const side = j % 2 === 0 ? -1 : 1;
    const a = Math.random() * Math.PI * 2;
    const rr = Math.random() * 5;
    const px = cx + side * 20 + Math.cos(a) * rr;
    const py = cy - 4 + Math.sin(a) * rr;
    positions[i * 3] = (px / SIZE - 0.5) * SPREAD;
    positions[i * 3 + 1] = -(py / SIZE - 0.5) * SPREAD;
    const z = (Math.random() - 0.5) * 0.15;
    positions[i * 3 + 2] = z;
    baseX[i] = positions[i * 3];
    baseY[i] = positions[i * 3 + 1];
    baseZ[i] = z;
    colors[i * 3] = yellow.r;
    colors[i * 3 + 1] = yellow.g;
    colors[i * 3 + 2] = yellow.b;
    phase[i] = Math.random() * Math.PI * 2;
    speed[i] = 1.2 + Math.random() * 0.8;
  }

  return { positions, baseX, baseY, baseZ, streamX, streamY, colors, phase, speed, total };
}

function LionPoints({ count = 4200, eyeCount = 150 }) {
  const ref = useRef<THREE.Points>(null);
  const lion = useMemo(() => buildLion(count, eyeCount), [count, eyeCount]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(lion.positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(lion.colors, 3));
    return g;
  }, [lion]);

  useFrame(({ clock, pointer }) => {
    const points = ref.current;
    if (!points) return;
    const t = clock.elapsedTime;

    // Scroll morph: lion (mix=0) dissolves into flowing data streams (mix=1)
    const mix = heroScrollMix.current;
    const eased = mix * mix * (3 - 2 * mix); // smoothstep

    const pos = points.geometry.attributes.position;
    const arr = pos.array as Float32Array;
    const flowRange = 3.4;
    for (let i = 0; i < lion.total; i++) {
      // Streams flow downward, wrapping — speed varies per particle
      let sy = lion.streamY[i] - ((t * lion.speed[i] * 0.35) % flowRange);
      if (sy < -flowRange / 2) sy += flowRange;

      arr[i * 3] = lion.baseX[i] + (lion.streamX[i] - lion.baseX[i]) * eased;
      arr[i * 3 + 1] = lion.baseY[i] + (sy - lion.baseY[i]) * eased;
      arr[i * 3 + 2] =
        lion.baseZ[i] + Math.sin(t * lion.speed[i] + lion.phase[i]) * 0.045;
    }
    pos.needsUpdate = true;

    // Slow drift + pointer parallax
    const targetY = pointer.x * 0.3 + Math.sin(t * 0.12) * 0.08;
    const targetX = -pointer.y * 0.18;
    points.rotation.y += (targetY - points.rotation.y) * 0.04;
    points.rotation.x += (targetX - points.rotation.x) * 0.04;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        map={getSprite()}
        size={0.036}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function AmbientField({ count = 500 }) {
  const ref = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Shell between r=2.2 and r=4.5 so it never crowds the lion
      const r = 2.2 + Math.random() * 2.3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      positions[i * 3 + 2] = r * Math.cos(phi) - 1;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [count]);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.02;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        map={getSprite()}
        size={0.035}
        sizeAttenuation
        color="#3fbf9f"
        transparent
        opacity={0.22}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function LionParticles() {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.2], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
    >
      <LionPoints />
      <AmbientField />
    </Canvas>
  );
}
