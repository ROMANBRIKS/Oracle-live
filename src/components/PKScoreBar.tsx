import React from "react";
import { motion } from "motion/react";
import { Swords } from "lucide-react";

interface PKScoreBarProps {
  score1: number;
  score2: number;
  host1: string;
  host2: string;
  timeLeft: number;
}

const PKScoreBar: React.FC<PKScoreBarProps> = ({ score1, score2, host1, host2, timeLeft }) => {
  const total = score1 + score2 || 1;
  const p1 = (score1 / total) * 100;
  const p2 = (score2 / total) * 100;

  return (
    <div className="w-full flex flex-col gap-2 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex justify-between items-end px-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{host1}</span>
          <span className="text-xl font-black italic text-white drop-shadow-md">{score1.toLocaleString()}</span>
        </div>
        
        <div className="flex flex-col items-center">
            <div className="bg-red-600 px-3 py-1 rounded-full border-2 border-white/20 shadow-lg mb-1">
                <span className="text-xs font-black text-white font-mono">{timeLeft}s</span>
            </div>
            <Swords size={20} className="text-white/20 animate-pulse" />
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest">{host2}</span>
          <span className="text-xl font-black italic text-white drop-shadow-md">{score2.toLocaleString()}</span>
        </div>
      </div>

      <div className="h-6 w-full bg-black/40 rounded-full border-2 border-white/10 overflow-hidden flex shadow-2xl relative">
        <motion.div 
          initial={{ width: "50%" }}
          animate={{ width: `${p1}%` }}
          className="h-full bg-gradient-to-r from-blue-600 to-blue-400 relative overflow-hidden"
        >
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        </motion.div>
        <motion.div 
          initial={{ width: "50%" }}
          animate={{ width: `${p2}%` }}
          className="h-full bg-gradient-to-r from-pink-400 to-pink-600 relative overflow-hidden"
        >
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        </motion.div>
        
        {/* Sparkle/Split */}
        <motion.div 
            animate={{ left: `${p1}%` }}
            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_white] z-10 -ml-0.5"
        />
      </div>
      
      <div className="flex justify-between px-4">
          <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                  <div key={i} className="w-5 h-5 rounded-full border border-white/20 bg-zinc-800" />
              ))}
          </div>
          <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                  <div key={i} className="w-5 h-5 rounded-full border border-white/20 bg-zinc-800" />
              ))}
          </div>
      </div>
    </div>
  );
};

export default PKScoreBar;
