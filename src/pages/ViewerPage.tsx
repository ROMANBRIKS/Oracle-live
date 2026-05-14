import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Hls from "hls.js";
import { 
  ChevronLeft, 
  MessageSquare, 
  Gift, 
  Heart, 
  Users, 
  Flame, 
  Share2, 
  Flag,
  MoreVertical,
  Activity,
  Zap,
  TrendingUp,
  X,
  ShieldCheck,
  Disc
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const ViewerPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [likes, setLikes] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const streamUrl = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

    if (Hls.isSupported() && videoRef.current) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current?.play().catch(e => console.log("Auto-play blocked"));
      });

      return () => {
        hls.destroy();
      };
    } else if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = streamUrl;
      videoRef.current.play().catch(e => console.log("Auto-play blocked"));
    }
  }, [roomId]);

  const handleLike = () => {
    setLikes(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-crystal-void text-white relative overflow-hidden font-sans">
      {/* Video Content */}
      <div className="absolute inset-0 bg-black">
        <video 
            ref={videoRef}
            className="w-full h-full object-cover opacity-80"
            playsInline
            autoPlay
            muted={false}
        />
      </div>

      {/* Cinematic Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />

      {/* Interactive Layer */}
      <div className="absolute inset-0 p-8 flex flex-col justify-between">
        {/* Top Header */}
        <div className="flex items-start justify-between relative z-50">
           <div className="flex items-center gap-5 liquid-glass p-2 pr-8 rounded-[3rem] border border-white/10 pointer-events-auto group">
              <div className="relative">
                <div className="w-14 h-14 rounded-[1.8rem] overflow-hidden border-2 border-cyan-400 p-0.5 group-hover:scale-105 transition-transform duration-500">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${roomId}`} alt="streamer" className="w-full h-full object-cover rounded-[1.5rem] bg-black" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-cyan-400 rounded-lg flex items-center justify-center border-2 border-black">
                    <ShieldCheck size={12} className="text-black" />
                </div>
              </div>
              <div className="flex flex-col">
                 <h3 className="text-lg font-black italic tracking-tighter uppercase truncate w-32 drop-shadow-lg">@{roomId || 'Streamer'}</h3>
                 <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400 italic">verified oracle</span>
                    <div className="w-1 h-1 bg-white/20 rounded-full" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">Tier 1 Elite</span>
                 </div>
              </div>
              <button 
                onClick={() => setIsFollowing(!isFollowing)}
                className={`ml-6 px-10 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] italic transition-all duration-500 ${
                    isFollowing 
                    ? 'crystal-glass text-white/40 border-white/5' 
                    : 'bg-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_35px_rgba(34,211,238,0.6)]'
                }`}
              >
                 {isFollowing ? 'SYNCED' : 'FOLLOW'}
              </button>
           </div>

           <div className="flex items-center gap-4 pointer-events-auto">
              <div className="flex items-center gap-6 px-8 py-3.5 liquid-glass border border-white/10 rounded-[2.5rem]">
                 <div className="flex items-center gap-3">
                    <Users size={16} className="text-cyan-400" />
                    <span className="text-sm font-black italic tracking-tighter">4.2K</span>
                 </div>
                 <div className="w-px h-4 bg-white/10" />
                 <div className="flex items-center gap-3">
                    <Flame size={16} className="text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                    <span className="text-sm font-black italic tracking-tighter text-rose-500">22.8K</span>
                 </div>
              </div>
              <button 
                onClick={() => navigate(-1)}
                className="w-14 h-14 crystal-button group"
              >
                 <X size={24} className="text-white/40 group-hover:text-cyan-400 transition-colors" />
              </button>
           </div>
        </div>

        {/* Reaction Layer */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
           <AnimatePresence>
              {likes > 0 && Array.from({ length: 1 }).map((_, i) => (
                <motion.div
                  key={`${likes}-${i}`}
                  initial={{ opacity: 0, y: 50, scale: 0, rotate: Math.random() * 60 - 30 }}
                  animate={{ opacity: [0, 1, 0.8, 0], y: -400, scale: [1, 2, 2.5, 3] }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="absolute text-cyan-400 pointer-events-none drop-shadow-[0_0_30px_rgba(34,211,238,0.8)]"
                >
                  <Heart size={80} fill="currentColor" strokeWidth={0} />
                </motion.div>
              ))}
           </AnimatePresence>
           
           {/* Center Visual Cue */}
           <div className="opacity-5 pointer-events-none scale-150">
                <Disc size={400} className="animate-[spin_10s_linear_infinite]" />
           </div>
        </div>

        {/* Bottom Interaction Bar */}
        <div className="flex items-center gap-6 relative z-50">
           <div className="flex-1 liquid-glass rounded-[3rem] border border-white/10 p-2.5 flex items-center gap-4 pointer-events-auto backdrop-blur-3xl">
              <div className="w-12 h-12 crystal-button bg-cyan-400/10 border-white/5 shrink-0">
                  <Activity size={20} className="text-cyan-400" />
              </div>
              <input 
                type="text" 
                placeholder="Synchronize your thoughts..." 
                className="flex-1 bg-transparent border-none outline-none px-4 text-sm font-bold uppercase tracking-widest placeholder:text-white/20 italic"
              />
              <button className="w-14 h-14 crystal-button bg-cyan-400 text-black border-none shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:scale-105 transition-all">
                 <MessageSquare size={22} fill="currentColor" />
              </button>
           </div>

           <div className="flex items-center gap-4 pointer-events-auto">
              <button 
                onClick={handleLike}
                className="w-16 h-16 crystal-button bg-rose-600/20 border-rose-500/30 text-rose-500 shadow-none hover:bg-rose-600 hover:text-white group"
              >
                 <Heart size={28} className="group-hover:fill-current active:scale-125 transition-all" />
              </button>
              <button className="w-16 h-16 crystal-button bg-cyan-400/20 border-cyan-400/30 text-cyan-400 shadow-none hover:bg-cyan-400 hover:text-black group relative">
                 <Gift size={28} className="group-hover:scale-110 transition-transform" />
                 <div className="absolute -top-3 -right-3 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center text-[10px] font-black border-4 border-black/20 italic">09</div>
              </button>
              <button className="w-16 h-16 crystal-button group">
                 <Share2 size={24} className="text-white/40 group-hover:text-white transition-colors" />
              </button>
              <button className="w-16 h-16 crystal-button group">
                 <MoreVertical size={24} className="text-white/40 group-hover:text-white transition-colors" />
              </button>
           </div>
        </div>
      </div>

      {/* Side HUD Stats */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 space-y-10 pointer-events-none opacity-20 hover:opacity-100 transition-opacity duration-700">
         <div className="flex flex-col items-center gap-3 group">
            <div className="w-10 h-10 crystal-button border-white/5 bg-transparent">
                <Zap size={16} className="text-cyan-400" />
            </div>
            <span className="text-[7px] font-black tracking-[0.4em] text-cyan-400 uppercase italic vertical-text">NEURAL_LINK</span>
         </div>
         <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 crystal-button border-white/5 bg-transparent">
                <TrendingUp size={16} className="text-cyan-400" />
            </div>
            <span className="text-[7px] font-black tracking-[0.4em] text-cyan-400 uppercase italic vertical-text">HI_RES_SYNC</span>
         </div>
         <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 crystal-button border-white/5 bg-transparent">
                <Activity size={16} className="text-cyan-400" />
            </div>
            <span className="text-[7px] font-black tracking-[0.4em] text-cyan-400 uppercase italic vertical-text">SECURE_TLS</span>
         </div>
      </div>
      
      <style>{`
        .vertical-text {
            writing-mode: vertical-rl;
            text-orientation: mixed;
        }
      `}</style>
    </div>
  );
};

export default ViewerPage;

