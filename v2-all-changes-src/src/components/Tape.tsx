import { useEffect, useRef } from "react";

const items = ["Financial modelling", "Advanced Excel", "Quantitative analysis", "Brand strategy", "Valuation", "Scenario planning"];

/* marquee that speeds up and skews with scroll velocity (ReactBits "Scroll Velocity") */
export default function Tape() {
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = track.current!; let x = 0, raf = 0, last = scrollY, vel = 0, dir = 1;
    const loop = () => {
      const d = scrollY - last; last = scrollY; vel += (d - vel) * 0.12;
      if (Math.abs(d) > 0.5) dir = d > 0 ? 1 : -1;
      x -= (1.1 + Math.min(14, Math.abs(vel) * 0.7)) * dir;
      const half = el.scrollWidth / 2;
      if (x <= -half) x += half; if (x > 0) x -= half;
      el.style.transform = `translateX(${x}px) skewX(${Math.max(-12, Math.min(12, -vel * 0.35))}deg)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop); return () => cancelAnimationFrame(raf);
  }, []);
  const row = [...items, ...items, ...items, ...items];
  return (
    <div className="tape" aria-hidden="true">
      <div className="tape-track" ref={track}>
        {row.map((t, i) => <span key={i} className={i % 2 ? "o" : ""}>{t}<b>✦</b></span>)}
      </div>
    </div>
  );
}
