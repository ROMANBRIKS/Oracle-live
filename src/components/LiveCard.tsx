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
      className="crystal-glass rounded-[2rem] overflow-hidden aspect-[9/16] relative group cursor-pointer"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Background / Placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-cyan-400/20 animate-pulse">
        {thumbnail && (
          <img 
            src={thumbnail} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            alt={user} 
            loading="lazy"
          />
        )}
      </div>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none" />

      {/* Top Labels */}
      <div className="absolute top-6 left-6 flex items-center gap-2 z-10">
        {isLive && (
          <div className="bg-red-500/90 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest animate-pulse flex items-center gap-1 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
            <div className="w-1.5 h-1.5 bg-white rounded-full" /> LIVE
          </div>
        )}
        <div className="bg-black/40 backdrop-blur-md text-white/90 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border border-white/10 italic">
          {viewerCount} Viewers
        </div>
      </div>

      {/* User Branding */}
      <div className="absolute bottom-8 left-8 right-16 space-y-4 z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-cyan-400 rounded-2xl flex items-center justify-center font-black text-black italic shadow-[0_0_20px_rgba(34,211,238,0.4)] text-lg border border-white/50">
            {user.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-white italic tracking-tighter uppercase drop-shadow-xl text-lg">@{user}</span>
            <span className="text-[10px] text-cyan-400 font-black uppercase tracking-widest leading-none drop-shadow-md">Creator</span>
          </div>
        </div>
        
        <p className="text-sm text-white/90 drop-shadow-lg leading-relaxed line-clamp-2 max-w-[90%] font-medium italic opacity-80 group-hover:opacity-100 transition-opacity">
          {title || "Experience the core of the digital pulse. Join the stream now!"}
        </p>

        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 w-fit shadow-2xl">
          <Music size={14} className="text-cyan-400 animate-spin-slow" />
          <span className="text-[10px] text-white/70 font-black uppercase tracking-widest italic tracking-tight">Vibe Radio • Original</span>
        </div>
      </div>

      {/* Floating Action Bar (Right Side) */}
      <div className="absolute bottom-24 right-6 flex flex-col gap-6 items-center z-10">
        <div className="flex flex-col items-center gap-2 group/action cursor-pointer">
          <div className="w-14 h-14 crystal-glass flex items-center justify-center text-white border-white/20 transition-all hover:bg-red-500/20 hover:border-red-500/50 rounded-2xl">
            <Heart size={26} className="group-hover/action:text-red-400 transition-colors" />
          </div>
          <span className="text-[10px] font-black text-white italic drop-shadow-lg uppercase">Like</span>
        </div>
        
        <div className="flex flex-col items-center gap-2 group/action cursor-pointer">
          <div className="w-14 h-14 crystal-glass flex items-center justify-center text-white border-white/20 transition-all hover:bg-cyan-400/20 hover:border-cyan-400/50 rounded-2xl">
            <MessageCircle size={26} className="group-hover/action:text-cyan-400 transition-colors" />
          </div>
          <span className="text-[10px] font-black text-white italic drop-shadow-lg uppercase">Chat</span>
        </div>

        <div className="flex flex-col items-center gap-2 group/action cursor-pointer">
          <div className="w-14 h-14 crystal-glass flex items-center justify-center text-white border-white/20 transition-all hover:bg-white/20 hover:border-white/50 rounded-2xl">
            <Share2 size={26} />
          </div>
          <span className="text-[10px] font-black text-white italic drop-shadow-lg uppercase">Share</span>
        </div>
      </div>
    </motion.div>
  );
});

export default LiveCard;
