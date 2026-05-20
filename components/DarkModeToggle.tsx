"use client";

import { useEffect, useState } from "react";

export default function DarkModeToggle({ variant = "icon" }: { variant?: "icon" | "sidebar" }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check if user previously saved preference, else check system preference
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleDark = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  if (variant === "sidebar") {
    return (
      <button 
        onClick={toggleDark} 
        className="admin-nav-item" 
        style={{ width: "100%", background: "none", border: "none", cursor: "pointer", marginTop: "auto", marginBottom: 8 }}
      >
        <span className="admin-nav-icon material-symbols-outlined">
          {isDark ? "light_mode" : "dark_mode"}
        </span>
        {isDark ? "Light Mode" : "Dark Mode"}
      </button>
    );
  }

  // Default "icon" variant for Topbar
  return (
    <button 
      onClick={toggleDark}
      className="icon-btn"
      aria-label="Toggle dark mode"
    >
      <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
        {isDark ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
