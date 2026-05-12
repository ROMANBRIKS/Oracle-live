import React from "react";
import GiftTray from "./GiftTray";
import { Gift as GiftIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LuxuryGiftPanelProps {
  isOpen: boolean;
  onClose: () => void;
  receiverId: string;
  roomId: string;
  battleId?: string;
}

const LuxuryGiftPanel: React.FC<LuxuryGiftPanelProps> = ({ isOpen, onClose, receiverId, roomId, battleId }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[101] bg-zinc-950 border-t border-white/10 rounded-t-[3rem] p-8 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
          >
            <div className="max-w-4xl mx-auto space-y-6">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500">
                        <GiftIcon size={20} />
                     </div>
                     <div>
                        <h3 className="text-xl font-black italic uppercase tracking-tighter">Send a Blessing</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Support your favorite streamer</p>
                     </div>
                  </div>
                  <button 
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"
                  >
                    <X size={20} />
                  </button>
               </div>

               <div className="py-4">
                  <GiftTray receiverId={receiverId} roomId={roomId} battleId={battleId} onGiftSent={() => {
                    // Optional: could keep it open group gifts or close it
                  }} />
               </div>

               <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Your Balance:</span>
                     <span className="text-amber-400 font-bold italic tracking-tighter">1,240 COINS</span>
                  </div>
                  <button className="text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:underline">
                     Recharge Now
                  </button>
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LuxuryGiftPanel;
