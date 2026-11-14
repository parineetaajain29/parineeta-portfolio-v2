import { useEffect, useRef, useState } from "react";
import { colors } from "../theme";

const K = 10, N = 3, D = K * N, PIC = 6;
type V = [number, number, number];
interface St { pos: V; n: V; u: V; v: V; home: number; r: number; c: number }
const FACES: { n: V; v: V }[] = [
  { n: [0, 0, 1], v: [0, 1, 0] }, { n: [0, 0, -1], v: [0, 1, 0] },
  { n: [1, 0, 0], v: [0, 1, 0] }, { n: [-1, 0, 0], v: [0, 1, 0] },
  { n: [0, 1, 0], v: [0, 0, -1] }, { n: [0, -1, 0], v: [0, 0, 1] },
];
const cross = (a: V, b: V): V => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const rot = (p: V, ax: number, th: number): V => {
  const c = Math.cos(th), s = Math.sin(th), [x, y, z] = p;
  if (ax === 0) return [x, y * c - z * s, y * s + z * c];
  if (ax === 1) return [x * c + z * s, y, -x * s + z * c];
  return [x * c - y * s, x * s + y * c, z];
};
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function makeStickers(): St[] {
  const out: St[] = [];
  FACES.forEach((F, f) => {
    const u = cross(F.v, F.n);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++)
      out.push({ pos: [F.n[0] * 1.5 + u[0] * (c - 1) + F.v[0] * (r - 1), F.n[1] * 1.5 + u[1] * (c - 1) + F.v[1] * (r - 1), F.n[2] * 1.5 + u[2] * (c - 1) + F.v[2] * (r - 1)], n: F.n, u, v: F.v, home: f, r, c });
  });
  return out;
}
const layerOf = (s: St, ax: number) => Math.round(s.n[ax] !== 0 ? s.pos[ax] - 0.5 * s.n[ax] : s.pos[ax]);

/* six dot-matrix "pictures", one per face of the solved cube */
function buildPics(): Float32Array[] {
  const S = 240, cvs = document.createElement("canvas"); cvs.width = cvs.height = S;
  const g = cvs.getContext("2d", { willReadFrequently: true })!;
  const c = S / 2, cut = (fn: () => void) => { g.globalCompositeOperation = "destination-out"; fn(); g.globalCompositeOperation = "source-over"; };
  const draws: ((g: CanvasRenderingContext2D) => void)[] = [
    (g) => { g.font = `700 ${S * 0.7}px "Inter", sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("PJ", c, S * 0.52); },
    (g) => { // smiley
      g.beginPath(); g.arc(c, c, S * 0.42, 0, 6.3); g.fill();
      cut(() => { g.beginPath(); g.arc(c - S * .15, c - S * .1, S * .06, 0, 6.3); g.arc(c + S * .15, c - S * .1, S * .06, 0, 6.3); g.fill();
        g.lineWidth = S * .05; g.lineCap = "round"; g.beginPath(); g.arc(c, c + S * .02, S * .24, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke(); });
    },
    (g) => { // heart
      const x = c, y = S * .22, w = S * .42;
      g.beginPath(); g.moveTo(x, y + w * .55); g.bezierCurveTo(x - w * 1.5, y - w * .35, x - w * .55, y - w * .85, x, y + w * .0);
      g.bezierCurveTo(x + w * .55, y - w * .85, x + w * 1.5, y - w * .35, x, y + w * .55 + w * 0); g.closePath();
      g.save(); g.translate(0, S * .08); g.scale(1, 1); g.beginPath(); g.moveTo(c, S * .85); g.bezierCurveTo(S * -.08, S * .45, S * .2, S * -.05, c, S * .3); g.bezierCurveTo(S * .8, S * -.05, S * 1.08, S * .45, c, S * .85); g.fill(); g.restore();
    },
    (g) => { // star
      g.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? S * .19 : S * .46, a = -Math.PI / 2 + (i * Math.PI) / 5; g.lineTo(c + r * Math.cos(a), c * 1.05 + r * Math.sin(a)); } g.closePath(); g.fill();
    },
    (g) => { // coin with $
      g.beginPath(); g.arc(c, c, S * .43, 0, 6.3); g.fill();
      cut(() => { g.beginPath(); g.arc(c, c, S * .33, 0, 6.3); g.lineWidth = S * .035; g.stroke(); });
      g.font = `700 ${S * .5}px "Inter", sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; cut(() => g.fillText("$", c, c + S * .02));
    },
    (g) => { // rising chart with arrow
      g.lineWidth = S * .06; g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); g.moveTo(S * .12, S * .12); g.lineTo(S * .12, S * .86); g.lineTo(S * .9, S * .86); g.stroke();
      g.beginPath(); g.moveTo(S * .24, S * .7); g.lineTo(S * .44, S * .46); g.lineTo(S * .6, S * .58); g.lineTo(S * .84, S * .24); g.stroke();
      g.beginPath(); g.moveTo(S * .64, S * .22); g.lineTo(S * .86, S * .22); g.lineTo(S * .86, S * .44); g.stroke();
    },
  ];
  return draws.map((fn) => {
    g.clearRect(0, 0, S, S); g.globalAlpha = 1; g.fillStyle = g.strokeStyle = "#fff"; fn(g);
    const px = g.getImageData(0, 0, S, S).data, arr = new Float32Array(D * D), bs = S / D;
    for (let j = 0; j < D; j++) for (let i = 0; i < D; i++) {
      let sum = 0;
      for (let y = 0; y < bs; y++) for (let x = 0; x < bs; x++) sum += px[(((j * bs + y) | 0) * S + ((i * bs + x) | 0)) * 4 + 3];
      arr[j * D + i] = Math.min(1, (sum / (bs * bs * 255)) * 1.8);
    }
    return arr;
  });
}

export default function Cube({ ready }: { ready: boolean }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const readyRef = useRef(ready); readyRef.current = ready;
  const [set, setSet] = useState(0);

  useEffect(() => {
    const canvas = cv.current!, ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stickers = makeStickers(), pics: Float32Array[] = [], raf = 0, size = 0, dpr = 1, tReady = -1;
    let yaw = -0.62, pitch = -0.42, vyaw = 0.0028, k = 0;
    let twist: { ax: number; layer: number; dir: number; t0: number } | null = null;
    let morph: { t0: number; swapped: boolean; reset?: boolean } | null = null;
    let moves = 0, resetPending = false;
    const mouse = { x: -999, y: -999 };
    let drag: { x: number; y: number; moved: boolean; id: number } | null = null;
    const TW = 700;

    const fit = () => { const r = canvas.getBoundingClientRect(); size = r.width; dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = size * dpr; canvas.height = size * dpr; };
    const clickTwist = (t: number) => {
      if (twist || morph) return;
      twist = { ax: (Math.random() * 3) | 0, layer: ((Math.random() * 3) | 0) - 1, dir: Math.random() < 0.5 ? 1 : -1, t0: t };
      morph = { t0: t, swapped: false };
    };
    const commit = () => {
      if (!twist) return; const { ax, layer, dir } = twist, th = dir * Math.PI / 2;
      stickers = stickers.map((s) => {
        if (layerOf(s, ax) !== layer) return s;
        const p = rot(s.pos, ax, th);
        return { ...s, pos: [Math.round(p[0] * 2) / 2, Math.round(p[1] * 2) / 2, Math.round(p[2] * 2) / 2], n: rot(s.n, ax, th).map(Math.round) as V, u: rot(s.u, ax, th).map(Math.round) as V, v: rot(s.v, ax, th).map(Math.round) as V };
      });
      twist = null;
      if (++moves >= 6) resetPending = true;
    };

    const draw = (t: number) => {
      if (tReady < 0 && readyRef.current) tReady = t;
      const pop = tReady < 0 ? 0 : 1 - Math.pow(1 - Math.min(1, (t - tReady) / 1100), 3);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, size, size);
      if (!drag) { yaw += vyaw; vyaw += (0.0028 - vyaw) * 0.02; pitch += (-0.42 + 0.1 * Math.sin(t / 2300) - pitch) * 0.03; }
      let tp = 0;
      if (twist) { tp = Math.min(1, (t - twist.t0) / TW); if (tp >= 1) { commit(); tp = 0; } }
      let mf = 1;
      if (morph) {
        const mp = Math.min(1, (t - morph.t0) / TW);
        if (mp >= 0.5 && !morph.swapped) {
          morph.swapped = true;
          if (morph.reset) { stickers = makeStickers(); k = 0; moves = 0; vyaw = 0.06; } else k = (k + 1) % PIC;
          setSet(k);
        }
        mf = 0.25 + 0.75 * (mp < 0.5 ? 1 - ease(mp * 2) : ease((mp - 0.5) * 2));
        if (mp >= 1) { morph = null; if (resetPending) { resetPending = false; morph = { t0: t, swapped: false, reset: true }; } }
      }
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      const R = (p: V): V => { const x1 = p[0] * cy + p[2] * sy, z1 = -p[0] * sy + p[2] * cy; return [x1, p[1] * cp - z1 * sp, p[1] * sp + z1 * cp]; };
      const half = size / 2, s0 = (half / 2.7) * pop, dist = 8;
      const scl = (z: number) => s0 * dist / (dist - z);
      const ink = colors.ink, acc = colors.accent;
      const th = twist ? twist.dir * (Math.PI / 2) * ease(tp) : 0;
      const items: { P: V; U: V; Vv: V; st: St }[] = [];
      for (const st of stickers) {
        let pos = st.pos, n = st.n, u = st.u, v = st.v;
        if (twist && layerOf(st, twist.ax) === twist.layer) { pos = rot(pos, twist.ax, th); n = rot(n, twist.ax, th); u = rot(u, twist.ax, th); v = rot(v, twist.ax, th); }
        const N3 = R(n); if (N3[2] <= 0.04) continue;
        items.push({ P: R(pos), U: R(u), Vv: R(v), st });
      }
      const alphas = [0.2, 0.45, 0.75, 1];
      for (const { P, U, Vv, st } of items) {
        const depth = Math.min(1, Math.max(0, (P[2] + 2.6) / 5.2));
        const pic = pics[(st.home + k) % PIC]; if (!pic) continue;
        const buckets: number[][] = [[], [], [], [], []];
        for (let j = 0; j < K; j++) for (let i = 0; i < K; i++) {
          const a = ((i + 0.5) / K - 0.5) * 0.88, b = ((j + 0.5) / K - 0.5) * 0.88;
          const X = P[0] + U[0] * a + Vv[0] * b, Y = P[1] + U[1] * a + Vv[1] * b, Z = P[2] + U[2] * a + Vv[2] * b;
          const sc = scl(Z), sx = half + X * sc, syy = half + Y * sc;
          const br = pic[(st.r * K + j) * D + st.c * K + i];
          let r = sc * (0.88 / K) * 0.5 * (0.1 + 0.9 * br) * mf; if (r < 0.2) continue;
          const near = Math.hypot(sx - mouse.x, syy - mouse.y) < 70;
          if (near) r *= 1.35;
          buckets[near ? 4 : br < 0.15 ? 0 : br < 0.4 ? 1 : br < 0.7 ? 2 : 3].push(sx, syy, r);
        }
        ctx.globalAlpha = (0.5 + 0.5 * depth) * Math.min(1, pop * 1.4);
        for (let q = 0; q < 5; q++) {
          const arr = buckets[q]; if (!arr.length) continue;
          ctx.fillStyle = q === 4 ? acc : ink;
          ctx.save(); if (q < 4) ctx.globalAlpha *= alphas[q];
          ctx.beginPath();
          for (let m = 0; m < arr.length; m += 3) { ctx.moveTo(arr[m] + arr[m + 2], arr[m + 1]); ctx.arc(arr[m], arr[m + 1], arr[m + 2], 0, 6.2832); }
          ctx.fill(); ctx.restore();
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    fit();
    document.fonts.load('700 100px "Inter"').then(() => { pics = buildPics(); });
    pics = buildPics();
    if (reduce) { vyaw = 0; }
    raf = requestAnimationFrame(draw);
    const ro = new ResizeObserver(fit); ro.observe(canvas);

    const pos = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * size, y: ((e.clientY - r.top) / r.height) * size }; };
    const down = (e: PointerEvent) => { drag = { x: e.clientX, y: e.clientY, moved: false, id: e.pointerId }; canvas.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => {
      const p = pos(e); mouse.x = p.x; mouse.y = p.y;
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) > 6) drag.moved = true;
      if (drag.moved) { yaw += dx * 0.008; vyaw = dx * 0.008; pitch = Math.max(-1.2, Math.min(1.2, pitch - dy * 0.008)); drag.x = e.clientX; drag.y = e.clientY; }
    };
    const up = () => { if (drag && !drag.moved) clickTwist(performance.now()); drag = null; };
    const leave = () => { mouse.x = mouse.y = -999; };
    canvas.addEventListener("pointerdown", down); canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up); canvas.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      canvas.removeEventListener("pointerdown", down); canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up); canvas.removeEventListener("pointercancel", up); canvas.removeEventListener("pointerleave", leave);
    };
  }, []);

  const names = ["Initials", "Smile", "Heart", "Star", "Coin", "Growth"];
  return (
    <div className={`cube-wrap ${ready ? "in" : ""}`}>
      <canvas ref={cv} className="cube-canvas" data-hover aria-label="Interactive dotted cube. Click to twist and change the pictures, drag to rotate." role="img" />
      <p className="cube-cap"><b>{String(set + 1).padStart(2, "0")} / 06</b> {names[set]} · click to twist · drag to turn</p>
    </div>
  );
}
