"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

import { cn } from "@/lib/utils";

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-expect-error older browsers
    navigator.msMaxTouchPoints > 0
  );
}

export function LiquidGlassCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [tiltEnabled, setTiltEnabled] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const transform = useMotionTemplate`perspective(900px) rotateX(${y}deg) rotateY(${x}deg)`;

  useEffect(() => {
    setTiltEnabled(!isTouchDevice());
  }, []);

  const handlers = useMemo(() => {
    if (!tiltEnabled) {
      return {};
    }

    return {
      onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const dx = e.clientX - rect.left;
        const dy = e.clientY - rect.top;
        const px = (dx / rect.width - 0.5) * 10;
        const py = (0.5 - dy / rect.height) * 10;
        x.set(px);
        y.set(py);
      },
      onMouseLeave: () => {
        x.set(0);
        y.set(0);
      },
    };
  }, [tiltEnabled, x, y]);

  return (
    <motion.div
      style={tiltEnabled ? { transform } : undefined}
      className={cn(
        "glass relative rounded-2xl p-6 transition-transform will-change-transform",
        className,
      )}
      initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      {...handlers}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/30 to-transparent" />
      <div className="relative">{children}</div>
    </motion.div>
  );
}
