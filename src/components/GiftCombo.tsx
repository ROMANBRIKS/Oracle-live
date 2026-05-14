import React from "react";
import { motion } from "motion/react";

interface GiftComboProps {
  combo: number;
  giftName?: string;
}

export default function GiftCombo({ combo, giftName = "Rose" }: GiftComboProps) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.4, 0.95, 1.05, 1],
      }}
      transition={{
        duration: 0.4,
        ease: "easeOut",
      }}
      className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-2xl backdrop-blur-md text-white font-black italic uppercase shadow-lg shadow-red-500/10"
      style={{
        zIndex: 40,
      }}
    >
      <div className="flex flex-col">
        <span className="text-[9px] font-mono tracking-widest text-[#00f2ea]">Combo Gifting</span>
        <span className="text-xs uppercase tracking-tight">{giftName} Sent</span>
      </div>
      <div className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#ff0050] to-[#00f2ea] drop-shadow-[0_2px_8px_rgba(255,0,80,0.5)]">
        x{combo}
      </div>
    </motion.div>
  );
}
