import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";

interface CounterProps {
  value: number;
  suffix?: string;
  duration?: number;
}

function Counter({ value, suffix = "", duration = 1500 }: CounterProps) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(elementRef, { once: true, amount: 0.5 });
  const countRef = useRef(0);

  useEffect(() => {
    if (!isInView) return;

    let startTimestamp: number | null = null;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentCount = Math.floor(progress * value);
      
      setCount(currentCount);
      countRef.current = currentCount;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(value);
      }
    };

    window.requestAnimationFrame(step);
  }, [isInView, value, duration]);

  return (
    <span ref={elementRef} className="tabular-nums">
      {count}
      {suffix}
    </span>
  );
}

export default function StatCounters() {
  const stats = [
    { label: "Years of Experience", value: 6, suffix: "+" },
    { label: "Completed Projects", value: 48, suffix: "" },
    { label: "Satisfied Clients", value: 35, suffix: "+" },
    { label: "Design System Tokens", value: 1200, suffix: "+" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto py-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center shadow-xs hover:shadow-md hover:border-primary/20 transition-all duration-300 group"
        >
          <span className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-cyan group-hover:scale-105 transition-transform duration-300">
            <Counter value={stat.value} suffix={stat.suffix} />
          </span>
          <span className="mt-2 text-xs md:text-sm text-zinc-500 dark:text-zinc-400 font-medium font-sans uppercase tracking-wider">
            {stat.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
