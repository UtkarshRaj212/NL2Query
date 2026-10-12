"use client";

import React, { useEffect, useRef, useMemo, useCallback } from "react";
// @ts-expect-error ogl module resolution in Next.js Turbopack
import { Renderer, Triangle, Program, Mesh, Color } from "ogl/src/index.js";

const VERTEX_SHADER = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision mediump float;

varying vec2 vUv;

uniform float iTime;
uniform vec3  iResolution;
uniform float uScale;

uniform vec2  uGridMul;
uniform float uDigitSize;
uniform float uScanlineIntensity;
uniform float uGlitchAmount;
uniform float uFlickerAmount;
uniform float uNoiseAmp;
uniform float uChromaticAberration;
uniform float uDither;
uniform float uCurvature;
uniform vec3  uTint;
uniform vec3  uTintLeft;
uniform vec3  uTintRight;
uniform float uUseSplitTint;
uniform float uSplitRatio;
uniform float uSplitSmoothness;
uniform float uSplitVertical;

uniform vec2  uMouse;
uniform float uMouseStrength;
uniform float uUseMouse;
uniform float uPageLoadProgress;
uniform float uUsePageLoadAnimation;
uniform float uBrightness;
uniform float uLightMode;

float time;

float hash21(vec2 p){
  p = fract(p * 234.56);
  p += dot(p, p + 34.56);
  return fract(p.x * p.y);
}

float noise(vec2 p)
{
  return sin(p.x * 10.0) * sin(p.y * (3.0 + sin(time * 0.090909))) + 0.2; 
}

mat2 rotate(float angle)
{
  float c = cos(angle);
  float s = sin(angle);
  return mat2(c, -s, s, c);
}

float fbm(vec2 p)
{
  p *= 1.1;
  float f = 0.0;
  float amp = 0.5 * uNoiseAmp;
  
  mat2 modify0 = rotate(time * 0.02);
  f += amp * noise(p);
  p = modify0 * p * 2.0;
  amp *= 0.454545;
  
  mat2 modify1 = rotate(time * 0.02);
  f += amp * noise(p);
  p = modify1 * p * 2.0;
  amp *= 0.454545;
  
  mat2 modify2 = rotate(time * 0.08);
  f += amp * noise(p);
  
  return f;
}

float pattern(vec2 p, out vec2 q, out vec2 r) {
  vec2 offset1 = vec2(1.0);
  vec2 offset0 = vec2(0.0);
  mat2 rot01 = rotate(0.1 * time);
  mat2 rot1 = rotate(0.1);
  
  q = vec2(fbm(p + offset1), fbm(rot01 * p + offset1));
  r = vec2(fbm(rot1 * q + offset0), fbm(q + offset0));
  return fbm(p + r);
}

float digit(vec2 p){
    vec2 grid = uGridMul * 15.0;
    vec2 s = floor(p * grid) / grid;
    p = p * grid;
    vec2 q, r;
    float intensity = pattern(s * 0.1, q, r) * 1.3 - 0.03;
    
    if(uUseMouse > 0.5){
        vec2 mouseWorld = uMouse * uScale;
        vec2 diff = s - mouseWorld;
        diff.x *= iResolution.z;
        float distToMouse = length(diff);
        
        float mouseInfluence = exp(-distToMouse * 9.5) * uMouseStrength * 10.0;
        intensity += mouseInfluence;
        
        float ripple = sin(distToMouse * 22.0 - iTime * 6.0) * 0.15 * mouseInfluence;
        intensity += ripple;
    }
    
    if(uUsePageLoadAnimation > 0.5){
        float cellRandom = fract(sin(dot(s, vec2(12.9898, 78.233))) * 43758.5453);
        float cellDelay = cellRandom * 0.8;
        float cellProgress = clamp((uPageLoadProgress - cellDelay) / 0.2, 0.0, 1.0);
        
        float fadeAlpha = smoothstep(0.0, 1.0, cellProgress);
        intensity *= fadeAlpha;
    }
    
    p = fract(p);
    p *= uDigitSize;
    
    float px5 = p.x * 5.0;
    float py5 = (1.0 - p.y) * 5.0;
    float x = fract(px5);
    float y = fract(py5);
    
    float i = floor(py5) - 2.0;
    float j = floor(px5) - 2.0;
    float n = i * i + j * j;
    float f = n * 0.0625;
    
    float isOn = step(0.1, intensity - f);
    float brightness = isOn * (0.2 + y * 0.8) * (0.75 + x * 0.25);
    
    return step(0.0, p.x) * step(p.x, 1.0) * step(0.0, p.y) * step(p.y, 1.0) * brightness;
}

float onOff(float a, float b, float c)
{
  return step(c, sin(iTime + a * cos(iTime * b))) * uFlickerAmount;
}

float displace(vec2 look)
{
    float y = look.y - mod(iTime * 0.25, 1.0);
    float window = 1.0 / (1.0 + 50.0 * y * y);
    return sin(look.y * 20.0 + iTime) * 0.0125 * onOff(4.0, 2.0, 0.8) * (1.0 + cos(iTime * 60.0)) * window;
}

vec3 getColor(vec2 p){
    float bar = step(mod(p.y + time * 20.0, 1.0), 0.2) * 0.4 + 1.0;
    bar *= uScanlineIntensity;
    
    float displacement = displace(p);
    p.x += displacement;

    if (uGlitchAmount != 1.0) {
      float extra = displacement * (uGlitchAmount - 1.0);
      p.x += extra;
    }

    float middle = digit(p);
    
    const float off = 0.002;
    float sum = digit(p + vec2(-off, -off)) + digit(p + vec2(0.0, -off)) + digit(p + vec2(off, -off)) +
                digit(p + vec2(-off, 0.0)) + digit(p + vec2(0.0, 0.0)) + digit(p + vec2(off, 0.0)) +
                digit(p + vec2(-off, off)) + digit(p + vec2(0.0, off)) + digit(p + vec2(off, off));
    
    vec3 baseColor = vec3(0.9) * middle + sum * 0.1 * vec3(1.0) * bar;
    return baseColor;
}

vec2 barrel(vec2 uv){
  vec2 c = uv * 2.0 - 1.0;
  float r2 = dot(c, c);
  c *= 1.0 + uCurvature * r2;
  return c * 0.5 + 0.5;
}

void main() {
    time = iTime * 0.333333;
    vec2 uv = vUv;

    if(uCurvature != 0.0){
      uv = barrel(uv);
    }
    
    vec2 p = uv * uScale;
    vec3 col = getColor(p);

    if(uChromaticAberration != 0.0){
      vec2 ca = vec2(uChromaticAberration) / iResolution.xy;
      col.r = getColor(p + ca).r;
      col.b = getColor(p - ca).b;
    }

    vec3 activeTint = uTint;
    if (uUseSplitTint > 0.5) {
      float halfSmooth = max(uSplitSmoothness * 0.5, 0.001);
      float coord = (uSplitVertical > 0.5) ? (1.0 - uv.y) : uv.x;
      float t = smoothstep(uSplitRatio - halfSmooth, uSplitRatio + halfSmooth, coord);
      activeTint = mix(uTintLeft, uTintRight, t);
    }

    col *= activeTint;
    col *= uBrightness;

    if(uDither > 0.0){
      float rnd = hash21(gl_FragCoord.xy);
      col += (rnd - 0.5) * (uDither * 0.003922);
    }

    if (uLightMode > 0.5) {
      float energy = max(max(col.r, col.g), col.b);
      float coverage = clamp(smoothstep(0.0, 0.72, energy) * 0.9, 0.0, 0.9);
      vec3 ink = clamp(col * 0.42, 0.0, 0.76);
      col = mix(vec3(1.0), ink, coverage);
    }

    gl_FragColor = vec4(col, 1.0);
}
`;

function hexToRgb(p: string): [number, number, number] {
  let i = p.replace("#", "").trim();
  if (i.length === 3) {
    i = i.split("").map((f) => f + f).join("");
  }
  const u = parseInt(i.slice(0, 6), 16);
  return [((u >> 16) & 255) / 255, ((u >> 8) & 255) / 255, (u & 255) / 255];
}

export interface FaultyTerminalProps {
  scale?: number;
  gridMul?: [number, number];
  digitSize?: number;
  timeScale?: number;
  pause?: boolean;
  scanlineIntensity?: number;
  glitchAmount?: number;
  flickerAmount?: number;
  noiseAmp?: number;
  chromaticAberration?: number;
  dither?: number | boolean;
  curvature?: number;
  tint?: string;
  tintLeft?: string;
  tintRight?: string;
  splitRatio?: number;
  splitSmoothness?: number;
  splitDirection?: "horizontal" | "vertical" | "auto";
  mouseReact?: boolean;
  mouseStrength?: number;
  dpr?: number;
  pageLoadAnimation?: boolean;
  brightness?: number;
  lightMode?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function FaultyTerminal({
  scale = 1,
  gridMul = [2, 1],
  digitSize = 1.2,
  timeScale = 0.5,
  pause = false,
  scanlineIntensity = 0.3,
  glitchAmount = 1,
  flickerAmount = 1,
  noiseAmp = 1,
  chromaticAberration = 0,
  dither = 0,
  curvature = 0.15,
  tint = "#ffffff",
  tintLeft,
  tintRight,
  splitRatio = 0.5,
  splitSmoothness = 0.04,
  splitDirection = "auto",
  mouseReact = true,
  mouseStrength = 0.35,
  dpr,
  pageLoadAnimation = true,
  brightness = 0.85,
  lightMode = false,
  className = "",
  style,
  ...rest
}: FaultyTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const programRef = useRef<Program | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const mouseTargetRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const mouseCurrentRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const timeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const randomOffsetRef = useRef<number>(Math.random() * 100);

  const resolvedDpr = useMemo(() => {
    if (typeof dpr === "number") return dpr;
    if (typeof window !== "undefined") {
      return Math.min(window.devicePixelRatio || 1, 2);
    }
    return 1;
  }, [dpr]);

  const rgbTint = useMemo(() => hexToRgb(tint), [tint]);
  const rgbTintLeft = useMemo(() => (tintLeft ? hexToRgb(tintLeft) : rgbTint), [tintLeft, rgbTint]);
  const rgbTintRight = useMemo(() => (tintRight ? hexToRgb(tintRight) : rgbTint), [tintRight, rgbTint]);
  const useSplit = Boolean(tintLeft && tintRight);

  const resolvedDither = useMemo(() => (typeof dither === "boolean" ? (dither ? 1 : 0) : dither), [dither]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const el = containerRef.current;
    if (!el) {
      const x = Math.max(0, Math.min(1, e.clientX / window.innerWidth));
      const y = Math.max(0, Math.min(1, 1 - e.clientY / window.innerHeight));
      mouseTargetRef.current = { x, y };
      return;
    }
    const rect = el.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / width));
    const y = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / height));
    mouseTargetRef.current = { x, y };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        dpr: resolvedDpr,
        alpha: false,
        premultipliedAlpha: false,
      });
    } catch (err) {
      console.error("Failed to initialize OGL WebGL renderer:", err);
      return;
    }

    rendererRef.current = renderer;
    const gl = renderer.gl;
    gl.clearColor(lightMode ? 1 : 0, lightMode ? 1 : 0, lightMode ? 1 : 0, 1);

    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.pointerEvents = "none";

    const geometry = new Triangle(gl);
    const initialWidth = container.offsetWidth || window.innerWidth || 300;
    const initialHeight = container.offsetHeight || window.innerHeight || 150;
    const initialIsVertical =
      splitDirection === "vertical"
        ? true
        : splitDirection === "horizontal"
        ? false
        : initialWidth < 768 || initialWidth < initialHeight;

    const program = new Program(gl, {
      vertex: VERTEX_SHADER,
      fragment: FRAGMENT_SHADER,
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new Color(initialWidth, initialHeight, initialWidth / initialHeight),
        },
        uScale: { value: scale },
        uGridMul: { value: new Float32Array(gridMul) },
        uDigitSize: { value: digitSize },
        uScanlineIntensity: { value: scanlineIntensity },
        uGlitchAmount: { value: glitchAmount },
        uFlickerAmount: { value: flickerAmount },
        uNoiseAmp: { value: noiseAmp },
        uChromaticAberration: { value: chromaticAberration },
        uDither: { value: resolvedDither },
        uCurvature: { value: curvature },
        uTint: { value: new Color(rgbTint[0], rgbTint[1], rgbTint[2]) },
        uTintLeft: { value: new Color(rgbTintLeft[0], rgbTintLeft[1], rgbTintLeft[2]) },
        uTintRight: { value: new Color(rgbTintRight[0], rgbTintRight[1], rgbTintRight[2]) },
        uUseSplitTint: { value: useSplit ? 1 : 0 },
        uSplitRatio: { value: splitRatio },
        uSplitSmoothness: { value: splitSmoothness },
        uSplitVertical: { value: initialIsVertical ? 1 : 0 },
        uMouse: {
          value: new Float32Array([mouseCurrentRef.current.x, mouseCurrentRef.current.y]),
        },
        uMouseStrength: { value: mouseStrength },
        uUseMouse: { value: mouseReact ? 1 : 0 },
        uPageLoadProgress: { value: pageLoadAnimation ? 0 : 1 },
        uUsePageLoadAnimation: { value: pageLoadAnimation ? 1 : 0 },
        uBrightness: { value: brightness },
        uLightMode: { value: lightMode ? 1 : 0 },
      },
    });

    programRef.current = program;
    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      if (!container || !renderer) return;
      const w = container.offsetWidth || window.innerWidth || 300;
      const h = container.offsetHeight || window.innerHeight || 150;
      renderer.setSize(w, h);
      program.uniforms.iResolution.value = new Color(
        gl.canvas.width,
        gl.canvas.height,
        gl.canvas.width / (gl.canvas.height || 1)
      );
      const isVertical =
        splitDirection === "vertical"
          ? true
          : splitDirection === "horizontal"
          ? false
          : w < 768 || w < h;
      program.uniforms.uSplitVertical.value = isVertical ? 1 : 0;
    }

    const ro = new ResizeObserver(() => resize());
    ro.observe(container);
    window.addEventListener("resize", resize);
    resize();

    const renderLoop = (timeMs: number) => {
      rafRef.current = requestAnimationFrame(renderLoop);

      if (pageLoadAnimation && startTimeRef.current === 0) {
        startTimeRef.current = timeMs;
      }

      if (pause) {
        program.uniforms.iTime.value = timeRef.current;
      } else {
        const t = (timeMs * 0.001 + randomOffsetRef.current) * timeScale;
        program.uniforms.iTime.value = t;
        timeRef.current = t;
      }

      if (pageLoadAnimation && startTimeRef.current > 0) {
        const elapsed = timeMs - startTimeRef.current;
        const progress = Math.min(elapsed / 2000, 1);
        program.uniforms.uPageLoadProgress.value = progress;
      }

      if (mouseReact) {
        const curr = mouseCurrentRef.current;
        const target = mouseTargetRef.current;
        curr.x += (target.x - curr.x) * 0.18;
        curr.y += (target.y - curr.y) * 0.18;
        const mouseUniform = program.uniforms.uMouse.value as Float32Array;
        mouseUniform[0] = curr.x;
        mouseUniform[1] = curr.y;
      }

      renderer.render({ scene: mesh });
    };

    rafRef.current = requestAnimationFrame(renderLoop);
    container.appendChild(canvas);

    if (mouseReact) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      window.removeEventListener("resize", resize);
      if (mouseReact) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
      if (canvas.parentElement === container) {
        container.removeChild(canvas);
      }
      const loseContext = gl.getExtension("WEBGL_lose_context");
      loseContext?.loseContext();
      startTimeRef.current = 0;
      randomOffsetRef.current = Math.random() * 100;
    };
  }, [
    resolvedDpr,
    pause,
    timeScale,
    scale,
    gridMul,
    digitSize,
    scanlineIntensity,
    glitchAmount,
    flickerAmount,
    noiseAmp,
    chromaticAberration,
    resolvedDither,
    curvature,
    rgbTint,
    rgbTintLeft,
    rgbTintRight,
    useSplit,
    splitRatio,
    splitSmoothness,
    splitDirection,
    mouseReact,
    mouseStrength,
    pageLoadAnimation,
    brightness,
    lightMode,
    handleMouseMove,
  ]);

  return (
    <div
      ref={containerRef}
      className={`faulty-terminal-container relative w-full h-full overflow-hidden pointer-events-none ${className}`}
      style={style}
      {...rest}
    />
  );
}

export default FaultyTerminal;
