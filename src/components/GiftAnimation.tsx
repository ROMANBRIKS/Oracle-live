import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface GiftEvent {
  id: string;
  senderName: string;
  giftName: string;
  animation: string;
  quantity: number;
}

const GiftAnimation: React.FC<{ event: GiftEvent | null }> = ({ event }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (event) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [event]);

  return (
    <AnimatePresence>
      {visible && event && (
        <motion.div
           initial={{ opacity: 0, scale: 0.5, y: 100 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 1.5, y: -200 }}
           className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none z-[9999]"
        >
           <div className="relative">
              <motion.img 
                src={event.animation} 
                alt={event.giftName} 
                className="w-64 h-64 object-contain filter drop-shadow-2xl"
                animate={{ 
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 0.5, repeat: 4 }}
              />
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                 <p className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-2 rounded-full font-black italic uppercase tracking-tighter shadow-2xl border border-white/20">
                    {event.senderName} SENT {event.quantity}x {event.giftName}
                 </p>
              </div>
           </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GiftAnimation;
