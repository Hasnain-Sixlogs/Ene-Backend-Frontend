import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getSettings, updateAppearance } from "@/services/settingsApi";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [isLoading, setIsLoading] = useState(true);

  // Get system theme preference
  const getSystemTheme = (): "light" | "dark" => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  // Apply theme to document
  const applyTheme = (themeToApply: "light" | "dark") => {
    const root = document.documentElement;
    if (themeToApply === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    setResolvedTheme(themeToApply);
  };

  // Load theme from API on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        // Try to load from localStorage first for immediate application
        const savedThemeLocal = localStorage.getItem("theme") as Theme | null;
        if (savedThemeLocal && ["light", "dark", "system"].includes(savedThemeLocal)) {
          setThemeState(savedThemeLocal);
          if (savedThemeLocal === "system") {
            applyTheme(getSystemTheme());
          } else {
            applyTheme(savedThemeLocal);
          }
          setIsLoading(false);
        }

        // Then try to load from API (for authenticated users)
        try {
          const response = await getSettings();
          if (response.success && response.data?.theme) {
            const savedTheme = response.data.theme as Theme;
            setThemeState(savedTheme);
            localStorage.setItem("theme", savedTheme);
            
            // Apply the theme
            if (savedTheme === "system") {
              const systemTheme = getSystemTheme();
              applyTheme(systemTheme);
            } else {
              applyTheme(savedTheme);
            }
          }
        } catch (apiError) {
          // API call failed (user might not be authenticated)
          // Use localStorage theme or fallback
          if (!savedThemeLocal) {
            const systemTheme = getSystemTheme();
            applyTheme(systemTheme);
            setThemeState("system");
          }
        }
      } catch (error) {
        console.error("Error loading theme:", error);
        // Fallback to system theme
        const systemTheme = getSystemTheme();
        applyTheme(systemTheme);
        setThemeState("system");
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  // Listen for system theme changes when theme is set to "system"
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      applyTheme(e.matches ? "dark" : "light");
    };

    // Set initial system theme
    applyTheme(getSystemTheme());

    // Listen for changes
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Update theme function
  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);

    // Apply theme immediately
    if (newTheme === "system") {
      const systemTheme = getSystemTheme();
      applyTheme(systemTheme);
    } else {
      applyTheme(newTheme);
    }

    // Save to backend (if authenticated)
    try {
      await updateAppearance({ theme: newTheme });
    } catch (error) {
      // Theme is still applied locally even if save fails
      // This allows theme switching on public pages too
      console.error("Error saving theme to backend:", error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

