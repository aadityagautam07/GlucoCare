"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("light");
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    // Read persisted theme from localStorage
    const saved = localStorage.getItem("glucocare_theme") as Theme | null;
    const initialTheme: Theme = saved || "light";
    setThemeState(initialTheme);
  }, []);

  React.useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add("dark");
        if (typeof document !== "undefined" && document.body) {
          document.body.classList.add("dark");
        }
        setResolvedTheme("dark");
      } else {
        root.classList.remove("dark");
        if (typeof document !== "undefined" && document.body) {
          document.body.classList.remove("dark");
        }
        setResolvedTheme("light");
      }
    };

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      applyTheme(mediaQuery.matches);

      const listener = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    } else {
      applyTheme(theme === "dark");
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("glucocare_theme", newTheme);
    } catch {
      // ignore
    }
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
