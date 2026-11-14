import { useEffect, useState } from "react";
import { Moon, Sun, Sunrise } from "lucide-react";
import { applyTheme, currentTheme, type ThemeName } from "../theme";

const opts: { n: ThemeName; icon: typeof Sun; label: string }[] = [
  { n: "dark", icon: Moon, label: "Dark" },
  { n: "light", icon: Sun, label: "Light" },
  { n: "dawn", icon: Sunrise, label: "Dawn" },
];

export default function ThemeSwitch() {
  const [t, setT] = useState<ThemeName>(currentTheme());
  useEffect(() => {
    const on = (e: Event) => setT((e as CustomEvent<ThemeName>).detail);
    window.addEventListener("themechange", on);
    return () => window.removeEventListener("themechange", on);
  }, []);
  return (
    <div className="tsw" role="group" aria-label="Colour theme">
      {opts.map(({ n, icon: I, label }) => (
        <button key={n} className={t === n ? "on" : ""} onClick={() => applyTheme(n, true)}
          aria-pressed={t === n} aria-label={`${label} mode`} title={`${label} mode`} data-hover>
          <I size={15} />
        </button>
      ))}
    </div>
  );
}
