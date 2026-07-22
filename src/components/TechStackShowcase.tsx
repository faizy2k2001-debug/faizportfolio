import React, { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { 
  Sparkles, 
  Layers, 
  Code, 
  Cpu, 
  Box, 
  Palette, 
  Zap,
  CheckCircle2,
  ExternalLink
} from "lucide-react";

interface ToolItem {
  id: string;
  name: string;
  category: "motion" | "design" | "proto" | "3d";
  categoryLabel: string;
  level: number;
  iconName: string;
  description: string;
  badge: string;
  accentGradient: string;
  glowColor: string;
  keyFeatures: string[];
}

const TOOLS_DATA: ToolItem[] = [
  {
    id: "motion-page",
    name: "Motion.page & GSAP",
    category: "motion",
    categoryLabel: "Motion & Keyframe Choreography",
    level: 98,
    iconName: "Zap",
    description: "Timeline-based scroll triggers, SVG morphing, pin triggers, and keyframe choreography.",
    badge: "Core Mastery",
    accentGradient: "from-amber-500 via-orange-500 to-red-500",
    glowColor: "rgba(245, 158, 11, 0.3)",
    keyFeatures: ["ScrollTrigger Timelines", "SVG Path Morphing", "120fps Smooth Micro-Interactions"]
  },
  {
    id: "spline-3d",
    name: "Spline 3D & Cinema4D",
    category: "3d",
    categoryLabel: "3D & Spatial Canvases",
    level: 95,
    iconName: "Box",
    description: "Interactive 3D web scenes, state triggers, lighting maps, and real-time material shading.",
    badge: "Interactive 3D",
    accentGradient: "from-emerald-400 via-teal-500 to-cyan-600",
    glowColor: "rgba(16, 185, 129, 0.3)",
    keyFeatures: ["Camera Hover Physics", "Real-Time Material Maps", "Embedded Spatial Canvases"]
  },
  {
    id: "figma",
    name: "Figma & Design Systems",
    category: "design",
    categoryLabel: "UI/UX & Systems",
    level: 98,
    iconName: "Palette",
    description: "Variable modes, auto-layout 5.0, tokenized component architectures, and prototyping.",
    badge: "System Architect",
    accentGradient: "from-rose-500 via-pink-500 to-purple-600",
    glowColor: "rgba(236, 72, 153, 0.3)",
    keyFeatures: ["Tokenized Theme Variables", "Interactive Component States", "Atomic UI Systems"]
  },
  {
    id: "framer-motion",
    name: "Framer & Interactive Motion",
    category: "proto",
    categoryLabel: "Design Engineering",
    level: 96,
    iconName: "Code",
    description: "Declarative layout animations, gesture physics, shared layout transitions, and orchestration.",
    badge: "Prototyping Lead",
    accentGradient: "from-cyan-400 via-blue-500 to-indigo-600",
    glowColor: "rgba(6, 182, 212, 0.3)",
    keyFeatures: ["AnimatePresence Orchestration", "Layout Spring Physics", "Zero-Lag Gesture Loops"]
  },
  {
    id: "three-js",
    name: "WebGL Shaders & Canvas",
    category: "3d",
    categoryLabel: "3D & Interactive Canvases",
    level: 92,
    iconName: "Box",
    description: "Custom GLSL fragment shaders, PBR materials, instanced meshes, and particle physics.",
    badge: "Visual Shaders",
    accentGradient: "from-blue-500 via-indigo-500 to-violet-600",
    glowColor: "rgba(99, 102, 241, 0.35)",
    keyFeatures: ["Custom GLSL Shaders", "Interactive Particle Physics", "Instanced Buffer Mesh"]
  },
  {
    id: "design-tokens",
    name: "Tailwind CSS & Token Systems",
    category: "design",
    categoryLabel: "UI/UX & Systems",
    level: 98,
    iconName: "Layers",
    description: "Utility-first precision, dark mode system tokens, fluid clamp typography, and micro-interactions.",
    badge: "System Tokens",
    accentGradient: "from-sky-400 via-teal-400 to-emerald-500",
    glowColor: "rgba(56, 189, 248, 0.3)",
    keyFeatures: ["Fluid Clamp Scales", "Custom Glassmorphism Tokens", "Responsive Layout Math"]
  }
];

function Interactive3DCard({ tool }: { tool: ToolItem; key?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Motion values for smooth 3D tilt calculations
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), { stiffness: 300, damping: 25 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), { stiffness: 300, damping: 25 });
  
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
      }}
      className="relative group clickable select-none"
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d"
        }}
        className="relative bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 shadow-lg transition-shadow duration-500 hover:shadow-2xl overflow-hidden"
      >
        {/* Glow backdrop on mouse hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
          style={{
            background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${tool.glowColor}, transparent 40%)`
          }}
        />

        {/* Ambient Top Edge Gradient */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tool.accentGradient} opacity-60 group-hover:opacity-100 transition-opacity`} />

        {/* Card Content with 3D Z-translation */}
        <div style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }} className="space-y-4">
          
          <div className="flex justify-between items-start">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.accentGradient} flex items-center justify-center text-white shadow-md transform group-hover:scale-110 transition-transform duration-300`}>
              {tool.iconName === "Zap" && <Zap className="w-6 h-6" />}
              {tool.iconName === "Box" && <Box className="w-6 h-6" />}
              {tool.iconName === "Palette" && <Palette className="w-6 h-6" />}
              {tool.iconName === "Code" && <Code className="w-6 h-6" />}
              {tool.iconName === "Layers" && <Layers className="w-6 h-6" />}
            </div>

            <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-[10px] font-mono font-bold uppercase tracking-wider">
              {tool.badge}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest">
              {tool.categoryLabel}
            </span>
            <h4 className="text-xl font-display font-bold text-zinc-900 dark:text-white tracking-tight mt-0.5">
              {tool.name}
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed mt-2 line-clamp-2">
              {tool.description}
            </p>
          </div>

          {/* Key Capabilities Checklist */}
          <div className="pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50 space-y-1.5">
            {tool.keyFeatures.map((feat, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] font-sans text-zinc-700 dark:text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          {/* Level Progress Indicator */}
          <div className="pt-2 space-y-1">
            <div className="flex justify-between text-[10px] font-mono font-bold text-zinc-500">
              <span>PROFICIENCY SPECS</span>
              <span className="text-primary">{tool.level}%</span>
            </div>
            <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${tool.level}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full bg-gradient-to-r ${tool.accentGradient}`}
              />
            </div>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
}

export default function TechStackShowcase() {
  const [filter, setFilter] = useState<"all" | "motion" | "3d" | "design" | "proto">("all");

  const filteredTools = filter === "all" ? TOOLS_DATA : TOOLS_DATA.filter(t => t.category === filter);

  return (
    <div className="space-y-10 text-left">
      {/* Header section with Motion.page style badge */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-8">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Interactive Motion & Design Engine</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-display font-bold text-zinc-900 dark:text-white tracking-tight">
            Design Systems, Shaders & Motion Stack
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-sans font-light leading-relaxed">
            Crafted for high-end digital experiences using spatial 3D, Motion.page keyframe timelines, WebGL GLSL shaders, and tokenized Figma design architectures.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "All Stack" },
            { id: "motion", label: "Motion & Keyframes" },
            { id: "3d", label: "Spatial 3D & WebGL" },
            { id: "design", label: "Design Systems" },
            { id: "proto", label: "Design Engineering" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all duration-300 clickable ${
                filter === item.id
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-md"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of 3D Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <Interactive3DCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}
