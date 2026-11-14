import { Aurora, CountUp, ScrollReveal, SkillsLoop, SplitText } from "./Effects";
import { projects } from "../data/projects";
import { useEffect, useRef } from "react";

const steps = [
  { tag: "Foundation", title: "Brand strategy", text: "Learned how narratives shape what people value, long before the numbers get involved." },
  { tag: "Paiwand Studios", title: "Shaping brand narratives", text: "Worked on the creative side of the table: positioning, storytelling, and how a brand earns trust." },
  { tag: "Now", title: "Master of Global Business · SP Jain", text: "Decoding markets, models, and money — financial modelling, Advanced Excel, quantitative analysis." },
  { tag: "Next", title: "Finance specialist", text: "Where analysis and brand thinking meet: models that make the case, and stories that make it stick." },
];

export default function About() {
  const wrap = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = wrap.current!;
    const items = Array.from(el.querySelectorAll<HTMLElement>(".step"));
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.6 - r.top) / r.height));
      if (line.current) line.current.style.transform = `scaleY(${p})`;
      if (head.current) head.current.style.top = `${p * 100}%`;
      items.forEach((it) => it.classList.toggle("on", it.getBoundingClientRect().top < vh * 0.7));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);

  return (
    <section className="about" id="about">
      <Aurora />
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
            {["Financial Modelling", "Advanced Excel", "Quantitative Analysis", "Brand Strategy"].map((s) => <li key={s}>{s}</li>)}
          </ul>
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
    </section>
  );
}
