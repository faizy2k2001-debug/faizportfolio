import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useVelocity } from "motion/react";

interface ThreeDSmileyBallProps {
  className?: string;
  size?: number; // width and height in px
  isFloating?: boolean; // If true, registers extra scroll-based bounce/tilt/rotation
}

export default function ThreeDSmileyBall({ className = "", size = 48, isFloating = true }: ThreeDSmileyBallProps) {
  const ballRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [blink, setBlink] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Scroll Tracking for interactive 3D physics and rolling
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  
  // Smoothen the velocity for organic, elastic animations
  const velocitySpring = useSpring(scrollVelocity, { stiffness: 70, damping: 16 });

  // 1. Roll / Rotate the ball on scroll (Z axis) - makes it feel like it is rolling on scroll
  const rawRotateZ = useTransform(scrollY, [0, 3000], [0, 360]);
  const scrollRotateZ = useSpring(rawRotateZ, { stiffness: 100, damping: 20 });

  // 2. Playful float/bobbing Y-translation linked to scroll
  const rawBobbing = useTransform(scrollY, [0, 500, 1000, 1500, 2000, 2500, 3000], [0, -6, 4, -8, 2, -5, 0]);
  const scrollBobbing = useSpring(rawBobbing, { stiffness: 90, damping: 18 });

  // 3. Subtle 3D tilting on X/Y linked to scroll position
  const rawTiltX = useTransform(scrollY, [0, 2000], [-5, 15]);
  const rawTiltY = useTransform(scrollY, [0, 2000], [-10, 20]);
  const scrollTiltX = useSpring(rawTiltX, { stiffness: 120, damping: 22 });
  const scrollTiltY = useSpring(rawTiltY, { stiffness: 120, damping: 22 });

  // 4. Velocity-based Squash & Stretch (Cartoon Clay Physics)
  // As the user scrolls faster (positive or negative velocity), the ball stretches along Y-axis and squashes on X-axis
  const ballScaleY = useTransform(velocitySpring, [-3000, 0, 3000], [1.25, 1.0, 1.25]);
  const ballScaleX = useTransform(velocitySpring, [-3000, 0, 3000], [0.8, 1.0, 0.8]);

  // 5. Velocity-based Tongue Physics
  // Scrolling fast makes the naughty tongue stick out further and waggle left-to-right!
  const tongueScaleY = useTransform(velocitySpring, [-2000, 0, 2000], [1.5, 1.0, 1.5]);
  const tongueRotate = useTransform(velocitySpring, [-2000, 0, 2000], [-22, 0, 22]);

  // 6. Velocity-based Eye Squash (Wide eye reacts to high-speed scroll)
  const rightEyeScaleY = useTransform(velocitySpring, [-2500, 0, 2500], [0.65, 1.0, 0.65]);

  // 7. Dynamic Cheek Blush Glow (Blushes harder when scrolling fast)
  const blushOpacity = useTransform(velocitySpring, [-2000, 0, 2000], [1.0, 0.4, 1.0]);
  const blushScale = useTransform(velocitySpring, [-2000, 0, 2000], [1.35, 1.0, 1.35]);

  // Mouse hover tilt mechanics (only active when hovered)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isHovered || !ballRef.current) return;
      const rect = ballRef.current.getBoundingClientRect();
      const ballCenterX = rect.left + rect.width / 2;
      const ballCenterY = rect.top + rect.height / 2;
      
      // Get offset from center normalized between -1 and 1
      const dx = (e.clientX - ballCenterX) / (rect.width / 2);
      const dy = (e.clientY - ballCenterY) / (rect.height / 2);
      
      setMousePos({ x: dx, y: dy });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isHovered]);

  // Occasional cheeky blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.4) {
        setBlink(true);
        setTimeout(() => setBlink(false), 120);
      }
    }, 4000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Compute final 3D Tilts (combination of Scroll progress + Mouse tracking)
  const faceRotateX = isHovered 
    ? mousePos.y * -30 
    : (isFloating && !isMobile) 
      ? scrollTiltX.get() 
      : 0;

  const faceRotateY = isHovered 
    ? mousePos.x * 30 
    : (isFloating && !isMobile) 
      ? scrollTiltY.get() 
      : 0;

  const finalRotateZ = (isFloating && !isMobile) ? scrollRotateZ.get() : 0;
  const finalBobbingY = (isFloating && !isMobile) ? scrollBobbing.get() : 0;

  return (
    <div
      ref={ballRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 0, y: 0 });
      }}
      className={`relative select-none pointer-events-auto transition-shadow duration-300 ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        perspective: "250px"
      }}
    >
      {/* 1. Claymorphic Base Sphere with dynamic Z scroll-rolling & squash/stretch */}
      <motion.div
        className="w-full h-full rounded-full relative bg-primary flex items-center justify-center overflow-hidden shadow-lg border border-white/15"
        style={{
          transformStyle: "preserve-3d",
          rotate: finalRotateZ,
          y: finalBobbingY,
          scaleX: isMobile ? 1 : ballScaleX,
          scaleY: isMobile ? 1 : ballScaleY
        }}
        whileHover={{ 
          scale: 1.15,
          rotate: finalRotateZ + 15,
          transition: { type: "spring", stiffness: 300, damping: 15 }
        }}
        whileTap={{ 
          scale: 0.85, 
          rotate: finalRotateZ - 20,
          borderRadius: "45%" // Squishy clay look!
        }}
      >
        {/* Layer A: Radial gradient 3D shade overlay */}
        <div 
          className="absolute inset-0 pointer-events-none rounded-full z-20"
          style={{
            background: "radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(0, 0, 0, 0.45) 85%, rgba(0, 0, 0, 0.7) 100%)"
          }}
        />

        {/* Layer B: Glossy reflection bubble */}
        <div 
          className="absolute top-1 left-1.5 bg-gradient-to-b from-white/70 to-white/0 rounded-full pointer-events-none filter blur-[0.5px] z-30"
          style={{
            width: `${size * 0.35}px`,
            height: `${size * 0.22}px`,
            transform: "rotate(-35deg)"
          }}
        />

        {/* Layer C: Embedded Naughty Face container (Tilts in 3D) */}
        <motion.div
          className="relative flex flex-col items-center justify-center"
          style={{
            width: "65%",
            height: "65%",
            transformStyle: "preserve-3d",
            rotateX: faceRotateX,
            rotateY: faceRotateY
          }}
        >
          {/* Eyes Group: Naughty Wink Face */}
          <div className="flex justify-between w-full px-1 mb-1.5 z-10" style={{ transform: "translateZ(15px)" }}>
            
            {/* Left Eye: Playful Wink (Semi-circle or Cheeky Arc) */}
            <div className="w-3 h-3 flex items-center justify-center">
              <svg viewBox="0 0 12 12" className="w-full h-full text-zinc-950 dark:text-zinc-900 fill-none stroke-current" strokeWidth="3" strokeLinecap="round">
                <path d="M2,8 Q6,2 10,8" />
              </svg>
            </div>

            {/* Right Eye: Wide Open Pupil (reacts to scroll squash) */}
            <motion.div 
              className="bg-zinc-950 dark:bg-zinc-900 rounded-full flex items-center justify-center relative overflow-hidden"
              style={{
                width: `${size * 0.14}px`,
                height: blink ? "1.5px" : `${size * 0.14}px`,
                scaleY: isHovered ? 1.0 : rightEyeScaleY,
                transition: "height 0.08s ease"
              }}
            >
              {/* Little glossy catchlight inside the pupil */}
              {!blink && (
                <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full" />
              )}
            </motion.div>
          </div>

          {/* Naughty Smirk Mouth with Pink Tongue sticking out! */}
          <div className="relative w-8 h-4 flex flex-col items-center justify-center z-10" style={{ transform: "translateZ(15px)" }}>
            <svg 
              viewBox="0 0 24 12" 
              className="w-full h-full text-zinc-950 dark:text-zinc-900 fill-none stroke-current"
              strokeWidth="3.2"
              strokeLinecap="round"
            >
              {/* Cheeky lopsided smirk path */}
              <path d="M3,3 Q10,12 21,4" />
            </svg>
            
            {/* Cheeky sticking-out Pink Tongue */}
            <motion.div
              className="absolute -bottom-1.5 left-[42%] -translate-x-1/2 w-3.5 h-3 bg-rose-500 rounded-b-full border-t border-zinc-950 dark:border-zinc-900 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)]"
              style={{
                transformOrigin: "top center",
                perspective: "120px",
                scaleY: isHovered ? undefined : tongueScaleY,
                rotate: isHovered ? undefined : tongueRotate
              }}
              animate={isHovered ? {
                y: [0, 2, -0.5, 2, 0],
                scaleY: [1, 1.35, 0.9, 1.25, 1],
                rotate: [0, -12, 12, -6, 0]
              } : undefined}
              transition={isHovered ? {
                duration: 0.6,
                repeat: Infinity,
                repeatType: "mirror"
              } : undefined}
            >
              {/* Soft line down the middle of tongue */}
              <div className="w-[1px] h-2 bg-rose-700/50 mx-auto" />
            </motion.div>
          </div>

          {/* Rosy Cheeks (Blushing when hovered or rolling/scrolling) */}
          <motion.div 
            className="absolute inset-x-0 bottom-1 flex justify-between px-0.5 pointer-events-none"
            style={{
              opacity: isHovered ? 0.9 : blushOpacity,
              scale: isHovered ? 1.2 : blushScale
            }}
          >
            <div className="w-2 h-1.5 bg-red-400/40 rounded-full filter blur-[0.5px]" />
            <div className="w-2 h-1.5 bg-red-400/40 rounded-full filter blur-[0.5px]" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* 2. Soft Dynamic Sphere Shadow underneath (linked to floating bobbing) */}
      <motion.div 
        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-[85%] h-1 bg-black/30 dark:bg-black/50 rounded-full filter blur-[2.5px] pointer-events-none z-[-1]"
        style={{
          y: finalBobbingY * -0.3 // moves inversely to float bobbing for realistic depth!
        }}
        animate={{
          scale: isHovered ? 0.75 : 1.0,
          opacity: isHovered ? 0.4 : 0.7
        }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}
