import React from "react";
import { Heart, MessageCircle, Share2, Music } from "lucide-react";
import { motion } from "motion/react";

interface LiveCardProps {
  id: string;
  user: string;
  title?: string;
  thumbnail?: string;
  isLive?: boolean;
  viewerCount?: number;
}

const LiveCard: React.FC<LiveCardProps> = React.memo(({ id, user, title, thumbnail, isLive = true, viewerCount = 0 }) => {
  return (
    <motion.div 
      className="crystal-glass rounded-[3rem] overflow-hidden aspect-[9/16] relative group cursor-pointer border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Background / Placeholder */}
      <div className="absolute inset-0 bg-black">
        {thumbnail && (
          <img 
            src={thumbnail} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100" 
            alt={user} 
            loading="lazy"
          />
        )}
      </div>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none" />

      {/* Top Labels */}
      <div className="absolute top-8 left-8 flex items-center gap-3 z-10">
        {isLive && (
          <div className="bg-rose-600/90 text-white text-[9px] font-black px-4 py-1.5 rounded-xl uppercase tracking-[0.3em] animate-pulse flex items-center gap-2 shadow-[0_0_20px_rgba(225,29,72,0.5)] border border-white/20 italic">
            <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_white]" /> LIVE
          </div>
        )}
        <div className="liquid-glass text-white/60 text-[9px] font-black px-4 py-1.5 rounded-xl uppercase tracking-[0.3em] border border-white/10 italic">
          {viewerCount.toLocaleString()} <span className="opacity-40">LINKS</span>
        </div>
      </div>

      {/* User Branding */}
      <div className="absolute bottom-10 left-8 right-20 space-y-5 z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 crystal-button bg-cyan-400 rounded-2xl flex items-center justify-center font-black text-black italic shadow-[0_0_25px_rgba(34,211,238,0.5)] text-xl transition-transform group-hover:scale-110 border-none">
            {user.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-white italic tracking-tighter uppercase drop-shadow-2xl text-xl leading-none">@{user}</span>
            <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-0.5 bg-cyan-400" />
                <span className="text-[9px] text-cyan-400 font-black uppercase tracking-[0.4em] leading-none italic opacity-80">Creator_Node</span>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-white/70 drop-shadow-lg leading-relaxed line-clamp-2 max-w-[95%] font-medium italic group-hover:text-white transition-colors duration-500">
          {title || "Accessing the neural stream frequency. Join the synchronization protocol now!"}
        </p>

        <div className="flex items-center gap-3 liquid-glass px-5 py-2.5 rounded-2xl border border-white/10 w-fit shadow-2xl group-hover:border-cyan-400/20 transition-colors">
          <Music size={14} className="text-cyan-400 animate-spin-slow" />
          <span className="text-[9px] text-white/50 font-black uppercase tracking-[0.3em] italic leading-none group-hover:text-cyan-400 transition-colors">Neural_Beat • Vibe_Sync</span>
        </div>
      </div>

      {/* Floating Action Bar (Right Side) */}
      <div className="absolute bottom-32 right-6 flex flex-col gap-8 items-center z-10">
        <div className="flex flex-col items-center gap-3 group/action cursor-pointer">
          <button className="w-14 h-14 crystal-button border-white/20 transition-all hover:bg-rose-500/20 hover:border-rose-500/50 flex items-center justify-center text-white/40 group-hover/action:text-rose-400">
            <Heart size={24} className="transition-transform group-hover/action:scale-110" />
          </button>
          <span className="text-[8px] font-black text-white/30 italic uppercase tracking-widest group-hover/action:text-rose-400 transition-colors">Pulse</span>
        </div>
        
        <div className="flex flex-col items-center gap-3 group/action cursor-pointer">
          <button className="w-14 h-14 crystal-button border-white/20 transition-all hover:bg-cyan-400/20 hover:border-cyan-400/50 flex items-center justify-center text-white/40 group-hover/action:text-cyan-400">
            <MessageCircle size={24} className="transition-transform group-hover/action:scale-110" />
          </button>
          <span className="text-[8px] font-black text-white/30 italic uppercase tracking-widest group-hover/action:text-cyan-400 transition-colors">Sync</span>
        </div>

        <div className="flex flex-col items-center gap-3 group/action cursor-pointer">
          <button className="w-14 h-14 crystal-button border-white/20 transition-all hover:bg-white/10 hover:border-white/30 flex items-center justify-center text-white/40 group-hover/action:text-white">
            <Share2 size={24} className="transition-transform group-hover/action:scale-110" />
          </button>
          <span className="text-[8px] font-black text-white/30 italic uppercase tracking-widest group-hover/action:text-white transition-colors">Link</span>
        </div>
      </div>
    </motion.div>
  );
});

export default LiveCard;
