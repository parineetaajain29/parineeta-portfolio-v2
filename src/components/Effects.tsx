import { useEffect, useRef, useState } from "react";
import { colors } from "../theme";

const GLYPHS = "!<>-_\\/[]{}=+*^?#ABCDEFGHJKLMNPRSTUVWXYZ0123456789";

/* hover text scramble (ReactBits "Scrambled Text" idea) */
export function Scramble({ text, className }: { text: string; className?: string }) {
  const [out, setOut] = useState(text);
  const raf = useRef(0);
  const run = () => {
    cancelAnimationFrame(raf.current);
    const t0 = performance.now(), dur = 520;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setOut(text.split("").map((c, i) => (c === " " || i < p * text.length ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join(""));
      if (p < 1) raf.current = requestAnimationFrame(tick); else setOut(text);
    };
    raf.current = requestAnimationFrame(tick);
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return <span className={className} onMouseEnter={run} onFocus={run} aria-label={text}><span aria-hidden="true">{out}</span></span>;
}

/* per-letter reveal on scroll (ReactBits "Split Text") */
export function SplitText({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el); return () => io.disconnect();
  }, []);
  let n = 0;
  return (
    <span ref={ref} className={`split ${className}`} aria-label={text}>
      {text.split(" ").map((w, wi) => (
        <span className="w" key={wi} aria-hidden="true">
          {w.split("").map((c, ci) => <span className="ch" key={ci} style={{ ["--i" as string]: n++ }}>{c}</span>)}
          {" "}
        </span>
      ))}
    </span>
  );
}

/* number count-up when scrolled into view */
export function CountUp({ to, decimals = 0, prefix = "", suffix = "" }: { to: number; decimals?: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current!; let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect();
      const t0 = performance.now();
      const tick = (t: number) => { const p = Math.min(1, (t - t0) / 1400); setV(to * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el); return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  return <span ref={ref}>{prefix}{v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>;
}

/* rotating ring of text (ReactBits "Circular Text") */
export function CircularBadge({ text, href }: { text: string; href: string }) {
  const id = "cb" + text.length;
  return (
    <a className="badge fx-mag" href={href} data-hover aria-label="Get in touch">
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <defs><path id={id} d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0" /></defs>
        <text><textPath href={`#${id}`} startOffset="0">{text}</textPath></text>
      </svg>
      <span className="badge-ar">↗</span>
    </a>
  );
}

/* click sparks (ReactBits "Click Spark") */
export function ClickSpark() {
  const cv = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = cv.current!, ctx = c.getContext("2d")!;
    let W = 0, H = 0, raf = 0, dpr = 1;
    const sparks: { x: number; y: number; a: number; t: number }[] = [];
    const fit = () => { dpr = Math.min(window.devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; c.width = W * dpr; c.height = H * dpr; };
    const down = (e: PointerEvent) => { for (let i = 0; i < 9; i++) sparks.push({ x: e.clientX, y: e.clientY, a: (i / 9) * 6.283 + Math.random() * 0.4, t: performance.now() }); };
    const draw = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = colors.accent; ctx.lineWidth = 2; ctx.lineCap = "round";
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i], p = (t - s.t) / 520;
        if (p >= 1) { sparks.splice(i, 1); continue; }
        const e = 1 - Math.pow(1 - p, 3), r0 = 8 + 36 * e, r1 = r0 + 14 * (1 - p);
        ctx.globalAlpha = 1 - p; ctx.beginPath();
        ctx.moveTo(s.x + Math.cos(s.a) * r0, s.y + Math.sin(s.a) * r0); ctx.lineTo(s.x + Math.cos(s.a) * r1, s.y + Math.sin(s.a) * r1); ctx.stroke();
      }
      raf = requestAnimationFrame(draw);
    };
    fit(); raf = requestAnimationFrame(draw);
    addEventListener("pointerdown", down); addEventListener("resize", fit);
    return () => { cancelAnimationFrame(raf); removeEventListener("pointerdown", down); removeEventListener("resize", fit); };
  }, []);
  return <canvas ref={cv} className="sparks" aria-hidden="true" />;
}

/* global pointer effects: spotlight + tilt on cards, magnetic buttons, hero glow follow */
export function useFx() {
  useEffect(() => {
    if (window.matchMedia("(hover: none), (prefers-reduced-motion: reduce)").matches) return;
    const mv = (e: PointerEvent) => {
      const tgt = e.target as HTMLElement | null;
      const card = tgt?.closest<HTMLElement>(".card, .rows .row");
      document.querySelectorAll<HTMLElement>(".card.lit, .rows .row.lit").forEach((el) => { if (el !== card) { el.classList.remove("lit"); el.style.transform = ""; } });
      if (card) {
        const b = card.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
        card.classList.add("lit"); card.style.setProperty("--mx", `${x}px`); card.style.setProperty("--my", `${y}px`);
        if (card.classList.contains("card")) card.style.transform = `perspective(700px) rotateX(${(0.5 - y / b.height) * 9}deg) rotateY(${(x / b.width - 0.5) * 9}deg) translateY(-3px)`;
      }
      const hero = document.querySelector<HTMLElement>(".hero");
      if (hero) { const b = hero.getBoundingClientRect(); hero.style.setProperty("--hx", `${e.clientX - b.left}px`); hero.style.setProperty("--hy", `${e.clientY - b.top}px`); }
      document.querySelectorAll<HTMLElement>(".fx-mag").forEach((m) => {
        const b = m.getBoundingClientRect(), cx = b.left + b.width / 2, cy = b.top + b.height / 2, d = Math.hypot(e.clientX - cx, e.clientY - cy);
        if (d < Math.max(b.width, 90) * 0.9) m.style.transform = `translate(${(e.clientX - cx) * 0.28}px, ${(e.clientY - cy) * 0.28}px)`;
        else m.style.transform = "";
      });
    };
    addEventListener("pointermove", mv);
    return () => removeEventListener("pointermove", mv);
  }, []);
}
