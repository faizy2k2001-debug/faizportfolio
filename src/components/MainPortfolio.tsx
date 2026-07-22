import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, useScroll, useSpring, useMotionValue, useTransform, AnimatePresence } from "motion/react";
import {
  ArrowUpRight,
  ChevronUp,
  Github,
  Linkedin,
  Dribbble,
  Twitter,
  ArrowRight,
  Briefcase,
  User,
  LayoutGrid,
  History,
  FileText,
  Sparkles,
  Compass,
  Video,
  Play
} from "lucide-react";

import ThreeDHeroCanvas from "./ThreeDHeroCanvas";
import ThreeDSmileyBall from "./ThreeDSmileyBall";
import StatCounters from "./StatCounters";
import VideoReelSlider from "./VideoReelSlider";
import ContactForm from "./ContactForm";
import ThemeToggle from "./ThemeToggle";
import { usePortfolio } from "../context/PortfolioContext";
import {
  getSectionPadding,
  getButtonRadius,
  getChipStyle,
  getCardStyle,
  getHoverScale,
  getFramerTransition
} from "../lib/styleUtils";

function InteractiveBentoCard({ card, profile, navigate }: { card: any; profile: any; navigate: any; key?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), { stiffness: 300, damping: 25 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), { stiffness: 300, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={getFramerTransition(profile.motionStrength)}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
      className="relative group clickable select-none"
      onClick={() => navigate(`/work/${card.category}`)}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={`relative h-[280px] sm:h-[320px] rounded-3xl overflow-hidden ${getCardStyle(profile.effectsStyle)} cursor-pointer transition-all duration-300 text-left flex flex-col justify-between p-8 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-primary/50 shadow-lg hover:shadow-2xl`}
      >
        <div className={`absolute inset-0 ${card.glowClass} pointer-events-none z-0 opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />
        <div className="absolute inset-0 bg-[radial-gradient(#86868b10_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }} className="relative z-10 flex justify-between items-start">
          <span className={getChipStyle(profile.chipsStyle)}>
            {card.badge}
          </span>
          <span className="w-10 h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-white/10 dark:text-white dark:group-hover:bg-primary dark:group-hover:text-white border border-zinc-200 dark:border-transparent flex items-center justify-center transition-all duration-300 group-hover:rotate-45 shadow-sm">
            <ArrowUpRight className="w-5 h-5" />
          </span>
        </div>

        <div style={{ transform: "translateZ(25px)", transformStyle: "preserve-3d" }} className="relative z-10 space-y-2">
          <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-wider">
            ROW {card.row} — GALLERY
          </span>
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-zinc-900 dark:text-white tracking-tight">
            {card.title}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm font-sans font-light leading-relaxed">
            {card.description}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function InteractiveExperienceCard({ exp }: { exp: any }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 300, damping: 25 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 300, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
      className="relative group clickable select-none"
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-7 shadow-lg hover:shadow-2xl hover:border-primary/50 transition-all duration-300 overflow-hidden text-left"
      >
        {/* Glow backdrop on mouse hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl bg-[radial-gradient(500px_circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),rgba(59,130,246,0.15),transparent_40%)]" />

        {/* Ambient Top Edge Gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-indigo-500 to-violet-600 opacity-60 group-hover:opacity-100 transition-opacity" />

        <div style={{ transform: "translateZ(25px)", transformStyle: "preserve-3d" }} className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3">
            <div>
              <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest block">
                CAREER MILESTONE
              </span>
              <h3 className="text-xl font-display font-bold text-zinc-900 dark:text-white leading-tight mt-0.5">
                {exp.role}
              </h3>
              <p className="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400 mt-1 uppercase tracking-wider">
                {exp.company}
              </p>
            </div>
            <span className="shrink-0 px-3.5 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 rounded-full text-[10px] font-mono font-bold text-zinc-700 dark:text-zinc-300 shadow-sm">
              {exp.duration}
            </span>
          </div>

          <ul className="space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-sans font-light leading-relaxed">
            {exp.contributions.map((bullet: string, bulletIdx: number) => (
              <li key={bulletIdx} className="flex gap-2 items-start">
                <span className="text-primary mt-1.5 shrink-0 block w-1.5 h-1.5 rounded-full bg-primary" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  );
}

export default function MainPortfolio() {
  const { experiences, profile, videos, videoCards } = usePortfolio();
  const [activeSection, setActiveSection] = useState("hero");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state && (location.state as any).scrollTo) {
      const targetId = (location.state as any).scrollTo;
      navigate(location.pathname, { replace: true, state: {} });
      setTimeout(() => {
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
      }, 100);
    }
  }, [location, navigate]);

  // Progress Bar configuration
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Intersection Observer to highlight active section in navbar
  useEffect(() => {
    const sections = ["hero", "work", "about", "experience", "contact"];
    const observers: IntersectionObserver[] = [];

    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -40% 0px", // Trigger when section fills focal center
      threshold: 0,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
      }
    });

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
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
  };

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Bento Work Cards Definition matching user parameters
  const bentoCards = [
    {
      title: "Branding",
      category: "branding",
      badge: "IDENTITY",
      description: "Visual systems, organic geometries & brand guidelines.",
      glowClass: "bg-[radial-gradient(circle_at_top_right,rgba(0,113,227,0.1),transparent_45%)]",
      row: 1,
    },
    {
      title: "UI/UX",
      category: "ui-ux",
      badge: "PRODUCT",
      description: "Tactile dashboards, design tokens & high-end prototypes.",
      glowClass: "bg-[radial-gradient(circle_at_top_right,rgba(134,134,139,0.12),transparent_45%)]",
      row: 1,
    },
    {
      title: "Logo Design",
      category: "logo-design",
      badge: "EMBLEMS",
      description: "Modern vector monograms & corporate hallmarks.",
      glowClass: "bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.06),transparent_45%)]",
      row: 2,
    },
    {
      title: "Social Media",
      category: "social-media",
      badge: "CAMPAIGNS",
      description: "CGI teasers, animated stories & interactive carousels.",
      glowClass: "bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.08),transparent_45%)]",
      row: 2,
    },
    {
      title: "Packaging",
      category: "packaging",
      badge: "STRUCTURAL",
      description: "Tactile cardboard forms, debossed labels & matte finishes.",
      glowClass: "bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.08),transparent_45%)]",
      row: 3,
    },
    {
      title: "Brochure",
      category: "brochure",
      badge: "EDITORIAL",
      description: "Modern layout lookbooks, grid systems & catalog sheets.",
      glowClass: "bg-[radial-gradient(circle_at_top_right,rgba(148,163,184,0.1),transparent_45%)]",
      row: 3,
    },
    {
      title: "Other Design",
      category: "other-design",
      badge: "KEYARTS",
      description: "Sci-fi posters, typography templates & musical grids.",
      glowClass: "bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.08),transparent_45%)]",
      row: 4,
    },
    {
      title: "T-shirt Design",
      category: "t-shirt-design",
      badge: "APPAREL",
      description: "Oversized technical streetwears & heavy silk prints.",
      glowClass: "bg-[radial-gradient(circle_at_top_right,rgba(225,29,72,0.08),transparent_45%)]",
      row: 4,
    },
  ];

  // SECTION COMPONENT DEFINITIONS FOR EASY SORTING/RENDERING
  const renderSectionsMap: Record<string, React.ReactNode> = {
    hero: (
      <section
        key="hero"
        id="hero"
        className="relative min-h-[85vh] pt-20 pb-12 flex items-center justify-center overflow-hidden z-10"
      >
        {profile.heroImage && (
          <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none">
            <img
              src={profile.heroImage}
              alt="Custom Hero Artwork"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-20 dark:opacity-15 blur-[1px] scale-105 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/10 to-slate-50 dark:via-zinc-950/20 dark:to-zinc-950" />
          </div>
        )}

        <div className="absolute inset-0 pointer-events-none z-1 overflow-hidden select-none">
          <div className="absolute -top-[30%] -left-[10%] w-[65%] h-[160%] bg-gradient-to-r from-white/35 via-white/10 to-transparent dark:from-white/5 dark:via-white/1 dark:to-transparent rotate-[32deg] blur-[50px] transform origin-top-left" />
          <div className="absolute -top-[15%] left-[15%] w-[45%] h-[160%] bg-gradient-to-r from-white/20 via-white/5 to-transparent dark:from-white/3 dark:via-white/1 dark:to-transparent rotate-[32deg] blur-[70px] transform origin-top-left" />
        </div>

        <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[35vw] h-[35vw] bg-accent-cyan/5 rounded-full blur-[100px] pointer-events-none" />

        <ThreeDHeroCanvas />

        <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 z-10 select-none text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-3">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={getFramerTransition(profile.motionStrength)}
                className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-semibold tracking-tight text-zinc-950 dark:text-white leading-[1.1] max-w-5xl mx-auto"
              >
                {profile.heroTitlePrefix || "Unlimited"}<span className="inline-flex items-center justify-center align-middle mx-1 sm:mx-1.5">
                  <ThreeDSmileyBall size={56} isFloating={true} />
                </span><span className="text-zinc-900 dark:text-zinc-100">{profile.heroTitleSuffix || "Design"}</span> <br className="sm:hidden" />
                for{" "}
                <span className="inline-flex items-center justify-center align-middle mx-2 sm:mx-3 px-3 py-1 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-sm hover:shadow-md hover:border-primary/30 dark:hover:border-primary/40 transition-all pointer-events-auto group cursor-default backdrop-blur-md">
                  <span className="w-3.5 h-3.5 text-primary group-hover:rotate-180 transition-transform duration-500 flex items-center justify-center">
                    <Compass className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[9px] font-mono tracking-widest text-zinc-500 dark:text-zinc-400 uppercase font-extrabold ml-1.5 select-none">
                    LAB
                  </span>
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60 dark:from-primary dark:to-primary/50">
                  {profile.heroTitleBody || "Solid Startups"}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={getFramerTransition(profile.motionStrength)}
                className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-zinc-500 dark:text-zinc-400 font-sans font-light leading-relaxed pt-1"
              >
                {profile.heroSubtitle || "We help premium brands and ambitious startups design beautiful, high-fidelity digital products — fast, reliable, and completely hassle-free."}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={getFramerTransition(profile.motionStrength)}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
            >
              <a
                href="#contact"
                onClick={(e) => handleScrollTo(e, "contact")}
                className={`px-8 py-3.5 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-primary dark:hover:bg-primary hover:text-white dark:hover:text-white ${getButtonRadius(profile.buttonStyle)} text-xs font-mono font-bold tracking-widest uppercase inline-flex items-center gap-3 shadow-md hover:scale-[1.03] active:scale-[0.98] transition-all clickable pointer-events-auto`}
              >
                CONTACT NOW <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    ),
    work: (
      <section key="work" id="work" className={`${getSectionPadding(profile.sectionSpacing)} relative z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left max-w-xl space-y-3 mb-8 sm:mb-10 select-none">
            <span className={getChipStyle(profile.chipsStyle)}>
              <LayoutGrid className="w-3.5 h-3.5 inline mr-1" /> Curated Collections
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-zinc-900 dark:text-white">
              Curated creative disciplines.
            </h2>
            <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 font-sans font-light leading-relaxed">
              Explore specialized galleries driven by our central asset directory. Click any card to launch its full-fidelity case studies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 max-w-6xl mx-auto">
            {bentoCards.map((card) => (
              <InteractiveBentoCard
                key={card.category}
                card={card}
                profile={profile}
                navigate={navigate}
              />
            ))}
          </div>
        </div>
      </section>
    ),
    videoReels: profile.showVideoReel ? (
      <section key="videoReels" id="videoReels" className={`${getSectionPadding(profile.sectionSpacing)} relative z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left max-w-xl space-y-3 mb-8 sm:mb-10 select-none">
            <span className={getChipStyle(profile.chipsStyle)}>
              <Sparkles className="w-3.5 h-3.5 inline mr-1" /> Motion & Simulation
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-zinc-900 dark:text-white">
              Interactive video reel.
            </h2>
            <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 font-sans font-light">
              Press left or right to switch between specialized cinematography, motion design, and fluid WebGL physics reels.
            </p>
          </div>

          <VideoReelSlider />
        </div>
      </section>
    ) : null,
    videos: videos.length > 0 ? (
      <section key="videos" id="videos" className={`${getSectionPadding(profile.sectionSpacing)} relative z-10 border-t border-zinc-200/40 dark:border-zinc-800/40 bg-zinc-50/20 dark:bg-zinc-900/5`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left max-w-xl space-y-3 mb-8 sm:mb-10 select-none">
            <span className={getChipStyle(profile.chipsStyle)}>
              <Video className="w-3.5 h-3.5 inline mr-1" /> Interactive Walkthroughs
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-zinc-900 dark:text-white">
              Featured design broadcasts.
            </h2>
            <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 font-sans font-light leading-relaxed">
              Step-by-step videos and walkthroughs exploring interactive design system builds, UI blueprints, and digital graphics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {videos.map((vid, idx) => (
              <motion.div
                key={vid.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={getFramerTransition(profile.motionStrength)}
                whileHover={profile.motionStrength !== "none" ? { scale: getHoverScale(profile.motionStrength) } : undefined}
                className={`group relative rounded-3xl overflow-hidden p-4 text-left flex flex-col justify-between ${getCardStyle(profile.effectsStyle)} transition-all duration-500`}
              >
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-6 bg-zinc-900 shadow-inner">
                  <img
                    src={vid.thumbnail || "https://images.unsplash.com/photo-1542204172-e7052809a86f?auto=format&fit=crop&w=800&q=80"}
                    alt={vid.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <a
                      href={vid.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300 clickable"
                    >
                      <Play className="w-6 h-6 fill-white ml-1" />
                    </a>
                  </div>
                </div>

                <div className="space-y-2 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-display font-semibold text-zinc-900 dark:text-white group-hover:text-primary transition-colors">
                      {vid.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-sans font-light mt-1.5 leading-relaxed">
                      {vid.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/60 mt-4 flex justify-between items-center">
                    <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                      BROADCAST INDEX 0{idx + 1}
                    </span>
                    <a
                      href={vid.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-mono font-bold uppercase tracking-wider text-primary hover:underline clickable"
                    >
                      WATCH VIDEO <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    ) : null,
    videoCards: videoCards.length > 0 ? (
      <section key="videoCards" id="videoCards" className={`${getSectionPadding(profile.sectionSpacing)} relative z-10 border-t border-zinc-200/40 dark:border-zinc-800/40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left max-w-xl space-y-4 mb-16 select-none">
            <span className={getChipStyle(profile.chipsStyle)}>
              <Sparkles className="w-3.5 h-3.5 inline mr-1" /> Dynamic Catalog Cards
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-zinc-900 dark:text-white">
              Featured resources & grids.
            </h2>
            <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 font-sans font-light">
              Dynamic cards managing external luxury libraries, 3D showcases, and Figma styling packages.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {videoCards.map((card, idx) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={getFramerTransition(profile.motionStrength)}
                whileHover={profile.motionStrength !== "none" ? { scale: getHoverScale(profile.motionStrength) } : undefined}
                className={`group relative rounded-3xl overflow-hidden p-3 transition-all duration-300 flex flex-col justify-between ${getCardStyle(profile.effectsStyle)}`}
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 mb-4 shadow-sm">
                  <img
                    src={card.thumbnail || "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80"}
                    alt={card.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0"
                  />
                  <a
                    href={card.link}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md flex items-center justify-center text-zinc-800 dark:text-white border border-white/20 hover:bg-primary hover:text-white transition-all duration-300 clickable"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>

                <div className="px-3 pb-3 text-left space-y-1">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-primary">
                    CATALOG CARD 0{idx + 1}
                  </span>
                  <h3 className="text-lg font-display font-bold text-zinc-900 dark:text-white tracking-tight leading-snug group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans font-light line-clamp-2">
                    {card.subtitle}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    ) : null,
    about: (
      <section key="about" id="about" className={`${getSectionPadding(profile.sectionSpacing)} relative z-10 border-t border-zinc-200/30 dark:border-zinc-800/30`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center text-left mb-20">
            <div className="space-y-6">
              <span className={getChipStyle(profile.chipsStyle)}>
                <User className="w-3.5 h-3.5 inline mr-1" /> {profile.philosophySubheading || "Core Philosophy"}
              </span>
              <h2 className="text-3xl sm:text-5xl font-display font-semibold tracking-tight text-zinc-900 dark:text-white leading-tight">
                {profile.philosophyHeading || "Designing at the boundary of logic & art."}
              </h2>
              <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 font-sans font-light leading-relaxed">
                {profile.philosophyDescription || "I engineer tactile digital environments that live at the precise intersection of mathematical layout, graphics shading, and visual rigor."}
              </p>
              <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-500 font-sans font-light leading-relaxed border-l-2 border-primary pl-4 italic">
                {profile.philosophySupportingText || "I believe typography carries the soul of a layout, while motion and lighting provide its pulse. My process remains highly collaborative, strict in grid structures, and performance-oriented."}
              </p>
            </div>

            <div className="relative group flex justify-center w-full max-w-md mx-auto lg:max-w-none">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-primary to-violet-500 rounded-3xl blur opacity-20 group-hover:opacity-35 transition duration-1000 group-hover:duration-200" />
              
              <div className={`relative w-full overflow-hidden rounded-3xl p-3 backdrop-blur-md shadow-xl transition-all duration-500 hover:scale-[1.01] ${getCardStyle(profile.effectsStyle)}`}>
                <img
                  src={profile.philosophyHeroImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"}
                  alt="Faiz Philosophy Hero"
                  referrerPolicy="no-referrer"
                  className="w-full h-[400px] sm:h-[480px] object-cover rounded-2xl grayscale hover:grayscale-0 transition-all duration-700"
                />
                
                <div className="absolute bottom-8 left-8 right-8 bg-white/50 dark:bg-zinc-950/60 backdrop-blur-lg border border-white/20 dark:border-zinc-800/80 p-5 rounded-2xl shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 select-none">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-primary">
                        {profile.role || "Lead Designer"}
                      </h4>
                      <p className="text-sm font-display font-semibold text-zinc-900 dark:text-white mt-0.5 uppercase tracking-wide">
                        {profile.name || "Faiz Khan"}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-mono font-extrabold tracking-widest uppercase">
                      ACTIVE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {profile.showStats && <StatCounters />}
        </div>
      </section>
    ),
    skills: null,
    experience: profile.showExperience && experiences.length > 0 ? (
      <section key="experience" id="experience" className={`${getSectionPadding(profile.sectionSpacing)} bg-zinc-50/50 dark:bg-zinc-900/10 relative z-10 border-t border-zinc-200/30 dark:border-zinc-800/30`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Career Timeline Milestones */}
          <div>
            <div className="text-left max-w-xl space-y-3 mb-8 sm:mb-10 select-none">
              <span className={getChipStyle(profile.chipsStyle)}>
                <History className="w-3.5 h-3.5 inline mr-1" /> Career Timeline
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-zinc-900 dark:text-white">
                Professional milestones.
              </h2>
            </div>

            <div className="max-w-4xl mx-auto space-y-8 relative before:absolute before:top-0 before:bottom-0 before:left-4 md:before:left-1/2 before:-translate-x-0.5 before:w-px before:bg-zinc-200/80 dark:before:bg-zinc-800/80">
              {experiences.map((exp, index) => {
                const isEven = index % 2 === 0;
                return (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={getFramerTransition(profile.motionStrength)}
                    className={`relative flex flex-col md:flex-row ${
                      isEven ? "md:flex-row-reverse" : ""
                    } md:items-start`}
                  >
                    <div className="absolute left-4 md:left-1/2 -translate-x-1.5 md:-translate-x-2.5 w-4 h-4 md:w-5 md:h-5 rounded-full bg-white dark:bg-zinc-950 border-4 border-primary z-10 shadow-sm" />
                    <div className="hidden md:block w-1/2 px-6" />

                    <div className={`w-full md:w-1/2 pl-10 text-left ${isEven ? "md:pl-0 md:pr-6" : "md:pl-6 md:pr-0"}`}>
                      <InteractiveExperienceCard exp={exp} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    ) : null,
    contact: null
  };

  // Get active sorted order of components to render
  const defaultOrder = ["hero", "videoReels", "work", "about", "skills", "experience", "videos", "videoCards", "contact"];
  const activeOrder = profile.sectionOrder && profile.sectionOrder.length > 0 ? profile.sectionOrder : defaultOrder;

  return (
    <div className="relative min-h-screen">
      {/* --- PREMIUM HORIZONTAL LINEAR BACKGROUND GRADIENT --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-50 to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 transition-colors duration-500" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-zinc-200/50 via-zinc-100/10 to-transparent dark:from-black/70 dark:via-zinc-950/20 dark:to-transparent blur-3xl pointer-events-none" />
      </div>

      {/* Scroll indicator ribbon */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-zinc-400 dark:to-zinc-200 z-50 origin-left"
        style={{ scaleX }}
      />

      {/* RENDER CUSTOM-ORDERED CMS SECTIONS */}
      {activeOrder.map((sectionId) => {
        // Handle custom catalog-cards key vs actual key
        const actualKey = sectionId === "catalogCards" ? "videoCards" : sectionId;
        return renderSectionsMap[actualKey] || null;
      })}

      {/* Floating Back-to-Top Button on Bottom Right */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={handleBackToTop}
            className="fixed bottom-6 right-6 w-11 h-11 rounded-full bg-gradient-to-br from-primary to-zinc-500 text-white shadow-lg flex items-center justify-center cursor-pointer z-40 transition-all hover:scale-110 active:scale-95 clickable group"
            aria-label="Back to top"
          >
            <ChevronUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
