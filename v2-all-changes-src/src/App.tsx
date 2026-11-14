import { useCallback, useEffect, useState } from "react";
import Intro from "./components/Intro";
import Cursor from "./components/Cursor";
import Hero from "./components/Hero";
import Tape from "./components/Tape";
import ThemeSwitch from "./components/ThemeSwitch";
import AvalCase from "./components/AvalCase";
import Dial from "./components/Dial";
import About from "./components/About";
import Contact from "./components/Contact";
import { ClickSpark, Scramble, useFx } from "./components/Effects";
import { useSnapScroll } from "./components/Snap";

export default function App() {
  const [ready, setReady] = useState(false);
  const [caseOpen, setCaseOpen] = useState(false);
  useFx();
  const [past, setPast] = useState(false);
  useEffect(() => { const f = () => setPast(scrollY > innerHeight - 90); f(); addEventListener("scroll", f, { passive: true }); return () => removeEventListener("scroll", f); }, []);
  const done = useCallback(() => setReady(true), []);
  useSnapScroll(ready && !caseOpen);

  useEffect(() => {
    document.body.style.overflow = ready && !caseOpen ? "" : "hidden";
  }, [ready, caseOpen]);

  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")), { threshold: 0.2 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <Intro onDone={done} />
      <Cursor />
      <ClickSpark />
      <nav className={`nav ${ready ? "in" : ""} ${past ? "past" : ""}`}>
        <a href="#top" className="logo" data-hover><span className="mark">〰</span> Parineeta Jain</a>
        <div>
          <div className="navpill">
            <a href="#work" data-hover><Scramble text="Work" /></a>
            <a href="#about" data-hover><Scramble text="About" /></a>
            <a href="#contact" data-hover className="cta"><Scramble text="Contact" /></a>
          </div>
          <ThemeSwitch />
        </div>
      </nav>
      <main>
        <Hero ready={ready} />
        <Tape />
        <Dial onOpen={() => setCaseOpen(true)} />
        <About />
        <Contact />
      </main>
      {caseOpen && <AvalCase onClose={() => setCaseOpen(false)} />}
    </>
  );
}
