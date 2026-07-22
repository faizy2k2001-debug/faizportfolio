import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Play, VolumeX, Volume2 } from "lucide-react";
import { usePortfolio } from "../context/PortfolioContext";
import { VideoReel } from "../data";

export default function VideoReelSlider() {
  const { videoReels } = usePortfolio();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  useEffect(() => {
    if (videoReels.length === 0) return;
    const currentId = videoReels[currentIndex]?.id;
    const activeVideo = videoRefs.current[currentId];
    if (activeVideo) {
      activeVideo.muted = isMuted;
    }
  }, [isMuted, currentIndex, videoReels]);

  const nextSlide = () => {
    if (videoReels.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % videoReels.length);
    setVideoError(false);
  };

  const prevSlide = () => {
    if (videoReels.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + videoReels.length) % videoReels.length);
    setVideoError(false);
  };

  // HTML5 Canvas Cybernetic Waves - Fallback Animation Engine
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    // Sine wave generator variables
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Background fill matching theme gradients
      const darkActive = document.documentElement.classList.contains("dark");
      
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      if (darkActive) {
        gradient.addColorStop(0, "#09090b");
        gradient.addColorStop(0.5, "#1c1c1e");
        gradient.addColorStop(1, "#000000");
      } else {
        gradient.addColorStop(0, "#f5f5f7");
        gradient.addColorStop(0.5, "#e5e5ea");
        gradient.addColorStop(1, "#cbd5e1");
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Render 5 overlapping animated sine waves
      const waveCount = 5;
      for (let i = 0; i < waveCount; i++) {
        ctx.beginPath();
        ctx.lineWidth = 0.5 + i * 0.5;
        
        // Colors from our custom palette (Tesla Red or Apple Charcoal)
        if (darkActive) {
          ctx.strokeStyle = `rgba(232, 33, 39, ${0.08 + i * 0.06})`; // Tesla Crimson
        } else {
          ctx.strokeStyle = `rgba(29, 29, 31, ${0.05 + i * 0.04})`; // Apple Charcoal
        }

        const frequency = 0.002 + i * 0.001;
        const amplitude = 40 + i * 25;
        const speed = 0.02 + i * 0.005;

        for (let x = 0; x < width; x += 10) {
          const y =
            height / 2 +
            Math.sin(x * frequency + phase * speed + i) * amplitude +
            Math.cos(x * 0.001 - phase * 0.01) * 20;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Draw random data coordinate meshes in corner
      ctx.font = "10px JetBrains Mono";
      ctx.fillStyle = darkActive ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)";
      ctx.fillText(`SYSTEM_REEL_ACTIVE: ${currentIndex + 1}`, 30, 40);
      ctx.fillText(`FRAME_LATENCY: 0.02ms`, 30, 55);

      phase += 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentIndex, videoReels]);

  if (videoReels.length === 0) {
    return (
      <div className="w-full h-[65vh] md:h-[75vh] bg-zinc-900 rounded-3xl flex items-center justify-center text-zinc-500 font-mono text-sm">
        NO VIDEO REELS UPLOADED.
      </div>
    );
  }

  const activeReel = videoReels[currentIndex] || videoReels[0];

  return (
    <div className="relative w-full h-[65vh] md:h-[75vh] overflow-hidden rounded-3xl shadow-xl border border-zinc-200/50 dark:border-zinc-800/50">
      {/* 1. Base Canvas - Wave Fallback background always active */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover z-0" />

      {/* 2. Interactive Video Element (Only overlayed if no loading error) */}
      <AnimatePresence mode="wait">
        {!videoError && activeReel && (
          <motion.div
            key={activeReel.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full z-10 overflow-hidden"
          >
            {/* Ambient Dark Overlay to protect typography readability */}
            <div className="absolute inset-0 bg-black/45 dark:bg-black/60 z-20" />

            <video
              ref={(el) => {
                videoRefs.current[activeReel.id] = el;
              }}
              src={activeReel.videoUrl}
              poster={activeReel.fallbackPoster}
              autoPlay
              muted={isMuted}
              loop
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
              onError={() => {
                console.warn(`Video load error on: ${activeReel.title}. Falling back to clean animated Canvas.`);
                setVideoError(true);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Light Overlay when video is fallback (canvas active) */}
      <div className="absolute inset-0 bg-transparent dark:bg-black/10 pointer-events-none z-20" />

      {/* 3. Captions & Typography content overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 z-30">
        <div className="max-w-2xl text-left select-none">
          <motion.div
            key={`caption-${currentIndex}`}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 rounded-full text-[10px] md:text-xs font-mono font-medium text-white tracking-widest uppercase mb-4">
              <Play className="w-3 h-3 fill-white" /> Reel Showroom {currentIndex + 1}
            </span>
            <h3 className="text-2xl md:text-4xl font-display font-bold text-white tracking-tight leading-none mb-3">
              {activeReel.title}
            </h3>
            <p className="text-sm md:text-base text-zinc-200 dark:text-zinc-300 font-sans font-light max-w-xl">
              {activeReel.tagline}
            </p>
          </motion.div>
        </div>
      </div>

      {/* 4. Controls Rails (Arrows & Slider dots) */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between items-center pointer-events-none z-30">
        {/* Left Arrow */}
        <button
          onClick={prevSlide}
          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/60 border border-white/10 text-white backdrop-blur-md pointer-events-auto cursor-pointer hover:scale-105 transition-all clickable"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={nextSlide}
          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/60 border border-white/10 text-white backdrop-blur-md pointer-events-auto cursor-pointer hover:scale-105 transition-all clickable"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Inline Metadata Floating Indicator / Interactive Mute Toggle Button */}
      <div className="absolute top-6 right-6 flex items-center gap-4 z-30">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-black/45 hover:bg-black/60 border border-white/10 hover:border-white/30 rounded-full text-[10px] font-mono text-white backdrop-blur-md transition-all cursor-pointer select-none clickable hover:scale-105 active:scale-95"
          aria-label={isMuted ? "Unmute reel sound" : "Mute reel sound"}
        >
          {isMuted ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-zinc-400" /> MUTED
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-primary animate-pulse" /> PLAYING SOUND
            </>
          )}
        </button>
      </div>

      {/* Dots Indicator Rail */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30 select-none">
        {videoReels.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index);
              setVideoError(false);
            }}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 clickable cursor-pointer ${
              index === currentIndex
                ? "bg-white w-8"
                : "bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
