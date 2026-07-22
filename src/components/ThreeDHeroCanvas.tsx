import { useEffect, useRef, useState } from "react";

interface Wave {
  colorDark: string;
  colorLight: string;
  amplitude: number;
  frequency: number;
  speed: number;
  phaseShift: number;
  offsetY: number; // Vertical offset when separated
}

interface FlowParticle {
  waveIndex: number;
  progress: number; // 0 to 1 representing X-axis position
  speed: number;
  size: number;
  alpha: number;
}

export default function ThreeDHeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Detect theme on mount
    setIsDark(document.documentElement.classList.contains("dark"));

    const themeObserver = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => themeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Mouse tracking for subtle interactive magnetism/deflection
    const mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, radius: 250 };

    const isMobileDevice = window.innerWidth < 768;

    // Elegant waves mimicking V7 Labs aesthetic - optimized count for lightweight performance
    const waves: Wave[] = isMobileDevice 
      ? [
          {
            colorDark: "rgba(0, 113, 227, 0.6)", // Primary Blue
            colorLight: "rgba(0, 91, 191, 0.5)",
            amplitude: 30,
            frequency: 0.0035,
            speed: 1.2,
            phaseShift: 0,
            offsetY: -30,
          },
          {
            colorDark: "rgba(99, 102, 241, 0.55)", // Indigo
            colorLight: "rgba(79, 70, 229, 0.45)",
            amplitude: 25,
            frequency: 0.003,
            speed: 1.0,
            phaseShift: Math.PI * 1.5,
            offsetY: 15,
          }
        ]
      : [
          {
            colorDark: "rgba(0, 113, 227, 0.6)", // Primary Blue
            colorLight: "rgba(0, 91, 191, 0.5)",
            amplitude: 45,
            frequency: 0.0035,
            speed: 1.2,
            phaseShift: 0,
            offsetY: -60,
          },
          {
            colorDark: "rgba(6, 182, 212, 0.5)", // Cyan
            colorLight: "rgba(8, 145, 178, 0.45)",
            amplitude: 35,
            frequency: 0.004,
            speed: 1.6,
            phaseShift: Math.PI / 3,
            offsetY: -20,
          },
          {
            colorDark: "rgba(99, 102, 241, 0.55)", // Indigo
            colorLight: "rgba(79, 70, 229, 0.45)",
            amplitude: 40,
            frequency: 0.003,
            speed: 1.0,
            phaseShift: Math.PI * 1.5,
            offsetY: 20,
          },
          {
            colorDark: "rgba(20, 184, 166, 0.45)", // Teal
            colorLight: "rgba(13, 148, 136, 0.4)",
            amplitude: 30,
            frequency: 0.0045,
            speed: 2.0,
            phaseShift: Math.PI / 2,
            offsetY: 60,
          },
        ];

    // Flowing particles along the paths - 12 on mobile, 30 on desktop
    const particles: FlowParticle[] = [];
    const particleCount = isMobileDevice ? 12 : 30;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        waveIndex: i % waves.length,
        progress: Math.random(),
        speed: 0.0006 + Math.random() * 0.0008,
        size: 1.5 + Math.random() * 2,
        alpha: 0.3 + Math.random() * 0.5,
      });
    }

    // High DPI Canvas Scaling
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
    };

    resizeCanvas();

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserver.observe(container);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    let time = 0;

    // Helper to calculate wave Y at a given X
    const getWaveY = (x: number, wave: Wave, time: number) => {
      const centerY = height / 2;
      
      // Amplitude envelope (keeps waves from clipping at edges, tapering beautifully)
      const xPIOverWidth = (x / width) * Math.PI;
      const borderEnvelope = Math.sin(xPIOverWidth);
      
      // Convergence Envelope (V7 Labs reference):
      // Waves are separate at the start (left) and end (right), but converge exactly in the middle!
      // At x = width / 2, verticalOffsetFactor is 0 (fully merged).
      const verticalOffsetFactor = Math.pow(1 - borderEnvelope, 1.5);
      
      const waveSine = Math.sin(x * wave.frequency + time * wave.speed + wave.phaseShift);
      const waveAmplitude = wave.amplitude * borderEnvelope;
      const verticalOffset = wave.offsetY * verticalOffsetFactor;

      let y = centerY + waveSine * waveAmplitude + verticalOffset;

      // Mouse interactive magnetism / deflection
      if (mouse.x > -1000) {
        const dx = x - mouse.x;
        const dy = y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
          const force = (1 - distance / mouse.radius) * 35;
          // Pull waves slightly towards or push away from mouse
          const dirY = dy / (distance || 1);
          y += dirY * force;
        }
      }

      return y;
    };

    const animate = () => {
      time += 0.01;

      // Smoothly lerp mouse position for organic reaction speed
      if (mouse.targetX > -1000) {
        if (mouse.x === -1000) {
          mouse.x = mouse.targetX;
          mouse.y = mouse.targetY;
        } else {
          mouse.x += (mouse.targetX - mouse.x) * 0.08;
          mouse.y += (mouse.targetY - mouse.y) * 0.08;
        }
      } else {
        mouse.x = -1000;
        mouse.y = -1000;
      }

      ctx.clearRect(0, 0, width, height);

      // Render waves
      waves.forEach((wave) => {
        ctx.beginPath();
        
        // Precision stroke drawing - larger step size for superior performance
        const step = isMobileDevice ? 15 : 8;
        for (let x = 0; x <= width; x += step) {
          const y = getWaveY(x, wave, time);
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.strokeStyle = isDark ? wave.colorDark : wave.colorLight;
        ctx.lineWidth = 1.25;
        ctx.lineCap = "round";
        ctx.stroke();
      });

      // Render flowing particles traveling precisely along paths
      particles.forEach((p) => {
        p.progress += p.speed;
        if (p.progress > 1) {
          p.progress = 0;
          p.waveIndex = (p.waveIndex + 1) % waves.length;
        }

        const wave = waves[p.waveIndex];
        const x = p.progress * width;
        const y = getWaveY(x, wave, time);

        // Draw flowing glowing dot
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        
        // Dynamic opacity fade-out near canvas edges
        const edgeFade = Math.sin(p.progress * Math.PI);
        const color = isDark ? "255, 255, 255" : "0, 113, 227";
        ctx.fillStyle = `rgba(${color}, ${p.alpha * edgeFade})`;
        
        // Neon glow if dark mode
        if (isDark) {
          ctx.shadowColor = `rgba(${color}, 0.8)`;
          ctx.shadowBlur = 6;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      resizeObserver.disconnect();
    };
  }, [isDark]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-0"
    >
      <canvas ref={canvasRef} className="block w-full h-full opacity-70 dark:opacity-85" />
    </div>
  );
}
