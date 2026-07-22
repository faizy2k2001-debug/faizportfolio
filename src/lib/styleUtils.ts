import { usePortfolio } from "../context/PortfolioContext";

export function getSectionPadding(spacing?: "compact" | "normal" | "spacious") {
  if (spacing === "compact") return "py-6 sm:py-8 md:py-10";
  if (spacing === "spacious") return "py-16 sm:py-20 md:py-24";
  return "py-10 sm:py-14 md:py-16"; // Tightened professional product design spacing
}

export function getButtonRadius(style?: "sharp" | "rounded" | "pill") {
  if (style === "sharp") return "rounded-none";
  if (style === "rounded") return "rounded-xl";
  return "rounded-full"; // Default pill
}

export function getChipStyle(style?: "flat" | "outline" | "pill-outline" | "solid") {
  const base = "text-[10px] sm:text-xs font-mono font-bold tracking-wider uppercase px-3.5 py-1.5 transition-all duration-300";
  if (style === "flat") {
    return `${base} bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-none rounded-lg`;
  }
  if (style === "outline") {
    return `${base} border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-600 dark:text-zinc-400 rounded-lg`;
  }
  if (style === "solid") {
    return `${base} bg-primary/10 text-primary border border-primary/20 rounded-full`;
  }
  // Default: pill-outline
  return `${base} border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-600 dark:text-zinc-400 rounded-full`;
}

export function getCardStyle(style?: "minimal" | "shadows" | "glassmorphism") {
  if (style === "minimal") {
    return "border border-zinc-200/60 dark:border-zinc-800/80 bg-white/40 dark:bg-zinc-950/20";
  }
  if (style === "shadows") {
    return "border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900/30 shadow-md hover:shadow-xl transition-shadow duration-300";
  }
  // Default: glassmorphism
  return "glass-panel shadow-sm";
}

export function getHoverScale(strength?: "none" | "subtle" | "normal" | "playful") {
  if (strength === "none") return 1.0;
  if (strength === "subtle") return 1.02;
  if (strength === "normal") return 1.05;
  return 1.08; // playful
}

export function getFramerTransition(strength?: "none" | "subtle" | "normal" | "playful") {
  if (strength === "none") {
    return { type: "tween", duration: 0 };
  }
  if (strength === "subtle") {
    return { type: "tween", duration: 0.3, ease: "easeOut" };
  }
  if (strength === "playful") {
    return { type: "spring", stiffness: 380, damping: 20 };
  }
  // Default: normal
  return { type: "spring", stiffness: 300, damping: 25 };
}
