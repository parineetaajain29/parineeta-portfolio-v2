export type ThemeName = "dark" | "light" | "dawn";

interface Tokens {
  bg: string; bg2: string; ink: string; inkRgb: string; mute: string; line: string;
  accent: string; accentRgb: string; mist: string; warn: string; onAccent: string;
  bodyBg: string; heroGlow: string; grain: string; label: string;
}

export const THEMES: Record<ThemeName, Tokens> = {
  dark: {
    bg: "#14213D", bg2: "#1b2c4f", ink: "#F4EDE0", inkRgb: "244,237,224", mute: "#9aa6c2",
    line: "rgba(244,237,224,.16)", accent: "#FF6B5B", accentRgb: "255,107,91", mist: "#b8c3de",
    warn: "#ffb09f", onAccent: "#14213D", bodyBg: "#14213D", grain: ".07", label: "Dark",
    heroGlow: "radial-gradient(ellipse 46% 56% at 64% 80%, rgba(255,107,91,.62), transparent 70%), radial-gradient(ellipse 40% 52% at 14% 42%, rgba(70,96,160,.75), transparent 70%), radial-gradient(ellipse 30% 40% at 92% 14%, rgba(48,70,128,.8), transparent 70%)",
  },
  light: {
    bg: "#F4EDE0", bg2: "#ebe2d0", ink: "#14213D", inkRgb: "20,33,61", mute: "#5b6786",
    line: "rgba(20,33,61,.16)", accent: "#E5503F", accentRgb: "229,80,63", mist: "#34508a",
    warn: "#c43a2b", onAccent: "#F4EDE0", bodyBg: "#F4EDE0", grain: ".05", label: "Light",
    heroGlow: "radial-gradient(ellipse 46% 56% at 66% 86%, rgba(255,107,91,.45), transparent 70%), radial-gradient(ellipse 40% 52% at 12% 40%, rgba(120,150,210,.35), transparent 70%)",
  },
  dawn: {
    bg: "#F4EDE0", bg2: "#ffd9c7", ink: "#14213D", inkRgb: "20,33,61", mute: "#5b5f86",
    line: "rgba(20,33,61,.18)", accent: "#D9432F", accentRgb: "217,67,47", mist: "#3a4a85",
    warn: "#b3321f", onAccent: "#F4EDE0", label: "Dawn", grain: ".05",
    bodyBg: "linear-gradient(180deg, #e9e1ef 0%, #ffd9c7 55%, #ffc4aa 100%) fixed",
    heroGlow: "none",
  },
};

/* live colours for canvas drawing, mutated on every theme change */
export const colors = { ink: "#F4EDE0", inkRgb: "244,237,224", accent: "#FF6B5B", accentRgb: "255,107,91", bg: "#14213D", mute: "#9aa6c2", mist: "#b8c3de" };

const KEY = "pj-theme";
let current: ThemeName = "dark";
export const currentTheme = () => current;

export function applyTheme(name: ThemeName, animate = false) {
  const t = THEMES[name]; if (!t) return;
  current = name;
  const r = document.documentElement;
  if (animate) { r.classList.add("theming"); window.setTimeout(() => r.classList.remove("theming"), 700); }
  const set = (k: string, v: string) => r.style.setProperty(k, v);
  set("--bg", t.bg); set("--bg2", t.bg2); set("--ink", t.ink); set("--ink-rgb", t.inkRgb); set("--mute", t.mute);
  set("--line", t.line); set("--accent", t.accent); set("--accent-rgb", t.accentRgb); set("--mist", t.mist);
  set("--warn", t.warn); set("--on-accent", t.onAccent); set("--body-bg", t.bodyBg); set("--hero-glow", t.heroGlow); set("--grain", t.grain);
  r.setAttribute("data-theme", name);
  Object.assign(colors, { ink: t.ink, inkRgb: t.inkRgb, accent: t.accent, accentRgb: t.accentRgb, bg: t.bg, mute: t.mute, mist: t.mist });
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", t.bg);
  try { localStorage.setItem(KEY, name); } catch { /* storage unavailable */ }
  window.dispatchEvent(new CustomEvent("themechange", { detail: name }));
}

export function initTheme() {
  let saved: string | null = null;
  try { saved = localStorage.getItem(KEY); } catch { /* ignore */ }
  applyTheme(saved === "light" || saved === "dawn" || saved === "dark" ? saved : "dark");
}
