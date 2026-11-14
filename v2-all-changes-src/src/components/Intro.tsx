import { useEffect, useRef, useState } from "react";
import { colors } from "../theme";

interface D { bx: number; by: number; tx: number; ty: number; x: number; y: number; vx: number; vy: number; u: number }

/* dotted box drops from the top-left, bounces, shakes, bursts into the name, page starts */
export default function Intro({ onDone }: { onDone: () => void }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const [out, setOut] = useState(false);
  const [gone, setGone] = useState(false);
  const finish = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = cv.current!;
    const ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let done = false;
    const end = () => {
      if (done) return; done = true;
      onDone();
      window.setTimeout(() => setOut(true), 450);
      window.setTimeout(() => setGone(true), 1300);
    };
    finish.current = end;
    if (reduce) { const t = window.setTimeout(end, 250); return () => clearTimeout(t); }

    let W = 0, H = 0, dpr = 1, raf = 0, last = 0, started = false;
    let dots: D[] = [];
    let B = 160, sp = 5, dotR = 3, floorY = 0, cx = 0, cy = 0, vx = 0, vy = 0, G = 0;
    let squash = 0, flash = 0, ringT = -1;
    let phase: "drop" | "rest" | "shake" | "fly" | "form" | "bam" = "drop";
    let tp = 0;
    const FR = 0.0012;

    const build = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height; dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr; canvas.height = H * dpr;
      const off = document.createElement("canvas"); off.width = W; off.height = H;
      const o = off.getContext("2d")!;
      const fs = Math.min(W / 5.2, H / 3.4, 260);
      o.fillStyle = "#fff"; o.textAlign = "center"; o.textBaseline = "middle";
      o.font = `700 ${fs}px "Inter", sans-serif`;
      const cyT = H * 0.5;
      o.fillText("PARINEETA", W / 2, cyT - fs * 0.5);
      o.fillText("JAIN.", W / 2, cyT + fs * 0.55);
      const step = Math.max(4, Math.round(fs / 34));
      dotR = step * 0.46;
      const data = o.getImageData(0, 0, W, H).data;
      const targets: { x: number; y: number }[] = [];
      for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) if (data[(y * Math.floor(W) + x) * 4 + 3] > 128) targets.push({ x, y });
      for (let i = targets.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [targets[i], targets[j]] = [targets[j], targets[i]]; }
      B = Math.max(110, Math.min(W, H) * 0.25);
      const g = Math.ceil(Math.sqrt(targets.length)); sp = B / g;
      dots = targets.map((t, i) => ({ bx: ((i % g) - g / 2 + 0.5) * sp, by: (Math.floor(i / g) - g / 2 + 0.5) * sp, tx: t.x, ty: t.y, x: 0, y: 0, vx: 0, vy: 0, u: Math.random() }));
      G = 3.2e-6 * H;
      floorY = H - B / 2 - H * 0.07;
      cx = B * 0.9; cy = -B; vy = 0; vx = (FR * (W * 0.5 - B * 0.9)) / 0.9;
      phase = "drop"; tp = 0; squash = 0; flash = 0; ringT = -1;
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      const shakeP = phase === "shake" ? Math.min(1, tp / 1250) : phase === "drop" || phase === "rest" ? 0 : 1;
      const formP = phase === "fly" ? 0 : phase === "form" ? Math.min(1, tp / 900) : phase === "bam" ? 1 : 0;
      const boxSize = sp * 0.5, size = boxSize + (dotR * 2 - boxSize) * formP;
      if (phase === "shake") {
        const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, B);
        gr.addColorStop(0, `rgba(${colors.accentRgb},${0.22 * shakeP})`); gr.addColorStop(1, `rgba(${colors.accentRgb},0)`);
        ctx.fillStyle = gr; ctx.fillRect(cx - B, cy - B, B * 2, B * 2);
      }
      const accFrac = phase === "shake" ? 0.07 + 0.6 * shakeP : phase === "fly" ? 0.5 : phase === "form" ? 0.5 - 0.43 * formP : 0.07;
      for (let pass = 0; pass < 2; pass++) {
        ctx.fillStyle = pass ? colors.accent : colors.ink;
        ctx.beginPath();
        for (const d of dots) {
          if ((d.u < accFrac ? 1 : 0) !== pass) continue;
          ctx.rect(d.x - size / 2, d.y - size / 2, size, size);
        }
        ctx.fill();
      }
      if (ringT >= 0) {
        const p = Math.min(1, ringT / 800);
        ctx.strokeStyle = `rgba(${colors.accentRgb},${0.8 * (1 - p)})`; ctx.lineWidth = 3 * (1 - p) + 1;
        ctx.beginPath(); ctx.arc(W / 2, H * 0.5, p * Math.max(W, H) * 0.7, 0, 6.3); ctx.stroke();
      }
      if (flash > 0.01) { ctx.fillStyle = `rgba(${colors.accentRgb},${flash * 0.28})`; ctx.fillRect(0, 0, W, H); }
    };

    const place = () => {
      // box layout for drop / rest / shake
      const sx = 1 + 0.22 * squash, sy = 1 - 0.22 * squash;
      let ox = 0, oy = 0;
      const amp = phase === "shake" ? 1 + 15 * Math.pow(Math.min(1, tp / 1250), 1.6) : 0;
      if (phase === "shake") { ox = (Math.random() - 0.5) * 2 * amp; oy = (Math.random() - 0.5) * amp; }
      for (const d of dots) {
        const j = phase === "shake" ? (Math.random() - 0.5) * amp * 0.35 : 0;
        d.x = cx + ox + d.bx * sx + j;
        d.y = cy + B / 2 + (d.by - B / 2) * sy + oy + j;
      }
    };

    const burst = () => {
      const bxc = cx, byc = cy;
      for (const d of dots) {
        const dx = d.x - bxc, dy = d.y - byc, len = Math.hypot(dx, dy) || 1;
        const s = 0.35 + Math.random() * 1.15;
        d.vx = (dx / len) * s + (Math.random() - 0.5) * 0.35; d.vy = (dy / len) * s - 0.25 - Math.random() * 0.35;
      }
      phase = "fly"; tp = 0; flash = 1; ringT = 0;
    };

    const step = (t: number) => {
      const dt = Math.min(40, t - last || 16); last = t; tp += dt;
      if (ringT >= 0) ringT += dt;
      flash *= Math.exp(-dt / 220);
      squash *= Math.exp(-dt / 110);
      if (phase === "drop") {
        vy += G * dt; cy += vy * dt; cx += vx * dt; vx *= Math.exp(-FR * dt);
        if (cy >= floorY) {
          cy = floorY; const imp = vy; vy = -vy * 0.45; squash = Math.min(1, Math.abs(imp) / 1.3);
          if (Math.abs(vy) < 0.09) { vy = 0; phase = "rest"; tp = 0; }
        }
        place();
      } else if (phase === "rest") { place(); if (tp > 350) { phase = "shake"; tp = 0; } }
      else if (phase === "shake") { place(); if (tp > 1250) burst(); }
      else if (phase === "fly") {
        const k = Math.exp(-dt / 260);
        for (const d of dots) { d.x += d.vx * dt * 16; d.y += d.vy * dt * 16; d.vx *= k; d.vy *= k; }
        if (tp > 380) { phase = "form"; tp = 0; }
      } else if (phase === "form") {
        const a = 1 - Math.exp(-dt / 150), k = Math.exp(-dt / 120);
        for (const d of dots) { d.x += d.vx * dt * 16; d.y += d.vy * dt * 16; d.vx *= k; d.vy *= k; d.x += (d.tx - d.x) * a; d.y += (d.ty - d.y) * a; }
        if (tp > 1150) { phase = "bam"; tp = 0; flash = 1; ringT = 0; end(); }
      } else {
        for (const d of dots) { d.x = d.tx + (Math.random() - 0.5) * 0.8; d.y = d.ty + (Math.random() - 0.5) * 0.8; }
      }
    };

    const loop = (t: number) => { if (!started) return; step(t); draw(); raf = requestAnimationFrame(loop); };
    const start = () => { if (started) return; started = true; build(); last = performance.now(); raf = requestAnimationFrame(loop); };
    document.fonts.load('700 100px "Inter"').then(start);
    const fb = window.setTimeout(start, 1500);
    const safety = window.setTimeout(end, 12000);
    const onResize = () => { if (started && (phase === "drop" || phase === "rest")) build(); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); started = false; clearTimeout(fb); clearTimeout(safety); window.removeEventListener("resize", onResize); };
  }, [onDone]);

  if (gone) return null;
  return (
    <div className={`intro ${out ? "out" : ""}`} onClick={() => finish.current()} role="presentation">
      <canvas ref={cv} aria-hidden="true" />
      <button className="intro-skip" onClick={(e) => { e.stopPropagation(); finish.current(); }}>Skip intro</button>
    </div>
  );
}
