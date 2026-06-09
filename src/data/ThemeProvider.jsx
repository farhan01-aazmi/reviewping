import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../config/supabase";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("rp-theme") === "dark";
  });

  // On mount, load theme preference from DB if user is logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase.from("profiles").select("theme_pref")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => {
            if (data?.theme_pref === "dark" || data?.theme_pref === "light") {
              setIsDark(data.theme_pref === "dark");
            }
          })
          .catch(() => { /* no-op: preference not yet saved */ });
      }
    });
  }, []);

  // Sync to localStorage whenever isDark changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    localStorage.setItem("rp-theme", isDark ? "dark" : "light");
  }, [isDark]);

  // Sync to DB whenever isDark changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase.from("profiles")
          .update({ theme_pref: isDark ? "dark" : "light" })
          .eq("id", session.user.id)
          .then(({ error }) => {
            if (error) console.error("Failed to save theme pref:", error);
          });
      }
    });
  }, [isDark]);

  const toggleDark = useCallback(() => setIsDark((p) => !p), []);

  return (
    <ThemeContext.Provider value={{ isDark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
