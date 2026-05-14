import { motion, AnimatePresence } from "motion/react";
import { Ghost, ShieldAlert } from "lucide-react";

interface PkPunishmentModalProps {
  loser: string | null;
  onClose?: () => void;
}

export default function PkPunishmentModal({ loser, onClose }: PkPunishmentModalProps) {
  if (!loser) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          className="relative w-full max-w-md bg-zinc-950 border-2 border-red-500/30 rounded-[3rem] p-10 overflow-hidden shadow-[0_0_100px_rgba(239,68,68,0.2)]"
        >
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center mb-6 border border-red-500/30">
              <Ghost size={40} className="text-red-500 animate-bounce" />
            </div>
            
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500 mb-2 italic">
              CONSEQUENCE PROTOCOL
            </h2>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-6 leading-none">
              Defeat <br /> <span className="text-red-500">Imminent</span>
            </h1>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 w-full">
              <p className="text-sm font-bold text-white/60 italic leading-relaxed">
                <span className="text-white font-black not-italic uppercase tracking-widest">@{loser}</span> has lost the PK battle. 
                Prepare for the punishment phase. No skipping allowed.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-red-600 hover:bg-red-500 py-4 rounded-2xl text-white font-black uppercase italic tracking-widest shadow-lg shadow-red-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <ShieldAlert size={18} />
              ACCEPT FATE
            </button>
          </div>

          {/* Decorative scanner line */}
          <motion.div
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-px bg-red-500/50 shadow-[0_0_15px_red] pointer-events-none"
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
