import React, { useEffect, useState } from "react";
import socket from "../socket/socket";
import { motion, AnimatePresence } from "motion/react";

interface Gift {
  name: string;
  sender: string;
  roomId: string;
}

interface RealtimeGiftOverlayProps {
  roomId: string;
}

const RealtimeGiftOverlay: React.FC<RealtimeGiftOverlayProps> = ({ roomId }) => {
  const [gift, setGift] = useState<Gift | null>(null);

  useEffect(() => {
    socket.on("gift-received", (payload: Gift) => {
      if (payload.roomId === roomId) {
        setGift(payload);
        setTimeout(() => {
          setGift(null);
        }, 3000);
      }
    });

    return () => {
      socket.off("gift-received");
    };
  }, [roomId]);

  return (
    <AnimatePresence>
      {gift && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.5, y: -50 }}
          className="fixed top-1/3 left-1/2 -translate-x-1/2 z-[9999]"
        >
          <div className="bg-black/80 backdrop-blur-2xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center">
            <h1 className="text-4xl mb-2">🎁 {gift.name}</h1>
            <p className="text-white/60 font-bold uppercase tracking-widest text-[10px]">
              sent by <span className="text-indigo-400">{gift.sender}</span>
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RealtimeGiftOverlay;
