import Cube from "./Cube";
import { CircularBadge, Scramble } from "./Effects";
import { contact } from "../data/projects";

export default function Hero({ ready }: { ready: boolean }) {
  return (
    <section className="hero" id="top">
      <div className="hero-spot" aria-hidden="true" />
      <div className="hero-flute" aria-hidden="true" />
      <h1 className={`hero-name ${ready ? "in" : ""}`} aria-label="Parineeta Jain">
        <span className="ln"><span>Parineeta</span></span>
        <span className="ln"><span>Jain<i>.</i></span></span>
      </h1>
      <Cube ready={ready} />
      <div className={`badge-wrap ${ready ? "in" : ""}`}><CircularBadge text="OPEN TO FINANCE ROLES ✦ OPEN TO FINANCE ROLES ✦ " href="#contact" /></div>
      <div className={`hero-meta ${ready ? "in" : ""}`}>
        <div className="hero-left">
          <p className="hero-tag">Turning data into decisions,<br />and decisions into brands.</p>
          <div className="hero-cta">
            <a className="btn solid fx-mag" href="#work" data-hover><Scramble text="View my work" /> ↗</a>
            <a className="btn fx-mag" href={contact.resume} data-hover>Resume</a>
          </div>
        </div>
      </div>
      <div className={`scroll-cue ${ready ? "in" : ""}`}><span>Scroll</span><i /></div>
    </section>
  );
}
