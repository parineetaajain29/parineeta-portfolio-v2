import { useEffect, useRef, useState, type RefObject } from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { colors } from "../theme";
import ThemeSwitch from "./ThemeSwitch";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

/* progress (0..1) of a tall, sticky-pinned section inside the overlay scroller */
function usePin(scroller: RefObject<HTMLDivElement | null>) {
  const ref = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    const sc = scroller.current, el = ref.current;
    if (!sc || !el) return;
    let raf = 0;
    const calc = () => {
      raf = 0;
      const r = el.getBoundingClientRect(), s = sc.getBoundingClientRect();
      setP(clamp((s.top - r.top) / Math.max(1, r.height - s.height)));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(calc); };
    sc.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    calc();
    return () => { sc.removeEventListener("scroll", on); window.removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, [scroller]);
  return [ref, p] as const;
}

/* ───────────── ambient glyph field (hero) ───────────── */
function Glyphs() {
  const cv = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = cv.current!, ctx = c.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, raf = 0;
    const words = ["AED", "%", "45d", "Σ", "1.60", "PD", "3.00", "↗"];
    const gl = Array.from({ length: 46 }, (_, i) => ({ x: Math.random(), y: Math.random(), s: 10 + Math.random() * 16, v: 0.02 + Math.random() * 0.05, w: words[i % words.length], a: 0.05 + Math.random() * 0.13 }));
    const fit = () => { const r = c.getBoundingClientRect(); W = r.width; H = r.height; c.width = W * 2; c.height = H * 2; };
    const draw = () => {
      ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.clearRect(0, 0, W, H);
      for (const g of gl) {
        if (!reduce) { g.y -= g.v / 60; if (g.y < -0.05) { g.y = 1.05; g.x = Math.random(); } }
        ctx.font = `500 ${g.s}px "JetBrains Mono", monospace`;
        ctx.fillStyle = `rgba(${colors.accentRgb},${g.a})`;
        ctx.fillText(g.w, g.x * W, g.y * H);
      }
      raf = requestAnimationFrame(draw);
    };
    fit(); draw();
    const ro = new ResizeObserver(fit); ro.observe(c);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={cv} className="ac-glyphs" aria-hidden="true" />;
}

/* ───────────── 01 · the cash gap ───────────── */
function Gap({ scroller }: { scroller: RefObject<HTMLDivElement | null> }) {
  const [ref, p] = usePin(scroller);
  const days = Math.round(ease(seg(p, 0.08, 0.92)) * 120);
  const gap = Math.max(0, days - 45);
  const pct = (d: number) => `${(d / 120) * 100}%`;
  return (
    <section className="ac-pin" ref={ref} style={{ height: "280vh" }}>
      <div className="ac-sticky ac-center">
        <span className="ac-kick">01 — The problem</span>
        <h2 className="ac-h">A seller’s cash runs on <em>45 days</em>.<br />Buyers pay in <em>{days < 60 ? "60–120" : days}</em>.</h2>
        <div className="gap">
          <div className="gap-track">
            {[0, 30, 60, 90, 120].map((d) => <i key={d} style={{ left: pct(d) }}><b>{d}</b></i>)}
            <div className="gap-fill" style={{ left: pct(45), width: `calc(${pct(Math.max(0, days - 45))})` }} />
            <div className="gap-m need" style={{ left: pct(45) }}><span>cash needed · day 45</span></div>
            <div className="gap-m pay" style={{ left: pct(days) }}><span style={{ transform: `translateX(${-100 * Math.min(1, Math.max(0, (days - 6) / 80))}%)` }}>buyer pays · day {days}</span></div>
          </div>
          <div className="gap-num"><b>{gap}</b><small>days of working capital stuck in an invoice</small></div>
        </div>
        <p className="ac-sub">Banks take weeks to assess a small seller on invoice terms like these. Aval closes the gap from inside the marketplace, using data the platform already has.</p>
      </div>
    </section>
  );
}

/* ───────────── 02 · the money flow ───────────── */
type N = { id: string; x: number; y: number; w: number; label: string; sub: string };
const nodes: N[] = [
  { id: "lender", x: 0.5, y: 0.1, w: 0.2, label: "LICENSED PARTNER", sub: "lender of record" },
  { id: "aval", x: 0.5, y: 0.4, w: 0.16, label: "AVAL", sub: "scores · originates" },
  { id: "seller", x: 0.2, y: 0.66, w: 0.16, label: "SELLER", sub: "SME" },
  { id: "buyer", x: 0.8, y: 0.66, w: 0.16, label: "BUYER", sub: "pays on terms" },
  { id: "pay", x: 0.5, y: 0.86, w: 0.28, label: "PLATFORM SETTLEMENTS", sub: "deducted at source" },
];
const edges: Record<string, [string, string, string]> = {
  inv: ["seller", "buyer", "invoice"],
  data: ["seller", "aval", "sales data"],
  req: ["aval", "lender", "advance request"],
  adv: ["lender", "seller", "80% advance"],
  paid: ["buyer", "pay", "day-45 payment"],
  rep: ["pay", "lender", "advance + fee"],
  rest: ["pay", "seller", "the rest"],
};
const flowSteps = [
  { t: "Sell on the marketplace", d: "The seller invoices a buyer on 45-day terms. Sales data flows to Aval as it always has, now put to work.", on: ["inv", "data"] },
  { t: "Score, then fund", d: "Aval prices the invoice. The licensed partner advances up to 80% of its value within the limit.", on: ["req", "adv"] },
  { t: "Buyer pays the platform", d: "On day 45 the buyer settles with the marketplace, not with the seller.", on: ["paid"] },
  { t: "Repaid at source", d: "Advance and fee are deducted first. Whatever remains goes to the seller, and the limit is back.", on: ["rep", "rest"] },
];

function Flow({ scroller }: { scroller: RefObject<HTMLDivElement | null> }) {
  const [ref, p] = usePin(scroller);
  const step = Math.min(flowSteps.length - 1, Math.floor(p * flowSteps.length));
  const stepRef = useRef(0); stepRef.current = step;
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = cv.current!, ctx = c.getContext("2d")!;
    let W = 0, H = 0, raf = 0, dpr = 1;
    const fit = () => { const r = c.getBoundingClientRect(); W = r.width; H = r.height; dpr = Math.min(window.devicePixelRatio || 1, 2); c.width = W * dpr; c.height = H * dpr; };
    const pos = (id: string) => { const n = nodes.find((m) => m.id === id)!; return { x: n.x * W, y: n.y * H, n }; };
    const draw = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      const act = flowSteps[stepRef.current].on;
      const hot = new Set(act.flatMap((k) => [edges[k][0], edges[k][1]]));
      // marketplace box
      ctx.setLineDash([6, 7]); ctx.strokeStyle = `rgba(${colors.inkRgb},.22)`; ctx.lineWidth = 1;
      const bx = W * 0.04, by = H * 0.27, bw = W * 0.92, bh = H * 0.72;
      ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 16); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = `rgba(${colors.inkRgb},.4)`; ctx.font = '500 10px "JetBrains Mono", monospace';
      ctx.fillText("B2B MARKETPLACE", bx + 14, by + 20);
      // edges
      for (const [k, [a, b, lab]] of Object.entries(edges)) {
        const A = pos(a), B = pos(b), on = act.includes(k);
        ctx.strokeStyle = on ? `rgba(${colors.accentRgb},.7)` : `rgba(${colors.inkRgb},.1)`;
        ctx.lineWidth = on ? 1.4 : 1;
        ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
        if (on) {
          const len = Math.hypot(B.x - A.x, B.y - A.y), n = Math.max(6, Math.round(len / 26));
          for (let i = 0; i < n; i++) {
            const f = ((i / n) + t / 2200) % 1;
            const x = A.x + (B.x - A.x) * f, y = A.y + (B.y - A.y) * f;
            ctx.fillStyle = `rgba(${colors.accentRgb},${0.25 + 0.75 * Math.sin(f * Math.PI)})`;
            ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 6.3); ctx.fill();
          }
          ctx.fillStyle = colors.accent; ctx.font = '500 10px "JetBrains Mono", monospace'; ctx.textAlign = "center";
          ctx.fillText(lab.toUpperCase(), (A.x + B.x) / 2, (A.y + B.y) / 2 - 8); ctx.textAlign = "left";
        }
      }
      // nodes
      for (const n of nodes) {
        const nx = n.x * W, ny = n.y * H, w = Math.max(n.w * W, 96), h = 46, on = hot.has(n.id);
        ctx.fillStyle = colors.bg; ctx.strokeStyle = on ? colors.accent : `rgba(${colors.inkRgb},.28)`;
        ctx.shadowColor = `rgba(${colors.accentRgb},.55)`; ctx.shadowBlur = on ? 18 : 0; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.roundRect(nx - w / 2, ny - h / 2, w, h, 12); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
        ctx.textAlign = "center";
        ctx.fillStyle = on ? colors.accent : colors.ink; ctx.font = `700 ${n.id === "aval" ? 15 : 11}px "Inter", sans-serif`;
        ctx.fillText(n.label, nx, ny - 2);
        ctx.fillStyle = colors.mute; ctx.font = '400 9.5px "JetBrains Mono", monospace';
        ctx.fillText(n.sub, nx, ny + 13); ctx.textAlign = "left";
      }
      raf = requestAnimationFrame(draw);
    };
    fit(); raf = requestAnimationFrame(draw);
    const ro = new ResizeObserver(fit); ro.observe(c);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  const jump = (i: number) => {
    const sc = scroller.current, el = ref.current;
    if (!sc || !el) return;
    const top = sc.scrollTop + el.getBoundingClientRect().top - sc.getBoundingClientRect().top;
    const range = el.offsetHeight - sc.clientHeight;
    sc.scrollTo({ top: top + ((i + 0.5) / flowSteps.length) * range, behavior: "smooth" });
  };
  return (
    <section className="ac-pin" ref={ref} style={{ height: "420vh" }}>
      <div className="ac-sticky ac-split">
        <div className="ac-text">
          <span className="ac-kick">02 — How the money moves</span>
          <h2 className="ac-h sm">Repaid at the moment the buyer pays.</h2>
          <ol className="ac-steps">
            {flowSteps.map((s, i) => (
              <li key={s.t} className={i === step ? "on" : i < step ? "past" : ""} role="button" tabIndex={0} data-hover onClick={() => jump(i)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); jump(i); } }}>
                <span className="n">{String(i + 1).padStart(2, "0")}</span>
                <div><strong>{s.t}</strong><p>{s.d}</p></div>
              </li>
            ))}
          </ol>
        </div>
        <div className="ac-visual"><canvas ref={cv} className="ac-flow" /></div>
      </div>
    </section>
  );
}

/* ───────────── 03 · risk → price ───────────── */
const signals: [string, number][] = [["Settlement volatility", 0.35], ["Buyer concentration", 0.5], ["Dispute rate", 0.78], ["Tenure on platform", 0.42]];
const logistic = (x: number) => 1 / (1 + Math.exp(x));

function Risk({ scroller }: { scroller: RefObject<HTMLDivElement | null> }) {
  const [ref, p] = usePin(scroller);
  const X = 8, FINAL = Math.log(1 / 0.0042 - 1); // score at which PD = 0.42%
  const cx = ease(seg(p, 0.1, 0.85)) * FINAL;
  const sx = (x: number) => 40 + (x / X) * 520, sy = (y: number) => 30 + (1 - y) * 250;
  const pts: string[] = [];
  for (let i = 0; i <= 80; i++) { const x = (i / 80) * X; pts.push(`${i ? "L" : "M"}${sx(x).toFixed(1)} ${sy(logistic(x)).toFixed(1)}`); }
  const pd = logistic(cx) * 100;
  const done = seg(p, 0.85, 0.97);
  return (
    <section className="ac-pin" ref={ref} style={{ height: "300vh" }}>
      <div className="ac-sticky ac-split">
        <div className="ac-text">
          <span className="ac-kick">03 — Pricing the risk</span>
          <h2 className="ac-h sm">A handful of platform signals become one probability.</h2>
          <ul className="sig">
            {signals.map(([n, v], i) => (
              <li key={n}><span>{n}</span><i><b style={{ width: `${v * 100 * ease(seg(p, i * 0.08, 0.35 + i * 0.08))}%` }} /></i></li>
            ))}
            <li className="more"><span>+ 5 more signals</span></li>
          </ul>
          <p className="ac-fine">Hand-weighted scorecard on synthetic data. Not yet validated.</p>
        </div>
        <div className="ac-visual">
          <svg viewBox="0 0 600 340" className="curve" role="img" aria-label="Logistic curve mapping score to probability of default">
            <defs><clipPath id="cc"><rect x="0" y="0" width={sx(cx) - 0} height="340" /></clipPath></defs>
            <line x1="40" y1="280" x2="570" y2="280" className="ax" /><line x1="40" y1="20" x2="40" y2="280" className="ax" />
            <text x="46" y="26" className="axl">PD</text><text x="570" y="298" textAnchor="end" className="axl">SCORE → SAFER</text>
            <path d={pts.join(" ")} className="c-bg" />
            <path d={pts.join(" ")} className="c-fg" clipPath="url(#cc)" />
            <line x1={sx(cx)} y1={sy(logistic(cx))} x2={sx(cx)} y2="280" className="drop" />
            <circle cx={sx(cx)} cy={sy(logistic(cx))} r="6" className="pt" />
            <text x="300" y="70" textAnchor="middle" className="formula">PD = 1 / (1 + e^score)</text>
          </svg>
          <div className="pd-read"><small>probability of default · 45-day tenor</small><b>{pd < 10 ? pd.toFixed(2) : pd.toFixed(0)}%</b></div>
          <div className="pd-tag" style={{ opacity: done, transform: `translateY(${(1 - done) * 10}px)` }}>PD ≈ 0.42%</div>
        </div>
      </div>
    </section>
  );
}

function Price({ scroller }: { scroller: RefObject<HTMLDivElement | null> }) {
  const [ref, p] = usePin(scroller);
  const parts = [
    { k: "el", v: 0.147, lab: "0.147%", a: 0.0, b: 0.2, cls: "s1", name: "Expected loss" },
    { k: "coc", v: 1.455, lab: "1.455%", a: 0.2, b: 0.42, cls: "s2", name: "Capital cost" },
    { k: "plat", v: 0.4, lab: "0.40%", a: 0.5, b: 0.62, cls: "s3", name: "Marketplace" },
    { k: "aval", v: 1.0, lab: "1.00%", a: 0.62, b: 0.78, cls: "s4", name: "Aval" },
  ];
  const lines = [
    [0.04, <>PD <b>0.42%</b> × LGD <b>35%*</b> = <b>0.147%</b> expected loss</>],
    [0.22, <>+ cost of capital <b>11.8%</b> × 45/365 = <b>1.455%</b></>],
    [0.42, <>= partner needs about <b className="hl">1.60%</b></>],
    [0.5, <>+ marketplace share <b>0.40%</b></>],
    [0.62, <>+ Aval <b>1.00%</b></>],
    [0.8, <>= <b className="big3">3.00% flat</b></>],
  ] as const;
  return (
    <section className="ac-pin" ref={ref} style={{ height: "340vh" }}>
      <div className="ac-sticky ac-split">
        <div className="ac-text">
          <span className="ac-kick">04 — Pricing the advance</span>
          <h2 className="ac-h sm">One flat fee, built from the bottom up.</h2>
          <ul className="build">
            {lines.map(([at, node], i) => <li key={i} style={{ opacity: ease(seg(p, at, at + 0.08)), transform: `translateX(${(1 - ease(seg(p, at, at + 0.08))) * 18}px)` }}>{node}</li>)}
          </ul>
          <p className="ac-fine" style={{ opacity: seg(p, 0.85, 0.95) }}>≈ 24.3% APR simple, ~27% effective, on a 45-day advance. *LGD is an assumption; all figures synthetic.</p>
        </div>
        <div className="ac-visual stackwrap">
          <div className="stack3">
            {parts.map((s) => <div key={s.k} className={`seg ${s.cls}`} style={{ flexGrow: s.v, opacity: 0.25 + 0.75 * ease(seg(p, s.a, s.b)), transform: `scaleY(${ease(seg(p, s.a, s.b))})` }}><span>{s.name} {s.lab}</span></div>)}
          </div>
          <div className="stack-total" style={{ opacity: seg(p, 0.78, 0.9) }}>3.00%</div>
        </div>
      </div>
    </section>
  );
}

/* ───────────── 05 · live prototype ───────────── */
const protoSteps = [
  { t: "Home", d: "A pre-approved limit already sits inside the seller’s marketplace app." },
  { t: "Invoices", d: "Any open invoice can be advanced, up to 80% of its value." },
  { t: "Credit", d: "The limit, price and the 3.00% split are explained. Dashed outlines mark what Aval provides." },
  { t: "Advance", d: "Three permissions, one confirmation, and the advance is taken." },
  { t: "Repayment", d: "Simulate the buyer paying: repaid at source, the limit returns." },
];
const q = (d: Document, s: string) => d.querySelector<HTMLElement>(s);
const click = (d: Document, s: string) => q(d, s)?.click();
function play(d: Document, n: number) {
  click(d, "#pReset");
  const mark = q(d, "#pMark"), on = mark?.classList.contains("on");
  if (n >= 2 && !on) mark?.click();
  if (n < 2 && on) mark?.click();
  if (n === 1) click(d, '[data-a="tab"][data-v="invoices"]');
  if (n === 2) click(d, '[data-a="tab"][data-v="credit"]');
  if (n >= 3) {
    click(d, '[data-a="tab"][data-v="account"]');
    ["c0", "c1", "c2"].forEach((c) => click(d, `[data-a="${c}"]`));
    click(d, '[data-a="tab"][data-v="home"]');
    click(d, 'button[data-a="flow"]'); click(d, '[data-a="fpick"]'); click(d, '[data-a="fnext"]'); click(d, '[data-a="fgo"]'); click(d, '[data-a="fact"]');
  }
  if (n >= 4) click(d, '[data-a="pay"]');
}

function Proto({ scroller }: { scroller: RefObject<HTMLDivElement | null> }) {
  const [ref, p] = usePin(scroller);
  const step = Math.min(protoSteps.length - 1, Math.floor(p * protoSteps.length));
  const frame = useRef<HTMLIFrameElement>(null);
  const loaded = useRef(false);
  const last = useRef(-1);
  const apply = (n: number) => {
    const d = frame.current?.contentDocument;
    if (d && loaded.current && last.current !== n) { last.current = n; try { play(d, n); } catch { /* ignore */ } }
  };
  useEffect(() => { apply(step); });
  const jump = (i: number) => {
    const sc = scroller.current, el = ref.current;
    if (!sc || !el) return;
    const top = sc.scrollTop + el.getBoundingClientRect().top - sc.getBoundingClientRect().top;
    const range = el.offsetHeight - sc.clientHeight;
    sc.scrollTo({ top: top + ((i + 0.5) / protoSteps.length) * range, behavior: "smooth" });
  };
  return (
    <section className="ac-pin" ref={ref} style={{ height: "380vh" }}>
      <div className="ac-sticky ac-split rev">
        <div className="ac-visual phonewrap">
          <div className="ac-phone">
            <i className="notch" aria-hidden="true" />
            <iframe ref={frame} src="/aval/" title="Aval clickable prototype" onLoad={() => { loaded.current = true; apply(step); }} />
          </div>
        </div>
        <div className="ac-text">
          <span className="ac-kick">05 — Try it</span>
          <h2 className="ac-h sm">The seller’s side, as a working prototype.</h2>
          <ol className="ac-steps">
            {protoSteps.map((s, i) => (
              <li key={s.t} className={i === step ? "on" : i < step ? "past" : ""} role="button" tabIndex={0} data-hover onClick={() => jump(i)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); jump(i); } }}>
                <span className="n">{String(i + 1).padStart(2, "0")}</span>
                <div><strong>{s.t}</strong><p>{s.d}</p></div>
              </li>
            ))}
          </ol>
          <div className="ac-cta">
            <a className="btn solid" href="/aval/" target="_blank" rel="noreferrer" data-hover>Open full prototype <ArrowUpRight size={16} /></a>
            <p className="ac-fine">Click a step or scroll to follow the story, or tap inside the phone to take over.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────── shell ───────────── */
export default function AvalCase({ onClose }: { onClose: () => void }) {
  const sc = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);
  const [prog, setProg] = useState(0);
  const close = () => { setClosing(true); setTimeout(onClose, 520); };

  useEffect(() => {
    const el = sc.current!;
    el.focus();
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    const on = () => setProg(el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight));
    window.addEventListener("keydown", key);
    el.addEventListener("scroll", on, { passive: true });
    return () => { window.removeEventListener("keydown", key); el.removeEventListener("scroll", on); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`ac ${closing ? "closing" : ""}`} ref={sc} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Aval case study">
      <div className="ac-bar">
        <button onClick={close} data-hover className="ac-back"><ArrowLeft size={16} /> Back to work</button>
        <span className="ac-bar-t">Aval · case study</span>
        <ThemeSwitch />
        <i className="ac-prog" style={{ transform: `scaleX(${prog})` }} />
      </div>

      <header className="ac-hero">
        <Glyphs />
        <span className="ac-kick">06 — Embedded finance · group pitch</span>
        <h1>Aval<span>.</span></h1>
        <p className="ac-tag">Credit that settles itself.</p>
        <p className="ac-lead">
          Working-capital advances for SMEs, offered inside the B2B marketplaces they already sell on. Aval is the
          technology and origination layer on a licensed balance-sheet partner, repaid at source when the buyer pays.
        </p>
        <ul className="ac-chips">
          {["FinTech Shark Tank", "Conceived by me · pitched as a group", "UAE launch → GCC", "SP Jain"].map((c) => <li key={c}>{c}</li>)}
        </ul>
        <div className="ac-down"><span>Scroll</span><i /></div>
      </header>

      <Gap scroller={sc} />
      <Flow scroller={sc} />
      <Risk scroller={sc} />
      <Price scroller={sc} />
      <Proto scroller={sc} />

      <footer className="ac-end">
        <h2>That’s Aval.</h2>
        <div className="links">
          <button className="btn solid" onClick={close} data-hover><ArrowLeft size={16} /> Back to the wheel</button>
          <a className="btn" href="/aval/" target="_blank" rel="noreferrer" data-hover>Open prototype <ArrowUpRight size={16} /></a>
        </div>
        <p className="ac-fine">Academic concept for the FinTech Shark Tank assignment, SP Jain School of Global Management. Seller, platform and all figures are synthetic; no real lending takes place.</p>
      </footer>
    </div>
  );
}
