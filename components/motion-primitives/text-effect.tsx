// components/motion-primitives/text-effect.tsx

"use client";

import { motion } from "framer-motion";
import React from "react";

interface TextEffectProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  delay?: number;
  preset?: string;
  per?: string;
  speedSegment?: number;
}

export function TextEffect({
  children,
  className,
  as: Component = "div",
  delay = 0,
}: TextEffectProps) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      transition={{
        duration: 0.8,
        delay,
      }}
    >
      <Component className={className}>{children}</Component>
    </motion.div>
  );
}
