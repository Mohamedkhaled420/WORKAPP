"use client";

import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.12,
    },
  },
} as const;

const item = {
  hidden: { opacity: 0, y: 14, filter: "blur(10px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
} as const;

export function AnimatedText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <motion.span
      className={className}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {text.split("").map((char, idx) => (
        <motion.span key={`${char}-${idx}`} variants={item}>
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
}
