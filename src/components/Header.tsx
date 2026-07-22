import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Compass, Sparkles, ArrowRight, Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { usePortfolio } from "../context/PortfolioContext";

export default function Header() {
  const { profile } = usePortfolio();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("hero");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isHomePage = location.pathname === "/" || location.pathname === "";

  // Highlight active section on homepage scroll
  useEffect(() => {
    if (!isHomePage) return;

    const handleScroll = () => {
      const sections = ["hero", "work", "about", "experience", "contact"];
      const scrollPosition = window.scrollY + 200; // Offset for accuracy

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Trigger initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage, location.pathname]);

  // Close mobile menu on route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (isHomePage) {
      const element = document.getElementById(targetId);
      if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
        setActiveSection(targetId);
      }
    } else {
      navigate("/", { state: { scrollTo: targetId } });
    }
  };

  // Hide header on CMS pages to keep workspace uncluttered
  if (location.pathname === "/admin") {
    return null;
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-20 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md border-b border-zinc-200/40 dark:border-zinc-800/40 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Dynamic Logo / Brand Name */}
          <Link
            to="/"
            onClick={(e) => {
              if (isHomePage) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="group flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-zinc-900 dark:text-white clickable"
          >
            {profile.logo ? (
              <img
                src={profile.logo}
                alt="Logo"
                referrerPolicy="no-referrer"
                className="h-9 max-w-[150px] object-contain rounded-md shadow-sm"
              />
            ) : (
              <>
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-sm font-mono tracking-tighter shadow-sm group-hover:scale-105 transition-transform duration-300">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : "H"}
                </span>
                <span className="font-display tracking-tight text-base font-bold uppercase">
                  {profile.name || "HANZO"}
                </span>
              </>
            )}
          </Link>

          {/* Core Navigation Anchors (Sticky across pages) */}
          <nav className="hidden md:flex items-center gap-8 select-none">
            {[
              { id: "work", label: "Work" },
              { id: "about", label: "About" },
              { id: "experience", label: "Experience" },
              { id: "contact", label: "Contact" },
            ].map((item) => {
              const isActive = isHomePage && activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleNavClick(e, item.id)}
                  className={`relative text-xs font-mono font-bold tracking-wider uppercase py-2 transition-colors duration-300 clickable ${
                    isActive
                      ? "text-primary dark:text-primary"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-primary/50 rounded-full"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Action Hub (Theme Toggle + CTA + Hamburger) */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, "contact")}
              className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-primary dark:hover:bg-primary hover:text-white dark:hover:text-white text-white dark:text-zinc-900 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 shadow-sm hover:scale-[1.03] active:scale-[0.98] clickable"
            >
              Start Project
            </a>

            {/* Mobile Hamburger Menu Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex md:hidden items-center justify-center p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed inset-x-0 top-20 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 z-30 md:hidden flex flex-col p-6 gap-6 shadow-xl"
          >
            <nav className="flex flex-col gap-4">
              {[
                { id: "work", label: "Work" },
                { id: "about", label: "About" },
                { id: "experience", label: "Experience" },
                { id: "contact", label: "Contact" },
              ].map((item) => {
                const isActive = isHomePage && activeSection === item.id;
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => handleNavClick(e, item.id)}
                    className={`text-sm font-mono font-bold tracking-wider uppercase py-2 transition-colors border-b border-zinc-100 dark:border-zinc-900 pb-2 ${
                      isActive
                        ? "text-primary"
                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>

            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, "contact")}
              className="w-full text-center py-3 bg-zinc-900 dark:bg-zinc-100 hover:bg-primary dark:hover:bg-primary hover:text-white dark:hover:text-white text-white dark:text-zinc-900 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 shadow-sm block"
            >
              Start Project
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
