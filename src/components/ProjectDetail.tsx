import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  ExternalLink, 
  Sparkles, 
  CheckCircle, 
  Briefcase, 
  Calendar, 
  Compass, 
  Sliders, 
  Activity, 
  ShieldCheck, 
  Heart 
} from "lucide-react";
import { usePortfolio } from "../context/PortfolioContext";
import { Project } from "../data";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects } = usePortfolio();
  const [project, setProject] = useState<Project | null>(null);
  const [selectedLightboxImage, setSelectedLightboxImage] = useState<string | null>(null);
  
  // Interactive 3D/2D Simulator Control Panel States
  const [meshScale, setMeshScale] = useState(1);
  const [lightingIntensity, setLightingIntensity] = useState(1.5);
  const [isWireframe, setIsWireframe] = useState(false);
  const [activePreset, setActivePreset] = useState("default");

  useEffect(() => {
    if (id && projects.length > 0) {
      const found = projects.find((p) => p.id === id);
      if (found) {
        setProject(found);
      } else {
        // Redirection as fallback
        navigate("/");
      }
    }
  }, [id, navigate, projects]);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-f5f5f7 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-50 font-mono">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Handle Preset updates for our interactive preview mesh
  const applyPreset = (presetName: string) => {
    setActivePreset(presetName);
    if (presetName === "eco") {
      setMeshScale(0.85);
      setLightingIntensity(1.0);
      setIsWireframe(true);
    } else if (presetName === "luxe") {
      setMeshScale(1.15);
      setLightingIntensity(2.5);
      setIsWireframe(false);
    } else {
      setMeshScale(1.0);
      setLightingIntensity(1.5);
      setIsWireframe(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-50 transition-colors duration-500 pb-24">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-16">
        {/* 2. Hero Presentation Banner */}
        <section className="relative rounded-3xl overflow-hidden shadow-xl border border-zinc-200/50 dark:border-zinc-800/50">
          {/* Main Visual background */}
          <div 
            className="aspect-video sm:aspect-[21/9] w-full flex items-center justify-center p-8 sm:p-16 text-center relative"
            style={project.image.startsWith("linear-gradient") ? { background: project.image } : undefined}
          >
            {!project.image.startsWith("linear-gradient") && (
              <img
                src={project.image}
                alt={project.title}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
            )}
            {/* Subtle Blueprint Grid overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
            
            {/* Backdrop lighting mask */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 pointer-events-none" />

            {/* Float details block inside image */}
            <div className="relative z-10 max-w-2xl space-y-4">
              <motion.span 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-mono tracking-widest text-zinc-200 uppercase font-bold border border-white/10"
              >
                {project.categoryName} — ARCHIVE
              </motion.span>
              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-5xl lg:text-6xl font-display font-semibold tracking-tight text-white leading-tight"
              >
                {project.title}
              </motion.h1>
            </div>
          </div>
        </section>

        {/* 3. Metadata bento cells & Brief Description */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Information */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase">
                SCULPTURE BRIEF
              </span>
              <h2 className="text-2xl md:text-3xl font-display font-semibold text-zinc-900 dark:text-white tracking-tight">
                Crafting luxury digital systems.
              </h2>
            </div>
            
            <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-300 font-sans font-light leading-relaxed">
              {project.description} This curated digital piece embodies the high-fidelity guidelines established by modern tastemakers like Tesla and Apple. Every margin, interaction frame, and color value is rigorously tuned to satisfy extreme ergonomic precision and structural honesty.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-4">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-mono text-zinc-600 dark:text-zinc-400 font-semibold shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Project Specs Sidebar */}
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl p-8 space-y-6 text-left shadow-sm">
            <h3 className="text-sm font-mono font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase pb-4 border-b border-zinc-100 dark:border-zinc-800">
              PROJECT SPECIFICATIONS
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-zinc-400 dark:text-zinc-500 font-mono">CLIENT Partner</span>
                <span className="font-display font-bold text-zinc-800 dark:text-zinc-200">{project.client}</span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-zinc-400 dark:text-zinc-500 font-mono">CALENDAR YEAR</span>
                <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{project.year}</span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-zinc-400 dark:text-zinc-500 font-mono">PRIMARY SECTOR</span>
                <span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded text-primary font-bold">{project.categoryName.toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-zinc-400 dark:text-zinc-500 font-mono">VISUAL QUALITY</span>
                <span className="font-mono text-xs text-green-500 flex items-center gap-1 font-bold">
                  <CheckCircle className="w-3.5 h-3.5" /> WCAG COMPLIANT
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=faizy2k2001@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-primary dark:hover:bg-primary hover:text-white dark:hover:text-white rounded-xl text-xs font-mono font-bold tracking-widest uppercase inline-flex items-center justify-center gap-2 transition-all shadow-sm clickable active:scale-[0.98]"
              >
                REQUEST DESIGN SPEC <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* 4. Interactive Simulation Sandbox (Apple/Tesla Inspired Widget) */}
        <section className="bg-white dark:bg-zinc-900/20 border border-zinc-200/50 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-10 text-left space-y-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-primary uppercase font-bold">
                <Sliders className="w-3.5 h-3.5" /> Interactive Lab
              </span>
              <h2 className="text-2xl font-display font-semibold text-zinc-900 dark:text-white tracking-tight">
                Tactile Sculptural Control
              </h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                Observe the digital blueprint response under customized aesthetic guidelines.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {["default", "eco", "luxe"].map((preset) => (
                <button
                  key={preset}
                  onClick={() => applyPreset(preset)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase font-bold transition-all clickable ${
                    activePreset === preset
                      ? "bg-primary text-white"
                      : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800 hover:text-zinc-800 dark:hover:text-white"
                  }`}
                >
                  {preset} PRESET
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Simulation Canvas area */}
            <div className="lg:col-span-8 rounded-2xl bg-zinc-50 dark:bg-black border border-zinc-200/40 dark:border-zinc-800/60 flex flex-col justify-between p-6 relative overflow-hidden min-h-[280px]">
              {/* Radial backdrop */}
              <div 
                className="absolute inset-0 opacity-40 transition-all duration-700 pointer-events-none"
                style={{ 
                  background: `radial-gradient(circle at center, ${isWireframe ? 'rgba(134,134,139,0.3)' : 'rgba(0,113,227,0.2)'} 0%, transparent 70%)` 
                }} 
              />

              {/* Top readout */}
              <div className="relative z-10 flex justify-between text-[10px] font-mono text-zinc-400 select-none">
                <span>SIM_MODEL_ID: {project.id.toUpperCase()}</span>
                <span className="text-green-500 animate-pulse">RENDERER: ACTIVE</span>
              </div>

              {/* Sculptural Visualization wireframe / representation */}
              <div className="relative z-10 py-12 flex items-center justify-center">
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: meshScale 
                  }}
                  transition={{ 
                    rotate: { repeat: Infinity, duration: 15, ease: "linear" },
                    scale: { type: "spring", stiffness: 150, damping: 20 }
                  }}
                  className={`w-32 h-32 rounded-3xl flex items-center justify-center border-4 relative transition-all duration-500 ${
                    isWireframe 
                      ? "border-dashed border-zinc-400 dark:border-zinc-700 bg-transparent" 
                      : "border-primary bg-gradient-to-tr from-primary/20 via-zinc-400/10 to-primary/30"
                  }`}
                >
                  <Compass 
                    className={`w-12 h-12 transition-colors duration-500 ${
                      isWireframe ? "text-zinc-400" : "text-primary"
                    }`} 
                  />
                  
                  {/* Surrounding orbit line */}
                  <div className="absolute inset-2 border border-zinc-300 dark:border-zinc-800 rounded-full animate-ping opacity-35" />
                </motion.div>
              </div>

              {/* Bottom readout */}
              <div className="relative z-10 flex justify-between text-[9px] font-mono text-zinc-400 select-none">
                <span>ZOOM: {meshScale.toFixed(2)}x</span>
                <span>AMBIENT LIGHT: {lightingIntensity.toFixed(1)} lux</span>
                <span>WIREFRAME: {isWireframe ? "ON" : "OFF"}</span>
              </div>
            </div>

            {/* Simulation controls panel */}
            <div className="lg:col-span-4 flex flex-col justify-center space-y-6">
              <div className="space-y-2">
                <label className="flex justify-between text-xs font-mono text-zinc-400 dark:text-zinc-500 select-none font-semibold">
                  <span>SCALE / ENVELOPE</span>
                  <span className="text-zinc-800 dark:text-zinc-200">{(meshScale * 100).toFixed(0)}%</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={meshScale}
                  onChange={(e) => {
                    setMeshScale(parseFloat(e.target.value));
                    setActivePreset("custom");
                  }}
                  className="w-full accent-primary h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <label className="flex justify-between text-xs font-mono text-zinc-400 dark:text-zinc-500 select-none font-semibold">
                  <span>LIGHTING EXPOSURE</span>
                  <span className="text-zinc-800 dark:text-zinc-200">{lightingIntensity.toFixed(2)} EV</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={lightingIntensity}
                  onChange={(e) => {
                    setLightingIntensity(parseFloat(e.target.value));
                    setActivePreset("custom");
                  }}
                  className="w-full accent-primary h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setIsWireframe(!isWireframe);
                    setActivePreset("custom");
                  }}
                  className="w-full py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono text-zinc-600 dark:text-zinc-300 hover:text-primary dark:hover:text-primary hover:border-primary/20 flex items-center justify-center gap-2 clickable"
                >
                  <Activity className="w-4 h-4" /> TOGGLE WIREFRAME VIEW
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Production Ethics Statement */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white dark:bg-zinc-900/10 border border-zinc-200/40 dark:border-zinc-800/60 rounded-2xl text-left space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-display font-semibold text-zinc-900 dark:text-white">
              Absolute Precision
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Every coordinate, typeface weight, and contrast layer is rigorously tested to match highest international branding systems.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-900/10 border border-zinc-200/40 dark:border-zinc-800/60 rounded-2xl text-left space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-display font-semibold text-zinc-900 dark:text-white">
              Tactile Engineering
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Designed with physical matte-texture properties in mind. Ideal for both high-end packaging print and fluid high-FPS digital interfaces.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-900/10 border border-zinc-200/40 dark:border-zinc-800/60 rounded-2xl text-left space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-base font-display font-semibold text-zinc-900 dark:text-white">
              Client Dedicated
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Co-created closely with {project.client} in order to elevate and solidify their market positioning.
            </p>
          </div>
        </section>

        {/* Curated Design Mockups Gallery (Dynamic Showcase) */}
        {project.gallery && project.gallery.length > 0 && (
          <section className="space-y-8 select-none border-t border-zinc-200/40 dark:border-zinc-800/40 pt-16">
            <div className="text-left space-y-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-primary uppercase font-bold">
                <Sparkles className="w-3.5 h-3.5" /> Curated Mockups Showcase
              </span>
              <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-zinc-900 dark:text-white">
                Detailed project mockups & assets.
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-sans font-light max-w-xl leading-relaxed">
                Experience high-fidelity layouts, typography grids, and product mockups created specifically for this branding showcase.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.gallery.map((mockup, mIdx) => (
                <motion.div
                  key={mIdx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: mIdx * 0.08 }}
                  onClick={() => setSelectedLightboxImage(mockup)}
                  className="group relative aspect-video sm:aspect-square rounded-3xl overflow-hidden border border-zinc-200/50 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/20 cursor-zoom-in shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500"
                >
                  <img
                    src={mockup}
                    alt={`Mockup ${mIdx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="px-4 py-2 bg-white/10 backdrop-blur-md text-white text-[10px] font-mono font-bold tracking-wider rounded-full border border-white/20 uppercase">
                      Expand Mockup
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Dynamic Navigation Action Hub */}
        <section className="pt-8 border-t border-zinc-200/40 dark:border-zinc-800/40 flex flex-col sm:flex-row justify-between items-center gap-6">
          <Link
            to={`/work/${project.category}`}
            className="px-6 py-3 border border-zinc-200 dark:border-zinc-800 rounded-full text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300 hover:text-primary hover:border-primary/30 transition-colors cursor-pointer clickable"
          >
            ← View All {project.categoryName}
          </Link>
          <Link
            to="/"
            className="px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full text-xs font-mono font-bold tracking-wider uppercase hover:opacity-90 transition-opacity cursor-pointer clickable"
          >
            Return to Landing Showroom
          </Link>
        </section>
      </main>

      {/* Lightbox Modal (Full-screen view) */}
      <AnimatePresence>
        {selectedLightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedLightboxImage(null)}
            className="fixed inset-0 bg-zinc-950/95 z-50 flex items-center justify-center p-4 sm:p-8 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative max-w-5xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedLightboxImage}
                alt="Enlarged Mockup View"
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[85vh] object-contain rounded-xl"
              />
              <button
                onClick={() => setSelectedLightboxImage(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition-colors cursor-pointer border border-white/10 text-sm font-bold"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
