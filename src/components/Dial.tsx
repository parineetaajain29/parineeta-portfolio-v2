import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { projects } from "../data/projects";
import { colors } from "../theme";
import { GithubIcon } from "./BrandIcons";

const N = projects.length;
const STEP = 360 / N;
const R = 250; // ring radius in svg units
const C = 300; // svg centre

type Pat = (u: number, v: number, t: number) => number;
const pats: Pat[] = [
  (u, v, t) => {
    const a = Math.sin(u * 4 + t) + Math.cos(v * 4 - t * 0.8);
    return 0.5 + 0.5 * Math.sin(a * 2 + Math.hypot(u, v) * 5 - t);
  },
  (u, v, t) => 0.5 + 0.5 * Math.sin(Math.hypot(u, v) * 14 - t * 2),
  (u, v, t) => Math.exp(-(u * u + v * v) * 2.2) * (0.75 + 0.25 * Math.sin(t * 1.5 + u * 6)),
  (u, v, t) => {
    const col = Math.floor((u + 1) * 7);
    const h = 0.25 + 0.65 * Math.abs(Math.sin(col * 1.7 + t * 0.8));
    const y = (1 - v) / 2;
    return y < h ? 0.55 + 0.45 * y : 0.06;
  },
  (u, v, t) => 0.5 + 0.5 * Math.sin((u + v) * 9 - t * 1.6) * Math.cos(u * 3 + t * 0.3),
  (u, v, t) => {
    const w = Math.sin(u * 5 - t * 2.2 + Math.sin(v * 3 + t) * 1.6);
    return Math.max(0, (0.5 + 0.5 * w) * (1 - Math.abs(v) * 0.55));
  },
  (u, v, t) => {
    const r = Math.hypot(u, v), a = Math.atan2(v, u);
    const arm = 0.5 + 0.5 * Math.sin(a * 2 + r * 9 - t * 1.3);
    return Math.min(1, Math.max(0, arm * Math.exp(-r * 1.5) * 1.3 + Math.exp(-r * r * 30) * 0.9));
  },
];

export default function Dial({ onOpen }: { onOpen: () => void }) {
  const section = useRef<HTMLElement>(null);
  const ringRef = useRef<SVGGElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(0);
  const target = useRef(0);
  const cur = useRef(0);
  const activeRef = useRef(0);

  const jump = useCallback((i: number) => {
    const el = section.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.offsetTop + (i / (N - 1)) * total + 2, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const el = section.current!;
    const canvas = cv.current!;
    const ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, size = 0, dpr = 1;

    let snapT = 0;
    const snap = () => {
      const total = el.offsetHeight - window.innerHeight;
      const y = window.scrollY - el.offsetTop;
      if (y < 0 || y > total) return; // only while the wheel is pinned
      const idx = Math.round((y / total) * (N - 1));
      const to = el.offsetTop + (idx / (N - 1)) * total;
      if (Math.abs(to - window.scrollY) > 2) window.scrollTo({ top: to, behavior: "smooth" });
    };
    const onScroll = () => {
      const total = el.offsetHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, (window.scrollY - el.offsetTop) / total));
      target.current = p * (N - 1);
      clearTimeout(snapT);
      snapT = window.setTimeout(snap, 130);
    };
    const fit = () => {
      const r = canvas.getBoundingClientRect();
      size = r.width; dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = size * dpr; canvas.height = size * dpr;
    };
    const onKey = (e: KeyboardEvent) => {
      const rect = el.getBoundingClientRect();
      if (rect.top > window.innerHeight * 0.5 || rect.bottom < window.innerHeight * 0.5) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); jump(Math.min(N - 1, activeRef.current + 1)); }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); jump(Math.max(0, activeRef.current - 1)); }
    };

    const draw = (t: number) => {
      cur.current += (target.current - cur.current) * (reduce ? 1 : 0.09);
      const c = cur.current;
      ringRef.current?.setAttribute("transform", `rotate(${-c * STEP} ${C} ${C})`);
      const idx = Math.round(c);
      if (idx !== activeRef.current) { activeRef.current = idx; setActive(idx); }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      const g = 13, cells = Math.floor(size / g);
      const off = (size - cells * g) / 2;
      const lo = Math.floor(c), hi = Math.min(N - 1, lo + 1), f = c - lo;
      const tt = t / 1000;
      for (let j = 0; j < cells; j++) {
        for (let i = 0; i < cells; i++) {
          const u = (i / (cells - 1)) * 2 - 1, v = (j / (cells - 1)) * 2 - 1;
          const d = Math.hypot(u, v);
          if (d > 1) continue;
          const val = pats[lo](u, v, tt) * (1 - f) + pats[hi](u, v, tt) * f;
          const r = Math.max(0.3, val * g * 0.52) * (d > 0.88 ? (1 - d) / 0.12 : 1);
          ctx.globalAlpha = 0.25 + 0.75 * val;
          ctx.fillStyle = val > 0.82 ? colors.ink : colors.accent;
          ctx.beginPath();
          ctx.arc(off + i * g + g / 2, off + j * g + g / 2, r, 0, 6.2832);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };
    const loop = (t: number) => { draw(t); raf = requestAnimationFrame(loop); };

    fit(); onScroll();
    const ro = new ResizeObserver(() => { fit(); onScroll(); });
    ro.observe(canvas);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    raf = requestAnimationFrame(loop);
    return () => {
      clearTimeout(snapT);
      cancelAnimationFrame(raf); ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, [jump]);

  const p = projects[active];
  const ticks = Array.from({ length: 120 }, (_, i) => i);

  return (
    <section className="dial" id="work" ref={section} style={{ height: `${100 + (N - 1) * 75}vh` }}>
      <div className="dial-stage">
        <header className="sec-head">
          <span className="squig" aria-hidden="true">〰</span>
          <h2>Selected work</h2>
          <em>{String(active + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}</em>
        </header>

        <div className="dial-wrap">
          <svg viewBox="0 0 600 600" className="dial-svg" role="img" aria-label="Project dial">
            <defs>
              <path id="ringPath" d={`M ${C} ${C - R} a ${R} ${R} 0 1 1 0 ${2 * R} a ${R} ${R} 0 1 1 0 ${-2 * R}`} />
            </defs>
            <circle cx={C} cy={C} r={R - 34} className="ring-inner" />
            <circle cx={C} cy={C} r={R + 36} className="ring-outer" />
            <g ref={ringRef}>
              {ticks.map((i) => {
                const a = (i / 120) * Math.PI * 2 - Math.PI / 2;
                const long = i % 6 === 0;
                const r1 = R - 20, r2 = R - (long ? 34 : 27);
                return (
                  <line key={i} x1={C + Math.cos(a) * r1} y1={C + Math.sin(a) * r1}
                    x2={C + Math.cos(a) * r2} y2={C + Math.sin(a) * r2}
                    className={long ? "tick long" : "tick"} />
                );
              })}
              {projects.map((pr, i) => (
                <g key={pr.index}>
                  <text className={`lbl ${i === active ? "act" : ""}`} onClick={() => jump(i)} data-hover>
                    <textPath href="#ringPath" startOffset={`${(i / N) * 100}%`} textAnchor="middle">{pr.short}</textPath>
                  </text>
                  <text className="lbl-cat">
                    <textPath href="#ringPath" startOffset={`${((i + 0.5) / N) * 100}%`} textAnchor="middle">{pr.category}</textPath>
                  </text>
                </g>
              ))}
            </g>
            <path d={`M ${C - 7} ${C - R - 58} L ${C + 7} ${C - R - 58} L ${C} ${C - R - 46} Z`} className="pointer" />
          </svg>
          <canvas ref={cv} className={`dial-art ${p.caseStudy ? "openable" : ""}`} onClick={() => p.caseStudy && onOpen()} data-hover={p.caseStudy ? true : undefined} />
          <p className="dial-hint">Scroll to tune · click a name · ← → keys</p>
        </div>

        <article className="dial-info" key={p.index}>
          <span className="idx">{p.index} — {p.category}</span>
          <h3>{p.title}</h3>
          <p>{p.description}</p>
          {p.proof && <p className="proof">{p.proof}</p>}
          <ul className="tags">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>
          <div className="links">
            {p.caseStudy && (
              <button className="btn solid" onClick={onOpen} data-hover>
                Open full view <ArrowUpRight size={16} />
              </button>
            )}
            {p.live && (
              <a href={p.live} target="_blank" rel="noreferrer" className="btn solid" data-hover>
                {p.liveLabel ?? "Live dashboard"} <ArrowUpRight size={16} />
              </a>
            )}
            {p.github && (
              <a href={p.github} target="_blank" rel="noreferrer" className="btn" data-hover>
                <GithubIcon size={15} /> Source
              </a>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
