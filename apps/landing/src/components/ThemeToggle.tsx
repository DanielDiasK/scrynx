import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode / Mudar para modo claro" : "Switch to dark mode / Mudar para modo escuro"}
      title={isDark ? "Light mode / Modo claro" : "Dark mode / Modo escuro"}
      className="icon-btn"
    >
      {isDark ? <Sun size={17} strokeWidth={2.2} /> : <Moon size={17} strokeWidth={2.2} />}
    </button>
  );
}
