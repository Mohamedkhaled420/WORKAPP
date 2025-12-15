"use client";

import { motion } from "framer-motion";

export function LiquidBlobBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.svg
        viewBox="0 0 800 800"
        className="absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 opacity-50 blur-3xl"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          <radialGradient id="blob" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="hsl(var(--primary) / 0.35)" />
            <stop offset="50%" stopColor="hsl(var(--primary) / 0.12)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <motion.path
          d="M537.3 86.5c83.5 36.6 169.8 91.4 203.7 174.6 33.7 83.4 14.9 195.3-26.4 285.7-41.2 90.6-104.9 159.8-190.6 195.3-85.6 35.6-193.2 37.6-280.1 3.4-87-34.3-153.4-104.8-189.7-192.5-36.3-87.6-42.5-192.4-6.3-278.8C83.9 187.8 162 110.8 257.2 74.3c95.1-36.6 207.4-32.9 280.1 12.2Z"
          fill="url(#blob)"
          animate={{
            d: [
              "M537.3 86.5c83.5 36.6 169.8 91.4 203.7 174.6 33.7 83.4 14.9 195.3-26.4 285.7-41.2 90.6-104.9 159.8-190.6 195.3-85.6 35.6-193.2 37.6-280.1 3.4-87-34.3-153.4-104.8-189.7-192.5-36.3-87.6-42.5-192.4-6.3-278.8C83.9 187.8 162 110.8 257.2 74.3c95.1-36.6 207.4-32.9 280.1 12.2Z",
              "M561.8 120.2c82.8 55.1 151.2 134.9 163.6 225.9 12.5 91-30.8 193.2-98.1 268.4-67.2 75.2-158.2 123.4-254.7 130.6-96.4 7.2-198.2-26.6-276.7-93.1-78.4-66.4-133.5-165.4-139.6-269.6-6.1-104.2 36.7-213.6 116.5-269.1 79.8-55.4 196.6-56.9 289-22.3Z",
              "M537.3 86.5c83.5 36.6 169.8 91.4 203.7 174.6 33.7 83.4 14.9 195.3-26.4 285.7-41.2 90.6-104.9 159.8-190.6 195.3-85.6 35.6-193.2 37.6-280.1 3.4-87-34.3-153.4-104.8-189.7-192.5-36.3-87.6-42.5-192.4-6.3-278.8C83.9 187.8 162 110.8 257.2 74.3c95.1-36.6 207.4-32.9 280.1 12.2Z",
            ],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.svg>
    </div>
  );
}
