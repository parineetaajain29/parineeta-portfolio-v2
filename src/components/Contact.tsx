import { useEffect, useRef } from "react";
import { ArrowUpRight, FileText, Mail } from "lucide-react";
import { contact } from "../data/projects";
import { Aurora, CopyEmail, Scramble } from "./Effects";
import { GithubIcon, LinkedinIcon } from "./BrandIcons";

const rows = [
  { label: "Email", value: contact.email, href: `mailto:${contact.email}`, icon: <Mail size={20} /> },
  { label: "LinkedIn", value: "parineeta-jain292002", href: contact.linkedin, icon: <LinkedinIcon size={20} /> },
  { label: "GitHub", value: "parineetaajain29", href: contact.github, icon: <GithubIcon size={20} /> },
  { label: "Resume", value: "Download PDF", href: contact.resume, icon: <FileText size={20} /> },
];

export default function Contact() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver(([e]) => el.classList.toggle("seen", e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    const mv = (e: PointerEvent) => {
      el.querySelectorAll<HTMLElement>(".row").forEach((r) => {
        const b = r.getBoundingClientRect();
        r.style.setProperty("--mx", `${e.clientX - b.left}px`);
        r.style.setProperty("--my", `${e.clientY - b.top}px`);
      });
    };
    el.addEventListener("pointermove", mv);
    return () => { io.disconnect(); el.removeEventListener("pointermove", mv); };
  }, []);

  const word = (w: string, o: number) =>
    w.split("").map((c, i) => <span key={i} style={{ transitionDelay: `${(o + i) * 45}ms` }}>{c}</span>);

  return (
    <section className="contact" id="contact" ref={ref}>
      <Aurora className="strong" />
      <h2 className="big" aria-label="Let's talk.">
        <span className="line">{word("Let’s", 0)}</span>
        <span className="line">{word("talk.", 5)}</span>
      </h2>
      <div className="ctas">
        <CopyEmail email={contact.email} />
        <a className="btn solid fx-mag" href={`mailto:${contact.email}`} data-hover><Scramble text="Send an email" /> ↗</a>
      </div>
      <div className="rows">
        {rows.map((r) => (
          <a key={r.label} className="row" href={r.href} target={r.href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer" {...(r.label === "Resume" ? { download: true } : {})} data-hover>
            <span className="ic">{r.icon}</span>
            <span className="lab">{r.label}</span>
            <span className="val">{r.value}</span>
            <ArrowUpRight className="arr" size={26} />
          </a>
        ))}
      </div>
      <footer>
        <span>© 2026 Parineeta Jain</span>
        <span>Turning data into decisions, and decisions into brands.</span>
        <a className="totop fx-mag" href="#top" data-hover aria-label="Back to top">↑</a>
      </footer>
    </section>
  );
}
