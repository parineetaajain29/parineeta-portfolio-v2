import { Aurora, CountUp, ScrollReveal, SkillsLoop, SplitText } from "./Effects";
import { projects } from "../data/projects";
import { useEffect, useRef } from "react";

const steps = [
  { tag: "Startek Aegis · 2022", title: "Finance intern", text: "Built Excel reporting templates (+20% efficiency) and forecasting models at 90% accuracy; insights fed a 10% cut in operating expenses." },
  { tag: "Paiwand Studios · 2023–24", title: "Brand strategist", text: "Integrated campaigns lifted brand visibility 45% and online activity 30%; led a 35-person workshop with 98% positive feedback." },
  { tag: "Now", title: "Master of Global Business · SP Jain", text: "Finance specialisation: DCF, WACC and CAPM valuation models, financial modelling and quantitative analysis." },
  { tag: "Next", title: "Finance specialist", text: "Where analysis and brand thinking meet: models that make the case, and stories that make it stick." },
];

export default function About() {
  const wrap = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const sec = document.getElementById("about")!;
    const el = wrap.current!;
    const items = Array.from(el.querySelectorAll<HTMLElement>(".step"));
    const onScroll = () => {
      const vh = window.innerHeight;
      if (window.matchMedia("(max-width: 900px)").matches) {
        const r = el.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (vh * 0.6 - r.top) / r.height));
        if (line.current) line.current.style.transform = `scaleY(${p})`;
        if (head.current) head.current.style.top = `${p * 100}%`;
        items.forEach((it) => it.classList.toggle("on", it.getBoundingClientRect().top < vh * 0.7));
        return;
      }
      /* pinned: each scroll step (0.6 of a screen) reveals the next card, all stay visible */
      const y = window.scrollY - (sec.getBoundingClientRect().top + window.scrollY);
      const p = Math.min(1, Math.max(0, y / (vh * 0.6 * (items.length - 1))));
      if (line.current) line.current.style.transform = `scaleY(${p})`;
      if (head.current) head.current.style.top = `${p * 100}%`;
      items.forEach((it, k) => it.classList.toggle("on", y >= (k * 0.6 - 0.3) * vh));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);

  return (
    <section className="about" id="about">
      <Aurora />
      <div className="about-pin">
      <header className="sec-head">
        <span className="squig" aria-hidden="true">〰</span>
        <h2><SplitText text="About" /></h2>
      </header>
      <div className="about-grid">
        <div className="about-copy reveal">
          <ScrollReveal className="lead" text="A finance specialist in the making, currently pursuing a Master of Global Business at SP Jain, with a foundation in brand strategy and a growing command of financial analysis." />
          <p>
            Spent time on both sides of the table — shaping brand narratives at Paiwand Studios, now decoding
            markets, models, and money. Outside the classroom: building small tools and dashboards that turn data
            into something usable, one project at a time.
          </p>
          <div className="stats">
            <div><b><CountUp to={projects.length} /></b><span>projects</span></div>
            <div><b><CountUp to={projects.filter((p) => p.live).length} /></b><span>live apps</span></div>
            <div><b><CountUp to={1} /></b><span>case study</span></div>
          </div>
          <ul className="chips">
            {["Financial Modelling", "Advanced Excel", "DCF · WACC · CAPM", "Financial Forecasting", "Quantitative Analysis", "Brand Strategy"].map((s) => <li key={s}>{s}</li>)}
          </ul>
          <p className="certs">Certified · Financial Markets (Yale) · Everyday Excel (UC Boulder)</p>
        </div>
        <div className="timeline" ref={wrap}>
          <div className="tl-track"><div className="tl-line" ref={line} /><span className="tl-head" ref={head} /></div>
          {steps.map((s) => (
            <div className="step" key={s.tag}>
              <span className="node" />
              <div className="card">
                <small>{s.tag}</small>
                <h4>{s.title}</h4>
                <p>{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <SkillsLoop items={["Financial modelling", "Advanced Excel", "Quantitative analysis", "Brand strategy", "Valuation", "Scenario planning"]} />
      </div>
    </section>
  );
}
