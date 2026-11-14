import { useEffect } from "react";

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* Page-to-page snapping: every scroll gesture jumps to the next stop with a fixed-length move.
   Stops = hero, each project on the wheel, steps through About, Contact. Desktop pointers only. */
export function useSnapScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia("(hover: none), (max-width: 900px)").matches) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animating = false, lastWheel = 0, lastAbs = 0, raf = 0, settle = 0;

    const topOf = (sel: string) => { const el = document.querySelector<HTMLElement>(sel); return el ? el.getBoundingClientRect().top + scrollY : null; };
    const targets = () => {
      const vh = innerHeight, max = document.documentElement.scrollHeight - vh, t: number[] = [0];
      const dial = document.querySelector<HTMLElement>("#work"), d = topOf("#work");
      if (dial && d != null) { const n = Math.round((dial.offsetHeight / vh - 1) / 0.75) + 1; for (let i = 0; i < n; i++) t.push(d + i * 0.75 * vh); }
      const about = document.querySelector<HTMLElement>("#about"), a = topOf("#about");
      if (about && a != null) {
        const end = a + about.offsetHeight - vh; t.push(a);
        for (let y = a + vh * 0.9; y < end - vh * 0.3; y += vh * 0.9) t.push(y);
        if (end > a + vh * 0.3) t.push(end);
      }
      const c = topOf("#contact"); if (c != null) t.push(c);
      return [...new Set(t.map((v) => Math.round(Math.min(max, Math.max(0, v)))))].sort((p, q) => p - q);
    };

    const animateTo = (to: number) => {
      cancelAnimationFrame(raf);
      const from = scrollY;
      if (Math.abs(to - from) < 2) return;
      const dur = reduce ? 1 : Math.min(1100, Math.max(650, Math.abs(to - from) * 0.4)), t0 = performance.now();
      animating = true;
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / dur);
        window.scrollTo({ top: from + (to - from) * ease(p), behavior: "instant" as ScrollBehavior });
        if (p < 1) raf = requestAnimationFrame(step);
        else { animating = false; lastWheel = performance.now(); }
      };
      raf = requestAnimationFrame(step);
    };
    const go = (dir: 1 | -1) => {
      const ts = targets(), y = scrollY;
      const to = dir > 0 ? ts.find((v) => v > y + 6) : [...ts].reverse().find((v) => v < y - 6);
      if (to != null) animateTo(to);
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || document.body.style.overflow === "hidden") return;
      if ((e.target as HTMLElement | null)?.closest?.(".ac")) return;
      e.preventDefault();
      const now = performance.now(), abs = Math.abs(e.deltaY);
      const fresh = now - lastWheel > 150 || abs > lastAbs * 1.6;   // a new gesture, not the tail of the last one
      lastAbs = abs; lastWheel = now;
      if (animating || abs < 3 || !fresh) return;
      go(e.deltaY > 0 ? 1 : -1);
    };
    const onKey = (e: KeyboardEvent) => {
      if (document.body.style.overflow === "hidden") return;
      const el = e.target as HTMLElement | null;
      if (el?.closest?.("input,textarea,select,.ac")) return;
      const space = e.key === " " && !el?.closest?.("button,a");
      if (e.key === "PageDown" || (space && !e.shiftKey)) { e.preventDefault(); if (!animating) go(1); }
      else if (e.key === "PageUp" || (space && e.shiftKey)) { e.preventDefault(); if (!animating) go(-1); }
      else if (e.key === "Home") { e.preventDefault(); animateTo(0); }
      else if (e.key === "End") { e.preventDefault(); const ts = targets(); animateTo(ts[ts.length - 1]); }
    };
    /* if anything leaves the page between stops (scrollbar drag, anchor jump), settle on the nearest stop */
    const onScroll = () => {
      clearTimeout(settle);
      settle = window.setTimeout(() => {
        if (animating || document.body.style.overflow === "hidden") return;
        const ts = targets(), y = scrollY, near = ts.reduce((b, v) => (Math.abs(v - y) < Math.abs(b - y) ? v : b), ts[0]);
        if (Math.abs(near - y) > 8) animateTo(near);
      }, 280);
    };

    addEventListener("wheel", onWheel, { passive: false });
    addEventListener("keydown", onKey);
    addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); clearTimeout(settle); removeEventListener("wheel", onWheel); removeEventListener("keydown", onKey); removeEventListener("scroll", onScroll); };
  }, [enabled]);
}
