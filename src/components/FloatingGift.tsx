import React from "react";
import { motion } from "motion/react";

interface FloatingGiftProps {
  gift: {
    icon: string;
    amount: number;
  };
}

export default function FloatingGift({ gift }: FloatingGiftProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100, scale: 0.8 }}
      animate={{ 
        opacity: [0, 1, 1, 0], 
        y: -300, 
        x: [0, 30, -30, 10],
        scale: [0.8, 1.2, 1.2, 0.9] 
      }}
      transition={{ 
        duration: 3,
        ease: "easeOut"
      }}
      style={{
        position: "absolute",
        right: 40,
        bottom: 120,
        fontSize: 42,
        pointerEvents: "none",
        zIndex: 50,
        textShadow: "0 0 10px rgba(0,0,0,0.5)",
        fontWeight: "black",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span className="animate-bounce">{gift.icon}</span>
      <span className="font-mono text-xl font-black text-[#ff0050] italic bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
        x{gift.amount}
      </span>
    </motion.div>
  );
}
