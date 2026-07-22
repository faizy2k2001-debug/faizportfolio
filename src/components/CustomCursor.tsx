import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export default function CustomCursor() {
  const [hovered, setHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  // High performance Motion Values to bypass React re-render cycle
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Elastic Spring physics for realistic delayed organic trailing
  const springConfig = { damping: 40, stiffness: 400, mass: 0.4 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    // 1. Detect if the device has a mouse pointer (fine resolution)
    const mediaQuery = window.matchMedia("(pointer: fine)");
    setIsMobile(!mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsMobile(!e.matches);
    };
    mediaQuery.addEventListener("change", handleMediaChange);

    if (!mediaQuery.matches) return;

    // 2. Track Mouse Movement
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    // 3. Track Mouse Leave Window Boundaries
    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // 4. Track Clickable Element Hover States using high-performance Event Delegation (no memory leaks)
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable = target.closest('a, button, [role="button"], input, textarea, select, .clickable');
        setHovered(!!isClickable);
      }
    };

    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseover", handleMouseOver);
    
    // Add custom cursor class to document element for global custom styling
    document.documentElement.classList.add("custom-cursor-active");

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseover", handleMouseOver);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, [isVisible, cursorX, cursorY]);

  if (isMobile || !isVisible) return null;

  return (
    <>
      {/* Interactive Floating Dot Core */}
      <motion.div
        className="fixed top-0 left-0 w-2.5 h-2.5 bg-primary rounded-full pointer-events-none z-[999] mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
      {/* Outer Spring Inertia Ring */}
      <motion.div
        className="fixed top-0 left-0 rounded-full border border-primary pointer-events-none z-[998]"
        animate={{
          width: hovered ? 48 : 22,
          height: hovered ? 48 : 22,
          backgroundColor: hovered ? "rgba(168, 85, 247, 0.15)" : "rgba(168, 85, 247, 0)",
          borderColor: hovered ? "rgba(6, 182, 212, 1)" : "rgba(168, 85, 247, 0.8)",
          scale: hovered ? 1.15 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
          mass: 0.5,
        }}
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
    </>
  );
}
