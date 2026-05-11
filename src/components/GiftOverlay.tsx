import React, { useEffect, useState } from "react";
import { socket } from "../lib/socket";
import { motion, AnimatePresence } from "motion/react";
import { Gift } from "lucide-react";

interface GiftEvent {
  username: string;
  giftType: string;
  roomId: string;
  id: string;
}

interface GiftOverlayProps {
  roomId: string;
}

const GiftOverlay: React.FC<GiftOverlayProps> = ({ roomId }) => {
  const [gifts, setGifts] = useState<GiftEvent[]>([]);

  useEffect(() => {
    socket.emit("join-room", roomId);

    const handleGiftAnimation = (gift: GiftEvent) => {
      const id = Math.random().toString(36).substr(2, 9);
      setGifts((prev) => [...prev, { ...gift, id }]);

      setTimeout(() => {
        setGifts((prev) => prev.filter(g => g.id !== id));
      }, 5000);
    };

    socket.on("gift-animation", handleGiftAnimation);

    return () => {
      socket.off("gift-animation", handleGiftAnimation);
    };
  }, [roomId]);

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      <div className="absolute right-6 top-24 flex flex-col items-end gap-3 w-64">
        <AnimatePresence>
          {gifts.map((gift) => (
            <motion.div
              key={gift.id}
              initial={{ x: 100, opacity: 0, scale: 0.8 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: -100, opacity: 0, scale: 1.1 }}
              className="liquid-glass p-4 pr-6 rounded-[1.8rem] border-white/20 flex items-center gap-3 shadow-2xl shadow-purple-500/20"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg">
                <Gift size={20} />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-black uppercase text-purple-400 tracking-widest truncate">
                  {gift.username}
                </p>
                <p className="text-xs font-black italic uppercase tracking-tighter truncate">
                  Sent {gift.giftType}!
                </p>
              </div>
              <div className="absolute -right-2 -top-2 w-6 h-6 bg-white text-black rounded-full flex items-center justify-center font-black text-[10px]">
                x1
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GiftOverlay;
