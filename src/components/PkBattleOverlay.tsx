import React from "react";
import { motion } from "motion/react";
import { Flame, Star } from "lucide-react";

interface PkBattle {
  score_a: number;
  score_b: number;
  host_a: string;
  host_b: string;
  duration: number;
  status: string;
}

interface PkBattleOverlayProps {
  battle: PkBattle;
  hostAName?: string;
  hostBName?: string;
}

const PkBattleOverlay: React.FC<PkBattleOverlayProps> = ({ battle, hostAName = "Host A", hostBName = "Host B" }) => {
  const total = battle.score_a + battle.score_b;
  const percentA = total > 0 ? (battle.score_a / total) * 100 : 50;

  return (
    <div className="w-full flex flex-col gap-4 pointer-events-none px-4 py-2">
      {/* Header Info */}
      <div className="flex justify-between items-center px-6">
         <div className="flex flex-col items-start">
            <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">Force</span>
            <span className="text-2xl font-black italic tracking-tighter">{battle.score_a.toLocaleString()}</span>
         </div>
         <div className="bg-zinc-950/80 backdrop-blur-xl border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-2">
            <Flame className="text-orange-500 animate-pulse" size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">PK BATTLE LIVE</span>
            <Star className="text-yellow-400" size={14} />
         </div>
         <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Force</span>
            <span className="text-2xl font-black italic tracking-tighter">{battle.score_b.toLocaleString()}</span>
         </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-10 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5 shadow-2xl flex">
        {/* Host A Side */}
        <motion.div
           initial={{ width: "50%" }}
           animate={{ width: `${percentA}%` }}
           transition={{ type: "spring", damping: 20 }}
           className="h-full bg-gradient-to-r from-pink-600 to-pink-400 relative flex items-center justify-start pl-6"
        >
           <span className="text-[10px] font-black uppercase tracking-widest text-white drop-shadow-md whitespace-nowrap">
              {hostAName}
           </span>
           <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/20 to-transparent skew-x-[-20deg] translate-x-4" />
        </motion.div>

        {/* Host B Side */}
        <div className="h-full bg-gradient-to-l from-cyan-600 to-cyan-400 flex-1 flex items-center justify-end pr-6 relative">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/20 to-transparent skew-x-[-20deg] -translate-x-4" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white drop-shadow-md whitespace-nowrap">
              {hostBName}
           </span>
        </div>

        {/* VS Badge */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-black rounded-full border-2 border-white/20 flex items-center justify-center z-10">
           <span className="text-[10px] font-black italic tracking-tighter">VS</span>
        </div>
      </div>

      {/* Win Predictor */}
      <div className="flex justify-between px-2">
         <div className={`text-[8px] font-black uppercase tracking-widest ${percentA > 50 ? 'text-pink-500' : 'text-white/20'}`}>
            {percentA > 50 ? 'DOMINATING' : 'RECOVERING'}
         </div>
         <div className={`text-[8px] font-black uppercase tracking-widest ${percentA < 50 ? 'text-cyan-400' : 'text-white/20'}`}>
            {percentA < 50 ? 'DOMINATING' : 'RECOVERING'}
         </div>
      </div>
    </div>
  );
};

export default PkBattleOverlay;
