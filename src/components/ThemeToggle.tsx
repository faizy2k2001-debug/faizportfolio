import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial state from head-injected class
    const checkTheme = () => {
      const darkActive = document.documentElement.classList.contains("dark");
      setIsDark(darkActive);
    };

    checkTheme();

    // Setup an observer to catch external modifications to html class
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);

    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("hanzo-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("hanzo-theme", "light");
    }
  };

  return (
    <button
      id="theme-toggle-button"
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-primary dark:hover:text-primary hover:border-primary dark:hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer overflow-hidden clickable"
      aria-label="Toggle visual theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ y: 20, rotate: 40, opacity: 0 }}
            animate={{ y: 0, rotate: 0, opacity: 1 }}
            exit={{ y: -20, rotate: -40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="absolute"
          >
            <Moon className="w-5 h-5" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ y: 20, rotate: -40, opacity: 0 }}
            animate={{ y: 0, rotate: 0, opacity: 1 }}
            exit={{ y: -20, rotate: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="absolute"
          >
            <Sun className="w-5 h-5 animate-[spin_40s_linear_infinite]" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
